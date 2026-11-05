import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/Layouts/DashboardLayout';
import EditStaff from '../components/Staff/EditStaff';

function EditStaffPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the staff member's ID from the URL

  const handleBack = () => {
    navigate('/manage-staff');
  };

  return (
    <DashboardLayout>
      {/* Back Button */}
      <div className="mb-6">
        <button 
          onClick={handleBack}
          className="flex items-center space-x-2 text-[#1D5C84] hover:text-blue-700 transition-colors duration-200 group"
        >
          <span className="text-lg group-hover:-translate-x-1 transition-transform duration-200">←</span>
          <span className="font-medium">Back to Manage Staff</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1D5C84] mb-2">Edit Staff Member</h1>
        <p className="text-gray-600 text-sm md:text-base">Update the details of the staff member</p>
      </div>

      {/* Edit Staff Form */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 p-6 border-b border-blue-100">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <span className="text-white text-xl">✏️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Staff Update Form</h2>
              <p className="text-gray-600 text-sm mt-1">Modify the information for this staff member</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gradient-to-b from-white to-gray-50">
          <EditStaff staffId={id} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default EditStaffPage;