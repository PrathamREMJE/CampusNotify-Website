import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import Logo from "../../assets/images/Logo.jpeg";
import { authAPI } from "../../services/api";
import { getRoleDisplayName } from "../../utils/roleUtils";
import toast from 'react-hot-toast'; 

function DashboardNavbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch current user data
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      // First try to get user from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      }
      
      // Then fetch fresh data from API
      const user = await authAPI.getUserProfile();
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err) {
      console.error('Error fetching current user:', err);
      // If API fails but we have stored user, keep using it
      const storedUser = localStorage.getItem('user');
      if (storedUser && !currentUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    }
  };

  return (
    <nav className="w-full h-16 bg-gradient-to-r from-white via-teal-50 to-slate-50 shadow flex items-center justify-between px-6 relative z-50 border-b border-teal-100">
      {/* Left side - Logo and Menu */}
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="focus:outline-none md:hidden">
          <FaBars className="w-6 h-6 text-teal-700" />
        </button>
        <img src={Logo} alt="College Logo" className="w-10 h-10 rounded-xl object-cover border border-teal-200 bg-teal-50 shadow" />
        <span className="text-lg font-bold text-teal-800 tracking-tight ml-2 hidden md:inline">CampusNotify</span>
      </div>
      {/* Right side - Profile Section */}
      <div className="flex items-center gap-4">
        {/* User Info */}
        {currentUser && (
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-800">
              {currentUser.role === 'admin' 
                ? (currentUser.first_name && currentUser.last_name 
                    ? `${currentUser.first_name} ${currentUser.last_name}`
                    : currentUser.username || 'Administrator')
                : (currentUser.first_name && currentUser.last_name 
                    ? `Prof. ${currentUser.first_name} ${currentUser.last_name}`
                    : `Prof. ${currentUser.username || 'Faculty'}`)
              }
            </span>
            <span className="text-xs text-gray-600">
              {getRoleDisplayName(currentUser.role)}
            </span>
          </div>
        )}
        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="focus:outline-none flex items-center gap-2 p-2 rounded-lg hover:bg-teal-50 transition-all duration-200"
          >
            <div className="relative">
              <FaUserCircle className="text-teal-700 w-8 h-8 cursor-pointer hover:text-teal-900 transition" />
              {/* Online Status Indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
            </div>
          </button>
          {/* Dropdown Menu */}
          <div
            className={`absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-200 border border-teal-100 ${
              dropdownOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div>
              {currentUser && (
                <div className="bg-gradient-to-r from-teal-600 to-slate-500 p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {currentUser.role === 'admin' 
                          ? (currentUser.first_name && currentUser.last_name 
                              ? `${currentUser.first_name} ${currentUser.last_name}`
                              : currentUser.username || 'Administrator')
                          : (currentUser.first_name && currentUser.last_name 
                              ? `Prof. ${currentUser.first_name} ${currentUser.last_name}`
                              : `Prof. ${currentUser.username || 'Faculty'}`)
                        }
                      </div>
                      <div className="text-teal-100 text-xs">
                        {getRoleDisplayName(currentUser.role)}
                      </div>
                      <div className="text-teal-200 text-xs mt-1">
                        {currentUser.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="py-2">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-all duration-200"
                >
                  <span className="w-5 h-5 flex items-center justify-center">👤</span>
                  <div>
                    <div className="font-medium">My Profile</div>
                    <div className="text-xs text-slate-500">View and edit profile</div>
                  </div>
                </button>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-all duration-200"
                >
                  <span className="w-5 h-5 flex items-center justify-center">⚙️</span>
                  <div>
                    <div className="font-medium">Settings</div>
                    <div className="text-xs text-slate-500">Account preferences</div>
                  </div>
                </button>
                <div className="border-t border-teal-100 my-2"></div>
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to logout?')) {
                      try {
                        // Call logout API to invalidate token on backend
                        await authAPI.logout();
                      } catch (error) {
                        console.error('Logout API failed:', error);
                      } finally {
                        // Clear all authentication data regardless of API success
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setDropdownOpen(false);
                        toast.success('Successfully logged out!');
                        navigate('/login');
                      }
                    }
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-all duration-200"
                >
                  <span className="w-5 h-5 flex items-center justify-center">🔓</span>
                  <div>
                    <div className="font-medium">Sign Out</div>
                    <div className="text-xs text-rose-400">Logout from account</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default DashboardNavbar;
