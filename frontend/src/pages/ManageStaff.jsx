import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layouts/DashboardLayout';
import { staffAPI, authAPI } from '../services/api';
import { getRoleDisplayName, canDeleteRole, canManageStaff } from '../utils/roleUtils';
import toast from 'react-hot-toast';

function ManageStaff() {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [activeUsersStats, setActiveUsersStats] = useState({ total_count: 0, role_breakdown: {} });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user and staff data from backend
  useEffect(() => {
    fetchCurrentUser();
    fetchStaffList();
    fetchActiveUsers();
    
    // Set up periodic refresh for active users (every 30 seconds)
    const interval = setInterval(() => {
      fetchActiveUsers();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const user = await authAPI.getUserProfile();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user permissions');
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const data = await staffAPI.getActiveUsers();
      setActiveUsers(data.active_users || []);
      setActiveUsersStats({
        total_count: data.total_count || 0,
        role_breakdown: data.role_breakdown || {}
      });
    } catch (err) {
      console.error('Error fetching active users:', err);
      // Don't show error toast for this, it's not critical
    }
  };

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await staffAPI.getStaffList();
      // Normalize department to string name for consistent UI filtering/display
      const normalized = (data || []).map((s) => ({
        ...s,
        department: typeof s?.department === 'object' && s?.department !== null ? (s.department.name || 'Not Assigned') : (s?.department || 'Not Assigned'),
      }));
      setStaffList(normalized);
    } catch (err) {
      console.error('Error fetching staff list:', err);
      setError('Failed to load staff data. Please try again.');
      // Fallback to mock data if API fails
      const mockStaff = [
        {
          id: 1,
          name: 'Dr. John Doe',
          email: 'john.doe@college.edu',
          department: 'Computer Science',
          role: 'principal',
          position: 'Principal',
          phone: '+91 98765 43210',
          joinDate: '2020-01-15',
          status: 'Active'
        },
        {
          id: 2,
          name: 'Prof. Jane Smith',
          email: 'jane.smith@college.edu',
          department: 'Commerce',
          role: 'hod',
          position: 'HOD',
          phone: '+91 98765 43211',
          joinDate: '2021-08-20',
          status: 'Active'
        },
        {
          id: 3,
          name: 'Mr. Rahul Kumar',
          email: 'rahul.kumar@college.edu',
          department: 'Computer Science',
          role: 'teacher',
          position: 'Teacher',
          phone: '+91 98765 43212',
          joinDate: '2022-03-10',
          status: 'Active'
        },
        {
          id: 4,
          name: 'Ms. Priya Sharma',
          email: 'priya.sharma@college.edu',
          department: 'Administration',
          role: 'senior_clerk',
          position: 'Senior Clerk',
          phone: '+91 98765 43213',
          joinDate: '2023-01-05',
          status: 'Active'
        }
      ];
      setStaffList(mockStaff);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleAddStaff = () => {
    // Check if user has permission to add staff
    if (!currentUser || !canManageStaff(currentUser.role)) {
      toast.error('You do not have permission to add staff members');
      return;
    }
    navigate('/add-staff');
  };

  const handleEditStaff = (staffId) => {
    // Navigate to edit page
    navigate(`/edit-staff/${staffId}`);
  };

  const handleDelete = async (staffId) => {
    // Find the staff member to delete
    const staffToDelete = staffList.find(staff => staff.id === staffId);
    if (!staffToDelete) {
      toast.error('Staff member not found');
      return;
    }

    // Check if current user has permission to delete this staff member
    if (!currentUser || !canDeleteRole(currentUser.role, staffToDelete.role)) {
      toast.error(`You do not have permission to delete ${getRoleDisplayName(staffToDelete.role)}`);
      return;
    }

    // Show confirmation and delete staff
    if (window.confirm(`Are you sure you want to delete ${staffToDelete.name} (${getRoleDisplayName(staffToDelete.role)})?`)) {
      try {
        await staffAPI.deleteStaff(staffId);
        toast.success('Staff member deleted successfully');
        fetchStaffList(); // Refresh staff list
      } catch (err) {
        console.error('Error deleting staff:', err);
        toast.error('Failed to delete staff member. Please try again.');
        
        // Fallback: Remove from local state if API fails
        setStaffList(staffList.filter(staff => staff.id !== staffId));
      }
    }
  };

  // Filter staff based on search, department, role, and status
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = (staff.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (staff.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (staff.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getRoleDisplayName(staff.role || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || staff.department === filterDepartment;
    const matchesRole = filterRole === 'all' || staff.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && staff.is_online) ||
                         (filterStatus === 'inactive' && !staff.is_online);
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  const departments = ['all', ...new Set(staffList.map(staff => staff.department).filter(dept => dept))];
  const roles = ['all', ...new Set(staffList.map(staff => staff.role).filter(role => role))];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 group bg-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>

        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-800 rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Staff Management</h1>
                <p className="text-blue-100 text-lg">
                  {currentUser ? (
                    canManageStaff(currentUser.role) ? 
                      `As ${getRoleDisplayName(currentUser.role)}, you can manage staff members according to hierarchy` :
                      `As ${getRoleDisplayName(currentUser.role)}, you can view staff members but cannot add or delete them`
                  ) : (
                    'View, search, and manage all staff members'
                  )}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                    {currentUser ? getRoleDisplayName(currentUser.role) : 'User'}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-blue-100">
                    <div className={`w-2 h-2 rounded-full ${
                      currentUser?.user_status === 'active' || currentUser?.is_online 
                        ? 'bg-emerald-400 animate-pulse' 
                        : 'bg-red-400'
                    }`}></div>
                    <span>
                      {currentUser?.user_status === 'active' || currentUser?.is_online 
                        ? 'Active' 
                        : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search staff by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Department Filter */}
              <div className="relative">
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="appearance-none bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-800 px-4 py-3 pr-10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-all duration-200"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Role Filter */}
              <div className="relative">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="appearance-none bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-purple-800 px-4 py-3 pr-10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium cursor-pointer hover:from-purple-100 hover:to-purple-200 transition-all duration-200"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role === 'all' ? 'All Roles' : getRoleDisplayName(role)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 pr-10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium cursor-pointer hover:from-emerald-100 hover:to-emerald-200 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">🟢 Active</option>
                  <option value="inactive">🔴 Inactive</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Add Staff Button - Only show if user has permission */}
              {currentUser && canManageStaff(currentUser.role) && (
                <button
                  onClick={handleAddStaff}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Add Staff</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Currently Active Users Section */}
        {activeUsersStats.total_count > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Currently Active Users</h2>
                    <p className="text-emerald-100 text-sm">
                      {activeUsersStats.total_count} user{activeUsersStats.total_count !== 1 ? 's' : ''} online now
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/90 text-sm">Role Breakdown:</div>
                  <div className="flex gap-3 mt-1">
                    {Object.entries(activeUsersStats.role_breakdown).map(([role, count]) => (
                      <span key={role} className="bg-white/20 px-3 py-1 rounded-full text-xs text-white">
                        {count} {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeUsers.slice(0, 6).map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="relative">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{user.name}</h4>
                      <p className="text-sm text-gray-500 truncate">{getRoleDisplayName(user.role)}</p>
                      <p className="text-xs text-emerald-600">
                        {user.last_login_time ? 
                          `Active since ${new Date(user.last_login_time).toLocaleTimeString()}` : 
                          'Recently active'
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {activeUsers.length > 6 && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => {/* TODO: Show all active users modal */}}
                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                  >
                    View all {activeUsers.length} active users →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Staff List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">All Staff Members</h2>
                  <p className="text-blue-100 text-sm">
                    Showing {filteredStaff.length} of {staffList.length} staff members
                  </p>
                </div>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-xl">
                <span className="text-white font-semibold text-lg">{staffList.length}</span>
                <span className="text-blue-100 text-sm ml-1">Total</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Loading Staff Data</h3>
                <p className="text-gray-500">Please wait while we fetch the staff information...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <button
                  onClick={fetchStaffList}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">No Staff Found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterDepartment !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No staff members have been added yet'
                  }
                </p>
                {currentUser && canManageStaff(currentUser.role) && !searchTerm && filterDepartment === 'all' && (
                  <button
                    onClick={handleAddStaff}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
                  >
                    Add First Staff Member
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStaff.map((staff) => (
                  <div key={staff.id} className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-blue-300 group-hover:scale-105 transition-all duration-300">
                              {(staff.name || 'U').charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-blue-900 group-hover:text-blue-700 transition-colors">{staff.name}</h3>
                            <p className="text-blue-600 font-semibold">
                              {getRoleDisplayName(staff.role || staff.position)} • {staff.department}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm ml-20">
                          <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6a2 2 0 114 0v1H8V6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="font-medium">ID: {staff.id || 'EMP' + String(staff.id || Math.floor(Math.random() * 1000)).padStart(3, '0')}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="font-medium">Verified Member</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="font-medium">Joined: {staff.joinDate || 'Recently'}</span>
                          </div>
                        </div>

                        {/* Last Activity Info */}
                        {(staff.last_login_time || staff.last_logout_time) && (
                          <div className="mt-3 ml-20 flex items-center gap-4 text-xs text-gray-500">
                            {staff.last_login_time && (
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                <span>Last login: {new Date(staff.last_login_time).toLocaleDateString()}</span>
                              </div>
                            )}
                            {staff.last_logout_time && (
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                <span>Last logout: {new Date(staff.last_logout_time).toLocaleDateString()}</span>
                              </div>
                            )}
                            {staff.session_count > 0 && (
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                <span>Sessions: {staff.session_count}</span>
                              </div>
                            )}
                            {staff.current_session_duration > 0 && (
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span>Online: {staff.current_session_duration}m</span>
                              </div>
                            )}
                            {staff.total_session_time && (
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                <span>Total: {staff.total_session_time}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Combined Status Badge */}
                        <span className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-md flex items-center gap-2 ${
                          staff.is_online 
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            staff.is_online ? 'bg-white' : 'bg-white'
                          }`}></div>
                          {staff.is_online ? 'Active' : 'Inactive'}
                        </span>

                        {/* Action Buttons */}
                        {currentUser && canDeleteRole(currentUser.role, staff.role) && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditStaff(staff.id)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-1"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(staff.id)}
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-1"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ManageStaff;
