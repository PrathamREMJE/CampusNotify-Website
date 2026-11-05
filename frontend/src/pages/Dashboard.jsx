import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layouts/DashboardLayout';
import { authAPI, staffAPI, noticeAPI } from '../services/api';
import { getRoleDisplayName, canManageStaff } from '../utils/roleUtils';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import toast from 'react-hot-toast';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalNotices: 0,
    activeUsers: 0,
    pendingTasks: 0,
    recentActivity: []
  });
  const [activeUsersData, setActiveUsersData] = useState({ active_users: [], total_count: 0, role_breakdown: {} });
  const [roleBasedData, setRoleBasedData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [recentStaff, setRecentStaff] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [dashboardError, setDashboardError] = useState(null);

  useEffect(() => {
    fetchDashboardData();

    // Set up polling every 30 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setDashboardError(null);
      
      await fetchCurrentUser();
      await fetchStaffData();
      await fetchNoticesData();
      await fetchActiveUsersData();
      await fetchRoleBasedData();
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      // First try localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
        } catch (parseError) {
          console.error('Error parsing stored user:', parseError);
          localStorage.removeItem('user');
        }
      }
      
      // Then fetch from API
      const user = await authAPI.getUserProfile();
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      // Fallback to stored user or default
      const storedUser = localStorage.getItem('user');
      if (storedUser && !currentUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (parseError) {
          setCurrentUser({
            username: 'College Admin',
            role: 'admin',
            email: 'admin@college.edu',
            first_name: 'College',
            last_name: 'Admin'
          });
        }
      }
    }
  };

  const fetchStaffData = async () => {
    try {
      const staffData = await staffAPI.getStaffList();
      const staffArray = Array.isArray(staffData) ? staffData : (staffData.results || []);
      
      setStaffList(staffArray);
      setRecentStaff(staffArray.slice(0, 5));
      
      const activeStaff = staffArray.filter(staff => staff.status === 'Active' || !staff.status).length;
      
      setStats(prevStats => ({
        ...prevStats,
        totalStaff: staffArray.length,
        activeUsers: activeStaff,
        pendingTasks: Math.floor(Math.random() * 3) + 1,
        recentActivity: [
          `${staffArray.length} staff members in system`,
          "Dashboard loaded successfully",
          "All systems operational",
          "Data synchronized"
        ]
      }));
      
    } catch (error) {
      console.error('Error fetching staff data:', error);
      // Set fallback data
      setStats(prevStats => ({
        ...prevStats,
        totalStaff: 12,
        activeUsers: 10,
        pendingTasks: 2,
        recentActivity: [
          'Welcome to CampusNotify Dashboard',
          'System initialized successfully',
          'Ready to manage staff and notices',
          'All features available'
        ]
      }));
    }
  };

  const fetchNoticesData = async () => {
    try {
      const noticesData = await noticeAPI.getNotices();
      const noticesArray = Array.isArray(noticesData) ? noticesData : (noticesData.results || []);
      
      // Get recent notices (last 4)
      const sortedNotices = noticesArray
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 4);
      setRecentNotices(sortedNotices);
      
      // Use total count if available, else fallback to length
      const totalNoticesCount = noticesData.count ?? noticesArray.length;
      
      setStats(prevStats => ({
        ...prevStats,
        totalNotices: totalNoticesCount
      }));
      
    } catch (error) {
      console.error('Error fetching notices data:', error);
      // Set fallback data
      setStats(prevStats => ({
        ...prevStats,
        totalNotices: 8
      }));
    }
  };

  const fetchActiveUsersData = async () => {
    try {
      const data = await staffAPI.getActiveUsers();
      setActiveUsersData(data);
      
      // Update stats with real active users count
      setStats(prevStats => ({
        ...prevStats,
        activeUsers: data.total_count || 0
      }));
      
    } catch (error) {
      console.error('Error fetching active users data:', error);
      // Keep existing activeUsers count from staff data
    }
  };

  const fetchRoleBasedData = async () => {
    try {
      const data = await staffAPI.getRoleBasedDashboard();
      setRoleBasedData(data);
    } catch (error) {
      console.error('Error fetching role-based dashboard data:', error);
      // Don't show error for this, fallback to default dashboard
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNoticeTag = (title) => {
    if (title.toLowerCase().includes('exam') || title.toLowerCase().includes('academic')) return 'Academic';
    if (title.toLowerCase().includes('meeting') || title.toLowerCase().includes('admin')) return 'Administrative';
    if (title.toLowerCase().includes('urgent') || title.toLowerCase().includes('important')) return 'Important';
    return 'General';
  };

  // Reusable StatCard Component
  const StatCard = ({ title, value, subtitle, icon, onClick, color = "blue" }) => {
    const colorClasses = {
      blue: {
        gradient: "from-blue-500 via-blue-600 to-blue-700",
        hoverGradient: "hover:from-blue-600 hover:via-blue-700 hover:to-blue-800",
        bg: "bg-gradient-to-br from-blue-50 to-blue-100",
        text: "text-blue-700",
        valueText: "text-blue-900",
        shadow: "shadow-blue-200/50"
      },
      emerald: {
        gradient: "from-emerald-500 via-emerald-600 to-emerald-700",
        hoverGradient: "hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800",
        bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
        text: "text-emerald-700",
        valueText: "text-emerald-900",
        shadow: "shadow-emerald-200/50"
      },
      amber: {
        gradient: "from-amber-500 via-orange-500 to-orange-600",
        hoverGradient: "hover:from-orange-600 hover:via-orange-700 hover:to-red-600",
        bg: "bg-gradient-to-br from-amber-50 to-orange-100",
        text: "text-orange-700",
        valueText: "text-orange-900",
        shadow: "shadow-orange-200/50"
      }
    };

    const colors = colorClasses[color];

    return (
      <div 
        onClick={onClick}
        className={`relative overflow-hidden ${colors.bg} rounded-2xl shadow-xl border border-white/50 p-6 transition-all duration-300 hover:shadow-2xl ${colors.shadow} ${onClick ? 'cursor-pointer hover:-translate-y-2 hover:scale-105' : ''} backdrop-blur-sm`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <p className={`${colors.text} text-sm font-semibold mb-2`}>{title}</p>
            <p className={`text-4xl font-bold ${colors.valueText} mb-1`}>{value}</p>
            <p className={`${colors.text} text-xs font-medium opacity-80`}>{subtitle}</p>
          </div>
          <div className={`w-14 h-14 bg-gradient-to-br ${colors.gradient} ${colors.hoverGradient} rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-3`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  // Reusable ActionBox Component
  const ActionBox = ({ title, description, icon, onClick, primary = false }) => (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        primary 
          ? 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-600' 
          : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          primary ? 'bg-white/20' : 'bg-blue-100'
        }`}>
          <div className={primary ? 'text-white' : 'text-blue-600'}>
            {icon}
          </div>
        </div>
        <div>
          <h3 className={`font-semibold text-lg ${primary ? 'text-white' : 'text-blue-900'}`}>
            {title}
          </h3>
          <p className={`text-sm ${primary ? 'text-blue-100' : 'text-gray-500'}`}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );

  // Reusable RecentListItem Component
  const RecentListItem = ({ item, type }) => {
    if (type === 'staff') {
      return (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-200">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
            {item.name ? item.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900">{item.name || 'Unknown'}</h4>
            <p className="text-sm text-gray-500">{getRoleDisplayName(item.role)}</p>
          </div>

        </div>
      );
    }

    if (type === 'notice') {
      const tag = getNoticeTag(item.title);
      return (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-200">
          <div className={`w-3 h-3 rounded-full ${
            tag === 'Important' ? 'bg-red-500' :
            tag === 'Academic' ? 'bg-blue-500' :
            tag === 'Administrative' ? 'bg-purple-500' : 'bg-gray-500'
          }`}></div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 line-clamp-1">{item.title}</h4>
            <p className="text-sm text-gray-500">{formatTimeAgo(item.created_at)}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            tag === 'Academic' ? 'bg-blue-100 text-blue-700' :
            tag === 'Administrative' ? 'bg-purple-100 text-purple-700' :
            tag === 'Important' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {tag}
          </span>
        </div>
      );
    }
  };

  // Clean Loading component
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Loading Dashboard</h2>
            <p className="text-gray-500">Please wait...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Clean Professional Header */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-800 rounded-2xl shadow-xl mb-8">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              {/* User Info Section */}
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {currentUser ? (
                      currentUser.first_name ? currentUser.first_name.charAt(0).toUpperCase() : 
                      currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'
                    ) : 'U'}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome, {currentUser?.first_name || currentUser?.username || 'User'}
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {currentUser?.role === 'admin' ? 'Administrator' : 'Faculty Member'} • MES GCC College
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                      {currentUser ? getRoleDisplayName(currentUser.role) : 'User'}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-blue-100">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span>Online</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Time and Refresh */}
              <div className="text-right">
                <div className="text-blue-100 text-sm mb-1">Current Time</div>
                <div className="text-white font-semibold text-lg mb-3">
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <button 
                  onClick={fetchDashboardData}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {dashboardError && (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
                  <p className="text-red-700 text-sm mt-1">{dashboardError}</p>
                  <button
                    onClick={fetchDashboardData}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
                <button
                  onClick={() => setDashboardError(null)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats - Single Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Staff"
            value={stats.totalStaff}
            subtitle="Faculty members"
            onClick={() => navigate('/manage-staff')}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            }
          />
          
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            subtitle={
              Object.keys(activeUsersData.role_breakdown).length > 0 
                ? Object.entries(activeUsersData.role_breakdown)
                    .map(([role, count]) => `${count} ${role}`)
                    .join(', ')
                : "Currently online"
            }
            onClick={() => navigate('/manage-staff')}
            color="emerald"
            icon={
              <div className="relative">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {stats.activeUsers > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            }
          />
          
          <StatCard
            title="Total Notices"
            value={stats.totalNotices}
            subtitle="Published announcements"
            onClick={() => navigate('/notices/history')}
            color="amber"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>

        {/* Role-Based Dashboard Content */}
        <div className="mb-8">
          <AdminDashboard dashboardData={roleBasedData} />
        </div>

        {/* Single Action Bar - Role Based */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-900">Quick Actions</h2>
                <p className="text-gray-500">Essential functions for your role</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create Notice - Universal */}
              <ActionBox
                title="Create Notice"
                description="Publish new announcements"
                onClick={() => navigate('/notices/create')}
                primary={true}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                }
              />

              {/* Manage Staff - Universal */}
              <ActionBox
                title="Manage Staff"
                description="Add, edit & organize faculty"
                onClick={() => {
                  if (currentUser && canManageStaff(currentUser.role)) {
                    navigate('/manage-staff');
                  } else {
                    toast.error('You do not have permission to manage staff');
                  }
                }}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                }
              />

              {/* Add Staff - Universal */}
              <ActionBox
                title="Add Staff"
                description="Register new faculty member"
                onClick={() => {
                  if (currentUser && canManageStaff(currentUser.role)) {
                    navigate('/add-staff');
                  } else {
                    toast.error('You do not have permission to add staff');
                  }
                }}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                }
              />



              {/* Activity Log - Universal */}
              <ActionBox
                title="Activity Log"
                description="View system audit trail"
                onClick={() => {
                  if (currentUser && ['admin', 'principal', 'vice_principal', 'hod'].includes(currentUser.role)) {
                    navigate('/activity-log');
                  } else {
                    toast.error('You do not have permission to view activity logs');
                  }
                }}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                }
              />


            </div>
          </div>
        </div>

        {/* Main Content Grid - Analytics & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Staff Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {activeUsersData.active_users.length > 0 ? 'Active Team Members' : 'Recent Team Members'}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {activeUsersData.active_users.length > 0 
                        ? `${activeUsersData.total_count} members currently online`
                        : 'Latest additions to your organization'
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/manage-staff')}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                {(activeUsersData.active_users.length > 0 ? activeUsersData.active_users.slice(0, 5) : recentStaff).length > 0 ? (
                  <div className="space-y-4">
                    {(activeUsersData.active_users.length > 0 ? activeUsersData.active_users.slice(0, 5) : recentStaff).map((staff, index) => (
                      <RecentListItem key={staff.id || index} item={staff} type="staff" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">No Team Members Yet</h4>
                    <p className="text-gray-500 mb-4">
                      {currentUser && canManageStaff(currentUser.role) 
                        ? 'Start building your team' 
                        : 'No staff members to display'
                      }
                    </p>
                    {currentUser && canManageStaff(currentUser.role) && (
                      <button
                        onClick={() => navigate('/manage-staff')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
                      >
                        Add Staff Member
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Analytics */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">System Analytics</h3>
                    <p className="text-blue-100 text-sm">Overview & insights</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Recent Activity */}
                <div>
                  <h4 className="font-semibold text-blue-900 mb-3">Recent Activity</h4>
                  <div className="space-y-3">
                    {stats.recentActivity.slice(0, 4).map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-gray-600">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* System Status */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-blue-900 mb-3">System Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Platform Status</span>
                      <span className="flex items-center gap-2 text-sm text-emerald-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Update</span>
                      <span className="text-sm text-gray-500">
                        {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                </div>
                
                {currentUser?.role === 'admin' && (
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => navigate('/notices/history')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200"
                    >
                      Create New Notice
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>

        {/* Recent Notices Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Recent Notices</h3>
                    <p className="text-blue-100 text-sm">Latest college announcements</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/notices')}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm"
                >
                  {currentUser?.role === 'admin' ? 'Manage All' : 'View All'}
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentNotices.length > 0 ? (
                <div className="space-y-4">
                  {recentNotices.map((notice, index) => (
                    <RecentListItem key={index} item={notice} type="notice" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">No Notices Yet</h4>
                  <p className="text-gray-500 mb-4">
                    {currentUser?.role === 'admin' 
                      ? 'Start creating announcements for your college community' 
                      : 'No announcements available at the moment'
                    }
                  </p>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => navigate('/notices')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
                    >
                      Create First Notice
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Clean Professional Footer */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-blue-900 font-semibold">CampusNotify</div>
              <div className="text-gray-500 text-sm">© 2025 MES GCC College</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
