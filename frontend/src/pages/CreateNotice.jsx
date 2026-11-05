import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/Layouts/DashboardLayout';
import HolidayNoticeForm from '../components/NoticeForm/HolidayNotice';
import GuestLectureCategorySelector from '../components/NoticeForm/GuestLectureCategorySelector';
import ExamNoticeForm from "../components/NoticeForm/ExamNoticeForm";
import LectureCancellationAndAdjustmentNotice from "../components/NoticeForm/LectureCancellationAndAdjustmentNotice";
import AssignmentNoticeForm from "../components/NoticeForm/AssignmentNoticeForm";
import ClassTimetableNoticeForm from "../components/NoticeForm/ClassTimetableNoticeForm";
import SportsEventsNoticeForm from "../components/NoticeForm/SportsEventsNoticeForm";
import ResultMarksheetDistributionForm from "../components/NoticeForm/ResultMarksheetDistributionForm";
import PhotocopyNoticeForm from '../components/NoticeForm/PhotocopyNoticeForm';
import RevaluationNoticeForm from "../components/NoticeForm/RevaluationNoticeForm";
import IndustrialVisitNoticeForm from '../components/NoticeForm/IndustrialVisitNoticeForm';
import SeminarWorkshopWebinarNoticeForm from '../components/NoticeForm/SeminarWorkshopWebinarNoticeForm';
import InternshipNoticeForm from '../components/NoticeForm/InternshipNoticeForm';
import LibraryNoticeForm from '../components/NoticeForm/LibraryNoticeForm';
import CustomNoticeForm from '../components/NoticeForm/CustomNoticeForm';
import LocalLetterheadEditor from '../components/Letterhead/LocalLetterheadEditor';
import { authAPI, committeeAPI } from '../services/api';


const CreateNotice = () => {
  const location = useLocation();
  const [noticeType, setNoticeType] = useState('');
  const [showLetterheadEditor, setShowLetterheadEditor] = useState(false);
  const [localLetterhead, setLocalLetterhead] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userCommittees, setUserCommittees] = useState([]);

  // Role-based notice permissions mapping
  const rolePermissions = {
    'admin': ['holiday', 'guest_lecture', 'exam', 'photocopy', 'lecture_cancellation', 'assignment_submission', 'class_timetable', 'sports_events', 'result_marksheet_distribution', 'revaluation', 'industrial_visit', 'seminar_workshop_webinar', 'internship', 'library', 'custom'],
    'principal': ['holiday', 'guest_lecture', 'exam', 'photocopy', 'lecture_cancellation', 'assignment_submission', 'class_timetable', 'sports_events', 'result_marksheet_distribution', 'revaluation', 'industrial_visit', 'seminar_workshop_webinar', 'internship', 'library', 'custom'],
    'vice_principal': ['holiday', 'guest_lecture', 'exam', 'photocopy', 'lecture_cancellation', 'assignment_submission', 'class_timetable', 'sports_events', 'result_marksheet_distribution', 'revaluation', 'industrial_visit', 'seminar_workshop_webinar', 'internship', 'library', 'custom'],
    'hod': ['guest_lecture', 'lecture_cancellation', 'assignment_submission', 'industrial_visit', 'seminar_workshop_webinar', 'custom'],
    'office_superintendent': ['holiday', 'guest_lecture', 'exam', 'photocopy', 'lecture_cancellation', 'result_marksheet_distribution', 'revaluation', 'custom'],
    'registrar': ['holiday', 'guest_lecture', 'exam', 'photocopy', 'lecture_cancellation', 'result_marksheet_distribution', 'revaluation', 'custom'],
    'teacher': ['guest_lecture', 'lecture_cancellation', 'assignment_submission', 'custom'],
    'senior_clerk': ['holiday', 'guest_lecture', 'exam', 'photocopy', 'lecture_cancellation', 'result_marksheet_distribution', 'revaluation', 'custom']
  };

  // Committee-based permissions
  const committeePermissions = {
    'class_timetable_committee': ['class_timetable'],
    'sports_advisory_committee': ['sports_events'],
    'placement_cell_committee': ['internship'],
    'library_committee': ['library']
  };

  // Normalize committee object to ensure consistent structure
  const normalizeCommittee = (committee) => {
    let name = committee.name || committee.committee_name || committee.committee?.name || committee.committee_name_with_spaces;
    let role = committee.role || committee.role_type || committee.committee?.role;

    // Ensure name is a string
    if (typeof name !== 'string') {
      name = String(name || '');
    }

    // Ensure role is a string
    if (typeof role !== 'string') {
      role = String(role || '');
    }

    return {
      name: name.trim(),
      role: role.trim().toLowerCase()
    };
  };

  // Fetch current user and committees
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await authAPI.getUserProfile();
        setCurrentUser(user);

        if (user?.id) {
          const committees = await committeeAPI.getUserCommittees(user.id);
          setUserCommittees(committees || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
          } catch (parseError) {
            console.error('Error parsing stored user:', parseError);
          }
        }
      }
    };

    fetchUserData();
  }, []);

  // Handle state passed from preview page
  useEffect(() => {
    if (location.state?.selectedType) {
      setNoticeType(location.state.selectedType);
    }
  }, [location.state]);

  // Get allowed notice types for current user
  const getAllowedNoticeTypes = () => {
    if (!currentUser?.role) return [];

    let allowedTypes = rolePermissions[currentUser.role] || [];

    // Add committee-based permissions for all users
    userCommittees.forEach(committee => {
      const normalized = normalizeCommittee(committee);
      if (normalized.name && (normalized.role === 'head' || normalized.role === 'member')) {
        const committeeKey = normalized.name.toLowerCase().replace(/\s+/g, '_');
        if (committeePermissions[committeeKey]) {
          allowedTypes = [...allowedTypes, ...committeePermissions[committeeKey]];
        }
      }
    });

    // Remove duplicates
    return [...new Set(allowedTypes)];
  };

  const allowedNoticeTypes = getAllowedNoticeTypes();

  const renderForm = () => {
    // Get initial data from navigation state (when coming back from preview)
    const initialData = location.state?.data?.content_data;

    if (noticeType === 'holiday') return <HolidayNoticeForm />;
    if (noticeType === 'guest_lecture') return <GuestLectureCategorySelector />;
    if (noticeType === "exam") return <ExamNoticeForm />;
    if(noticeType === "photocopy") return <PhotocopyNoticeForm />
    if (noticeType === "lecture_cancellation") return <LectureCancellationAndAdjustmentNotice />;
    if(noticeType === "assignment_submission") return <AssignmentNoticeForm />
    if(noticeType === "class_timetable") return <ClassTimetableNoticeForm />
    if(noticeType === "sports_events") return <SportsEventsNoticeForm />
    if(noticeType === "result_marksheet_distribution") return <ResultMarksheetDistributionForm />
    if(noticeType === "revaluation") return <RevaluationNoticeForm />
    if(noticeType === "industrial_visit") return <IndustrialVisitNoticeForm />
    if(noticeType === "seminar_workshop_webinar") return <SeminarWorkshopWebinarNoticeForm />
    if(noticeType === "internship") return <InternshipNoticeForm />
    if(noticeType === "library") return <LibraryNoticeForm />
    if(noticeType === "custom") return <CustomNoticeForm />


    return <p className="text-gray-600 mt-4">Please select a notice type.</p>;
  };

  const handleLetterheadChange = (newLetterhead) => {
    setLocalLetterhead(newLetterhead);
  };

  return (
    <DashboardLayout>
      <div className="max-w-8xl mx-auto mt-6 p-4 bg-white shadow-lg rounded-lg border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-teal-700">Create a New Notice</h2>
        </div>
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-1">Select Notice Type</label>
          <select
            className="w-full border px-4 py-2 rounded bg-white text-black"
            value={noticeType}
            onChange={(e) => setNoticeType(e.target.value)}
          >
            <option value="">-- Select --</option>
            {allowedNoticeTypes.includes('holiday') && <option value="holiday">Holiday Notice</option>}
            {allowedNoticeTypes.includes('guest_lecture') && <option value="guest_lecture">Guest Lecture Notice</option>}
            {allowedNoticeTypes.includes('exam') && <option value="exam">Exam Notice</option>}
            {allowedNoticeTypes.includes('photocopy') && <option value="photocopy">Photocopy Notice</option>}
            {allowedNoticeTypes.includes('lecture_cancellation') && <option value="lecture_cancellation">Lecture Cancellation and Adjustment Notice</option>}
            {allowedNoticeTypes.includes('assignment_submission') && <option value="assignment_submission">Assignment Submission Notice</option>}
            {allowedNoticeTypes.includes('class_timetable') && <option value="class_timetable">Class Timetable Notice</option>}
            {allowedNoticeTypes.includes('sports_events') && <option value="sports_events">Sports Events & Selections Notice</option>}
            {allowedNoticeTypes.includes('result_marksheet_distribution') && <option value="result_marksheet_distribution">Result / Marksheet Distribution Notice</option>}
            {allowedNoticeTypes.includes('revaluation') && <option value="revaluation">Revaluation Results Notice</option>}
            {allowedNoticeTypes.includes('industrial_visit') && <option value="industrial_visit">Industrial Visit Notice</option>}
            {allowedNoticeTypes.includes('seminar_workshop_webinar') && <option value="seminar_workshop_webinar">Seminar/ Workshop/ Webinar Notice</option>}
            {allowedNoticeTypes.includes('internship') && <option value="internship">Internship Notice</option>}
            {allowedNoticeTypes.includes('library') && <option value="library">Library Notice</option>}
            {allowedNoticeTypes.includes('custom') && <option value="custom">Custom Notice</option>}
          </select>
        </div>
        {renderForm()}
      </div>

      {showLetterheadEditor && (
        <LocalLetterheadEditor
          onLetterheadChange={handleLetterheadChange}
          onClose={() => setShowLetterheadEditor(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default CreateNotice;
