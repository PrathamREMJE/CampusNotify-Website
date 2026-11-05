import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LibraryNoticeForm = () => {
  const navigate = useNavigate();

  // Form fields
  const [title, setTitle] = useState('Library Notice');
  const [content, setContent] = useState('');
  const [targetGroups, setTargetGroups] = useState([]);
  const [targetDepartments, setTargetDepartments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [instructions, setInstructions] = useState(['']);
  const [endingContent, setEndingContent] = useState('');
  const [applyFooter, setApplyFooter] = useState(false);

  // Signatures
  const [signatures, setSignatures] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Predefined roles
  const signatureRoles = [
    { id: "librarian", name: "Librarian" },
    { id: "principal", name: "Principal" },
    { id: "vice_principal", name: "Vice Principal" },
    { id: "office_superintendent", name: "Office Superintendent" },
    { id: "senior_clerk", name: "Senior Clerk" },
    { id: "hod", name: "Head of Department" },
    { id: "teacher", name: "Teacher" }
  ];

  const draftKey = 'library_notice_draft';

  // Save draft to localStorage
  const saveDraft = () => {
    const draft = {
      title,
      content,
      targetGroups,
      targetDepartments,
      fromDate,
      toDate,
      instructions,
      endingContent,
      signatures,
      applyFooter
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  };

  // Load draft from localStorage
  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      setTitle(d.title || 'Library Notice');
      setContent(d.content || '');
      setTargetGroups(Array.isArray(d.targetGroups) ? d.targetGroups : []);
      setTargetDepartments(Array.isArray(d.targetDepartments) ? d.targetDepartments : []);
      setFromDate(d.fromDate || '');
      setToDate(d.toDate || '');
      setInstructions(Array.isArray(d.instructions) ? d.instructions : ['']);
      setEndingContent(d.endingContent || '');
      setSignatures(Array.isArray(d.signatures) ? d.signatures : [
        { role: 'Librarian', name: '' },
        { role: 'Principal', name: '' }
      ]);
      if (typeof d.applyFooter === 'boolean') setApplyFooter(d.applyFooter);
    } catch {}
  };

  // Clear draft
  const clearDraft = () => localStorage.removeItem(draftKey);

  useEffect(() => {
    loadDraft();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    // Staff list
    fetch("http://127.0.0.1:8000/api/staff/list/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((res) => res.json())
      .then((data) => setStaffList(Array.isArray(data) ? data : []))
      .catch(() => setStaffList([]));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/departments/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(saveDraft, 800);
    return () => clearTimeout(t);
  }, [title, content, targetGroups, targetDepartments, fromDate, toDate, instructions, endingContent, signatures, applyFooter]);

  // Handlers for instructions bullets
  const handleInstructionChange = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addInstructionBullet = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstructionBullet = (index) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  // Signature handlers
  const handleSignatureChange = (index, field, value) => {
    const updated = [...signatures];
    updated[index][field] = value;
    if (field === "person_name" && value) {
      updated[index]["person"] = ""; // prioritize custom name
    }
    setSignatures(updated);
  };
  const handleAddSignature = () => {
    setSignatures([...signatures, { role: "", custom_role: "", person: "", person_name: "" }]);
  };
  const removeSignature = (index) => {
    setSignatures(signatures.filter((_, i) => i !== index));
  };

  // Form validation
  const isFormValid = targetGroups.length > 0 && targetDepartments.length > 0 && fromDate && toDate;

  // Handle preview navigation
  const handlePreview = () => {
    const cleanInstructions = instructions.filter(i => i.trim());
    const formData = {
      title,
      content,
      targetGroups,
      targetDepartments,
      fromDate,
      toDate,
      instructions: cleanInstructions,
      endingContent,
      signatures,
      apply_footer: applyFooter
    };
    navigate('/notices/preview', { state: { noticeType: 'library', data: formData, draftKey } });
  };

  return (
    <div className="space-y-6 text-black">
      <div>
        <label className="block font-semibold mb-1">Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border rounded-lg" />
      </div>

      <div className="space-y-3">
        <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
          Target Year Groups
          <span className="text-red-500 ml-2 text-base">*</span>
        </label>
        <div className="flex gap-4 flex-wrap">
          {['FY', 'SY', 'TY'].map((year) => (
            <label key={year} className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-pink-200 bg-pink-50 text-pink-800 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={targetGroups.includes(year)}
                onChange={e => {
                  if (e.target.checked) setTargetGroups([...targetGroups, year]);
                  else setTargetGroups(targetGroups.filter(y => y !== year));
                }}
                className="accent-pink-600"
              />
              {year}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">From Date</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full p-3 border rounded-lg" />
        </div>
        <div>
          <label className="block font-semibold mb-1">To Date</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full p-3 border rounded-lg" />
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1">Content</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full p-3 border rounded-lg" placeholder="Enter the main content of the notice" />
      </div>  
          

      <div>
        <label className="block font-semibold mb-1">Instructions (Bullets)</label>
        {instructions.map((item, index) => (
          <div key={index} className="flex items-center mb-2 gap-2">
            <input
              type="text"
              value={item}
              onChange={e => handleInstructionChange(index, e.target.value)}
              className="flex-grow p-2 border rounded-lg"
              placeholder="Enter bullet point"
            />
            <button type="button" onClick={() => removeInstructionBullet(index)} className="px-2 py-1 bg-red-100 text-red-700 rounded">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addInstructionBullet} className="px-3 py-1 bg-green-600 text-white rounded">+ Add Bullet</button>
      </div>

      <div>
        <label className="block font-semibold mb-1">Ending Content</label>
        <textarea value={endingContent} onChange={e => setEndingContent(e.target.value)} rows={3} className="w-full p-3 border rounded-lg" placeholder="e.g. For more information, contact the library" />
      </div>

      {/* Signatures */}
      <div>
        <h3 className="text-lg font-medium mb-2">Signatures</h3>
        {signatures.map((sig, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-2 mb-2 p-2 border rounded text-black">
            <select
              value={sig.role}
              onChange={(e) => handleSignatureChange(index, "role", e.target.value)}
              className="flex-1 border px-2 py-1 rounded"
            >
              <option value="">Select Role</option>
              {signatureRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Custom Role Label (optional)"
              value={sig.custom_role || ""}
              onChange={(e) => handleSignatureChange(index, "custom_role", e.target.value)}
              className="flex-1 border px-2 py-1 rounded"
            />
            <select
              value={sig.person || ""}
              onChange={(e) => handleSignatureChange(index, "person", e.target.value)}
              className="flex-1 border px-2 py-1 rounded"
              disabled={!sig.role}
            >
              <option value="">{!sig.role ? "Select a role first..." : "Select Person"}</option>
              {staffList
                .filter((p) => p.role === sig.role)
                .map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.first_name && person.last_name
                      ? `${person.first_name} ${person.last_name}`
                      : person.username || person.id}
                  </option>
                ))}
            </select>
            <input
              type="text"
              placeholder="Or type custom person name"
              value={sig.person_name || ""}
              onChange={(e) => handleSignatureChange(index, "person_name", e.target.value)}
              className="flex-1 border px-2 py-1 rounded"
            />
            <button
              type="button"
              onClick={() => removeSignature(index)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddSignature} className="bg-green-600 text-white px-3 py-1 rounded mb-4">
          + Add Signature
        </button>
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

      <div className="flex justify-between items-center">
        {localStorage.getItem(draftKey) && (
          <button type="button" onClick={() => { if (confirm('Clear saved draft?')) { clearDraft(); window.location.reload(); } }} className="px-4 py-2 bg-red-50 text-red-700 rounded-lg">Clear Draft</button>
        )}
        <button type="button" disabled={!isFormValid} onClick={handlePreview} className={`px-6 py-3 rounded-lg text-white font-semibold ${isFormValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}>
          Preview
        </button>
      </div>
    </div>
  );
};

export default LibraryNoticeForm;
