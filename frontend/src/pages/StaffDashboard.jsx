import StatCard from '../components/StatCard';
import QuickAction from '../components/QuickAction';

export default function StaffDashboard({ user }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-700 rounded-b-3xl shadow-xl px-8 py-10 flex items-center gap-6">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl border border-white/20">
          <span className="text-4xl">🎓</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Welcome, {user.first_name} <span className="text-yellow-300 capitalize">({user.role})</span></h1>
          <p className="text-blue-100 text-lg">Your academic workspace for teaching and collaboration.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          <StatCard label="My Notices" value={5} icon="📢" />
          <StatCard label="My Events" value={2} icon="🗓️" />
          <StatCard label="Department" value={user.department || 'N/A'} icon="🏛️" />
          <StatCard label="Role" value={user.role} icon="🧑‍🏫" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          <QuickAction icon="➕" label="Create Notice" onClick={() => alert('Create Notice')} />
          <QuickAction icon="📄" label="View Notices" onClick={() => alert('View Notices')} />
          <QuickAction icon="📅" label="View Events" onClick={() => alert('View Events')} />
          <QuickAction icon="👤" label="My Profile" onClick={() => alert('My Profile')} />
        </div>
      </div>

      {/* Section Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="my-10 border-blue-200" />
      </div>

      {/* Notice Board */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="text-xl font-semibold mb-4 text-blue-900 flex items-center gap-2"><span className="text-2xl">📢</span> Notice Board <span className="text-xs text-gray-400 ml-2">(Coming Soon)</span></h2>
        <div className="bg-white rounded-xl shadow p-8 text-gray-400">Notices will appear here.</div>
      </div>

      {/* My Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="text-xl font-semibold mb-4 text-blue-900 flex items-center gap-2"><span className="text-2xl">👤</span> My Profile <span className="text-xs text-gray-400 ml-2">(Coming Soon)</span></h2>
        <div className="bg-white rounded-xl shadow p-8 text-gray-400">Profile info will appear here.</div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-700 text-white py-6 rounded-t-3xl shadow-inner text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="font-bold text-lg">CampusNotify Academic Portal</span>
          <span className="text-blue-200 text-sm">Empowering Faculty & Collaboration</span>
          <span className="text-blue-300 text-xs">© 2024 CampusNotify. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
} 