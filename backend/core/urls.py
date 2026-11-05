from django.urls import path
from .views import CollegeCreateView, CollegeAdminCreateView, StaffCreateView, StaffListView, StaffDetailView, StaffUpdateView, StaffDeleteView, AdminSignupView, CustomTokenObtainPairView, ActiveUsersView, ActivityLogView, RoleBasedDashboardView, CommitteeListView, CommitteeMembershipCreateView, UserCommitteesView, DepartmentCreateView, DepartmentListView, DepartmentUpdateView, DepartmentDeleteView, CommitteeCreateView, CommitteeUpdateView, CommitteeDeleteView, ImageUploadView, ForgotPasswordView, ResetPasswordView, LetterheadCurrentView, LetterheadUpdateView
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .views import GenerateNoticePDFView, NoticeDetailView
from core.views import NoticeListView

urlpatterns = [
    # Authentication
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('signup/', AdminSignupView.as_view(), name='admin-signup'),
    path('users/profile/', views.UserProfileView.as_view(), name='user-profile'),

    # Password reset
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    
    # College Management
    path('college/', CollegeCreateView.as_view(), name='college-create'),
    path('college-admin/', CollegeAdminCreateView.as_view(), name='collegeadmin-create'),
    
    # Staff Management
    path('staff/', StaffCreateView.as_view(), name='create-staff'),
    path('staff/list/', StaffListView.as_view(), name='staff-list'),
    path('staff/active/', ActiveUsersView.as_view(), name='active-users'),
    path('staff/<int:staff_id>/', StaffDetailView.as_view(), name='staff-detail'),
    path('staff/<int:staff_id>/update/', StaffUpdateView.as_view(), name='staff-update'),
    path('staff/<int:staff_id>/delete/', StaffDeleteView.as_view(), name='staff-delete'),
    
    # Activity Logs
    path('activity-logs/', ActivityLogView.as_view(), name='activity-logs'),
    
    # Dashboard
    path('dashboard/role-based/', RoleBasedDashboardView.as_view(), name='role-based-dashboard'),

    # Committee Management
    path('committees/', CommitteeListView.as_view(), name='committee-list'),
    path('committee-memberships/', CommitteeMembershipCreateView.as_view(), name='committee-membership-create'),
    path('users/<int:user_id>/committees/', UserCommitteesView.as_view(), name='user-committees'),

     # Department Management
    # Legacy create route kept for compatibility
    path('departments/create/', DepartmentCreateView.as_view(), name='department-create'),
    # RESTful CRUD routes
    path('departments/', DepartmentListView.as_view(), name='department-list'),  # GET, POST
    path('departments/<int:department_id>/', DepartmentUpdateView.as_view(), name='department-detail'),  # PUT/PATCH, DELETE via view methods
    path('departments/<int:department_id>/update/', DepartmentUpdateView.as_view(), name='department-update'),
    path('departments/<int:department_id>/delete/', DepartmentDeleteView.as_view(), name='department-delete'),

    # Committee Management (extra CRUD)
    # Legacy create route kept for compatibility
    path('committees/create/', CommitteeCreateView.as_view(), name='committee-create'),
    # RESTful CRUD routes
    path('committees/<int:committee_id>/', CommitteeUpdateView.as_view(), name='committee-detail'),  # PUT/PATCH, DELETE via view methods
    path('committees/<int:committee_id>/update/', CommitteeUpdateView.as_view(), name='committee-update'),
    path('committees/<int:committee_id>/delete/', CommitteeDeleteView.as_view(), name='committee-delete'),

    # Notice APIs
    path('notices/', NoticeListView.as_view(), name='notice-list-legacy'),  # legacy
    path('notices/list/', NoticeListView.as_view(), name='notice-list'),
    path('notices/<int:notice_id>/', NoticeDetailView.as_view(), name='notice-detail'),

    path('notices/generate/', GenerateNoticePDFView.as_view(), name='generate-notice-pdf'),

    # Image Upload
    path('upload/image/', ImageUploadView.as_view(), name='image-upload'),

    # Letterhead Management
    path('letterhead/current/', LetterheadCurrentView.as_view(), name='letterhead-current'),
    path('letterhead/update/', LetterheadUpdateView.as_view(), name='letterhead-update'),

    # path('notices/', get_notices, name='get_notices'),

    # Note: Admin accounts are created via Django management command for security
    # Usage: python manage.py create_college_admin --username=admin --email=admin@mesgcc.edu --password=secure123
]