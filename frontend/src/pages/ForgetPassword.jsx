import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { toast } from "react-hot-toast";

function ForgetPassword() {
  const [identifier, setIdentifier] = useState(""); // email or username
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!identifier.trim()) {
      setError("Please enter your email or username.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const payload = identifier.includes("@")
        ? { email: identifier, new_password: newPassword, confirm_password: confirmPassword }
        : { username: identifier, new_password: newPassword, confirm_password: confirmPassword };

      const res = await authAPI.forgotPassword(payload);

      setMessage(res?.message || "Password reset successful.");
      toast.success("Password reset successful. You can now log in.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-800">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">Forgot Password</h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="identifier" className="block text-lg font-semibold mb-1 text-black">
              Email or Username
            </label>
            <input
              id="identifier"
              type="text"
              placeholder="Enter your email or username"
              className="w-full p-2 text-black border border-gray-300 rounded"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-lg font-semibold mb-1 text-black">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              className="w-full p-2 text-black border border-gray-300 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-lg font-semibold mb-1 text-black">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              className="w-full p-2 text-black border border-gray-300 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm break-words">{message}</p>}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm text-blue-700 hover:underline"
            >
              Back to Login
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgetPassword;