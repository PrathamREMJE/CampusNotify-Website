from rest_framework import serializers
from .models import Notice, College, CollegeAdmin, CustomUser, Committee, CommitteeMembership, Department, Letterhead
from django.contrib.auth.hashers import make_password
from django.conf import settings


#----------- Department -----------
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']

    def validate_name(self, value):
        name = (value or '').strip()
        if not name:
            raise serializers.ValidationError("This field is required.")
        # Case-insensitive uniqueness check
        qs = Department.objects.filter(name__iexact=name)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A department with this name already exists.")
        return name


#----------- Notice -------------
class MinimalStaffSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'role', 'department']

class NoticeSerializer(serializers.ModelSerializer):
    created_by = MinimalStaffSerializer(read_only=True)
    language = serializers.SerializerMethodField()
    target_departments = serializers.SerializerMethodField()
    target_groups = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    pdf_file = serializers.SerializerMethodField()
    full_html = serializers.SerializerMethodField()

    def get_language(self, obj):
        return (obj.content_data or {}).get('language')

    def get_target_departments(self, obj):
        return (obj.content_data or {}).get('targetDepartments') or (obj.content_data or {}).get('departments') or (obj.content_data or {}).get('target_departments')

    def get_target_groups(self, obj):
        return (obj.content_data or {}).get('years') or (obj.content_data or {}).get('target_groups')

    def get_status(self, obj):
        return (obj.content_data or {}).get('status', 'published')  # Default to published if not specified

    def get_pdf_file(self, obj):
        """Return absolute URL for pdf_file if it exists"""
        if obj.pdf_file and obj.pdf_file.name:
            # Build absolute URL using request context
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
            # Fallback: construct URL manually
            return f"{settings.MEDIA_URL}{obj.pdf_file.name}"
        return None

    def get_full_html(self, obj):
        """Generate full HTML for the notice including letterhead, body, and footer"""
        from .utils import generate_pdf_for_notice
        try:
            # Get the user from context if available, otherwise use the notice creator
            user = self.context.get('request').user if self.context.get('request') else obj.created_by
            html = generate_pdf_for_notice(obj.notice_type, obj.content_data, preview=True, user=user)
            if html:
                # Extract body content using string operations
                start = html.find('<body>')
                end = html.find('</body>')
                if start != -1 and end != -1:
                    return html[start + 6:end].strip()
                else:
                    return html
            return ""
        except Exception as e:
            # Return empty string on error to avoid breaking the API
            return ""

    class Meta:
        model = Notice
        fields = ['id', 'title', 'notice_type', 'created_at', 'created_by', 'status', 'target_departments', 'target_groups', 'pdf_file', 'content_data', 'language', 'full_html']
        read_only_fields = ['created_at', 'created_by']

        

#----------- College ------------
class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = '__all__'

    def validate(self, data):
        # Only validate during creation (when instance is None)
        if self.instance is None:  # Creating new college
            # Required field checks
            if not data.get('college_name'):
                raise serializers.ValidationError({"college_name": "This field is required."})
            if not data.get('college_code'):
                raise serializers.ValidationError({"college_code": "This field is required."})
            if College.objects.filter(college_code=data['college_code']).exists():
                raise serializers.ValidationError({"college_code": "College code already exists."})

            if not data.get('college_phno') or len(data.get('college_phno')) != 10:
                raise serializers.ValidationError({"college_phno": "Phone number must be 10 digits."})

            if not data.get('college_email') or '@' not in data.get('college_email'):
                raise serializers.ValidationError({"college_email": "Enter a valid email."})
            if College.objects.filter(college_email=data['college_email']).exists():
                raise serializers.ValidationError({"college_email": "College email already exists."})

            if not data.get('college_documents'):
                raise serializers.ValidationError({"college_documents": "Document upload is required."})

            if not (data.get('offers_junior') or data.get('offers_ug') or data.get('offers_pg')):
                raise serializers.ValidationError({"programmes": "Select at least one programme."})

        return data

# ----------- CollegeAdmin -----------
class CollegeAdminSerializer(serializers.ModelSerializer):
    college_admin_confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CollegeAdmin
        fields = [
            'college',
            'college_admin_name',
            'college_admin_email',
            'college_admin_phno',
            'college_admin_username',
            'college_admin_password',
            'college_admin_confirm_password'
        ]

    def validate(self, data):
        if not data.get('college_admin_name'):
            raise serializers.ValidationError({"college_admin_name": "This field is required."})

        if not data.get('college_admin_email') or '@' not in data.get('college_admin_email'):
            raise serializers.ValidationError({"college_admin_email": "Enter a valid email."})

        if not data.get('college_admin_phno') or len(data.get('college_admin_phno')) != 10:
            raise serializers.ValidationError({"college_admin_phno": "Phone number must be 10 digits."})

        if not data.get('college_admin_username'):
            raise serializers.ValidationError({"college_admin_username": "Username is required."})

        # Check for duplicate usernames
        if CustomUser.objects.filter(username=data.get('college_admin_username')).exists():
            raise serializers.ValidationError({"college_admin_username": "Username already exists."})

        if not data.get('college_admin_password') or len(data.get('college_admin_password')) < 6:
            raise serializers.ValidationError({"college_admin_password": "Password must be at least 6 characters."})

        if data.get('college_admin_password') != data.get('college_admin_confirm_password'):
            raise serializers.ValidationError({"college_admin_confirm_password": "Passwords do not match."})

        return data

    def create(self, validated_data):
        validated_data.pop('college_admin_confirm_password')
        validated_data['college_admin_password'] = make_password(validated_data['college_admin_password'])
        return super().create(validated_data)

#----------- Letterhead -----------
class LetterheadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Letterhead
        fields = ['id', 'college', 'html_content', 'created_by', 'updated_at']
        read_only_fields = ['created_by', 'updated_at']

#----------- Committee ------------
class CommitteeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Committee
        fields = ['id', 'name']

    def validate_name(self, value):
        name = (value or '').strip()
        if not name:
            raise serializers.ValidationError("This field is required.")
        # Case-insensitive uniqueness check
        qs = Committee.objects.filter(name__iexact=name)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A committee with this name already exists.")
        return name


#----------- CommitteeMembership -----------
class CommitteeMembershipSerializer(serializers.ModelSerializer):
    committee = CommitteeSerializer(read_only=True)
    committee_id = serializers.PrimaryKeyRelatedField(queryset=Committee.objects.all(), source='committee', write_only=True)

    class Meta:
        model = CommitteeMembership
        fields = ['id', 'committee', 'committee_id', 'role']

    # ----------- Staff / CustomUser Serializer -----------
class StaffSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=False)

    # READ-ONLY nested committee memberships
    committees = CommitteeMembershipSerializer(source='committee_memberships', many=True, read_only=True)
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), source='department', write_only=True, required=False)
    departments = DepartmentSerializer(many=True, read_only=True)
    departments_ids = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), source='departments', many=True, write_only=True, required=False)

    # WRITE-ONLY fields for committee updates
    committee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="List of committee IDs to assign to this user"
    )
    committee_roles = serializers.ListField(
        child=serializers.ChoiceField(choices=[('head', 'Head'), ('member', 'Member')]),
        write_only=True,
        required=False,
        help_text="Corresponding roles for each committee (must match committee_ids length)"
    )


    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'password',
            'confirm_password',
            'email',
            'first_name',
            'last_name',
            'phone',
            'role',
            'college',
            'department',
            'department_id',
            'committees',  # <-- Nested field, not a direct model field
            'departments',
            'departments_ids',
            'user_status',  # Add status field
            'committee_ids',  # Write-only for updates
            'committee_roles',  # Write-only for updates
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'confirm_password': {'write_only': True}
        }

    def validate(self, data):
        # Only validate during creation (when instance is None)
        if self.instance is None:  # Creating new user
            if not data.get('username'):
                raise serializers.ValidationError({"username": "Username is required."})
            if CustomUser.objects.filter(username=data.get('username')).exists():
                raise serializers.ValidationError({"username": "Username already exists."})
            if not data.get('password') or len(data.get('password')) < 6:
                raise serializers.ValidationError({"password": "Password must be at least 6 characters."})
            if data.get('password') != data.get('confirm_password'):
                raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        validated_data['password'] = make_password(validated_data['password'])
        validated_data['is_superuser'] = False
        validated_data['is_staff'] = False
        validated_data['is_active'] = True
        return CustomUser.objects.create(**validated_data)




    


