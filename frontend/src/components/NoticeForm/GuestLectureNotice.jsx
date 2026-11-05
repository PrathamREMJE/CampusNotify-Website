import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GuestLectureNoticeForm = ({ category }) => {
    const [introduction, setIntroduction] = useState('');
    const [endingMessage, setEndingMessage] = useState('');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [lectureTitle, setLectureTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [designation, setDesignation] = useState('');
  const [venue, setVenue] = useState('');
  const [venueSelection, setVenueSelection] = useState('');

  // Add category to state
  const [lectureCategory] = useState(category || 'dept');
  // New state for mode
  const [mode, setMode] = useState('predefined');
  const [customContent, setCustomContent] = useState('');
  // New state for year groups and departments
  const [years, setYears] = useState([]); // e.g. ['FY', 'SY', 'TY']
  const [departments, setDepartments] = useState([]); // fetched from backend
  const [targetDepartments, setTargetDepartments] = useState([]);
  const [learningPoints, setLearningPoints] = useState(['']);
  const [signedBy, setSignedBy] = useState('');
  const [speakerProfile, setSpeakerProfile] = useState('');
  const [learningOutcomes, setLearningOutcomes] = useState([]);
  // New state for committee list and selected committee
  const [committees, setCommittees] = useState([]);
  const [selectedCommittee, setSelectedCommittee] = useState('');
  // New state for committee name in custom mode
  const [committeeName, setCommitteeName] = useState('');
  // New state for signature functionality
  const [signatureRoles, setSignatureRoles] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [applyFooter, setApplyFooter] = useState(false);


  const navigate = useNavigate();

  // Draft functionality - save form data to localStorage
  const saveDraft = () => {
    const draftData = {
      introduction,
      endingMessage,
      date,
      time,
      lectureTitle,
      speaker,
      designation,
      venue,
      mode,
      customContent,
      years,
      targetDepartments,
      learningPoints,
      signedBy,
      speakerProfile,
      learningOutcomes,
      selectedCommittee,
      committeeName,
      signatures,
      lectureCategory,
      applyFooter
    };
    localStorage.setItem(`guest_lecture_draft_${lectureCategory}`, JSON.stringify(draftData));
  };

  // Load draft data from localStorage
  const loadDraft = () => {
    try {
      const draftData = localStorage.getItem(`guest_lecture_draft_${lectureCategory}`);
      if (draftData) {
        const parsed = JSON.parse(draftData);
        setIntroduction(parsed.introduction || '');
        setEndingMessage(parsed.endingMessage || '');
        setDate(parsed.date || '');
        setTime(parsed.time || '');
        setLectureTitle(parsed.lectureTitle || '');
        setSpeaker(parsed.speaker || '');
        setDesignation(parsed.designation || '');
        setVenue(parsed.venue || '');
        // Initialize dropdown selection based on saved venue
        if (parsed.venue === 'Savarkar Hall' || parsed.venue === 'Room 101' || parsed.venue === 'Room 103') {
          setVenueSelection(parsed.venue);
        } else if (parsed.venue) {
          setVenueSelection('custom');
        } else {
        setVenueSelection('');
        }
        setMode(parsed.mode || 'predefined');
        setCustomContent(parsed.customContent || '');
        setYears(parsed.years || []);
        setTargetDepartments(parsed.targetDepartments || []);
        setLearningPoints(parsed.learningPoints || ['']);
        setSignedBy(parsed.signedBy || '');
        setSpeakerProfile(parsed.speakerProfile || '');
        setLearningOutcomes(parsed.learningOutcomes || []);
        setSelectedCommittee(parsed.selectedCommittee || '');
        setCommitteeName(parsed.committeeName || '');
        setSignatures(parsed.signatures || []);
        setApplyFooter(parsed.applyFooter || false);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  // Clear draft data
  const clearDraft = () => {
    localStorage.removeItem(`guest_lecture_draft_${lectureCategory}`);
  };

  // Load draft data when component mounts
  useEffect(() => {
    loadDraft();
  }, [lectureCategory]);

  // Fetch department options, committee list and signature data for dropdown
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    // Fetch departments
    fetch('http://127.0.0.1:8000/api/departments/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
        .then(data => {
          setDepartments(data);
        })
      .catch(err => console.error('Error fetching departments:', err));

    // Fetch committees
    fetch('http://127.0.0.1:8000/api/committees/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        setCommittees(data);
      })
      .catch(err => console.error('Error fetching committees:', err));

    // Fetch all staff
    fetch('http://127.0.0.1:8000/api/staff/list/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        setStaffList(data);
      })
      .catch(err => console.error('Error fetching staff:', err));

    // Set predefined signature roles based on user roles
    const predefinedRoles = [
      { id: 'principal', name: 'Principal' },
      { id: 'vice_principal', name: 'Vice Principal' },
      { id: 'office_superintendent', name: 'Office Superintendent' },
      { id: 'senior_clerk', name: 'Senior Clerk' },
      { id: 'hod', name: 'Head of Department' },
      { id: 'teacher', name: 'Teacher' }
    ];
    setSignatureRoles(predefinedRoles);
  }, []);

  // Auto-save draft whenever form data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [introduction, endingMessage, date, time, lectureTitle, speaker, designation, venue, mode, customContent, years, targetDepartments, learningPoints, signedBy, speakerProfile, learningOutcomes, selectedCommittee, signatures]);





  // Functions for multiple signatures
  const addSignature = () => {
    setSignatures([...signatures, { role: '', custom_role: '', person: '', person_name: '' }]);
  };

  const removeSignature = (index) => {
    const updated = signatures.filter((_, i) => i !== index);
    setSignatures(updated);
  };

  const updateSignature = (index, field, value) => {
    const updated = signatures.map((signature, i) =>
      i === index ? { ...signature, [field]: value } : signature
    );
    setSignatures(updated);
  };

  const handlePreview = () => {
    // Save current form data as draft before navigating to preview
    saveDraft();

    let formData;

    // Process signatures for multiple entries
    const processedSignatures = signatures
      .filter(sig => (sig.role || sig.custom_role) && (sig.person || sig.person_name))
      .map(sig => {
        let personId = null;
        let personName = sig.person_name || '';

        if (sig.person) {
          const person = staffList.find(p => String(p.id) === String(sig.person));
          if (person) {
            personId = parseInt(sig.person, 10);
            if (!personName) {
              personName = person.first_name && person.last_name
                ? `${person.first_name} ${person.last_name}`
                : person.username || person.id;
            }
          } else {
            // If person not found, treat sig.person as custom name
            personName = sig.person;
          }
        }

        return {
          role: sig.custom_role || sig.role,
          person: personId,
          person_name: personName,
          isPrincipal: (sig.custom_role || sig.role) === 'principal'
        };
      });

    if (mode === 'custom') {
      const principalSignature = processedSignatures.find(sig => sig.isPrincipal);
      const principalName = principalSignature ? principalSignature.person : '';
      
      const organizerText = lectureCategory === 'committee' ? 'Committee' : 'Department';
      formData = {
        notice_type: 'guest_lecture',
        mode: 'custom',
        category: lectureCategory,
        custom_content: customContent,
        ending_message: endingMessage,
        guest_lecture_date: date,
        time: time,
        speaker: speaker,
        designation: designation,
        venue: venue,
        signatures: processedSignatures,
        principal_name: principalName,
        committee: lectureCategory === 'committee' ? (committeeName || committees.find(c => String(c.id) === String(selectedCommittee))?.name) : undefined,
        applyFooter: applyFooter
      };
    } else {
      const targetDepartmentsNames = targetDepartments.map(id => {
        const dept = departments.find(d => String(d.id) === String(id));
        return dept ? dept.name : id;
      });

      const principalSignature = processedSignatures.find(sig => sig.isPrincipal);
      const principalName = principalSignature ? principalSignature.person : '';

      const committeeName = lectureCategory === 'committee' ? committees.find(c => String(c.id) === String(selectedCommittee))?.name : undefined;
      formData = {
        notice_type: 'guest_lecture',
        mode: 'predefined',
        category: lectureCategory,
        introduction: lectureCategory === 'committee' && committeeName
          ? `The ${committeeName} has organized a Guest Lecture on the topic "${lectureTitle}" for ${years.join('/')} ${targetDepartmentsNames.join(', ')} students.`
          : introduction || `A Guest Lecture has been organized on topic "${lectureTitle}" for ${years.join('/')} ${targetDepartmentsNames.join(', ')} students.`,
        ending_message: endingMessage,
        lecture_title: lectureTitle,
        speaker: speaker,
        designation: designation,
        speaker_organization: '', // Add this field if needed
        date: date,
        time: time,
        venue: venue,
        departments: targetDepartmentsNames,
        years: years,
        learning_outcomes: learningPoints.filter(point => point.trim() !== ''),
        signed_by: signedBy,
        speaker_profile: speakerProfile,
        signatures: processedSignatures,
        principal_name: principalName,
        committee: committeeName,
        committee_name: committeeName,
        origin_type: lectureCategory === 'committee' ? 'committee' : 'department',
        applyFooter: applyFooter
      };
    }
    console.log('Selected Committee:', selectedCommittee); // Log the selected committee for debugging
    console.log('Committee Name:', lectureCategory === 'committee' ? committees.find(c => String(c.id) === String(selectedCommittee))?.name : undefined); // Log the committee name for debugging
    console.log('Form Data:', formData); // Log the form data for debugging
    navigate("/notices/preview", { state: { noticeType: "guest_lecture", data: formData, draftKey: `guest_lecture_draft_${lectureCategory}` } });
  };



    const isFormValid = mode === 'custom'
      ? customContent.trim().length > 0
      : lectureTitle.trim() && speaker.trim() && date && time && targetDepartments.length > 0 && years.length > 0;
    const currentDate = new Date().toISOString().split('T')[0];

    // Helper function to add learning point
    const addLearningPoint = () => {
      setLearningPoints([...learningPoints, '']);
    };

    // Helper function to remove learning point
    const removeLearningPoint = (index) => {
      if (learningPoints.length > 1) {
        setLearningPoints(learningPoints.filter((_, i) => i !== index));
      }
    };

    // Helper function to update learning point
    const updateLearningPoint = (index, value) => {
      const updated = [...learningPoints];
      updated[index] = value;
      setLearningPoints(updated);
    };

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Professional Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Guest Lecture Notice Generator - {lectureCategory === 'committee' ? 'Committee' : 'Department'}
                </h2>
                <p className="text-white/90 text-sm font-medium">Academic Event Announcement System</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-xs font-semibold">
                  {lectureCategory === 'committee' ? 'COMMITTEE' : 'DEPARTMENT'}
                </span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-xs font-semibold">ACADEMIC</span>
              </div>
            </div>
          </div>
        </div>

        <form className="p-8 space-y-8">
          {/* Mode Toggle */}
          <div className="mb-6 flex gap-4 items-center justify-between">
            <div className="flex gap-4">
              <button type="button" className={`px-4 py-2 rounded-xl font-semibold border-2 transition-all duration-200 ${mode==='predefined' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`} onClick={()=>setMode('predefined')}>Predefined</button>
              <button type="button" className={`px-4 py-2 rounded-xl font-semibold border-2 transition-all duration-200 ${mode==='custom' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'}`} onClick={()=>setMode('custom')}>Custom</button>
            </div>
            
            {/* Draft Controls */}
            <div className="flex items-center gap-3">
              {localStorage.getItem(`guest_lecture_draft_${lectureCategory}`) && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-green-50 border border-green-200 rounded-lg px-3 py-1">
                    <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-green-700">Draft Loaded</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear the saved draft? This action cannot be undone.')) {
                        clearDraft();
                        window.location.reload(); // Reload to reset form
                      }
                    }}
                    className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    Clear Draft
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ...removed notice origin field... */}
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <span className="text-sm font-semibold text-gray-700">Lecture Details</span>
            </div>
            <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full">
              <div className="h-1 bg-blue-600 rounded-full" style={{ width: '33%' }}></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-bold">2</span>
              </div>
              <span className="text-sm text-gray-500">Preview & Generate</span>
            </div>
          </div>

          {/* Predefined or Custom Mode */}
          {mode === 'custom' ? (
            <>

                        {/* Committee Name Field for Custom Mode */}
              {lectureCategory === 'committee' && (
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    Committee Name
                    <div className="ml-auto bg-purple-50 px-2 py-1 rounded-full">
                      <span className="text-xs font-semibold text-purple-700">OPTIONAL</span>
                    </div>
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={committeeName}
                      onChange={(e) => setCommitteeName(e.target.value)}
                      placeholder="Enter committee name for custom mode"
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-800 bg-white hover:border-purple-400 hover:shadow-md group-hover:shadow-lg font-medium text-lg"
                      maxLength="100"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6" />
                    </svg>
                  </div>
                  Custom Content
                  <span className="text-red-500 ml-2 text-base">*</span>
                </label>
                <textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="Enter your custom notice content here..."
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-gray-800 bg-white hover:border-green-400 hover:shadow-md resize-none font-medium text-lg"
                  rows="8"
                  maxLength="2000"
                  required
                />
                <div className="text-right">
                  <span className="text-sm text-gray-500">{customContent.length}/2000</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  Date
                  <span className="text-red-500 ml-2 text-base">*</span>
                </label>
                <div className="relative group">
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    min={currentDate}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-800 bg-white hover:border-blue-400 hover:shadow-md group-hover:shadow-lg font-medium text-lg"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Time
                  <span className="text-red-500 ml-2 text-base">*</span>
                </label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    placeholder="e.g., 9:00 AM – 1:00 PM"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-800 bg-white hover:border-purple-400 hover:shadow-md group-hover:shadow-lg font-medium text-lg"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  Lecture Title
                  <span className="text-red-500 ml-2 text-base">*</span>
                </label>
                <div className="relative group">
                  <textarea 
                    value={lectureTitle} 
                    onChange={(e) => setLectureTitle(e.target.value)} 
                    placeholder="Enter the title of the guest lecture (e.g., Tools in Business Analytics, Digital Marketing Strategies, Artificial Intelligence in Business)"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-gray-800 bg-white hover:border-emerald-400 hover:shadow-md group-hover:shadow-lg resize-none font-medium text-lg"
                    rows="3"
                    maxLength="150"
                    required
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      lectureTitle.length > 120 ? 'bg-red-100 text-red-700' : 
                      lectureTitle.length > 80 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {lectureTitle.length}/150
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  Speaker Name
                  <span className="text-red-500 ml-2 text-base">*</span>
                </label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={speaker} 
                    onChange={(e) => setSpeaker(e.target.value)} 
                    placeholder="Enter speaker's full name"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-gray-800 bg-white hover:border-indigo-400 hover:shadow-md group-hover:shadow-lg font-medium text-lg"
                    maxLength="100"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  Designation
                  <div className="ml-auto bg-orange-50 px-2 py-1 rounded-full">
                    <span className="text-xs font-semibold text-orange-700">OPTIONAL</span>
                  </div>
                </label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={designation} 
                    onChange={(e) => setDesignation(e.target.value)} 
                    placeholder="Enter speaker's designation/title"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 text-gray-800 bg-white hover:border-orange-400 hover:shadow-md group-hover:shadow-lg font-medium text-lg"
                    maxLength="100"
                  />
                </div>
              </div>
              {/* Venue Field */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Venue
                  <div className="ml-auto bg-teal-50 px-2 py-1 rounded-full">
                    <span className="text-xs font-semibold text-teal-700">OPTIONAL</span>
                  </div>
                </label>
                <div className="relative group space-y-3">
                  <select
                    value={venueSelection}
                    onChange={(e) => {
                      const v = e.target.value;
                      setVenueSelection(v);
                      if (v === 'custom') {
                        setVenue('');
                      } else if (v) {
                        setVenue(v);
                      } else {
                        setVenue('');
                      }
                    }}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 text-gray-800 bg-white hover:border-teal-400 hover:shadow-md group-hover:shadow-lg font-medium text-lg"
                  >
                    <option value="">Select a venue...</option>
                    <option value="Savarkar Hall">Savarkar Hall</option>
                    <option value="Room 101">Room 101</option>
                    <option value="Room 103">Room 103</option>
                    <option value="custom">Custom</option>
                  </select>
                  {venueSelection === 'custom' && (
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="Type custom venue"
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 text-gray-800 bg-white hover:border-teal-400 hover:shadow-md group-hover:shadow-lg font-medium text-lg"
                      maxLength="100"
                    />
                  )}
                </div>
              </div>
  

              {/* Speaker's Profile Field */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  Speaker's Profile
                  <div className="ml-auto bg-indigo-50 px-2 py-1 rounded-full">
                    <span className="text-xs font-semibold text-indigo-700">OPTIONAL</span>
                  </div>
                </label>
                <div className="relative group">
                  <textarea
                    value={speakerProfile}
                    onChange={(e) => setSpeakerProfile(e.target.value)}
                    placeholder="Describe the speaker's background, expertise, and achievements..."
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-gray-800 bg-white hover:border-indigo-400 hover:shadow-md group-hover:shadow-lg resize-none font-medium text-lg"
                    rows="4"
                    maxLength="500"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <div className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      {speakerProfile.length}/500
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {mode === 'custom' && (
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6" />
                      </svg>
                    </div>
                    Introduction Message <span className="text-gray-500 ml-2 text-base">(optional)</span>
                  </label>
                  <textarea
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    placeholder="Write an introductory message for the notice..."
                    className="w-full text-black p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                    rows="3"
                  />
                </div>
              )}

              {/* Year Groups Field */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  Target Year Groups
                  <span className="text-red-500 ml-2 text-base">*</span>
                </label>
                <div className="flex gap-4 flex-wrap">
                  {['FY', 'SY', 'TY'].map((year) => (
                    <label key={year} className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-pink-200 bg-pink-50 text-pink-800 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={years.includes(year)}
                        onChange={e => {
                          if (e.target.checked) setYears([...years, year]);
                          else setYears(years.filter(y => y !== year));
                        }}
                        className="accent-pink-600"
                      />
                      {year}
                    </label>
                  ))}
                </div>
              </div>

              {/* Committee Selection - Only show when category is committee */}
              {lectureCategory === 'committee' && (
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    Committee
                    <span className="text-red-500 ml-2 text-base">*</span>
                  </label>
                  <select
                    value={selectedCommittee}
                    onChange={(e) => setSelectedCommittee(e.target.value)}
                    className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white hover:border-purple-300 transition-colors duration-200 text-gray-900"
                    required
                  >
                    <option value="">Select a committee...</option>
                    {committees.map(committee => (
                      <option key={committee.id} value={committee.id}>{committee.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Target Departments Field */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  Target Departments
                  <span className="text-red-500 ml-2 text-base">*</span>
                </label>
                <select
                  multiple
                  value={targetDepartments.map(String)}
                  onChange={e => {
                    const options = Array.from(e.target.options);
                    setTargetDepartments(options.filter(o => o.selected).map(o => o.value));
                  }}
                  className="w-full px-4 py-3 border border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white hover:border-yellow-300 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  required
                >
                  {departments.map(dep => (
                    <option key={dep.id || dep.name || dep} value={String(dep.id)}>{dep.name}</option>
                  ))}
                </select>
              </div>

              {/* Date and Time Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Field */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Date
                    <span className="text-red-500 ml-2 text-base">*</span>
                    <div className="ml-auto bg-blue-50 px-2 py-1 rounded-full">
                      <span className="text-xs font-semibold text-blue-700">REQUIRED</span>
                    </div>
                  </label>
                  <div className="relative group">
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      min={currentDate}
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-800 bg-white hover:border-blue-400 hover:shadow-md group-hover:shadow-lg font-medium text-lg"
                      required
                    />
                  </div>
                </div>
                {/* Time Field */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Time
                    <span className="text-red-500 ml-2 text-base">*</span>
                    <div className="ml-auto bg-purple-50 px-2 py-1 rounded-full">
                      <span className="text-xs font-semibold text-purple-700">REQUIRED</span>
                    </div>
                  </label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={time} 
                      onChange={(e) => setTime(e.target.value)} 
                      placeholder="e.g., 9:00 AM – 1:00 PM"
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-800 bg-white hover:border-purple-400 hover:shadow-md group-hover:shadow-lg font-medium text-lg"
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Lecture Title Field */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  Lecture Title
                  <span className="text-red-500 ml-2 text-base">*</span>
                  <div className="ml-auto bg-emerald-50 px-2 py-1 rounded-full">
                    <span className="text-xs font-semibold text-emerald-700">REQUIRED</span>
                  </div>
                </label>
                <div className="relative group">
                  <textarea 
                    value={lectureTitle} 
                    onChange={(e) => setLectureTitle(e.target.value)} 
                    placeholder="Enter the title of the guest lecture (e.g., Tools in Business Analytics, Digital Marketing Strategies, Artificial Intelligence in Business)"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-gray-800 bg-white hover:border-emerald-400 hover:shadow-md group-hover:shadow-lg resize-none font-medium text-lg"
                    rows="3"
                    maxLength="150"
                    required
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      lectureTitle.length > 120 ? 'bg-red-100 text-red-700' : 
                      lectureTitle.length > 80 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {lectureTitle.length}/150
                    </div>
                  </div>
                </div>
              </div>
              {/* Speaker Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Speaker Name Field */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    Speaker Name
                    <span className="text-red-500 ml-2 text-base">*</span>
                    <div className="ml-auto bg-indigo-50 px-2 py-1 rounded-full">
                      <span className="text-xs font-semibold text-indigo-700">REQUIRED</span>
                    </div>
                  </label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={speaker} 
                      onChange={(e) => setSpeaker(e.target.value)} 
                      placeholder="Enter speaker's full name"
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-gray-800 bg-white hover:border-indigo-400 hover:shadow-md group-hover:shadow-lg font-medium text-lg"
                      maxLength="100"
                      required
                    />
                  </div>
                </div>
                {/* Designation Field */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    Designation
                    <div className="ml-auto bg-orange-50 px-2 py-1 rounded-full">
                      <span className="text-xs font-semibold text-orange-700">OPTIONAL</span>
                    </div>
                  </label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={designation} 
                      onChange={(e) => setDesignation(e.target.value)} 
                      placeholder="Enter speaker's designation/title"
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 text-gray-800 bg-white hover:border-orange-400 hover:shadow-md group-hover:shadow-lg font-medium text-lg"
                      maxLength="100"
                    />
                  </div>
                </div>
              </div>
              {/* Venue Field */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Venue
                  <div className="ml-auto bg-teal-50 px-2 py-1 rounded-full">
                    <span className="text-xs font-semibold text-teal-700">OPTIONAL</span>
                  </div>
                </label>
                <div className="relative group space-y-3">
                  <select
                    value={venueSelection}
                    onChange={(e) => {
                      const v = e.target.value;
                      setVenueSelection(v);
                      if (v === 'custom') {
                        setVenue('');
                      } else if (v) {
                        setVenue(v);
                      } else {
                        setVenue('');
                      }
                    }}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 text-gray-800 bg-white hover:border-teal-400 hover:shadow-md group-hover:shadow-lg font-medium text-lg"
                  >
                    <option value="">Select a venue...</option>
                    <option value="Savarkar Hall">Savarkar Hall</option>
                    <option value="Room 101">Room 101</option>
                    <option value="Room 103">Room 103</option>
                    <option value="custom">Custom</option>
                  </select>
                  {venueSelection === 'custom' && (
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="Type custom venue"
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 text-gray-800 bg-white hover:border-teal-400 hover:shadow-md group-hover:shadow-lg font-medium text-lg"
                      maxLength="100"
                    />
                  )}
                </div>
              </div>

              {/* Speaker's Profile Field */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  Speaker's Profile
                  <div className="ml-auto bg-indigo-50 px-2 py-1 rounded-full">
                    <span className="text-xs font-semibold text-indigo-700">OPTIONAL</span>
                  </div>
                </label>
                <div className="relative group">
                  <textarea
                    value={speakerProfile}
                    onChange={(e) => setSpeakerProfile(e.target.value)}
                    placeholder="Describe the speaker's background, expertise, and achievements..."
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-gray-800 bg-white hover:border-indigo-400 hover:shadow-md group-hover:shadow-lg resize-none font-medium text-lg"
                    rows="4"
                    maxLength="500"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <div className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      {speakerProfile.length}/500
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Outcomes Field */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Learning Outcomes
                  <div className="ml-auto bg-purple-50 px-2 py-1 rounded-full">
                    <span className="text-xs font-semibold text-purple-700">OPTIONAL</span>
                  </div>
                </label>
                <div className="space-y-2">
                  {learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={outcome}
                        onChange={(e) => {
                          const updated = [...learningOutcomes];
                          updated[index] = e.target.value;
                          setLearningOutcomes(updated);
                        }}
                        placeholder={`Learning outcome ${index + 1}`}
                        className="flex-1 p-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-800 bg-white hover:border-purple-400 hover:shadow-md"
                        maxLength="100"
                      />
                      {learningOutcomes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setLearningOutcomes([...learningOutcomes, ''])}
                    className="w-full p-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Learning Outcome
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Ending Message */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Ending Message <span className="text-gray-500 ml-2 text-base">(optional)</span>
            </label>
            <textarea
              value={endingMessage}
              onChange={(e) => setEndingMessage(e.target.value)}
              placeholder="Write a closing note for the notice..."
              className="w-full text-black p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              rows="3"
            />
          </div>



          {/* Footer Option */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
              <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Footer Options
              <div className="ml-auto bg-orange-50 px-2 py-1 rounded-full">
                <span className="text-xs font-semibold text-orange-700">OPTIONAL</span>
              </div>
            </label>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="applyFooter"
                  checked={applyFooter}
                  onChange={(e) => setApplyFooter(e.target.checked)}
                  className="w-5 h-5 text-orange-600 bg-white border-2 border-orange-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <label htmlFor="applyFooter" className="ml-3 text-sm font-medium text-orange-800 cursor-pointer">
                  Include institutional footer with contact information
                </label>
              </div>
              <p className="text-xs text-orange-600 mt-2 ml-8">
                Adds official contact details and institutional branding to the notice footer
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <h3 className="text-lg font-medium mb-2">Signatures</h3>

          {signatures.map((sig, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-2 mb-2 p-2 border rounded text-black">
              {/* Role selection */}
              <select
                value={sig.role}
                onChange={(e) => updateSignature(index, "role", e.target.value)}
                className="flex-1 border px-2 py-1 rounded"
              >
                <option value="">Select Role</option>
                {signatureRoles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>

              {/* Custom Role Label */}
              <input
                type="text"
                placeholder="Custom Role Label (optional)"
                value={sig.custom_role || ""}
                onChange={(e) => updateSignature(index, "custom_role", e.target.value)}
                className="flex-1 border px-2 py-1 rounded"
              />

              {/* Staff person selection filtered by role */}
              <select
                value={sig.person || ""}
                onChange={(e) => updateSignature(index, "person", e.target.value)}
                className="flex-1 border px-2 py-1 rounded"
                disabled={!sig.role}
              >
                <option value="">{!sig.role ? 'Select a role first...' : 'Select Person'}</option>
                {staffList
                  .filter(p => p.role === sig.role)
                  .map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.first_name && person.last_name
                        ? `${person.first_name} ${person.last_name}`
                        : person.username || person.id}
                    </option>
                ))}
              </select>

              {/* Custom person name */}
              <input
                type="text"
                placeholder="Or type custom person name"
                value={sig.person_name || ""}
                onChange={(e) => updateSignature(index, "person_name", e.target.value)}
                className="flex-1 border px-2 py-1 rounded"
              />

              {/* Remove signature */}
              <button
                type="button"
                onClick={() => removeSignature(index)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSignature}
            className="bg-green-600 text-white px-3 py-1 rounded mb-4"
          >
            + Add Signature
          </button>

          {/* Form Validation Summary */}
          {!isFormValid && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-800 mb-3 text-lg">Complete Required Information</h4>
                  <div className="space-y-2">
                    {mode === 'custom' ? (
                      <>
                        {!customContent.trim() && (
                          <div className="flex items-center p-2 bg-white/50 rounded-lg">
                            <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-amber-800">Please enter the custom notice content</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {!lectureTitle.trim() && (
                          <div className="flex items-center p-2 bg-white/50 rounded-lg">
                            <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-amber-800">Please enter the lecture title</span>
                          </div>
                        )}
                        {!speaker.trim() && (
                          <div className="flex items-center p-2 bg-white/50 rounded-lg">
                            <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-amber-800">Please enter the speaker's name</span>
                          </div>
                        )}
                        {!date && (
                          <div className="flex items-center p-2 bg-white/50 rounded-lg">
                            <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-amber-800">Please select the date</span>
                          </div>
                        )}
                        {!time && (
                          <div className="flex items-center p-2 bg-white/50 rounded-lg">
                            <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-amber-800">Please specify the time</span>
                          </div>
                        )}
                        {/* ...removed notice origin validation... */}
                        {targetDepartments.length === 0 && (
                          <div className="flex items-center p-2 bg-white/50 rounded-lg">
                            <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-amber-800">Please select at least one department</span>
                          </div>
                        )}
                        {years.length === 0 && (
                          <div className="flex items-center p-2 bg-white/50 rounded-lg">
                            <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-amber-800">Please select at least one year group</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2 group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Go Back</span>
            </button>
            
            <button
              type="button"
              onClick={handlePreview}
              disabled={!isFormValid}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 transition-all duration-300 ${
                isFormValid
                  ? 'bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Preview Notice</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    );
  };

  export default GuestLectureNoticeForm;