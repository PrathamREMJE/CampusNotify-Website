from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.db import transaction
from django.http import HttpResponse
from django.http import JsonResponse
from rest_framework.parsers import JSONParser
from django.utils.text import slugify
from core.utils import generate_pdf_for_notice
from rest_framework.response import Response

from django.conf import settings
import traceback
from django.db import models  # Added import for models

# Create your views here.
from rest_framework import status
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView
from rest_framework.mixins import UpdateModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes

from .models import Notice, College, CustomUser, ActivityLog, Committee, CommitteeMembership, Department, Letterhead, CollegeAdmin
# from .serializers import NoticeSerializer, CollegeSerializer, CollegeAdminSerializer
from .serializers import CollegeSerializer, CollegeAdminSerializer, StaffSerializer, NoticeSerializer, CommitteeSerializer, CommitteeMembershipSerializer, DepartmentSerializer
from django.contrib.auth import authenticate
from .utils import log_activity
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
from weasyprint import HTML
import tempfile
import json
import uuid
import os

# Role hierarchy - who can manage whom
ROLE_HIERARCHY = {
    'admin': ['principal', 'vice_principal', 'office_superintendent', 'senior_clerk', 'hod', 'teacher'],
    'principal': ['vice_principal', 'office_superintendent', 'senior_clerk', 'hod', 'teacher'],
    'vice_principal': ['hod', 'teacher'],
    'office_superintendent': ['senior_clerk'],
    'hod': ['teacher'],
    'senior_clerk': [],
    'teacher': []
}

def get_committee_heads(user):
    """Get committees where the user is head"""
    return CommitteeMembership.objects.filter(
        user=user,
        role='head'
    ).values_list('committee_id', flat=True)

#restframework JWT Authentication
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth import get_user_model


class ForgotPasswordView(APIView):
    def post(self, request):
        identifier = request.data.get('email') or request.data.get('username')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not identifier:
            return Response({'error': 'Email or username is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Use configured user model
            User = get_user_model()

            # Find user by email or username (case-insensitive)
            if '@' in identifier:
                user = User.objects.filter(email__iexact=identifier).first()
            else:
                user = User.objects.filter(username__iexact=identifier).first()

            # If passwords are provided, perform direct reset as per requirement
            if new_password is not None or confirm_password is not None:
                if not user:
                    return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

                if not new_password or not confirm_password:
                    return Response({'error': 'new_password and confirm_password are required'}, status=status.HTTP_400_BAD_REQUEST)

                if new_password != confirm_password:
                    return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

                if len(new_password) < 6:
                    return Response({'error': 'Password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

                # Hash and save the new password
                user.set_password(new_password)
                user.save(update_fields=['password'])

                return Response({'message': 'Password has been reset successfully'}, status=status.HTTP_200_OK)

            # Otherwise, keep existing dev-friendly reset link flow
            if not user:
                # Generic message to avoid user enumeration when only requesting link
                return Response({'message': 'If the account exists, a reset link has been generated.'}, status=status.HTTP_200_OK)

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)

            frontend_base = request.data.get('frontend_base', 'http://localhost:5173')
            reset_url = f"{frontend_base}/reset-password?uid={uid}&token={token}"

            return Response({
                'message': 'Password reset link generated',
                'uid': uid,
                'token': token,
                'reset_url': reset_url
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Error processing request: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResetPasswordView(APIView):
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not uid or not token or not new_password or not confirm_password:
            return Response({'error': 'uid, token, new_password, and confirm_password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({'error': 'Password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=user_id)
        except Exception:
            return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)

        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save(update_fields=['password'])

        return Response({'message': 'Password has been reset successfully'}, status=status.HTTP_200_OK)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_notices(request):
#     notices = Notice.objects.all().order_by('-created_at')
#     serializer = NoticeSerializer(notices, many=True)
#     return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    try:
        print("=== USING StaffSerializer from views.py ===")
        print(f"User: {request.user.username}, Role: {request.user.role}")
        serializer = StaffSerializer(request.user, context={'request':request})
        return Response(serializer.data)
    except Exception as e:
        print(f"Error in get_user_profile: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': f'Error fetching user profile: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminSignupView(APIView):
    """
    Signup view that creates College Admin user by default
    College Admin = Dashboard access, staff management, notice creation
    """
    def post(self, request):
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            
            # Validation
            if not username or not email or not password:
                return Response({
                    'error': 'Username, email, and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user already exists
            if CustomUser.objects.filter(username=username).exists():
                return Response({
                    'error': 'Username already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            if CustomUser.objects.filter(email=email).exists():
                return Response({
                    'error': 'Email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create College Admin user (hard-coded role)
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=password,
                role='admin',  # Hard-coded as College Admin
                is_active=True
            )
            
            return Response({
                'message': 'College Admin account created successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Error creating admin account: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class CollegeCreateView(APIView):
    def post(self, request):
        serializer = CollegeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CollegeAdminCreateView(APIView):
    def post(self, request):
        serializer = CollegeAdminSerializer(data=request.data)
        if serializer.is_valid():
            college_admin = serializer.save()

            try:
                # ✅ Safely fetch raw username and password from `request.data`
                raw_username = request.data.get("college_admin_username")
                raw_password = request.data.get("college_admin_password")

                if not raw_username or not raw_password:
                    return Response({"error": "Missing username or password"}, status=400)

                CustomUser.objects.create(
                    username=raw_username,
                    password=make_password(raw_password),
                    role="admin",  # College Admin role
                    college=college_admin.college,
                    is_superuser=False,  # Not a Django superuser
                    is_staff=False,      # Not Django admin staff
                    is_active=True       # Active user
                )
            except Exception as e:
                print("❌ Error while creating CustomUser:", e)
                return Response({"error": "Something went wrong while creating user."}, status=500)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DepartmentCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DepartmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        departments = Department.objects.all().order_by('name')
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Department created successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"message": "Validation failed", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class DepartmentUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, department_id):
        # Full update
        return self._update(request, department_id, partial=False)

    def patch(self, request, department_id):
        # Partial update
        return self._update(request, department_id, partial=True)

    def delete(self, request, department_id):
        try:
            department = Department.objects.get(pk=department_id)
            department.delete()
            return Response({"message": "Department deleted successfully"}, status=status.HTTP_200_OK)
        except Department.DoesNotExist:
            return Response({"message": "Department not found"}, status=status.HTTP_404_NOT_FOUND)

    def _update(self, request, department_id, partial: bool):
        try:
            department = Department.objects.get(pk=department_id)
        except Department.DoesNotExist:
            return Response({"message": "Department not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = DepartmentSerializer(instance=department, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Department updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response({"message": "Validation failed", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class DepartmentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, department_id):
        try:
            department = Department.objects.get(pk=department_id)
            department.delete()
            return Response({"message": "Department deleted successfully"}, status=status.HTTP_200_OK)
        except Department.DoesNotExist:
            return Response({"message": "Department not found"}, status=status.HTTP_404_NOT_FOUND)


class CommitteeCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = CommitteeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommitteeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        committees = Committee.objects.all().order_by('name')
        serializer = CommitteeSerializer(committees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CommitteeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Committee created successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"message": "Validation failed", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class CommitteeUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, committee_id):
        # Full update
        return self._update(request, committee_id, partial=False)

    def patch(self, request, committee_id):
        # Partial update
        return self._update(request, committee_id, partial=True)

    def delete(self, request, committee_id):
        try:
            committee = Committee.objects.get(pk=committee_id)
            committee.delete()
            return Response({"message": "Committee deleted successfully"}, status=status.HTTP_200_OK)
        except Committee.DoesNotExist:
            return Response({"message": "Committee not found"}, status=status.HTTP_404_NOT_FOUND)

    def _update(self, request, committee_id, partial: bool):
        try:
            committee = Committee.objects.get(pk=committee_id)
        except Committee.DoesNotExist:
            return Response({"message": "Committee not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CommitteeSerializer(instance=committee, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Committee updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response({"message": "Validation failed", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class CommitteeDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, committee_id):
        try:
            committee = Committee.objects.get(pk=committee_id)
            committee.delete()
            return Response({"message": "Committee deleted successfully"}, status=status.HTTP_200_OK)
        except Committee.DoesNotExist:
            return Response({"message": "Committee not found"}, status=status.HTTP_404_NOT_FOUND)

class StaffCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Add college from current user if not provided
        data = request.data.copy()
        if not data.get('college') and request.user.college:
            data['college'] = request.user.college.id

        user_role = request.user.role
        new_role = data.get("role")

        # Special case for teachers who are committee heads
        if user_role == 'teacher' and new_role == 'teacher':
            committee_head_ids = get_committee_heads(request.user)
            if not committee_head_ids:
                return Response(
                    {"error": "Teacher is not allowed to create users."},
                    status=status.HTTP_403_FORBIDDEN
                )
            # Allow committee head teachers to create teachers
        else:
            # 🔐 Role hierarchy: Who can create what
            ROLE_HIERARCHY = {
                'admin': ['principal', 'vice_principal', 'office_superintendent', 'senior_clerk', 'hod', 'teacher'],
                'principal': ['vice_principal', 'office_superintendent', 'senior_clerk', 'hod', 'teacher'],
                'vice_principal': ['hod', 'teacher'],
                'office_superintendent': ['senior_clerk'],
                'hod': ['teacher'],
                'senior_clerk': [],
                'teacher': [],
            }

            allowed_roles = ROLE_HIERARCHY.get(user_role, [])
            if new_role not in allowed_roles:
                return Response(
                    {"error": f"{user_role.replace('_', ' ').title()} is not allowed to create user with role '{new_role}'."},
                    status=status.HTTP_403_FORBIDDEN
                )

        # ✅ Proceed to create staff
        serializer = StaffSerializer(data=data)
        if serializer.is_valid():
            with transaction.atomic():
                staff_member = serializer.save()
                
                # Handle committee memberships if provided
                committee_memberships = data.get('committee_memberships', [])
                created_memberships = []
                
                for membership_data in committee_memberships:
                    committee_id = membership_data.get('committee_id')
                    role = membership_data.get('role')
                    
                    if committee_id and role:
                        try:
                            committee = Committee.objects.get(id=committee_id)
                            membership = CommitteeMembership.objects.create(
                                user=staff_member,
                                committee=committee,
                                role=role
                            )
                            created_memberships.append(membership)
                        except Committee.DoesNotExist:
                            # Log warning but don't fail the staff creation
                            print(f"Warning: Committee with id {committee_id} not found")
                
                # Log staff creation activity
                log_activity(
                    user=request.user,
                    action='create_user',
                    description=f"{request.user.username} created new {new_role.replace('_', ' ')} user: {staff_member.username}",
                    target_user=staff_member,
                    request=request
                )
                
                # Prepare response with committee memberships
                committee_memberships_data = []
                if created_memberships:
                    membership_serializer = CommitteeMembershipSerializer(created_memberships, many=True)
                    committee_memberships_data = membership_serializer.data
                
                return Response({
                    "message": "Staff created successfully",
                    "staff": {
                        "id": staff_member.id,
                        "username": staff_member.username,
                        "email": staff_member.email,
                        "role": staff_member.role,
                        "committee_memberships": committee_memberships_data
                    }
                }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StaffListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Check if this is an active users request - skip committee filtering for active users
            if 'active' in request.path:
                # For active users API, return full list without committee restrictions
                base_query = CustomUser.objects.filter(
                    is_superuser=False,
                    is_staff=False
                )
                staff_members = base_query.order_by('-is_online', '-last_login_time', '-date_joined')
            else:
                # Get current user's role
                current_user_role = request.user.role

                # Get roles that current user can manage
                manageable_roles = ROLE_HIERARCHY.get(current_user_role, [])

                # Base query - exclude superusers and Django staff
                base_query = CustomUser.objects.filter(
                    is_superuser=False,  # Hide Django superusers
                    is_staff=False       # Hide Django admin staff users
                )

                # Special case for teachers who are committee heads
                if current_user_role == 'teacher':
                    try:
                        committee_head_ids = get_committee_heads(request.user)
                        if committee_head_ids:
                            # Show only teachers in committees where user is head
                            staff_members = base_query.filter(
                                role='teacher',
                                committee_memberships__committee_id__in=committee_head_ids
                            ).distinct().order_by('-is_online', '-last_login_time', '-date_joined')
                        else:
                            # Regular teacher - show nothing
                            staff_members = CustomUser.objects.none()
                    except Exception as e:
                        # Log exception and show nothing for committee head logic failure
                        print(f"Error in committee head filtering: {e}")
                        staff_members = CustomUser.objects.none()
                # Apply role-based filtering for other roles
                elif current_user_role in ROLE_HIERARCHY:
                    # Filter to show only manageable roles + current user
                    staff_members = base_query.filter(
                        role__in=manageable_roles + [current_user_role]
                    ).order_by('-is_online', '-last_login_time', '-date_joined')  # Online users first
                else:
                    # If role not in hierarchy, show only self
                    staff_members = base_query.filter(id=request.user.id)
            serializer = StaffSerializer(staff_members, many=True)
            
            # Format data for frontend
            formatted_data = []
            for staff_data in serializer.data:
                # Get the actual staff object for additional fields
                staff_obj = staff_members.get(id=staff_data['id'])
                formatted_data.append({
                    'id': staff_data['id'],
                    'name': staff_data['first_name'] or staff_data['username'],  # Use first_name or fallback to username
                    'username': staff_data['username'],
                    'email': staff_data['email'],
                    'department': staff_data['department'] or 'Not Assigned',
                    'role': staff_data['role'],  # Send actual role for frontend mapping
                    'position': staff_data['role'].replace('_', ' ').title(),  # Keep for backward compatibility
                    'phone': staff_data['phone'] or 'Not Provided',  # Use actual phone field
                    'joinDate': staff_obj.date_joined.strftime('%Y-%m-%d') if staff_obj.date_joined else 'Unknown',
                    'status': 'Active' if staff_obj.is_active else 'Inactive',
                    'user_status': staff_obj.user_status,
                    'is_online': staff_obj.is_online,
                    'last_login_time': staff_obj.last_login_time.isoformat() if staff_obj.last_login_time else None,
                    'last_logout_time': staff_obj.last_logout_time.isoformat() if staff_obj.last_logout_time else None,
                    'session_count': staff_obj.session_count,
                    'current_session_duration': staff_obj.get_current_session_duration(),
                    'total_session_time': staff_obj.get_total_session_time()
                })
            
            return Response(formatted_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ActiveUsersView(APIView):
    """Get currently active/online users"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Base query for active users - show all active users without role restrictions
            base_query = CustomUser.objects.filter(
                is_superuser=False,
                is_staff=False,
                is_online=True  # Only online users
            )

            active_users = base_query.order_by('-last_login_time')
            
            # Format data for frontend
            formatted_data = []
            for user in active_users:
                try:
                    formatted_data.append({
                        'id': user.id,
                        'name': user.first_name or user.username,
                        'username': user.username,
                        'role': user.role,
                        'department': user.department.name if user.department else 'Not Assigned',
                        'last_login_time': user.last_login_time.isoformat() if user.last_login_time else None,
                        'session_count': getattr(user, 'session_count', 0),
                        'is_online': user.is_online
                    })
                except Exception as e:
                    # Skip problematic users and continue
                    print(f"Error formatting user {user.id}: {e}")
                    continue

            # Get role-wise count
            role_counts = {}
            for user in active_users:
                try:
                    role_display = user.role.replace('_', ' ').title()
                    role_counts[role_display] = role_counts.get(role_display, 0) + 1
                except Exception as e:
                    print(f"Error counting role for user {user.id}: {e}")
                    continue

            return Response({
                'active_users': formatted_data,
                'total_count': len(formatted_data),
                'role_breakdown': role_counts
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StaffDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, staff_id):
        try:
            staff_member = CustomUser.objects.get(id=staff_id, is_superuser=False, is_staff=False)
            serializer = StaffSerializer(staff_member, context={'request': request})

            # Format data for frontend compatibility
            formatted_data = {
                'id': serializer.data['id'],
                'name': serializer.data['first_name'] or serializer.data['username'],
                'username': serializer.data['username'],
                'email': serializer.data['email'],
                'first_name': serializer.data['first_name'],
                'last_name': serializer.data['last_name'],
                'phone': serializer.data['phone'],
                'department': serializer.data['department']['name'] if serializer.data['department'] else 'Not Assigned',
                'department_id': serializer.data['department']['id'] if serializer.data['department'] else None,
                'role': serializer.data['role'],
                'position': serializer.data['role'].replace('_', ' ').title(),
                'status': 'Active' if serializer.data['user_status'] == 'active' else 'Inactive',
                'committees': serializer.data['committees'],  # Include committee memberships
                'joinDate': staff_member.date_joined.strftime('%Y-%m-%d') if staff_member.date_joined else None,
            }

            return Response(formatted_data, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "Staff member not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StaffUpdateView(GenericAPIView, UpdateModelMixin):
    permission_classes = [IsAuthenticated]
    serializer_class = StaffSerializer
    queryset = CustomUser.objects.filter(is_superuser=False, is_staff=False)

    def get_object(self):
        staff_id = self.kwargs.get('staff_id')
        try:
            return CustomUser.objects.get(id=staff_id, is_superuser=False, is_staff=False)
        except CustomUser.DoesNotExist:
            from django.http import Http404
            raise Http404("Staff member not found")

    def put(self, request, *args, **kwargs):
        # Full update
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        # Partial update
        return self.partial_update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Handle committee memberships separately
        committee_ids = request.data.get('committee_ids', [])
        committee_roles = request.data.get('committee_roles', [])

        # Validate committee data
        if committee_ids and committee_roles:
            if len(committee_ids) != len(committee_roles):
                return Response(
                    {"error": "committee_ids and committee_roles must have the same length"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        with transaction.atomic():
            # Update basic staff data
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            # Handle committee memberships
            if committee_ids is not None:  # Allow empty list to clear all memberships
                # Delete existing memberships
                CommitteeMembership.objects.filter(user=instance).delete()

                # Create new memberships
                for committee_id, role in zip(committee_ids, committee_roles):
                    try:
                        committee = Committee.objects.get(id=committee_id)
                        CommitteeMembership.objects.create(
                            user=instance,
                            committee=committee,
                            role=role
                        )
                    except Committee.DoesNotExist:
                        return Response(
                            {"error": f"Committee with id {committee_id} does not exist"},
                            status=status.HTTP_400_BAD_REQUEST
                        )

        return Response(serializer.data, status=status.HTTP_200_OK)


class StaffDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, staff_id):
        try:
            staff_member = CustomUser.objects.get(id=staff_id, is_superuser=False, is_staff=False)

            # Permission check for teachers who are committee heads
            if request.user.role == 'teacher' and staff_member.role == 'teacher':
                committee_head_ids = get_committee_heads(request.user)
                if not committee_head_ids:
                    return Response(
                        {"error": "Teacher is not allowed to delete staff."},
                        status=status.HTTP_403_FORBIDDEN
                    )
                # Check if the staff member is in one of the committees where user is head
                staff_committee_ids = CommitteeMembership.objects.filter(
                    user=staff_member
                ).values_list('committee_id', flat=True)
                if not set(committee_head_ids).intersection(set(staff_committee_ids)):
                    return Response(
                        {"error": "Teacher can only delete staff in their committees."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                # Check standard role hierarchy permissions
                user_role = request.user.role
                manageable_roles = ROLE_HIERARCHY.get(user_role, [])
                if staff_member.role not in manageable_roles and staff_member.id != request.user.id:
                    return Response(
                        {"error": f"{user_role.replace('_', ' ').title()} is not allowed to delete this user."},
                        status=status.HTTP_403_FORBIDDEN
                    )

            # Store info before deletion
            staff_info = {
                "id": staff_member.id,
                "username": staff_member.username,
                "email": staff_member.email,
                "role": staff_member.role
            }

            # Log deletion activity before deleting
            log_activity(
                user=request.user,
                action='delete_user',
                description=f"{request.user.username} deleted {staff_member.role.replace('_', ' ')} user: {staff_member.username}",
                target_user=staff_member,
                request=request
            )

            # Delete the staff member
            staff_member.delete()

            return Response({
                "message": "Staff member deleted successfully",
                "deleted_staff": staff_info
            }, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            return Response({"error": "Staff member not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            data = {
                'id': user.id,
                'first_name': user.first_name or '',
                'last_name': user.last_name or '',
                'email': user.email or '',
                'phone': user.phone or '',
                'role': user.role,
                'department': user.department.name if user.department else '',
                'college_name': user.college.college_name if user.college else '',
                'employee_id': user.id,
                'committees': [
                    {
                        'id': membership.committee.id,
                        'name': membership.committee.name,
                        'role': membership.role
                    } for membership in user.committee_memberships.all()
                ]
            }

            # Add college admin details only for admin role
            if user.role == 'admin':
                try:
                    college_admin = CollegeAdmin.objects.get(college=user.college)
                    data['college_admin'] = {
                        'name': college_admin.college_admin_name,
                        'email': college_admin.college_admin_email,
                        'phone': college_admin.college_admin_phno,
                        'username': college_admin.college_admin_username
                    }
                except CollegeAdmin.DoesNotExist:
                    data['college_admin'] = None

            return Response(data)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def patch(self, request):
        user = request.user
        data = request.data

        allowed_fields = {'first_name', 'last_name', 'phone', 'department', 'college_name'}
        forbidden_fields = {'role', 'employee_id', 'id', 'username', 'email', 'user_status', 'is_online'}
        
        provided_fields = set(data.keys())
        forbidden_provided = provided_fields & forbidden_fields
        
        if forbidden_provided:
            return Response(
                {'error': f'Cannot update fields: {", ".join(forbidden_provided)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'department' in data:
            from .models import Department
            dept_value = data['department']
            if dept_value in [None, '', 'null']:
                user.department = None
            else:
                try:
                    if isinstance(dept_value, int) or (isinstance(dept_value, str) and dept_value.isdigit()):
                        user.department = Department.objects.get(id=int(dept_value))
                    else:
                        user.department = Department.objects.get(name=str(dept_value).strip())
                except Department.DoesNotExist:
                    return Response({'error': 'Department not found'}, status=status.HTTP_400_BAD_REQUEST)

        if 'college_name' in data and user.college:
            user.college.college_name = data['college_name']
            user.college.save()

        user.save()

        updated_data = {
            'id': user.id,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'email': user.email or '',
            'phone': user.phone or '',
            'role': user.role,
            'department': user.department.name if user.department else '',
            'college_name': user.college.college_name if user.college else '',
            'employee_id': user.id,
            'committees': [
                {
                    'id': membership.committee.id,
                    'name': membership.committee.name,
                    'role': membership.role
                } for membership in user.committee_memberships.all()
            ]
        }
        return Response(updated_data)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view that sets user as online when they login
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get the user from the username in request
            username = request.data.get('username')
            try:
                user = CustomUser.objects.get(username=username)
                # Set user as online
                user.set_online()
                
                # Log login activity
                log_activity(
                    user=user,
                    action='login',
                    description=f"User {user.username} logged in successfully",
                    request=request
                )
                
                # Add user status to response
                response.data['user_status'] = 'active'
                response.data['login_time'] = user.last_login_time.isoformat() if user.last_login_time else None
                response.data['session_count'] = user.session_count
            except CustomUser.DoesNotExist:
                pass
        
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Logout endpoint - Set user as offline/inactive and track logout time
        """
        try:
            user = request.user
            
            # Set user as offline and update logout time
            user.set_offline()
            
            # Log logout activity
            log_activity(
                user=user,
                action='logout',
                description=f"User {user.username} logged out",
                request=request
            )
            
            return Response({
                'message': 'Successfully logged out',
                'user_status': 'inactive',
                'logout_time': user.last_logout_time.isoformat() if user.last_logout_time else None
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': f'Logout failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class ActivityLogView(APIView):
    """View activity logs for audit trail"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get current user's role
            current_user_role = request.user.role
            
            # Role hierarchy for activity log access
            ROLE_HIERARCHY = {
                'admin': ['principal', 'vice_principal', 'office_superintendent', 'senior_clerk', 'hod', 'teacher'],
                'principal': ['vice_principal', 'office_superintendent', 'senior_clerk', 'hod', 'teacher'],
                'vice_principal': ['hod', 'teacher'],
                'office_superintendent': ['senior_clerk'],
                'hod': ['teacher'],
                'senior_clerk': [],
                'teacher': [],
            }
            
            # Get roles that current user can manage
            manageable_roles = ROLE_HIERARCHY.get(current_user_role, [])
            
            # Base query
            if current_user_role in ROLE_HIERARCHY:
                # Show activities for manageable users + own activities
                activities = ActivityLog.objects.filter(
                    user__role__in=manageable_roles + [current_user_role]
                )[:100]  # Last 100 activities
            else:
                # Show only own activities
                activities = ActivityLog.objects.filter(user=request.user)[:50]
            
            # Format data for frontend
            formatted_data = []
            for activity in activities:
                formatted_data.append({
                    'id': activity.id,
                    'user': activity.user.username,
                    'user_role': activity.user.role,
                    'action': activity.get_action_display(),
                    'description': activity.description,
                    'target_user': activity.target_user.username if activity.target_user else None,
                    'timestamp': activity.timestamp.isoformat(),
                    'ip_address': activity.ip_address,
                    'time_ago': self.get_time_ago(activity.timestamp)
                })
            
            return Response({
                'activities': formatted_data,
                'total_count': len(formatted_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_time_ago(self, timestamp):
        """Calculate time ago string"""
        from django.utils import timezone
        now = timezone.now()
        diff = now - timestamp
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"


class RoleBasedDashboardView(APIView):
    """Get role-specific dashboard data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            role = user.role

            # Log dashboard access
            log_activity(
                user=user,
                action='view_dashboard',
                description=f"{user.username} accessed dashboard",
                request=request
            )

            # All roles see the same admin dashboard UI
            dashboard_data = {
                'user_info': {
                    'username': user.username,
                    'role': role,
                    'role_display': role.replace('_', ' ').title(),
                    'department': user.department.name if user.department else None,
                    'is_online': user.is_online,
                    'session_duration': user.get_current_session_duration(),
                    'total_session_time': user.get_total_session_time()
                },
                'view_type': 'admin',
                'recent_activities': self.get_recent_activities(),
                'notices': self.get_all_notices()
            }

            return Response(dashboard_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_teacher_notices(self, user):
        """Get notices relevant to teacher"""
        # Mock data - replace with actual Notice model queries
        return [
            {'title': 'Department Meeting', 'date': '2024-01-15', 'priority': 'high'},
            {'title': 'Exam Schedule', 'date': '2024-01-20', 'priority': 'medium'}
        ]
    
    def get_department_info(self, department):
        """Get department information"""
        if not department:
            return {'name': 'Not Assigned', 'staff_count': 0}
        
        staff_count = CustomUser.objects.filter(department=department).count()
        return {
            'name': department,
            'staff_count': staff_count,
            'active_staff': CustomUser.objects.filter(department=department, is_online=True).count()
        }
    
    def get_teacher_stats(self, user):
        """Get personal stats for teacher"""
        return {
            'login_count': user.session_count,
            'total_time_online': user.get_total_session_time(),
            'last_login': user.last_login_time.isoformat() if user.last_login_time else None
        }
    
    def get_hod_department_data(self, user):
        """Get department data for HOD"""
        dept = user.department
        if not dept:
            return {'error': 'No department assigned'}
        
        dept_staff = CustomUser.objects.filter(department=dept)
        return {
            'department_name': dept,
            'total_staff': dept_staff.count(),
            'active_staff': dept_staff.filter(is_online=True).count(),
            'teachers': dept_staff.filter(role='teacher').count(),
            'recent_activities': ActivityLog.objects.filter(user__department=dept)[:10]
        }
    
    def get_department_staff(self, department):
        """Get staff in specific department"""
        if not department:
            return []
        
        staff = CustomUser.objects.filter(department=department)[:10]
        return [{
            'name': s.first_name or s.username,
            'role': s.role,
            'is_online': s.is_online,
            'last_login': s.last_login_time.isoformat() if s.last_login_time else None
        } for s in staff]
    
    def get_department_notices(self, department):
        """Get notices for specific department"""
        # Mock data - replace with actual queries
        return [
            {'title': f'{department} Meeting', 'date': '2024-01-15'},
            {'title': f'{department} Updates', 'date': '2024-01-18'}
        ]
    
    def get_department_stats(self, department):
        """Get statistics for department"""
        if not department:
            return {}
        
        dept_staff = CustomUser.objects.filter(department=department)
        return {
            'total_staff': dept_staff.count(),
            'online_now': dept_staff.filter(is_online=True).count(),
            'total_sessions_today': sum(s.session_count for s in dept_staff),
            'avg_session_time': '2h 30m'  # Calculate actual average
        }
    
    def get_college_stats(self):
        """Get college-wide statistics"""
        total_staff = CustomUser.objects.filter(is_superuser=False, is_staff=False).count()
        online_staff = CustomUser.objects.filter(is_superuser=False, is_staff=False, is_online=True).count()
        
        return {
            'total_staff': total_staff,
            'online_staff': online_staff,
            'total_departments': CustomUser.objects.values('department').distinct().count(),
            'total_sessions_today': CustomUser.objects.aggregate(
                total=models.Sum('session_count')
            )['total'] or 0
        }
    
    def get_all_departments_data(self):
        """Get data for all departments"""
        departments = CustomUser.objects.values('department').distinct()
        dept_data = []
        
        for dept in departments:
            if dept['department']:
                dept_staff = CustomUser.objects.filter(department=dept['department'])
                dept_data.append({
                    'name': dept['department'],
                    'total_staff': dept_staff.count(),
                    'online_staff': dept_staff.filter(is_online=True).count()
                })
        
        return dept_data
    
    def get_recent_activities(self):
        """Get recent activities for admin view only"""
        try:
            activities = ActivityLog.objects.select_related('user').order_by('-timestamp')[:20]
            return [{
                'user': a.user.username if a.user else 'Unknown',
                'action': a.get_action_display(),
                'description': a.description,
                'time_ago': self.get_time_ago(a.timestamp),
                'timestamp': a.timestamp.isoformat()
            } for a in activities]
        except Exception as e:
            print(f"Error in get_recent_activities: {e}")
            return []
    
    def get_all_notices(self):
        """Get all notices for admin"""
        # Mock data - replace with actual Notice queries
        return [
            {'title': 'College Meeting', 'department': 'All', 'date': '2024-01-15'},
            {'title': 'Exam Schedule', 'department': 'Academic', 'date': '2024-01-20'}
        ]
    
    def get_general_notices(self):
        """Get general notices for basic users"""
        return [
            {'title': 'General Announcement', 'date': '2024-01-15'},
            {'title': 'Holiday Notice', 'date': '2024-01-18'}
        ]
    
    def get_basic_stats(self, user):
        """Get basic stats for other roles"""
        return {
            'login_count': user.session_count,
            'last_login': user.last_login_time.isoformat() if user.last_login_time else None
        }
    

class NoticeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get_subordinate_users(self, user):
        """
        Return queryset of users that are managed by the given user based on ROLE_HIERARCHY
        and department/college scoping.
        - admin/principal: whole college
        - vice_principal: HOD + teachers (whole college or limited?) -> keep college scope
        - hod: only teachers in their departments
        - office_superintendent: senior_clerk
        - senior_clerk/teacher: none
        """
        manageable_roles = ROLE_HIERARCHY.get(user.role, [])
        if not manageable_roles:
            return CustomUser.objects.none()

        qs = CustomUser.objects.filter(role__in=manageable_roles)
        # Scope by same college if present
        if user.college_id:
            qs = qs.filter(college_id=user.college_id)

        # HOD special case: only teachers in their departments (M2M departments for HOD)
        if user.role == 'hod':
            # HOD can have multiple departments through M2M 'departments'
            dept_ids = list(user.departments.values_list('id', flat=True)) or ([user.department_id] if user.department_id else [])
            if dept_ids:
                qs = qs.filter(
                    Q(role='teacher') & (
                        Q(department_id__in=dept_ids)
                    )
                )
            else:
                # No departments -> no subordinates
                qs = CustomUser.objects.none()
        return qs

    def get(self, request):
        try:
            user = request.user
            queryset = Notice.objects.all().order_by('-created_at')

            # Scope: own + subordinates by default (can override via scope param: own | subordinates | own_and_subordinates)
            scope = (request.GET.get('scope') or 'own_and_subordinates').lower()
            subordinates = self.get_subordinate_users(user)
            subordinate_ids = list(subordinates.values_list('id', flat=True))
            if scope == 'own':
                allowed_users = [user.id]
            elif scope == 'subordinates':
                allowed_users = subordinate_ids
            else:
                allowed_users = subordinate_ids + [user.id]
            queryset = queryset.filter(created_by_id__in=allowed_users)

            # Filters: type, department, status, search
            notice_type = request.GET.get('type') or request.GET.get('notice_type')
            if notice_type:
                queryset = queryset.filter(notice_type__iexact=notice_type)

            status_val = request.GET.get('status')
            if status_val:
                queryset = queryset.filter(content_data__status__iexact=status_val)

            # Multiple department filter support
            departments = request.GET.get('departments')
            if departments:
                # Support comma-separated department IDs: ?departments=1,2,3
                dept_ids = [int(d.strip()) for d in departments.split(',') if d.strip().isdigit()]
                if dept_ids:
                    # Filter notices where content_data contains any of the department IDs
                    dept_filters = Q()
                    for dept_id in dept_ids:
                        dept_filters |= Q(content_data__icontains=str(dept_id))
                    queryset = queryset.filter(dept_filters)

            # Single department filter (backward compatibility)
            department = request.GET.get('department')
            if department and not departments:
                # Match anywhere in content_data JSON (names or IDs)
                queryset = queryset.filter(content_data__icontains=department)

            # Limit status to draft and published only
            status_val = request.GET.get('status')
            if status_val:
                if status_val.lower() in ['draft', 'published']:
                    queryset = queryset.filter(content_data__status__iexact=status_val)
                # Ignore invalid status values

            search = request.GET.get('search')
            if search:
                # Search title and content_data JSON string repr
                queryset = queryset.filter(
                    Q(title__icontains=search) |
                    Q(notice_type__icontains=search) |
                    Q(content_data__icontains=search)
                )

            # Pagination
            paginator = PageNumberPagination()
            paginator.page_size = int(request.GET.get('page_size', 10))
            paginated_qs = paginator.paginate_queryset(queryset, request)
            serializer = NoticeSerializer(paginated_qs, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        try:
            serializer = NoticeSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                notice = serializer.save(created_by=request.user)
                # Log creation activity
                log_activity(
                    user=request.user,
                    action='create_notice',
                    description=f"{request.user.username} created notice: {notice.title}",
                    target_user=request.user,
                    request=request
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# It's best to put this serializer in your `serializers.py` file, but I'm adding it here for clarity.
class GenerateNoticeSerializer(serializers.ModelSerializer):
    """
    Handles validation and creation of notices from generation data.
    """
    # This field is not on the model, it's just for input validation.
    notice_type = serializers.CharField(write_only=True, required=True)
    
    # Add other fields from your notice data here for validation.
    # This ensures the frontend sends all required data.
    title = serializers.CharField(max_length=255, required=True)

    class Meta:
        model = Notice
        # List fields from the Notice model that you want the serializer to handle directly.
        # 'content_data' and 'pdf_file' will be handled in the create method.
        fields = ['title', 'notice_type']

    def create(self, validated_data):
        notice_type = validated_data.pop('notice_type')
        # The rest of the data is the content for the PDF
        pdf_content_data = self.context['request'].data.copy()
        pdf_content_data.pop('notice_type', None) # ensure it's removed

        relative_pdf_path = None
        
        # Use a transaction to ensure file creation and DB save are atomic.
        with transaction.atomic():
            try:
                # 1. Generate the PDF
                relative_pdf_path, pdf_url = generate_pdf_for_notice(notice_type, pdf_content_data)

                # 2. Create the Notice instance in the database
                notice = Notice.objects.create(
                    created_by=self.context['request'].user,
                    notice_type=notice_type,
                    content_data=pdf_content_data,
                    pdf_file=relative_pdf_path,
                    **validated_data
                )
                
                # Attach the URL to the instance for the response, but don't save it to the DB
                notice.pdf_url = pdf_url
                return notice

            except Exception:
                # If anything fails, delete the generated PDF if it exists to prevent orphaned files.
                if relative_pdf_path and os.path.exists(os.path.join(settings.MEDIA_ROOT, relative_pdf_path)):
                    os.remove(os.path.join(settings.MEDIA_ROOT, relative_pdf_path))
                # Re-raise the exception to be caught by the view's main exception handler
                raise


class GenerateNoticePDFView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = GenerateNoticeSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            try:
                notice_instance = serializer.save()
                # The serializer's create method now returns the instance with the pdf_url attached
                return Response({'pdf_url': notice_instance.pdf_url}, status=status.HTTP_201_CREATED)
            except ValueError as e:
                # This can be raised by generate_pdf_for_notice if the template type is unknown
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                traceback.print_exc()
                return Response({'error': 'An error occurred on the server while generating the notice.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NoticeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, notice_id):
        try:
            notice = Notice.objects.get(pk=notice_id)
            # Enforce same scope as list: own or subordinates
            subordinates = NoticeListView().get_subordinate_users(request.user)
            allowed_ids = list(subordinates.values_list('id', flat=True)) + [request.user.id]
            if notice.created_by_id not in allowed_ids:
                return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
            serializer = NoticeSerializer(notice, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Notice.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, notice_id):
        try:
            notice = Notice.objects.get(pk=notice_id)
            # Enforce same scope as list: own or subordinates
            subordinates = NoticeListView().get_subordinate_users(request.user)
            allowed_ids = list(subordinates.values_list('id', flat=True)) + [request.user.id]
            if notice.created_by_id not in allowed_ids:
                return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

            # Log deletion activity
            log_activity(
                user=request.user,
                action='delete_notice',
                description=f"{request.user.username} deleted notice: {notice.title}",
                target_user=notice.created_by,
                request=request
            )

            # Delete the notice
            notice.delete()

            return Response({'message': 'Notice deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Notice.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Committee Management Views
class CommitteeListView(APIView):
    """Get all committees"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            committees = Committee.objects.all().order_by('name')
            serializer = CommitteeSerializer(committees, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CommitteeMembershipCreateView(APIView):
    """Create committee membership for a user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Expect data in format: {"user_id": 1, "memberships": [{"committee_id": 1, "role": "head"}, ...]}
            user_id = request.data.get('user_id')
            memberships_data = request.data.get('memberships', [])
            
            if not user_id:
                return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = CustomUser.objects.get(id=user_id)
            except CustomUser.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            created_memberships = []
            
            with transaction.atomic():
                for membership_data in memberships_data:
                    committee_id = membership_data.get('committee_id')
                    role = membership_data.get('role')
                    
                    if not committee_id or not role:
                        return Response({'error': 'committee_id and role are required for each membership'}, 
                                      status=status.HTTP_400_BAD_REQUEST)
                    
                    try:
                        committee = Committee.objects.get(id=committee_id)
                    except Committee.DoesNotExist:
                        return Response({'error': f'Committee with id {committee_id} not found'}, 
                                      status=status.HTTP_404_NOT_FOUND)
                    
                    # Check if membership already exists
                    existing_membership = CommitteeMembership.objects.filter(
                        user=user, committee=committee
                    ).first()
                    
                    if existing_membership:
                        # Update existing membership role
                        existing_membership.role = role
                        existing_membership.save()
                        created_memberships.append(existing_membership)
                    else:
                        # Create new membership
                        membership = CommitteeMembership.objects.create(
                            user=user,
                            committee=committee,
                            role=role
                        )
                        created_memberships.append(membership)
            
            serializer = CommitteeMembershipSerializer(created_memberships, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserCommitteesView(APIView):
    """Get committees for a specific user"""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            try:
                user = CustomUser.objects.get(id=user_id)
            except CustomUser.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            memberships = CommitteeMembership.objects.filter(user=user).select_related('committee')
            serializer = CommitteeMembershipSerializer(memberships, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ImageUploadView(APIView):
    """Upload image files for custom notices"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            if 'image' not in request.FILES:
                return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)

            image_file = request.FILES['image']

            # Validate file type
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if image_file.content_type not in allowed_types:
                return Response({'error': 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'},
                              status=status.HTTP_400_BAD_REQUEST)

            # Validate file size (max 5MB)
            max_size = 5 * 1024 * 1024  # 5MB
            if image_file.size > max_size:
                return Response({'error': 'File too large. Maximum size is 5MB.'},
                              status=status.HTTP_400_BAD_REQUEST)

            # Generate unique filename
            file_extension = os.path.splitext(image_file.name)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"

            # Create uploads directory if it doesn't exist
            uploads_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)

            # Save file
            file_path = os.path.join(uploads_dir, unique_filename)
            with open(file_path, 'wb+') as destination:
                for chunk in image_file.chunks():
                    destination.write(chunk)

            # Generate URL
            image_url = f"{settings.MEDIA_URL}uploads/{unique_filename}"

            return Response({
                'message': 'Image uploaded successfully',
                'image_url': image_url,
                'filename': unique_filename
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f'Upload failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LetterheadCurrentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get the latest letterhead for the user's college
            letterhead = Letterhead.objects.filter(college=request.user.college).order_by('-updated_at').first()
            if letterhead:
                serializer = LetterheadSerializer(letterhead)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({'html_content': ''}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LetterheadUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            if request.user.role != 'admin':
                return Response({'error': 'Only college admin can update letterhead'}, status=status.HTTP_403_FORBIDDEN)

            html_content = request.data.get('html_content')
            if not html_content:
                return Response({'error': 'html_content is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Create or update letterhead for the college
            letterhead, created = Letterhead.objects.get_or_create(
                college=request.user.college,
                defaults={'created_by': request.user}
            )
            letterhead.html_content = html_content
            letterhead.created_by = request.user
            letterhead.save()

            serializer = LetterheadSerializer(letterhead)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

