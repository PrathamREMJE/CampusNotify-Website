from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

# Create your models here.

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class CustomUser(AbstractUser):
    ROLE_CHOICES = [ 
        ('admin', 'College Admin'),  # Main college administrator
        ('principal', 'Principal'),
        ('vice_principal', 'Vice Principal'),
        ('office_superintendent', 'Office Superintendent'),
        ('senior_clerk', 'Senior Clerk'),
        ('hod', 'Head of Department'),
        ('teacher', 'Teacher'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    role = models.CharField(max_length=30, choices=ROLE_CHOICES)
    college = models.ForeignKey('College', on_delete=models.CASCADE, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    departments = models.ManyToManyField(Department, blank=True, related_name='hods')  # Only used for HODs
    phone = models.CharField(max_length=15, blank=True, null=True)  # Added phone field
    # In CustomUser model

    
    # Activity tracking fields
    user_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inactive', help_text="Current user activity status")
    last_login_time = models.DateTimeField(null=True, blank=True, help_text="Last time user logged in")
    last_logout_time = models.DateTimeField(null=True, blank=True, help_text="Last time user logged out")
    is_online = models.BooleanField(default=False, help_text="Whether user is currently online")
    session_count = models.IntegerField(default=0, help_text="Total number of login sessions")
    current_session_start = models.DateTimeField(null=True, blank=True, help_text="When current session started")
    total_session_duration = models.DurationField(default=timedelta(0), help_text="Total time spent online")

    def __str__(self):
        return self.username
    
    def set_online(self):
        """Mark user as online when they login"""
        now = timezone.now()
        self.is_online = True
        self.user_status = 'active'
        self.last_login_time = now
        self.current_session_start = now
        self.session_count += 1
        self.save(update_fields=['is_online', 'user_status', 'last_login_time', 'current_session_start', 'session_count'])
    
    def set_offline(self):
        """Mark user as inactive when they logout"""
        now = timezone.now()
        
        # Calculate session duration if session was active
        if self.current_session_start:
            session_duration = now - self.current_session_start
            self.total_session_duration += session_duration
        
        self.is_online = False
        self.user_status = 'inactive'
        self.last_logout_time = now
        self.current_session_start = None
        self.save(update_fields=['is_online', 'user_status', 'last_logout_time', 'current_session_start', 'total_session_duration'])
    
    def get_current_session_duration(self):
        """Get current session duration in minutes"""
        if self.is_online and self.current_session_start:
            duration = timezone.now() - self.current_session_start
            return int(duration.total_seconds() / 60)  # Return minutes
        return 0
    
    def get_total_session_time(self):
        """Get total session time as formatted string"""
        total_seconds = int(self.total_session_duration.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        return f"{hours}h {minutes}m"





class Committee(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class CommitteeMembership(models.Model):
    ROLE_CHOICES = [
        ('head', 'Committee Head'),
        ('member', 'Committee Member'),
    ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='committee_memberships')
    committee = models.ForeignKey(Committee, on_delete=models.CASCADE, related_name='members')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.committee.name} ({self.get_role_display()})"

    def get_members(self):
        return self.members.all()  # via related_name



class ActivityLog(models.Model):
    """Track user activities for audit trail"""
    ACTION_CHOICES = [
        ('create_user', 'Created User'),
        ('update_user', 'Updated User'),
        ('delete_user', 'Deleted User'),
        ('login', 'User Login'),
        ('logout', 'User Logout'),
        ('create_notice', 'Created Notice'),
        ('update_notice', 'Updated Notice'),
        ('delete_notice', 'Deleted Notice'),
        ('view_dashboard', 'Viewed Dashboard'),
        ('manage_staff', 'Accessed Staff Management'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    target_user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='targeted_activities')
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.user.username} - {self.get_action_display()} at {self.timestamp}"


class Notice(models.Model):
    title = models.CharField(max_length=200)
    notice_type = models.CharField(max_length=50)
    content_data = models.JSONField(default=dict)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True)
    pdf_file = models.FileField(upload_to='notices_pdfs/', null=True, blank=True)
    letterhead_html = models.TextField(blank=True, null=True)

class College(models.Model):
    college_name = models.CharField(max_length=100)
    college_code = models.CharField(max_length=10)
    college_phno = models.CharField(max_length=15)
    college_email = models.EmailField()
    college_address = models.TextField(blank=True)
    college_documents = models.FileField(upload_to='college_documents/', blank=True, null=True)
    offers_junior = models.BooleanField(default=False)
    offers_ug = models.BooleanField(default=False)
    offers_pg = models.BooleanField(default=False)

    def __str__(self):
        return self.college_name


class CollegeAdmin(models.Model):
    college = models.ForeignKey('College', on_delete=models.CASCADE, related_name='admins')
    college_admin_name = models.CharField(max_length=100)
    college_admin_email = models.EmailField()
    college_admin_phno = models.CharField(max_length=15)
    college_admin_username = models.CharField(max_length=150, unique=True,null=True)
    college_admin_password = models.CharField(max_length=100)

from django.db import models
from django.utils import timezone

class Letterhead(models.Model):
    """
    Stores the official HTML + CSS of the college letterhead.
    Only the developer will update this from Django Admin.
    Other users can view or render it but not modify it.
    """
    name = models.CharField(max_length=100, default="Default Letterhead")
    html_content = models.TextField("Letterhead HTML")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Letterhead Template"
        verbose_name_plural = "Letterhead Templates"
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.name} (Updated: {self.updated_at.strftime('%Y-%m-%d')})"

