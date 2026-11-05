import React from 'react';
import { getRoleDisplayName } from '../../utils/roleUtils';

function AdminDashboard({ dashboardData }) {
  const { 
    college_stats = {}, 
    all_departments = [], 
    recent_activities = [], 
    notices = [] 
  } = dashboardData;

  return (
    <>
      {/* Removed College Administration section as requested */}

      {/* Recent Activities Section - Visible to all roles */}
      {recent_activities && recent_activities.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Activities</h3>
            <span className="text-sm text-gray-500">Last 20 activities</span>
          </div>
          <div className="space-y-4">
            {recent_activities.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user} - {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time_ago}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Departments Overview */}
      {all_departments && all_departments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Departments Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {all_departments.map((dept, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-2">{dept.name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Staff:</span>
                    <span className="font-medium">{dept.total_staff}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Online:</span>
                    <span className="font-medium text-green-600">{dept.online_staff}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


    </>
  );
}
export default AdminDashboard;

