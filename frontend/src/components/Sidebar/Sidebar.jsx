import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import { getRoleDisplayName } from "../../utils/roleUtils";
import toast from 'react-hot-toast';
import Logo from "../../assets/images/Logo.jpeg";

function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await authAPI.getUserProfile();
        setCurrentUser(user);
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleNavigation = (path) => {
    if (!currentUser) return;

    // Access Logic:
    // - Full Access: developer, college_admin, principal, vice_principal
    // - HOD: Can access: Notice Management, Manage Staff, My Profile
    // - Office Superintendent/Registrar: Same as HOD
    // - Teacher: Limited—cannot access Staff Management or College Management
    // - Senior Clerk: Same as Office Superintendent

  if (['admin', 'clg_admin', 'college_admin'].includes(currentUser?.role)) {
  navigate(path);
  return;
}


    const fullAccessRoles = ['developer', 'admin', 'college_admin', 'clg_admin', 'principal', 'vice_principal'];
    const hodAccessRoles = ['hod', 'office_superintendent', 'registrar', 'senior_clerk'];
    const limitedAccessRoles = ['teacher'];

    const hasFullAccess = fullAccessRoles.includes(currentUser?.role);
    const hasHodAccess = hodAccessRoles.includes(currentUser?.role);
    const hasLimitedAccess = limitedAccessRoles.includes(currentUser?.role);

    // Dashboard - All users can access
    if (path === '/dashboard') {
      navigate(path);
      return;
    }

    // Notice Management - All users can access
    if (path === '/notices/history') {
      navigate(path);
      return;
    }

    // Staff Management - Restricted
    if (path === '/manage-staff') {
      if (hasFullAccess) {
        navigate(path);
      } else {
        toast.error('You do not have permission to access this section');
      }
      return;
    }

    // College Management - Only full access roles
    if (path === '/add-department-committee') {
      if (hasFullAccess) {
        navigate(path);
      } else {
        toast.error('You do not have permission to access this section');
      }
      return;
    }

    // My Profile - All users can access
    if (path === '/profile') {
      navigate(path);
      return;
    }

    // Default navigation for any other paths
    navigate(path);
  };

  const getMenuItems = () => {
    const allItems = [
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        ),
        label: 'Dashboard',
        path: '/dashboard',
        description: 'Overview & Analytics'
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        ),
        label: 'Notice Management',
        path: '/notices/history',
        description: 'Create & Manage Notices'
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        ),
        label: 'Staff Management',
        path: '/manage-staff',
        description: 'Add, Edit & Remove Staff'
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        ),
        label: 'College Management',
        path: '/add-department-committee',
        description: 'Add Departments & Committees',
        roles: ['admin', 'college_admin', 'clg_admin'] // Only show to admin roles
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        ),
        label: 'My Profile',
        path: '/profile',
        description: 'Account Settings'
      },
      // Settings page detached as per user request
      // {
      //   icon: (
      //     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      //       <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      //     </svg>
      //   ),
      //   label: 'Settings',
      //   path: '/settings',
      //   description: 'Preferences & Security'
      // }
    ];

    // Filter out College Management tab for non-admin roles
    return allItems.filter(item => {
      if (item.label === 'College Management') {
        return item.roles && item.roles.includes(currentUser?.role);
      }
      return true;
    });
  };


  return (
    <div
      className={`fixed top-0 left-0 h-full w-72 z-50 transition-all duration-300 ease-in-out border-r border-teal-100 shadow-xl ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col bg-gradient-to-b from-white via-teal-50 to-slate-50`}
      style={{ boxShadow: '0 6px 32px 0 rgba(20,184,166,0.08)' }}
    >
      {/* Header Section (gradient) */}
      <div className="pt-10 pb-5 px-7 border-b border-teal-100 flex flex-col items-center gap-2 bg-gradient-to-r from-white via-teal-50 to-slate-50">
        <img 
          src={Logo} 
          alt="College Logo" 
          className="w-14 h-14 rounded object-cover border border-teal-200 bg-teal-50 shadow-lg mb-2"
        />
        <h2 className="text-lg font-bold text-teal-800 tracking-tight drop-shadow">CampusNotify</h2>
        {currentUser && (
          <div className="w-full bg-white/80 rounded-lg px-3 py-2 border border-teal-100 text-center mt-2 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-slate-700">
                {getRoleDisplayName(currentUser.role)}
              </span>
            </div>
            {currentUser.first_name && currentUser.last_name && (
              <div className="text-slate-900 font-medium text-xs mb-1">
                {currentUser.first_name} {currentUser.last_name}
              </div>
            )}
            {currentUser.college_name && (
              <div className="text-xs text-teal-600">{currentUser.college_name}</div>
            )}
          </div>
        )}
      </div>
      {/* Navigation Menu (white bg) */}
      <div className="flex-1 px-3 py-6 overflow-y-auto bg-gradient-to-b from-white via-slate-50 to-teal-50">
        <nav className="space-y-2">
          {getMenuItems().map((item, index) => (
            <div key={index}>
              <button 
                onClick={() => handleNavigation(item.path)}
                className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-100 border border-transparent hover:bg-teal-50 hover:text-teal-900 hover:border-teal-200 focus:bg-teal-100 focus:text-teal-900 focus:border-teal-300 ${window.location.pathname === item.path ? 'bg-teal-100 text-teal-900 border-teal-300 shadow' : ''}`}
              >
                <span className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded flex items-center justify-center group-hover:bg-teal-100 transition-colors duration-100">
                  {item.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block text-xs text-slate-500 opacity-80">{item.description}</span>
                </span>
              </button>
            </div>
          ))}
        </nav>
      </div>
      {/* Logout Section (gradient) */}
      <div className="px-3 pb-6 border-t border-teal-100 bg-gradient-to-r from-white via-slate-50 to-teal-50">
        <div className="pt-5">
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to logout from CampusNotify?')) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }
            }}
            className="w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-100 border border-rose-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 focus:bg-rose-100 focus:text-rose-800 focus:border-rose-300"
          >
            <span className="flex-shrink-0 w-8 h-8 bg-rose-50 rounded flex items-center justify-center group-hover:bg-rose-100 transition-colors duration-100">
              <svg className="w-5 h-5 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="flex-1">
              <span className="font-semibold text-rose-500 group-hover:text-rose-400 transition-colors text-sm">Sign Out</span>
              <span className="block text-xs text-rose-400/75 group-hover:opacity-100 transition-opacity">End your session securely</span>
            </span>
          </button>
        </div>
        <div className="mt-5 text-center">
          <div className="text-xs text-teal-700">CampusNotify v2.0 • Academic Edition</div>
          <div className="text-xs text-slate-400 mt-1">© 2025 Educational Platform</div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
