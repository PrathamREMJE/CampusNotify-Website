import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI, staffAPI, departmentAPI, committeeAPI } from "../../services/api";
import { getRoleDisplayName, getAvailableRoles } from "../../utils/roleUtils";

function EditStaff() {
  const { staffId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    role: "",
    department_id: "",
    status: "Active",
    committees: [] // Array of {id, role} objects
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [committees, setCommittees] = useState([]);

  // Fetch current user, staff data, departments, and committees
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user
        const user = await authAPI.getUserProfile();
        setCurrentUser(user);
        const roles = getAvailableRoles(user.role);
        setAvailableRoles(roles);

        // Fetch departments and committees in parallel
        const [departmentsData, committeesData] = await Promise.all([
          departmentAPI.getDepartments(),
          committeeAPI.getCommittees()
        ]);
        setDepartments(departmentsData);
        setCommittees(committeesData);

        // Fetch staff data to edit
        try {
          const staffToEdit = await staffAPI.getStaffById(staffId);
          setFormData({
            first_name: staffToEdit.first_name || "",
            last_name: staffToEdit.last_name || "",
            username: staffToEdit.username || "",
            email: staffToEdit.email || "",
            phone: staffToEdit.phone || "",
            role: staffToEdit.role || "",
            department_id: staffToEdit.department_id || "",
            status: staffToEdit.status || "Active",
            committees: (staffToEdit.committees || []).map(c => ({
              id: c.committee.id,
              role: c.role
            }))
          });
        } catch (staffError) {
          // Fallback to getting from staff list if individual API fails
          const staffList = await staffAPI.getStaffList();
          const staffToEdit = staffList.find(staff => staff.id === parseInt(staffId));

          if (staffToEdit) {
            setFormData({
              first_name: staffToEdit.first_name || "",
              last_name: staffToEdit.last_name || "",
              username: staffToEdit.username || "",
              email: staffToEdit.email || "",
              phone: staffToEdit.phone || "",
              role: staffToEdit.role || "",
              department_id: staffToEdit.department_id || "",
              status: staffToEdit.status || "Active",
              committees: [] // Fallback doesn't have committees
            });
          } else {
            toast.error('Staff member not found');
            navigate('/manage-staff');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load staff data');
        navigate('/manage-staff');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [staffId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleCommitteeChange = (committeeId, role) => {
    const updatedCommittees = [...formData.committees];
    const existingIndex = updatedCommittees.findIndex(c => c.id === parseInt(committeeId));

    if (existingIndex >= 0) {
      // Update existing committee role
      updatedCommittees[existingIndex].role = role;
    } else {
      // Add new committee
      updatedCommittees.push({ id: parseInt(committeeId), role });
    }

    setFormData({ ...formData, committees: updatedCommittees });
  };

  const removeCommittee = (committeeId) => {
    setFormData({
      ...formData,
      committees: formData.committees.filter(c => c.id !== committeeId)
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "First Name is required.";
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid Email is required.";
    if (!formData.phone || !/^\+?\d[\d -]{8,}\d$/.test(formData.phone))
      newErrors.phone = "Enter valid Phone number.";
    if (!formData.role) newErrors.role = "Select a role.";
    if (!formData.department_id) newErrors.department_id = "Department is required.";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for backend
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department_id: formData.department_id,
        user_status: formData.status.toLowerCase(),
        committee_ids: formData.committees.map(c => c.id),
        committee_roles: formData.committees.map(c => c.role)
      };

      await staffAPI.updateStaff(staffId, updateData);
      toast.success('Staff member updated successfully');
      navigate('/manage-staff');
    } catch (err) {
      console.error('Error updating staff:', err);

      if (err.response?.data) {
        const errorData = err.response.data;
        let errorMessage = "❌ Failed to Update Staff Member\n";

        if (typeof errorData === 'object') {
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              errorMessage += `• ${field.replace(/_/g, " ").toUpperCase()}: ${errorData[field][0]}\n`;
            }
          });
        } else {
          errorMessage += "• Please check all fields and try again";
        }

        toast.error(errorMessage, {
          duration: 8000,
          style: {
            background: '#EF4444',
            color: 'white',
            fontWeight: '500',
            padding: '16px',
            borderRadius: '8px',
            maxWidth: '400px',
          },
        });
      } else {
        toast.error('Failed to update staff member. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/manage-staff');
  };

  if (isLoading) {
    return (
      <div className="bg-white mt-8 shadow-lg rounded-xl px-10 py-8 border border-gray-200">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white mt-8 shadow-lg rounded-xl px-10 py-8 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1D5C84] mb-2">
          ✏️ Edit Staff Member
        </h2>
        <p className="text-gray-600">Update the information for this staff member</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* Basic Information Fields */}
        {[
          { name: "first_name", label: "First Name", placeholder: "e.g. Rahul" },
          { name: "last_name", label: "Last Name", placeholder: "e.g. Sharma" },
          { name: "email", label: "Email", placeholder: "e.g. rahul@gmail.com" },
          { name: "phone", label: "Phone Number", placeholder: "+1 234 567 8900" },
          { name: "username", label: "Username", placeholder: "e.g. rahul123" }
        ].map((field) => (
          <div className="flex flex-col" key={field.name}>
            <label className="text-gray-700 font-semibold mb-1">{field.label}</label>
            <input
              type={field.type || "text"}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              className={`p-3 border ${
                errors[field.name] ? "border-red-500" : "border-gray-300"
              } rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#1D5C84]`}
            />
            {errors[field.name] && (
              <span className="text-red-500 text-sm mt-1">{errors[field.name]}</span>
            )}
          </div>
        ))}

        {/* Department Dropdown */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">Department</label>
          <select
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            className={`p-3 border ${
              errors.department_id ? "border-red-500" : "border-gray-300"
            } rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#1D5C84]`}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.department_id && <span className="text-red-500 text-sm mt-1">{errors.department_id}</span>}
        </div>

        {/* Role Dropdown */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`p-3 border ${
              errors.role ? "border-red-500" : "border-gray-300"
            } rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#1D5C84]`}
            disabled={availableRoles.length === 0}
          >
            <option value="">
              {availableRoles.length === 0 ? "Loading roles..." : "Select Role"}
            </option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {getRoleDisplayName(role)}
              </option>
            ))}
          </select>
          {errors.role && <span className="text-red-500 text-sm mt-1">{errors.role}</span>}
        </div>

        {/* Status Dropdown */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#1D5C84]"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Committee Memberships */}
        <div className="col-span-2">
          <label className="text-gray-700 font-semibold mb-3 block">Committee Memberships</label>

          {/* Selected Committees */}
          {formData.committees.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Current Memberships:</h4>
              <div className="space-y-2">
                {formData.committees.map((committee) => {
                  const committeeData = committees.find(c => c.id === committee.id);
                  return (
                    <div key={committee.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <span className="font-medium text-black">{committeeData?.name || `Committee ${committee.id}`}</span>
                      <div className="flex items-center space-x-2">
                        <select
                          value={committee.role}
                          onChange={(e) => handleCommitteeChange(committee.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm text-black"
                        >
                          <option value="member">Member</option>
                          <option value="head">Head</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeCommittee(committee.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Committee Dropdown */}
          <div className="flex items-center space-x-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleCommitteeChange(e.target.value, 'member'); // Default to member
                  e.target.value = ''; // Reset dropdown
                }
              }}
              className="flex-1 p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#1D5C84]"
              value=""
            >
              <option value="">Add Committee Membership</option>
              {committees
                .filter(committee => !formData.committees.some(c => c.id === committee.id))
                .map((committee) => (
                  <option key={committee.id} value={committee.id}>
                    {committee.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="col-span-2 flex justify-center space-x-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="font-medium px-6 py-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`font-medium px-6 py-3 rounded-md transition-all duration-200 ${
              isSubmitting 
                ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                : "bg-[#1D5C84] text-white hover:bg-[#164a6c]"
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Updating Staff Member...
              </>
            ) : (
              <>✏️ Update Staff Member</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditStaff;