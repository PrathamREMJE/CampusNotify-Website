import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExamTableForm from "./ExamTableNotice";

const ExamNoticeForm = () => {
  const [examTitle, setExamTitle] = useState("");
  const [examMonth, setExamMonth] = useState("");
  const [courseDeptSemester, setCourseDeptSemester] = useState("");
  const [examCategory, setExamCategory] = useState("");
  const [introductionContent, setIntroductionContent] = useState("");
  const [instructions, setInstructions] = useState([""]);
  const [endingContent, setEndingContent] = useState("");
  const [signatures, setSignatures] = useState([]);
  const [applyFooter, setApplyFooter] = useState(false);

  const [rows, setRows] = useState([]);
  const [staffList, setStaffList] = useState([]);
  // Predefined signature roles (same as Guest Lecture)
  const signatureRoles = [
    { id: 'principal', name: 'Principal' },
    { id: 'vice_principal', name: 'Vice Principal' },
    { id: 'office_superintendent', name: 'Office Superintendent' },
    { id: 'senior_clerk', name: 'Senior Clerk' },
    { id: 'hod', name: 'Head of Department' },
    { id: 'teacher', name: 'Teacher' }
  ];
  const navigate = useNavigate(); 

  // Draft: autosave/load without UI changes
  const draftKey = 'exam_notice_draft';
  const saveDraft = () => {
    try {
      const draft = {
        examTitle,
        examMonth,
        courseDeptSemester,
        examCategory,
        introductionContent,
        instructions,
        endingContent,
        signatures,
        rows,
        applyFooter,
      };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch (_) {}
  };
  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const p = JSON.parse(raw);
      setExamTitle(p.examTitle || "");
      setExamMonth(p.examMonth || "");
      setCourseDeptSemester(p.courseDeptSemester || "");
      setExamCategory(p.examCategory || "");
      setIntroductionContent(p.introductionContent || "");
      setInstructions(Array.isArray(p.instructions) ? p.instructions : [""]);
      setEndingContent(p.endingContent || "");
      setSignatures(Array.isArray(p.signatures) ? p.signatures : []);
      setRows(Array.isArray(p.rows) ? p.rows : []);
      setApplyFooter(p.applyFooter || false);
    } catch (_) {}
  };
  useEffect(() => { loadDraft(); }, []);
  useEffect(() => {
    const id = setTimeout(saveDraft, 1000);
    return () => clearTimeout(id);
  }, [examTitle, examMonth, courseDeptSemester, examCategory, introductionContent, instructions, endingContent, signatures, rows, applyFooter]);

  // Fetch staff list once for populating signature person dropdown
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    fetch('http://127.0.0.1:8000/api/staff/list/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setStaffList(Array.isArray(data) ? data : []))
      .catch(() => setStaffList([]));
  }, []);

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index) => {
    const newInstructions = instructions.filter((_, i) => i !== index);
    setInstructions(newInstructions);
  };

  const updateInstruction = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleAddSignature = () => {
    setSignatures([...signatures, { role: "", custom_role: "", person: "", person_name: "" }]);
  };
  const removeSignature = (index) => {
    const updated = signatures.filter((_, i) => i !== index);
    setSignatures(updated);
  };

  const handleSignatureChange = (index, field, value) => {
    const updated = [...signatures];
    updated[index][field] = value;
    // If user types a custom person name, clear person id to avoid conflicts
    if (field === "person_name" && value) {
      updated[index]["person"] = "";
    }
    setSignatures(updated);
  };



  const handleSubmit = () => {
    if (!examTitle || !examMonth || !courseDeptSemester || rows.length === 0) {
      alert("Please fill in all required fields and ensure the exam table is not empty.");
      return;
    }

    const payload = {
      notice_type: "exam",
      exam_table: rows,
      content_data: {
        exam_title: examTitle,
        exam_month: examMonth,
        course_dept_semester: courseDeptSemester,
        exam_category: examCategory,
        introduction_content: introductionContent,
        instructions: instructions.filter(instruction => instruction.trim() !== ""),
        ending_content: endingContent,
        signatures: signatures,
        apply_footer: applyFooter,
      }
    };

    console.log("Final Exam Notice JSON:", payload);
    navigate("/notices/preview", {
      state: { data: payload, noticeType: "exam" }
    });
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-7xl mx-auto">
        {/* Professional Header with Gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Exam Notice Generator</h2>
                <p className="text-white/90 text-sm font-medium">Create professional exam notices with schedule tables</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-xs font-semibold">OFFICIAL</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-xs font-semibold">SECURE</span>
              </div>
            </div>
          </div>
        </div>

        <form className="p-8 space-y-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <span className="text-sm font-semibold text-gray-700">Exam Details</span>
            </div>
            <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full">
              <div className="h-1 bg-indigo-600 rounded-full" style={{ width: '50%' }}></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-bold">2</span>
              </div>
              <span className="text-sm text-gray-500">Preview & Generate</span>
            </div>
          </div>

          {/* Exam Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Exam Title */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z" />
                  </svg>
                </div>
                Exam Title
                <span className="text-red-500 ml-2 text-base">*</span>
                <div className="ml-auto bg-purple-50 px-2 py-1 rounded-full">
                  <span className="text-xs font-semibold text-purple-700">REQUIRED</span>
                </div>
              </label>
              <input
                type="text"
                placeholder="e.g., End Semester Examination"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-800 bg-white hover:border-purple-400 hover:shadow-md"
                required
              />
            </div>

            {/* Exam Month */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
                <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Exam Month
                <span className="text-red-500 ml-2 text-base">*</span>
                <div className="ml-auto bg-indigo-50 px-2 py-1 rounded-full">
                  <span className="text-xs font-semibold text-indigo-700">REQUIRED</span>
                </div>
              </label>
              <input
                type="text"
                placeholder="e.g., December 2024"
                value={examMonth}
                onChange={(e) => setExamMonth(e.target.value)}
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-gray-800 bg-white hover:border-indigo-400 hover:shadow-md"
                required
              />
            </div>

            {/* Course/Dept Semester */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z" />
                  </svg>
                </div>
                Course/Dept Semester
                <span className="text-red-500 ml-2 text-base">*</span>
                <div className="ml-auto bg-green-50 px-2 py-1 rounded-full">
                  <span className="text-xs font-semibold text-green-700">REQUIRED</span>
                </div>
              </label>
              <input
                type="text"
                placeholder="e.g., FY Sem 1, SY BBA, TY B.Com"
                value={courseDeptSemester}
                onChange={(e) => setCourseDeptSemester(e.target.value)}
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-gray-800 bg-white hover:border-green-400 hover:shadow-md"
                required
              />
            </div>
          </div>

          {/* Regular/Backlog/Regular + Backlog */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
              <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z" />
                </svg>
              </div>
              Regular/Backlog/Regular + Backlog
              <span className="text-gray-500 ml-2 text-base">(Optional)</span>
            </label>
            <select
              value={examCategory}
              onChange={(e) => setExamCategory(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 text-gray-800 bg-white hover:border-yellow-400 hover:shadow-md"
            >
              <option value="">Select</option>
              <option value="Regular">Regular</option>
              <option value="Backlog">Backlog</option>
              <option value="Regular + Backlog">Regular + Backlog</option>
              <option value="Special">Special</option>
            </select>
          </div>

          {/* Introduction Content */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z" />
                </svg>
              </div>
              Introduction Content
            </label>
            <textarea
              placeholder="Enter introduction content here..."
              value={introductionContent}
              onChange={(e) => setIntroductionContent(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-800 bg-white hover:border-blue-400 hover:shadow-md"
              rows="4"
            />
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
              <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Instructions (Optional)
            </label>
            <div className="space-y-2">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{index + 1}.</span>
                  <input
                    type="text"
                    placeholder={`Instruction ${index + 1}`}
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300"
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addInstruction}
                className="mt-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
              >
                + Add Instruction
              </button>
            </div>
          </div>

          {/* Ending Content */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z" />
                </svg>
              </div>
              Ending Content (Optional)
            </label>
            <textarea
              placeholder="Enter ending content here..."
              value={endingContent}
              onChange={(e) => setEndingContent(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-800 bg-white hover:border-purple-400 hover:shadow-md"
              rows="3"
            />
          </div>

          {/* Exam Schedule Table */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-800">
              <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
                </svg>
              </div>
              Exam Schedule Table
              <span className="text-red-500 ml-2 text-base">*</span>
            </label>
            <ExamTableForm onChange={setRows} />
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
            onChange={(e) => handleSignatureChange(index, "role", e.target.value)}
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
            onChange={(e) => handleSignatureChange(index, "custom_role", e.target.value)}
            className="flex-1 border px-2 py-1 rounded"
          />

          {/* Staff person selection filtered by role */}
          <select
            value={sig.person || ""}
            onChange={(e) => handleSignatureChange(index, "person", e.target.value)}
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
            onChange={(e) => handleSignatureChange(index, "person_name", e.target.value)}
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
        onClick={handleAddSignature}
        className="bg-green-600 text-white px-3 py-1 rounded mb-4"
      >
        + Add Signature
      </button>

          {/* Submit */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Save Exam Notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamNoticeForm;