import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/'; // Adjust this to match your backend URL

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API request failed:', error);
    
    // Only redirect to login if it's a 401 and we're not already on login page
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Handle unauthorized access
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Only redirect if we're not already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Staff API functions
export const staffAPI = {
  // Get all staff members
  getStaffList: async () => {
    return await apiClient.get('staff/list/');
  },

  // Get single staff member by ID
  getStaffById: async (staffId) => {
    return await apiClient.get(`staff/${staffId}/`);
  },

  // Create new staff member
  createStaff: async (staffData) => {
    return await apiClient.post('staff/', staffData);
  },

  // Update staff member
  updateStaff: async (staffId, staffData) => {
    return await apiClient.patch(`staff/${staffId}/update/`, staffData);
  },

  // Delete staff member
  deleteStaff: async (staffId) => {
    return await apiClient.delete(`staff/${staffId}/delete/`);
  },

  // Get active/online users
  getActiveUsers: async () => {
    return await apiClient.get('staff/active/');
  },

  // Get activity logs
  getActivityLogs: async () => {
    return await apiClient.get('activity-logs/');
  },

  // Get role-based dashboard data
  getRoleBasedDashboard: async () => {
    return await apiClient.get('dashboard/role-based/');
  },
};

// Auth API functions
export const authAPI = {
  // Admin Signup (Hard-coded as Admin role)
  signup: async (userData) => {
    return await apiClient.post('signup/', userData);
  },

  login: async (credentials) => {
    try {
      const response = await apiClient.post('token/', credentials);
      console.log("API response:", response); // Debug log
      return response; // The response is already the data we need
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Request password reset (supports direct reset by providing new_password + confirm_password)
  forgotPassword: async ({ email, username, frontend_base, new_password, confirm_password }) => {
    return await apiClient.post('auth/forgot-password/', { email, username, frontend_base, new_password, confirm_password });
  },

  // Confirm password reset using uid + token (kept for compatibility)
  resetPassword: async ({ uid, token, new_password, confirm_password }) => {
    return await apiClient.post('auth/reset-password/', { uid, token, new_password, confirm_password });
  },

  getUserProfile: async () => {
    try {
      const response = await apiClient.get('users/profile/');
      return response; // The interceptor already returns response.data
    } catch (error) {
      console.error('Get user profile failed:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.patch('users/profile/', profileData);
      return response; // The interceptor already returns response.data
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Call backend logout endpoint to invalidate token
      await apiClient.post('logout/');
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Don't throw error - we still want to clear local storage even if API fails
    }
  },
};

// Notice API functions
export const noticeAPI = {
  getNotices: async () => {
    try {
      return await apiClient.get('notices/');
    } catch (error) {
      console.error('Error fetching notices:', error);
      // Return mock data if API fails
      return [
        {
          id: 1,
          title: 'Semester Examination Schedule',
          content: 'The semester examination will commence from next Monday. All students are requested to check their exam schedules.',
          author: 'Principal',
          created_at: new Date().toISOString(),
          status: 'published',
          priority: 'high'
        },
        {
          id: 2,
          title: 'Faculty Meeting',
          content: 'All faculty members are requested to attend the monthly meeting on Friday at 2 PM in the conference hall.',
          author: 'HOD Computer Science',
          created_at: new Date().toISOString(),
          status: 'published',
          priority: 'medium'
        }
      ];
    }
  },

  // New: Paginated + filterable list endpoint
  getNoticeList: async (params = {}) => {
    return await apiClient.get('notices/list/', { params });
  },

  getNoticeById: async (id) => {
    return await apiClient.get(`notices/${id}/`);
  },

  createNotice: async (noticeData) => {
    return await apiClient.post('notices/', noticeData);
  },

  updateNotice: async (id, noticeData) => {
    return await apiClient.put(`notices/${id}/`, noticeData);
  },

  deleteNotice: async (id) => {
    return await apiClient.delete(`notices/${id}/`);
  }
};

// Committee API functions
export const committeeAPI = {
  // Get all committees
  getCommittees: async () => {
    return await apiClient.get('committees/');
  },

  // Create new committee (RESTful)
  createCommittee: async (committeeData) => {
    return await apiClient.post('committees/create/', committeeData);
  },

  // Update committee (RESTful)
  updateCommittee: async (committeeId, committeeData) => {
    return await apiClient.put(`committees/${committeeId}/`, committeeData);
  },

  // Delete committee (RESTful)
  deleteCommittee: async (committeeId) => {
    return await apiClient.delete(`committees/${committeeId}/`);
  },

  // Create committee memberships for a user
  createCommitteeMemberships: async (membershipData) => {
    return await apiClient.post('committee-memberships/', membershipData);
  },

  // Get committees for a specific user
  getUserCommittees: async (userId) => {
    return await apiClient.get(`users/${userId}/committees/`);
  }
};

// Department API functions
export const departmentAPI = {
  // Get all departments
  getDepartments: async () => {
    return await apiClient.get('departments/');
  },

  // Create new department (RESTful)
  createDepartment: async (departmentData) => {
    return await apiClient.post('departments/', departmentData);
  },

  // Update department (RESTful)
  updateDepartment: async (departmentId, departmentData) => {
    return await apiClient.put(`departments/${departmentId}/`, departmentData);
  },

  // Delete department (RESTful)
  deleteDepartment: async (departmentId) => {
    return await apiClient.delete(`departments/${departmentId}/`);
  }
};

// Letterhead API functions
export const letterheadAPI = {
  // Get current letterhead
  getCurrent: async () => {
    return await apiClient.get('letterhead/current/');
  },

  // Update letterhead (admin only)
  update: async (htmlContent) => {
    return await apiClient.post('letterhead/update/', { html_content: htmlContent });
  }
};

export default apiClient;