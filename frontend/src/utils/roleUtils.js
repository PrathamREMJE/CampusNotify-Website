// Role Display Mapping - Backend stores technical names, Frontend shows user-friendly names
export const ROLE_DISPLAY_MAP = {
  'admin': 'College Admin',          // Main college administrator
  'college_admin': 'College Admin',  // College administrator (same as admin)
  'clg_admin': 'College Admin',      // College administrator (same as admin)
  'principal': 'Principal',
  'vice_principal': 'Vice Principal',
  'hod': 'HOD',
  'office_superintendent': 'Office Superintendent',
  'teacher': 'Teacher',
  'senior_clerk': 'Senior Clerk'
};

// Helper function to get display name
export const getRoleDisplayName = (role) => {
  if (!role) return 'Unknown';
  return ROLE_DISPLAY_MAP[role] || role.replace(/_/g, ' ').toUpperCase();
};

// Role hierarchy levels (lower number = higher authority)
export const ROLE_HIERARCHY = {
  'admin': 1,                    // College Admin - highest authority
  'college_admin': 1,            // College Admin - highest authority (same as admin)
  'clg_admin': 1,                // College Admin - highest authority (same as admin)
  'principal': 2,                // Principal
  'vice_principal': 2,           // Vice Principal (same level as Principal)
  'hod': 3,                      // Head of Department
  'office_superintendent': 3,    // Office Superintendent/Registrar (same level as HOD)
  'teacher': 4,                  // Teacher
  'senior_clerk': 4              // Senior Clerk (same level as Teacher)
};

// Role-based permissions - Who can add/delete what roles
/*
  ACCESS MATRIX FOR STAFF CREATION:
  
  Role                    | Can Create
  ----------------------- | ------------------------------------------
  Admin                   | All lower roles (Principal to Teacher)
  Principal               | Vice Principal, Office Staff, HOD, Teacher  
  Vice Principal          | Cannot add anyone
  HOD                     | Only Teachers in their department
  Office Superintendent   | Senior Clerk
  Teacher                 | Cannot add anyone
  Senior Clerk            | Cannot add anyone
*/
export const ROLE_PERMISSIONS = {
  'admin': ['principal', 'vice_principal', 'hod', 'office_superintendent', 'teacher', 'senior_clerk'], // Admin can create all lower roles (Principal to Teacher)
  'college_admin': ['principal', 'vice_principal', 'hod', 'office_superintendent', 'teacher', 'senior_clerk'], // College Admin can create all lower roles (same as admin)
  'clg_admin': ['principal', 'vice_principal', 'hod', 'office_superintendent', 'teacher', 'senior_clerk'], // College Admin can create all lower roles (same as admin)
  'principal': ['vice_principal', 'office_superintendent', 'hod', 'teacher'],                          // Principal can create Vice Principal, Office Staff, HOD, Teacher
  'vice_principal': [],                                                                                // Vice Principal cannot add anyone (as per your spec)
  'hod': ['teacher'],                                                                                  // HOD can only create Teachers in their department
  'office_superintendent': ['senior_clerk'],                                                          // Office Superintendent can create Senior Clerk
  'teacher': [],                                                                                       // Teachers cannot add anyone
  'senior_clerk': []                                                                                  // Senior Clerks cannot add anyone
};

// Get roles that current user can add/delete
export const getAvailableRoles = (userRole) => {
  if (!userRole) return [];
  return ROLE_PERMISSIONS[userRole] || [];
};

// Check if user can add specific role
export const canAddRole = (userRole, targetRole) => {
  const availableRoles = getAvailableRoles(userRole);
  return availableRoles.includes(targetRole);
};

// Check if user can delete specific role
export const canDeleteRole = (userRole, targetRole) => {
  const availableRoles = getAvailableRoles(userRole);
  return availableRoles.includes(targetRole);
};

// Check if user can manage staff (add/delete)
export const canManageStaff = (userRole) => {
  const availableRoles = getAvailableRoles(userRole);
  return availableRoles.length > 0;
};

// Get user's authority level
export const getUserAuthorityLevel = (userRole) => {
  return ROLE_HIERARCHY[userRole] || 999; // 999 for unknown roles (lowest authority)
};