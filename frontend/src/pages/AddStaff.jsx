
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layouts/DashboardLayout';
import { staffAPI, authAPI, committeeAPI, departmentAPI } from '../services/api';
import { getAvailableRoles, getRoleDisplayName } from '../utils/roleUtils';
import toast from 'react-hot-toast';

function AddStaff() {
  const navigate = useNavigate();
  const [departmentsList, setDepartmentsList] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    department: '', // For non-HOD
    departments: [], // For HOD multiple selection
    role: '',
    password: '',
    confirmPassword: '',
    passwordOption: 'auto',
  });
  const [committees, setCommittees] = useState([]);
  const [committeeMemberships, setCommitteeMemberships] = useState([]);

  useEffect(() => {
    fetchCurrentUser();
    fetchCommittees();
    fetchDepartments();
  }, []);

  const fetchCommittees = async () => {
    try {
      const response = await committeeAPI.getCommittees();
      setCommittees(response);
    } catch (err) {
      console.error("Error fetching committees:", err);
      toast.error("Failed to load committees");
    }
  };

  const addCommitteeMembership = () => {
    setCommitteeMemberships([...committeeMemberships, { committee_id: '', role: 'member' }]);
  };

  const removeCommitteeMembership = (index) => {
    const updated = committeeMemberships.filter((_, i) => i !== index);
    setCommitteeMemberships(updated);
  };

  const updateCommitteeMembership = (index, field, value) => {
    const updated = committeeMemberships.map((membership, i) => 
      i === index ? { ...membership, [field]: value } : membership
    );
    setCommitteeMemberships(updated);
  };

  // Helper functions to determine field availability based on role
  const isDepartmentFieldDisabled = (role) => {
    const disabledRoles = ['principal', 'vice_principal', 'office_superintendent', 'senior_clerk'];
    return disabledRoles.includes(role);
  };

  const isCommitteeFieldDisabled = (role) => {
    const disabledRoles = ['principal', 'vice_principal', 'office_superintendent', 'senior_clerk'];
    return disabledRoles.includes(role);
  };

  const isHODRole = (role) => {
    return role === 'hod';
  };

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUserProfile();
      setCurrentUserRole(response.role);
      const roles = getAvailableRoles(response.role);
      setAvailableRoles(roles);
      if (roles.length > 0) {
        setFormData(prev => ({ ...prev, role: roles[0] }));
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to load user permissions");
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const fetchDepartments = async () => {
  try {
    const response = await departmentAPI.getDepartments();
    setDepartmentsList(response);
  } catch (err) {
    console.error("Error fetching departments:", err);
    toast.error("Failed to load departments");
  }
};


  const handleInputChange = (e) => {
    const { name, value, type, options } = e.target;
    
    if (name === 'departments') {
      // Multi-select for HOD
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setFormData((prev) => ({ ...prev, departments: selected }));
    } else if (name === 'role') {
      // Handle role change
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        // Clear department fields when role changes
        department: isDepartmentFieldDisabled(value) ? '' : prev.department,
        departments: isHODRole(value) ? prev.departments : [],
      }));
      
      // Clear committee memberships if role doesn't allow committees
      if (isCommitteeFieldDisabled(value)) {
        setCommitteeMemberships([]);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePasswordOptionChange = (option) => {
    const autoPassword = option === 'auto' ? generatePassword() : '';
    setFormData((prev) => ({
      ...prev,
      passwordOption: option,
      password: autoPassword,
      confirmPassword: autoPassword,
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.password);
    toast.success('Password copied to clipboard!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    // Validate committee memberships (only if role allows committees)
    const validMemberships = isCommitteeFieldDisabled(formData.role) ? [] : committeeMemberships.filter(m => m.committee_id && m.role);
    
    // Construct payload with only valid fields
    const payload = {
      first_name: formData.name,
      username: formData.username,
      password: formData.password,
      confirm_password: formData.confirmPassword,
      email: formData.email,
      phone: formData.phone,
      role: formData.role.toLowerCase(),
      committee_memberships: validMemberships,
    };

    // Add department data based on role
    if (!isDepartmentFieldDisabled(formData.role)) {
      if (isHODRole(formData.role)) {
        payload.departments = formData.departments;
      } else {
        payload.department = formData.department;
      }
    }
    try {
      await staffAPI.createStaff(payload);
      toast.success('Staff added successfully!');
      navigate('/manage-staff');
    } catch (err) {
      toast.error('Error adding staff!');
      console.error(err);
    }
  };

  const handleBack = () => {
    navigate('/manage-staff');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading permissions...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!loading && availableRoles.length === 0) {
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
              <span className="font-medium">Back to Staff Management</span>
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to add staff members. Please contact your administrator if you believe this is an error.</p>
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
            <span className="font-medium">Back to Staff Management</span>
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
                <h2 className="text-2xl font-bold text-white">Add New Staff Member</h2>
                <p className="text-teal-100">Fill in the details to add a new team member</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-8">
            {/* Personal Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:border-teal-300 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:border-teal-300 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:border-teal-300 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Username *</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:border-teal-300 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
              </div>
            </div>
            {/* Professional Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Department {!isDepartmentFieldDisabled(formData.role) && '*'}
                    {isDepartmentFieldDisabled(formData.role) && (
                      <span className="text-xs text-gray-500 ml-2">(Not applicable for this role)</span>
                    )}
                  </label>
                  {isDepartmentFieldDisabled(formData.role) ? (
                    <input
                      type="text"
                      value="Not applicable"
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  ) : isHODRole(formData.role) ? (
                    <div className="relative">
                      <select
                        name="departments"
                        multiple
                        value={formData.departments}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:border-teal-300 transition-colors duration-200 text-gray-900 min-h-[120px] appearance-none"
                        style={{
                          backgroundImage: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                        required
                      >
                        {departmentsList.map((dept) => (
                          <option key={dept.code} value={dept.code} className="py-2 px-3 hover:bg-teal-50">
                        {dept.name}
                        </option>
                        ))}
                      </select>
                      <div className="absolute top-2 right-2 pointer-events-none">
                        <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:border-teal-300 transition-colors duration-200 cursor-pointer text-gray-900 appearance-none pr-10"
                        required
                      >
                        {departmentsList.map((dept) => (
                        <option key={dept.code} value={dept.code}>
                        {dept.name}
                        </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {isHODRole(formData.role) && (
                    <div className="flex items-center gap-2 mt-2">
                      <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-teal-600 font-medium">Hold Ctrl/Cmd to select multiple departments</p>
                    </div>
                  )}
                </div>

                {/* Role Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Role *</label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:border-teal-300 transition-colors duration-200 cursor-pointer text-gray-900 appearance-none pr-10"
                      required
                      disabled={loading || availableRoles.length === 0}
                    >
                      <option value="">Select Role</option>
                      {availableRoles.map((roleOption) => (
                        <option key={roleOption} value={roleOption}>
                          {getRoleDisplayName(roleOption)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {!loading && availableRoles.length === 0 && (
                    <p className="text-red-600 text-sm mt-1">You are not allowed to create any roles.</p>
                  )}
                  {loading && (
                    <p className="text-teal-600 text-sm mt-1">Loading available roles...</p>
                  )}
                </div>
              </div>
            </div>
        {/* Committee Memberships Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
            </div>
            Committee Memberships (Optional)
            {isCommitteeFieldDisabled(formData.role) && (
              <span className="text-xs text-gray-500 ml-2">(Not applicable for this role)</span>
            )}
          </h3>
          
          {isCommitteeFieldDisabled(formData.role) ? (
            <div className="p-4 bg-gray-100 border border-gray-200 rounded-xl">
              <p className="text-gray-600 text-center">
                Committee memberships are not applicable for {getRoleDisplayName(formData.role)} role.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {committeeMemberships.map((membership, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Committee</label>
                      <div className="relative">
                        <select
                          value={membership.committee_id}
                          onChange={(e) => updateCommitteeMembership(index, 'committee_id', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:border-teal-300 transition-colors duration-200 cursor-pointer text-gray-900 appearance-none pr-10"
                        >
                          <option value="">Select Committee</option>
                          {committees.map((committee) => (
                            <option key={committee.id} value={committee.id}>
                              {committee.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <div className="relative">
                        <select
                          value={membership.role}
                          onChange={(e) => updateCommitteeMembership(index, 'role', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:border-teal-300 transition-colors duration-200 cursor-pointer text-gray-900 appearance-none pr-10"
                        >
                          <option value="member">Committee Member</option>
                          <option value="head">Committee Head</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="button"
                        onClick={() => removeCommitteeMembership(index)}
                        className="w-full px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addCommitteeMembership}
                className="w-full px-4 py-3 border-2 border-dashed border-teal-300 hover:border-teal-400 text-teal-600 hover:text-teal-700 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2 bg-teal-50 hover:bg-teal-100"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Committee Membership
              </button>
              
              {committeeMemberships.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No committee memberships added. Staff member will not be assigned to any committees.
                </p>
              )}
            </div>
          )}
        </div>
            {/* Security Settings Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Security Settings
              </h3>
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-3 block">Password Generation Method</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-teal-300 transition-colors duration-200 bg-white">
                    <input
                      type="radio"
                      name="passwordOption"
                      value="auto"
                      checked={formData.passwordOption === 'auto'}
                      onChange={() => handlePasswordOptionChange('auto')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">Auto-Generate Password</div>
                      <div className="text-sm text-gray-500">System will create a secure password</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-teal-300 transition-colors duration-200 bg-white">
                    <input
                      type="radio"
                      name="passwordOption"
                      value="custom"
                      checked={formData.passwordOption === 'custom'}
                      onChange={() => handlePasswordOptionChange('custom')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">Custom Password</div>
                      <div className="text-sm text-gray-500">Enter your own password</div>
                    </div>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password *</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:border-teal-300 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                      required
                    />
                    {formData.passwordOption === 'auto' && (
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-teal-100 hover:bg-teal-200 text-teal-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                  {formData.passwordOption === 'auto' && (
                    <div className="flex items-center gap-2 text-sm text-teal-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Auto-generated secure password
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Confirm Password *</label>
                  <input
                    type="text"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:border-teal-300 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    required
                  />
                  {formData.passwordOption === 'auto' && (
                    <div className="flex items-center gap-2 text-sm text-teal-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Passwords match
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Staff Member
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );}

export default AddStaff;
