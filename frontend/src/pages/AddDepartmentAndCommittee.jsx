import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layouts/DashboardLayout';
import { departmentAPI, committeeAPI, authAPI } from '../services/api';
import { getRoleDisplayName } from '../utils/roleUtils';
import toast from 'react-hot-toast';

function AddDepartmentAndCommittee() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('department');
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Department form data
  const [departmentData, setDepartmentData] = useState({
    name: ''
  });
  const [departments, setDepartments] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null); // {id, name}

  // Committee form data
  const [committeeData, setCommitteeData] = useState({
    name: ''
  });
  const [committees, setCommittees] = useState([]);
  const [editingCommittee, setEditingCommittee] = useState(null); // {id, name}

  useEffect(() => {
    fetchCurrentUser();
    // initial lists
    refreshLists();
  }, []);

  const refreshLists = async () => {
    try {
      const [deptRes, comRes] = await Promise.all([
        departmentAPI.getDepartments(),
        committeeAPI.getCommittees()
      ]);
      setDepartments(deptRes);
      setCommittees(comRes);
    } catch (err) {
      console.error('Failed to load lists', err);
      toast.error('Failed to load departments/committees');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUserProfile();
      setCurrentUserRole(response.role);
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to load user permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentInputChange = (e) => {
    const { name, value } = e.target;
    setDepartmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCommitteeInputChange = (e) => {
    const { name, value } = e.target;
    setCommitteeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await departmentAPI.createDepartment(departmentData);
      toast.success('Department added successfully!');
      setDepartmentData({ name: '' });
      await refreshLists();
    } catch (err) {
      console.error('Error adding department:', err);
      const msg = err.response?.data?.errors?.name?.[0] || err.response?.data?.message || 'Error adding department!';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommitteeSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await committeeAPI.createCommittee(committeeData);
      toast.success('Committee added successfully!');
      setCommitteeData({ name: '' });
      await refreshLists();
    } catch (err) {
      console.error('Error adding committee:', err);
      const msg = err.response?.data?.errors?.name?.[0] || err.response?.data?.message || 'Error adding committee!';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Department inline edit handlers
  const startEditDepartment = (dept) => setEditingDepartment({ id: dept.id, name: dept.name });
  const cancelEditDepartment = () => setEditingDepartment(null);
  const saveEditDepartment = async () => {
    if (!editingDepartment) return;
    try {
      await departmentAPI.updateDepartment(editingDepartment.id, { name: (editingDepartment.name || '').trim() });
      toast.success('Department updated successfully!');
      setEditingDepartment(null);
      await refreshLists();
    } catch (err) {
      const msg = err.response?.data?.errors?.name?.[0] || err.response?.data?.message || 'Failed to update department';
      toast.error(msg);
    }
  };
  const deleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await departmentAPI.deleteDepartment(id);
      toast.success('Department deleted successfully!');
      await refreshLists();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete department');
    }
  };

  // Committee inline edit handlers
  const startEditCommittee = (c) => setEditingCommittee({ id: c.id, name: c.name });
  const cancelEditCommittee = () => setEditingCommittee(null);
  const saveEditCommittee = async () => {
    if (!editingCommittee) return;
    try {
      await committeeAPI.updateCommittee(editingCommittee.id, { name: (editingCommittee.name || '').trim() });
      toast.success('Committee updated successfully!');
      setEditingCommittee(null);
      await refreshLists();
    } catch (err) {
      const msg = err.response?.data?.errors?.name?.[0] || err.response?.data?.message || 'Failed to update committee';
      toast.error(msg);
    }
  };
  const deleteCommittee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this committee?')) return;
    try {
      await committeeAPI.deleteCommittee(id);
      toast.success('Committee deleted successfully!');
      await refreshLists();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete committee');
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user has permission (only college admin should be able to add departments and committees)
  if (!currentUserRole || !['admin', 'college_admin'].includes(currentUserRole)) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="mb-6">
            <button 
              onClick={handleBack}
              className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors duration-200 group bg-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to add departments and committees. Only college administrators can perform this action.</p>
            <p className="text-sm text-gray-500">Your current role: <span className="font-semibold">{getRoleDisplayName(currentUserRole)}</span></p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors duration-200 group bg-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-teal-50 rounded-2xl shadow-xl border border-teal-200 overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">College Management</h2>
                <p className="text-teal-100">Add departments and committees to your college</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab('department')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'department'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Add Department
                </div>
              </button>
              <button
                onClick={() => setActiveTab('committee')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'committee'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" clipRule="evenodd" />
                  </svg>
                  Add Committee
                </div>
              </button>
            </nav>
          </div>

          {/* Department Form */}
          {activeTab === 'department' && (
            <form onSubmit={handleDepartmentSubmit} className="p-8">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Department Information
                </h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Department Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Computer Science"
                    value={departmentData.name}
                    onChange={handleDepartmentInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:border-teal-300 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setDepartmentData({ name: '' })}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-700 text-white font-medium rounded-xl hover:from-teal-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding Department...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Department
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Department List */}
          {activeTab === 'department' && (
            <div className="px-8 pb-8">
              <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h3 className="text-lg font-semibold text-slate-900">Departments</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {departments && departments.length > 0 ? (
                        departments.map((d) => (
                          <tr key={d.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingDepartment && editingDepartment.id === d.id ? (
                                <input
                                  type="text"
                                  value={editingDepartment.name}
                                  onChange={(e) => setEditingDepartment(prev => ({ ...prev, name: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                              ) : (
                                <span className="text-sm text-gray-900">{d.name}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {editingDepartment && editingDepartment.id === d.id ? (
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    onClick={cancelEditDepartment}
                                    className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={saveEditDepartment}
                                    className="px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    onClick={() => startEditDepartment(d)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteDepartment(d.id)}
                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-6 py-4 text-sm text-gray-500" colSpan={2}>No departments found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Committee Form */}
          {activeTab === 'committee' && (
            <form onSubmit={handleCommitteeSubmit} className="p-8">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Committee Information
                </h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Committee Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Academic Committee"
                    value={committeeData.name}
                    onChange={handleCommitteeInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:border-teal-300 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setCommitteeData({ name: '' })}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-700 text-white font-medium rounded-xl hover:from-teal-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding Committee...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Committee
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Committee List */}
          {activeTab === 'committee' && (
            <div className="px-8 pb-8">
              <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h3 className="text-lg font-semibold text-slate-900">Committees</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {committees && committees.length > 0 ? (
                        committees.map((c) => (
                          <tr key={c.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingCommittee && editingCommittee.id === c.id ? (
                                <input
                                  type="text"
                                  value={editingCommittee.name}
                                  onChange={(e) => setEditingCommittee(prev => ({ ...prev, name: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                              ) : (
                                <span className="text-sm text-gray-900">{c.name}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {editingCommittee && editingCommittee.id === c.id ? (
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    onClick={cancelEditCommittee}
                                    className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={saveEditCommittee}
                                    className="px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    onClick={() => startEditCommittee(c)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteCommittee(c.id)}
                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-6 py-4 text-sm text-gray-500" colSpan={2}>No committees found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AddDepartmentAndCommittee;