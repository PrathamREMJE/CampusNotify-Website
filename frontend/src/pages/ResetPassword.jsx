import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

// Utility to read query params
function useQuery() {
  const [params, setParams] = useState({ uid: "", token: "" });
  useEffect(() => {
    const url = new URL(window.location.href);
    setParams({
      uid: url.searchParams.get("uid") || "",
      token: url.searchParams.get("token") || "",
    });
  }, []);
  return params;
}

function ResetPassword() {
  const navigate = useNavigate();
  const { uid, token } = useQuery();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!uid || !token) {
      setError("Invalid or missing reset link parameters.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPassword({
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setMessage(res?.message || "Password has been reset successfully.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-800">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">Reset Password</h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="newPassword" className="block text-lg font-semibold mb-1 text-black">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              className="w-full p-2 text-black border border-gray-300 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-lg font-semibold mb-1 text-black">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter new password"
              className="w-full p-2 text-black border border-gray-300 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

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

export default ResetPassword;