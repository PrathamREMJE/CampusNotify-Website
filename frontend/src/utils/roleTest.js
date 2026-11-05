// Test file to verify role permissions
import { getAvailableRoles, canManageStaff, getRoleDisplayName } from './roleUtils';

// Test function to verify role permissions
export const testRolePermissions = () => {
  console.log('=== ROLE PERMISSIONS TEST ===');
  
  const roles = ['admin', 'principal', 'vice_principal', 'hod', 'office_superintendent', 'teacher', 'senior_clerk'];
  
  roles.forEach(role => {
    const availableRoles = getAvailableRoles(role);
    const canManage = canManageStaff(role);
    const displayName = getRoleDisplayName(role);
    
    console.log(`${displayName}:`);
    console.log(`  - Can manage staff: ${canManage}`);
    console.log(`  - Can create roles: [${availableRoles.map(r => getRoleDisplayName(r)).join(', ')}]`);
    console.log('');
  });
};

// Expected results based on your specifications:
/*
College Admin:
  - Can manage staff: true
  - Can create roles: [Principal, Vice Principal, HOD, Office Superintendent, Teacher, Senior Clerk]

Principal:
  - Can manage staff: true
  - Can create roles: [Vice Principal, Office Superintendent, HOD, Teacher]

Vice Principal:
  - Can manage staff: false
  - Can create roles: []

HOD:
  - Can manage staff: true
  - Can create roles: [Teacher]

Office Superintendent:
  - Can manage staff: true
  - Can create roles: [Senior Clerk]

Teacher:
  - Can manage staff: false
  - Can create roles: []

Senior Clerk:
  - Can manage staff: false
  - Can create roles: []
*/