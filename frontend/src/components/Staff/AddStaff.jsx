import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";
import { getRoleDisplayName, getAvailableRoles } from "../../utils/roleUtils";

function AddStaff() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    passwordOption: "custom", // Default to custom password
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);

  // Fetch current user, available roles, and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await authAPI.getUserProfile();
        setCurrentUser(user);
        const roles = getAvailableRoles(user.role);
        setAvailableRoles(roles);

        // Fetch departments
        const token = localStorage.getItem('access_token');
        const response = await fetch("http://127.0.0.1:8000/api/departments/", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const departments = await response.json();
          setAvailableDepartments(departments);
        } else {
          console.error('Failed to fetch departments');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load user permissions or departments');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Function to generate a random password
  const generatePassword = () => {
    // Generate a random password with letters, numbers and special characters (8 characters)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  
  // Function to copy password to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Password copied to clipboard!");

  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required.";
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid Email is required.";
    if (!formData.phone || !/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Enter 10-digit Phone number.";
    if (!formData.role) newErrors.role = "Select a role.";
    if (!formData.department.trim()) newErrors.department = "Department is required.";
    
    // Password validation only if custom password is selected
    if (formData.passwordOption === "custom") {
      if (!formData.password || formData.password.length < 6)
        newErrors.password = "Minimum 6 characters required.";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match.";
    }

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
    
    // Remove passwordOption and transform confirmPassword to confirm_password before sending
    const { passwordOption, confirmPassword, name, department, ...payload } = formData;
    payload.confirm_password = confirmPassword;
    payload.first_name = name; // Map name to first_name

    // Department is now already an ID from the dropdown
    if (department) {
      payload.department_id = parseInt(department);
    }

    // Add college association from current user
    if (currentUser && currentUser.college) {
      payload.college = currentUser.college; // Now it's the college ID
      console.log("🔍 Adding College ID:", payload.college);
    }
  
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch("http://127.0.0.1:8000/api/staff/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const data = await response.json();
        
        // Simple secure success notification
        toast.success(
          "Staff member added successfully",
          {
            duration: 4000,
            style: {
              background: '#10B981',
              color: 'white',
              fontWeight: '500',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
            },
          }
        );
        
        console.log("✅ Staff Created:", data);
        
        // Reset form
        setFormData({
          name: "",
          username: "",
          email: "",
          phone: "",
          role: "",
          department: "",
          passwordOption: "custom",
          password: "",
          confirmPassword: "",
        });
      } else {
        const errorData = await response.json();
        
        // Professional error notification with details
        let errorMessage = "❌ Failed to Add Staff Member\n";
        
        if (errorData && typeof errorData === 'object') {
          // Handle field-specific errors
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
        
        console.error("❌ Server error:", errorData);
      }
    } catch (err) {
      toast.error(
        "🌐 Network Connection Error\n" +
        "• Please check your internet connection\n" +
        "• Server might be temporarily unavailable\n" +
        "• Try again in a few moments",
        {
          duration: 6000,
          style: {
            background: '#F59E0B',
            color: 'white',
            fontWeight: '500',
            padding: '16px',
            borderRadius: '8px',
            maxWidth: '400px',
          },
        }
      );
      console.error("❌ Network error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="bg-white mt-8 shadow-lg rounded-xl px-10 py-8 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1D5C84] mb-2">
          👥 Add New Staff Member
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* Field group */}
        {[
          { name: "name", label: "Full Name", placeholder: "e.g. Rahul Sharma" },
          { name: "email", label: "Email", placeholder: "e.g. rahul@gmail.com" },
          { name: "phone", label: "Phone Number", placeholder: "10-digit number" },
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
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={`p-3 border ${
              errors.department ? "border-red-500" : "border-gray-300"
            } rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#1D5C84]`}
            disabled={availableDepartments.length === 0}
          >
            <option value="">
              {availableDepartments.length === 0 ? "Loading departments..." : "Select Department"}
            </option>
            {availableDepartments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.department && <span className="text-red-500 text-sm mt-1">{errors.department}</span>}
        </div>

        {/* Role Dropdown */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">
            Role
          </label>
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
          
          {/* Show info if no roles available */}
          {availableRoles.length === 0 && currentUser && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> As {getRoleDisplayName(currentUser.role)}, you don't have permission to add staff members.
              </p>
            </div>
          )}
        </div>

        {/* Password Options */}
        <div className="flex flex-col col-span-2">
          <label className="text-gray-700 font-semibold mb-1">Password Options</label>
          <div className="flex flex-col space-y-2 mb-4">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
              <label className="flex items-center space-x-2 text-black">
                <input 
                  type="radio" 
                  name="passwordOption" 
                  value="auto" 
                  checked={formData.passwordOption === "auto"} 
                  onChange={() => {
                    const generatedPassword = generatePassword();
                    setFormData({
                      ...formData,
                      passwordOption: "auto",
                      password: generatedPassword,
                      confirmPassword: generatedPassword
                    });
                    // Copy to clipboard automatically when generating
                    navigator.clipboard.writeText(generatedPassword);
                    toast.success("Password generated and copied to clipboard!");
                  }}
                />
                <span className="font-medium">Generate Automatic Password</span>
              </label>
              
              {formData.passwordOption === "auto" && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Generated: {formData.password}</span>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard(formData.password)}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
              <label className="flex items-center space-x-2 text-black">
                <input 
                  type="radio" 
                  name="passwordOption" 
                  value="custom" 
                  checked={formData.passwordOption === "custom"} 
                  onChange={() => {
                    // If switching from auto to custom, keep the password
                    if (formData.passwordOption === "auto") {
                      const currentPassword = formData.password;
                      setFormData({
                        ...formData,
                        passwordOption: "custom",
                        password: currentPassword,
                        confirmPassword: currentPassword
                      });
                      toast.success("Switched to custom mode with generated password");
                    } else {
                      setFormData({
                        ...formData,
                        passwordOption: "custom",
                        password: "",
                        confirmPassword: ""
                      });
                    }
                  }}
                />
                <span className="font-medium">Enter Custom Password</span>
              </label>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">Password</label>
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={formData.passwordOption === "auto"}
              className={`p-3 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#1D5C84] ${
                formData.passwordOption === "auto" ? "bg-gray-100" : ""
              } w-full`}
            />
          </div>
          {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password}</span>}
        </div>
        
        {/* Confirm Password */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">Confirm Password</label>
          <div className="relative">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repeat the password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={formData.passwordOption === "auto"}
              className={`p-3 border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#1D5C84] ${
                formData.passwordOption === "auto" ? "bg-gray-100" : ""
              } w-full`}
            />
          </div>
          {errors.confirmPassword && <span className="text-red-500 text-sm mt-1">{errors.confirmPassword}</span>}
        </div>

        <div className="col-span-2 text-center pt-4">
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
                Adding Staff Member...
              </>
            ) : (
              <>➕ Add Staff Member</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddStaff;
