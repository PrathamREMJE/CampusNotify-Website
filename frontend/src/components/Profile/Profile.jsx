import { useState, useEffect } from "react";
import { authAPI, departmentAPI } from "../../services/api";
import { getRoleDisplayName } from "../../utils/roleUtils";
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaEdit, FaSave, FaTimes } from "react-icons/fa";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [departments, setDepartments] = useState([]); // for dropdown
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUserProfile();
    // Load departments for dropdown
    (async () => {
      try {
        const list = await departmentAPI.getDepartments();
        setDepartments(list || []);
      } catch (e) {
        console.error('Failed to load departments', e);
      }
    })();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await authAPI.getUserProfile();
      setUser(userData);

      // For admin users, use college_admin data for form fields
      const isAdmin = userData.role === "admin";
      const adminData = userData.college_admin;

      setFormData({
        first_name: isAdmin
          ? (adminData?.name ? adminData.name.split(" ")[0] : "")
          : (userData.first_name || ""),
        last_name: isAdmin
          ? (adminData?.name ? adminData.name.split(" ").slice(1).join(" ") : "")
          : (userData.last_name || ""),
        phone: isAdmin ? (adminData?.phone || "") : (userData.phone || ""),
        college_name: userData.college_name || "",
        email: isAdmin ? (adminData?.email || "") : (userData.email || ""),
        department: userData.department || "",
      });
    } catch (err) {
      setError("Failed to load profile");
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Only send allowed fields (exclude email, id, role, employee_id)
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        department: formData.department,
        college_name: formData.college_name
      };

      // Call API to update profile
      const updatedUser = await authAPI.updateProfile(updateData);
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUser
      }));
      setEditing(false);
      setSuccess("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update profile");
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      college_name: user.college_name || "",
      email: user.email || "",
      department: user.department || "",
    });
    setEditing(false);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D5C84]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1D5C84] to-blue-700 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-blue-100 mt-1">Manage your personal information and account settings</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Active Account</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🏢</span>
                <span>{user?.college_name || "Institution"}</span>
              </div>
            </div>
          </div>
          
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-white text-[#1D5C84] px-6 py-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium shadow-md"
            >
              <FaEdit /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50 font-medium shadow-md"
              >
                <FaSave /> {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                className="bg-white text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium shadow-md border border-gray-300"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center border border-gray-100">
            {/* Profile Picture */}
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-[#1D5C84] to-blue-600 rounded-full mx-auto flex items-center justify-center shadow-lg border-4 border-white">
                <FaUser className="text-white text-4xl" />
              </div>
              {/* Status Indicator */}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {user?.role === "admin"
                ? user?.college_admin?.name || "College Admin"
                : user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user?.name || "User Name"}
            </h2>
            
            {/* Role Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${
              user?.role === 'admin' 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
              {getRoleDisplayName(user?.role)}
            </div>
            
            {/* Contact Information */}
            <div className="space-y-3 text-sm">
              {/* Email */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <FaEnvelope className="text-[#1D5C84]" />
                  <span className="font-medium">
                    {user?.role === "admin"
                      ? user?.college_admin?.email
                      : user?.email}
                  </span>
                </div>
              </div>
              
              {/* Phone */}
              {(user?.role === "admin" ? user?.college_admin?.phone : user?.phone) && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <FaPhone className="text-[#1D5C84]" />
                    <span className="font-medium">
                      {user?.role === "admin"
                        ? user?.college_admin?.phone
                        : user?.phone}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Department */}
              {user?.department && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <FaBuilding className="text-[#1D5C84]" />
                    <span className="font-medium">{user.department}</span>
                  </div>
                </div>
              )}
              
              {/* Institution */}
              {user?.college_name && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-center">
                    <div className="text-xs text-blue-600 font-medium mb-1">INSTITUTION</div>
                    <div className="text-blue-800 font-semibold">{user.college_name}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#1D5C84] rounded-lg flex items-center justify-center">
                <FaUser className="text-white text-sm" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                <p className="text-sm text-gray-600">Manage your personal details and contact information</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5C84] bg-white text-gray-800"
                    placeholder="Enter your first name"
                    required
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                    {user?.role === "admin"
                      ? (user?.college_admin?.name ? user.college_admin.name.split(" ")[0] : "Not provided")
                      : (user?.first_name || (user?.name ? user.name.split(" ")[0] : "Not provided"))}
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5C84] bg-white text-gray-800"
                    placeholder="Enter your last name"
                    required
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                    {user?.role === "admin"
                      ? (user?.college_admin?.name ? user.college_admin.name.split(" ").slice(1).join(" ") : "Not provided")
                      : (user?.last_name || (user?.name ? user.name.split(" ").slice(1).join(" ") : "Not provided"))}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-[#1D5C84] text-sm" />
                    <span>
                      {user?.role === "admin"
                        ? user?.college_admin?.email
                        : user?.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                {editing ? (
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-3 text-gray-400 text-sm" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5C84] bg-white text-gray-800"
                      placeholder="+91 XXXXX XXXXX"
                      pattern="[0-9+\-\s]+"
                      required
                    />
                  </div>
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400 text-sm" />
                      <span>
                        {user?.role === "admin"
                          ? (user?.college_admin?.phone || "Not provided")
                          : (user?.phone || "Not provided")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                {editing ? (
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5C84] bg-white text-gray-800"
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                    <div className="flex items-center gap-2">
                      <FaBuilding className="text-[#1D5C84] text-sm" />
                      <span>{user?.department || "Not assigned"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role & Permissions
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-800 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${user?.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    <span className="font-medium">{getRoleDisplayName(user?.role)}</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {user?.role === 'admin' ? 'Full system access and management' : 'Standard user permissions'}
                  </span>
                </div>
              </div>

              {/* College/Institution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="college_name"
                    value={formData.college_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5C84] bg-white text-gray-800"
                    placeholder="Enter institution name"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                    {user?.college_name || "Not provided"}
                  </div>
                )}
              </div>

              {/* Employee ID (if available) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-800 border border-gray-200">
                  <span className="font-mono text-sm">
                    {user?.employee_id || user?.id ? `EMP${String(user.employee_id || user.id).padStart(4, '0')}` : "Not assigned"}
                  </span>
                  <span className="text-xs text-gray-500 ml-2 block">Auto-generated identifier</span>
                </div>
              </div>

            </div>

            {/* Committees Section */}
            {user?.committees && user.committees.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📋</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Committee Memberships</h3>
                    <p className="text-sm text-gray-600">Your roles in committees</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {user.committees.map((committee) => (
                    <div key={committee.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent border border-blue-100 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">{committee.name}</p>
                        <p className="text-sm text-gray-600">
                          Role: <span className="font-medium capitalize">{committee.role === 'head' ? 'Committee Head' : 'Committee Member'}</span>
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        committee.role === 'head' 
                          ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                          : 'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {committee.role === 'head' ? '👑 Head' : '👤 Member'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;