import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tempErrors = {};

    if (!username.trim()) {
      tempErrors.username = "Username is required.";
    }

    if (!password) {
      tempErrors.password = "Password is required.";
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    try {
      const response = await authAPI.login({ username, password });
      console.log("Login response:", response); // Debug log

      if (response && response.access && response.refresh) {
        localStorage.setItem("access_token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
        
        // Fetch user profile after successful login
        try {
          const userProfile = await authAPI.getUserProfile();
          localStorage.setItem("user", JSON.stringify(userProfile));
          console.log("User profile fetched:", userProfile);
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          // Continue to dashboard even if profile fetch fails
        }
        
        alert("Login successful!");
        navigate("/dashboard");
      } else {
        console.error("Unexpected response structure:", response);
        setErrors({ login: "Invalid credentials or unexpected server response. Please try again." });
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        console.error("Error response:", error.response);
        setErrors({ login: error.response.data.detail || "Server error. Please try again later." });
      } else if (error.request) {
        console.error("No response received:", error.request);
        setErrors({ login: "No response from server. Please check your connection and try again." });
      } else {
        setErrors({ login: "An unexpected error occurred. Please try again." });
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-800">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">Login</h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-lg font-semibold mb-1 text-black">
              Username:
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter username"
              className="w-full p-2 text-black border border-gray-300 rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-lg font-semibold mb-1 text-black">
              Password:
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              className="w-full p-2 text-black border border-gray-300 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Forgot Password + Login Button */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-blue-700 hover:underline"
            >
              Forgot Password?
            </button>

            <button
              type="submit"
              className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Login
            </button>
          </div>
          {errors.login && (
            <p className="text-red-500 text-sm text-center mt-1">{errors.login}</p>
          )}
        </form>
        
        {/* College Registration Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            New college?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-[#1D5C84] font-semibold hover:underline"
            >
              Register your college here
            </button>
          </p>
        </div>
      </div>
    </div>
    
  );
}

export default Login;