import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { getRoleDisplayName } from '../utils/roleUtils';

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalNotices: 0,
    activeUsers: 0,
    pendingTasks: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const user = await authAPI.getUserProfile();
      setCurrentUser(user);
      
      // Mock data for now
      setStats({
        totalStaff: 24,
        totalNotices: 12,
        activeUsers: 8,
        pendingTasks: 3,
        recentActivity: [
          'New faculty member added to Computer Science department',
          'Notice published: Mid-semester examination schedule',
          'Staff profile updated: Dr. Sarah Johnson',
          'System backup completed successfully'
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/30 rounded-2xl shadow-sm border border-gray-200/60 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Welcome back, {currentUser?.first_name || 'User'}!
                    </h1>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                        {currentUser ? getRoleDisplayName(currentUser.role) : 'User'}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                        <span className="font-medium">Online</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-base mb-4 leading-relaxed">
                  Manage your college notices and staff efficiently with our streamlined platform
                </p>
                
                {/* Institution Info */}
                {(currentUser?.college_name || currentUser?.department) && (
                  <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        {currentUser.college_name && (
                          <div className="font-semibold text-gray-900">{currentUser.college_name}</div>
                        )}
                        {currentUser.department && (
                          <div className="text-sm text-gray-600">{currentUser.department} Department</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-col gap-4">
                <div className="text-center bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="text-sm text-gray-600 font-medium mb-1">Today</div>
                  <div className="text-lg font-bold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-sm">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{stats.totalStaff}</div>
                      <div className="text-xs text-gray-600 font-medium">Total Staff</div>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-sm">
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">{stats.totalNotices}</div>
                      <div className="text-xs text-gray-600 font-medium">Active Notices</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Recent Staff Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 p-6 border-b border-gray-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Faculty Members</h3>
                      <p className="text-gray-600 text-sm">Recent staff additions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/manage-staff')}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-xl transition-all duration-200"
                  >
                    Manage All
                  </button>
                </div>
              </div>
              <div className="p-6">
                {stats.totalStaff > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Dr. Sarah Johnson", dept: "Computer Science", status: "active", role: "Professor" },
                      { name: "Prof. Michael Chen", dept: "Mathematics", status: "active", role: "Associate Professor" },
                      { name: "Dr. Emily Davis", dept: "Physics", status: "active", role: "Assistant Professor" },
                      { name: "Prof. Robert Wilson", dept: "Chemistry", status: "active", role: "Professor" }
                    ].map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-blue-50/50 rounded-xl transition-colors duration-200 group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{member.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{member.dept}</span>
                              <span>•</span>
                              <span>{member.role}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">No staff members found</p>
                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => navigate('/manage-staff')}
                        className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Add Staff Member
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50/30 p-6 border-b border-gray-200/60">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Quick Stats</h3>
                    <p className="text-gray-600 text-sm">System overview</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {/* Notice Stats */}
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-700">Total Notices</span>
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-purple-700">{stats.totalNotices}</div>
                    <div className="text-xs text-purple-600 mt-1">Published announcements</div>
                  </div>

                  {/* Staff Stats */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">Faculty Members</span>
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{stats.totalStaff}</div>
                    <div className="text-xs text-blue-600 mt-1">Registered staff</div>
                  </div>

                  {/* Active Users */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-emerald-700">Active Users</span>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">{stats.activeUsers}</div>
                    <div className="text-xs text-emerald-600 mt-1">Currently online</div>
                  </div>
                </div>
                
                {/* Quick Action Button */}
                <div className="mt-6 pt-4 border-t border-gray-200/60">
                  {currentUser?.role === 'admin' ? (
                <button
                  onClick={() => navigate('/notices/history')}
                  className="w-full flex items-center justify-center gap-2 text-purple-600 hover:text-purple-800 font-semibold text-sm bg-purple-50 hover:bg-purple-100 px-4 py-3 rounded-xl transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New Notice
                </button>
                  ) : (
                    <button
                      onClick={() => navigate('/notices')}
                      className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-xl transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      View Notice Board
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notices */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-gray-200/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Recent Notices</h3>
                    <p className="text-gray-600 text-sm">Latest college announcements</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/notices')}
                  className="text-purple-600 hover:text-purple-800 font-semibold text-sm bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-xl transition-all duration-200"
                >
                  Manage All
                </button>
              </div>
            </div>
            <div className="p-6">
              {stats.totalNotices > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Guest Lecture on AI & Machine Learning", time: "2 hours ago", priority: "high", type: "Academic" },
                    { title: "Faculty Meeting - Department Heads", time: "5 hours ago", priority: "medium", type: "Administrative" },
                    { title: "Student Registration Deadline Extended", time: "1 day ago", priority: "high", type: "Important" },
                    { title: "Library Timing Changes", time: "2 days ago", priority: "low", type: "General" }
                  ].map((notice, index) => (
                    <div key={index} className="flex items-center justify-between p-5 bg-gray-50/50 hover:bg-purple-50/50 rounded-xl transition-colors duration-200 group cursor-pointer border border-gray-100 hover:border-purple-200">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${
                          notice.priority === 'high' ? 'bg-red-500' :
                          notice.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors mb-1">{notice.title}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">{notice.time}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notice.type === 'Academic' ? 'bg-blue-100 text-blue-700' :
                              notice.type === 'Administrative' ? 'bg-purple-100 text-purple-700' :
                              notice.type === 'Important' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {notice.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">No Notices Yet</h4>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    {currentUser?.role === 'admin' 
                      ? 'Start creating announcements for your college community' 
                      : 'No announcements available at the moment'
                    }
                  </p>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => navigate('/notices')}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Create First Notice
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div className="bg-gradient-to-r from-white via-gray-50/50 to-blue-50/30 rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Platform running smoothly</span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              CampusNotify © 2025 • Notice Management Platform
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;