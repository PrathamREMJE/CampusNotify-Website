import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Card from '../components/Card';
import { useState } from 'react';

export default function PrincipalDashboard() {
  const [showForm, setShowForm] = useState(true);
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar />
        <main className="p-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-6">Welcome, Principal!</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-900 font-semibold text-lg">
                  <span role="img" aria-label="notices">🗒️</span> Manage Notices
                </div>
                <button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded font-semibold text-sm">+ Create Notice</button>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-900 font-semibold text-lg">
                  <span role="img" aria-label="staff">👥</span> Manage Staff
                </div>
                <button onClick={() => setShowForm(f => !f)} className={`px-4 py-2 rounded font-semibold text-sm ${showForm ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-700 hover:bg-blue-800 text-white'}`}>{showForm ? '– Hide Form' : '+ Show Form'}</button>
              </div>
            </Card>
          </div>
          {showForm && (
            <Card>
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xl mb-6">
                <span role="img" aria-label="add-staff">👥</span> Add New Staff Member
              </div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-1">Full Name</label>
                  <input className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value="Rahul S" readOnly />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email</label>
                  <input className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value="rahuls@gmail.com" readOnly />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone Number</label>
                  <input className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value="0962368237" readOnly />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Username</label>
                  <input className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value="rahuluser" readOnly />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Department</label>
                  <input className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value="Bcom" readOnly />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Role</label>
                  <input className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value="TEACHER" readOnly />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1">Password Options</label>
                  <div className="flex gap-6 mt-1">
                    <label className="flex items-center gap-2">
                      <input type="radio" checked readOnly /> Generate Automatic Password
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" readOnly /> Enter Custom Password
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Password</label>
                  <div className="flex gap-2 items-center">
                    <input className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value="!a3ZtHeC" readOnly />
                    <button type="button" className="px-2 py-1 text-xs bg-gray-100 rounded border">Copy</button>
                    <span className="text-green-600 text-xs font-semibold ml-1">Auto-generated</span>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Confirm Password</label>
                  <div className="flex gap-2 items-center">
                    <input className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value="!a3ZtHeC" readOnly />
                    <span className="text-green-600 text-xs font-semibold ml-1">Auto-generated</span>
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end mt-4">
                  <button type="button" className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded font-bold text-base flex items-center gap-2">+ Add Staff Member</button>
                </div>
              </form>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
} 