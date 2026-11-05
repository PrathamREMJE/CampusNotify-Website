import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LectureCancellationAndAdjustmentNotice = () => {
  const [content, setContent] = useState(""); // Declare content state
  const [applyFooter, setApplyFooter] = useState(false); // Declare applyFooter state
  const [signatures, setSignatures] = useState([]); // Declare signatures state
  const [departments, setDepartments] = useState([]); // Store department list
  const [targetDepartments, setTargetDepartments] = useState([]); // Track selected departments
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const navigate = useNavigate();

  // Draft
  const draftKey = 'lecture_cancellation_notice_draft';
  const saveDraft = () => {
    const draft = { content, applyFooter, signatures, targetDepartments };
    try { localStorage.setItem(draftKey, JSON.stringify(draft)); } catch {}
  };
  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (typeof d.content === 'string') setContent(d.content);
      setApplyFooter(d.applyFooter || false);
      if (Array.isArray(d.signatures)) setSignatures(d.signatures);
      if (Array.isArray(d.targetDepartments)) setTargetDepartments(d.targetDepartments);
    } catch {}
  };
  useEffect(() => { loadDraft(); }, []);
  useEffect(() => {
    const t = setTimeout(saveDraft, 800);
    return () => clearTimeout(t);
  }, [content, applyFooter, signatures, targetDepartments]);

  const signatureRoles = [
    { id: 'principal', name: 'Principal' },
    { id: 'vice_principal', name: 'Vice Principal' },
    { id: 'office_superintendent', name: 'Office Superintendent' },
    { id: 'senior_clerk', name: 'Senior Clerk' },
    { id: 'hod', name: 'Head of Department' },
    { id: 'teacher', name: 'Teacher' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    // Fetch staff list
    fetch('http://127.0.0.1:8000/api/staff/list/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setStaffList(Array.isArray(data) ? data : []))
      .catch(() => setStaffList([]));
      
    // Fetch departments
    fetch('http://127.0.0.1:8000/api/departments/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => setDepartments([]));
  }, []);

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
    if (field === "person_name" && value) {
      updated[index]["person"] = "";
    }
    setSignatures(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("access_token");

    const selectedDepartmentNames = departments
      .filter(dept => targetDepartments.map(String).includes(String(dept.id)))
      .map(dept => dept.name)
      .join(', ');


    // Instead of calling the API here, navigate directly to preview page with data
    navigate("/notices/preview", {
      state: { 
        data: {
          notice_type: "lecture_cancellation",
          title: "Lecture Cancellation Notice",
          target_audience: selectedDepartmentNames,
          content_data: {
            content,
            apply_footer: applyFooter,
            signatures,
            targetDepartments,
          }
        },
        noticeType: "lecture_cancellation",
        departments: departments.filter(dept => targetDepartments.includes(dept.id))
      }
    });
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6">
          <h2 className="text-2xl font-bold text-white mb-1">Lecture Cancellation Notice</h2>
          <p className="text-white/90 text-sm font-medium">Create professional lecture cancellation notices</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Content Field */}
          <div className="space-y-3">
          {/* Target Departments Field */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  Target Departments
                  <span className="text-gray-500 ml-2 text-base">(Optional)</span>
                </label>
                <select
                  multiple
                  value={targetDepartments.map(String)}
                  onChange={e => {
                    const options = Array.from(e.target.options);
                    setTargetDepartments(options.filter(o => o.selected).map(o => o.value));
                  }}
                  className="w-full px-4 py-3 border border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white hover:border-yellow-300 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                >
                  {departments.map(dep => (
                    <option key={dep.id || dep.name || dep} value={String(dep.id)}>{dep.name}</option>
                  ))}
                </select>
              </div>
            <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
              Content
              <span className="text-red-500 ml-2 text-base">*</span>
            </label>
            <textarea
              placeholder="Enter content for the notice here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-800 bg-white hover:border-blue-400 hover:shadow-md"
              rows="6"
              required
            />
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

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate Notice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LectureCancellationAndAdjustmentNotice;
