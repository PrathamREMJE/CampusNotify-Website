import React, { useState } from "react";
import HolidayNoticeForm from "./HolidayNoticeForm";
import GuestLectureCategorySelector from "./GuestLectureCategorySelector";
import ExamNoticeForm from "./ExamNoticeForm";
import LectureCancellationAndAdjustmentNotice from "./LectureCancellationAndAdjustmentNotice";
import AssignmentNoticeForm from "./AssignmentNoticeForm";
import ClassTimetableNoticeForm from "./ClassTimetableNoticeForm";
import PhotocopyNoticeForm from "./PhotocopyNoticeForm";
import IndustrialVisitNoticeForm from "./IndustrialVisitNoticeForm";
import SeminarWorkshopWebinarNoticeForm from "./SeminarWorkshopWebinarNoticeForm";
import InternshipNoticeForm from "./InternshipNoticeForm";
import LibraryNoticeForm from "./LibraryNoticeForm";
import CustomNoticeForm from "./CustomNoticeForm";

const NoticeTypeSelector = () => {
  const [selectedType, setSelectedType] = useState("");

  const renderForm = () => {
    switch (selectedType) {
      case "holiday":
        return <HolidayNoticeForm />;
      case "guest_lecture":
        // Show category selector first, then form based on selection
        return <GuestLectureCategorySelector />;
      case "exam":
        return <ExamNoticeForm />;
      case "lecture_cancellation":
        return <LectureCancellationAndAdjustmentNotice />;
      case "assignment_submission":
        return <AssignmentNoticeForm />;
      case "class_timetable":
        return <ClassTimetableNoticeForm />;
      case "photocopy":
        return <PhotocopyNoticeForm />;
      case "industrial_visit":
        return <IndustrialVisitNoticeForm />;
      case "seminar_workshop_webinar":
        return <SeminarWorkshopWebinarNoticeForm />;
      case "internship":
        return <InternshipNoticeForm />
      case "library":
        return <LibraryNoticeForm />
      case "custom":
      case "miscellaneous":
      case "miscellaneours":
      case "misc":
        return <CustomNoticeForm />;
      default:
        return null;
    }
  };

  const noticeTypes = [
    { value: "holiday", label: "Holiday Notice", icon: "🏖️" },
    { value: "guest_lecture", label: "Guest Lecture Notice", icon: "🎓" },
    { value: "exam", label: "Exam Notice", icon: "📝" },
    { value: "lecture_cancellation", label: "Lecture Cancellation Notice", icon: "📅" },
    { value: "class_timetable", label: "Class Timetable Notice", icon: "📅" },
    { value: "photocopy", label: "Photocopy Application Notice", icon: "📄" },
    { value: "industrial_visit", label: "Industrial Visit / Educational Trip Notice", icon: "🚌" },
    { value: "seminar_workshop_webinar", label: "Seminar / Workshop / Webinar Notice", icon: "🎓" },
    { value: "internship", label: "Internship Notice", icon: "💼" },
    { value: "library", label: "Library Notice", icon: "📚" },
    { value: "custom", label: "Custom / Miscellaneous Notice", icon: "🧩" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Notice Management System</h1>
          <p className="text-gray-600">Create and manage institutional notices efficiently</p>
        </div>

        {/* Notice Type Selection Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Create New Notice
            </h2>
          </div>
          
          <div className="p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Notice Type
            </label>
            
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-4 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-700 font-medium appearance-none cursor-pointer hover:border-gray-400"
              >
                <option value="" className="text-gray-500">Choose a notice type...</option>
                {noticeTypes.map((type) => (
                  <option key={type.value} value={type.value} className="text-gray-700">
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
              
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Notice type description */}
            {selectedType && (
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {noticeTypes.find(type => type.value === selectedType)?.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-blue-800">
                      {noticeTypes.find(type => type.value === selectedType)?.label}
                    </h3>
                    <p className="text-sm text-blue-600 mt-1">
                      {selectedType === "holiday"
                        ? "Create notices for holidays and institutional closures"
                        : selectedType === "guest_lecture"
                        ? "Generate notices for guest lectures and special events organized by departments or committees"
                        : selectedType === "exam"
                        ? "Create notices for exam schedules and details"
                        : selectedType === "photocopy"
                        ? "Create notices for photocopy applications of answer sheets"
                        : selectedType === "industrial_visit"
                        ? "Create notices for industrial visits / educational trips"
                        : selectedType === "seminar_workshop_webinar"
                        ? "Create notices for seminars, workshops, or webinars"
                        : selectedType === "internship"
                        ? "Create notices for internship opportunities from Placement Cell"
                        : selectedType === "library"
                        ? "Create notices for library-related information and schedules"
                        : selectedType === "custom" || selectedType === "misc" || selectedType === "miscellaneous" || selectedType === "miscellaneours"
                        ? "Create fully flexible custom/miscellaneous notices with sections, lists, tables, HTML, and signatures"
                        : "Manage lecture cancellations and adjustments"}
                      </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Section */}
        {selectedType && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Notice Details
              </h3>
            </div>
            
            <div className="p-6">
              {renderForm()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeTypeSelector;
