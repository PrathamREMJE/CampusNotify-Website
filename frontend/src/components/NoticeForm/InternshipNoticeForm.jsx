import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InternshipNoticeForm = () => {
  const navigate = useNavigate();

  // Form fields
  const [title, setTitle] = useState('Notice');
  const [introduction, setIntroduction] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [internshipProfile, setInternshipProfile] = useState(['']);
  const [internshipDuration, setInternshipDuration] = useState('');
  const [stipend, setStipend] = useState('');
  const [location, setLocation] = useState('');
  const [endingContent, setEndingContent] = useState('');

  // Footer option
  const [applyFooter, setApplyFooter] = useState(false);

  // Signatures
  const [signatures, setSignatures] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Predefined roles
  const signatureRoles = [
    { id: "principal", name: "Principal" },
    { id: "vice_principal", name: "Vice Principal" },
    { id: "office_superintendent", name: "Office Superintendent" },
    { id: "senior_clerk", name: "Senior Clerk" },
    { id: "hod", name: "Head of Department" },
    { id: "teacher", name: "Teacher" }
  ];

  const draftKey = 'internship_notice_draft';

  // Save draft to localStorage
  const saveDraft = () => {
    const draft = {
      title,
      introduction,
      organizationName,
      internshipProfile,
      internshipDuration,
      stipend,
      location,
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
      setTitle(d.title || 'Notice');
      setIntroduction(d.introduction || '');
      setOrganizationName(d.organizationName || '');
      setInternshipProfile(Array.isArray(d.internshipProfile) ? d.internshipProfile : ['']);
      setInternshipDuration(d.internshipDuration || '');
      setStipend(d.stipend || '');
      setLocation(d.location || '');
      setEndingContent(d.endingContent || '');
      setSignatures(Array.isArray(d.signatures) ? d.signatures : [
        { role: 'Placement Cell - Head', name: '' },
        { role: 'Principal', name: '' }
      ]);
      setApplyFooter(d.applyFooter || false);
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
    const t = setTimeout(saveDraft, 800);
    return () => clearTimeout(t);
  }, [title, introduction, organizationName, internshipProfile, internshipDuration, stipend, location, endingContent, signatures, applyFooter]);

  // Handlers for internship profile bullets
  const handleProfileChange = (index, value) => {
    const updated = [...internshipProfile];
    updated[index] = value;
    setInternshipProfile(updated);
  };

  const addProfileBullet = () => {
    setInternshipProfile([...internshipProfile, '']);
  };

  const removeProfileBullet = (index) => {
    setInternshipProfile(internshipProfile.filter((_, i) => i !== index));
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
  const isFormValid = organizationName.trim() && internshipProfile.some(p => p.trim()) && internshipDuration.trim() && stipend.trim() && location.trim();

  // Handle preview navigation
  const handlePreview = () => {
    const cleanProfile = internshipProfile.filter(p => p.trim());
    const formData = {
      title,
      introduction,
      organizationName,
      internshipProfile: cleanProfile,
      internshipDuration,
      stipend,
      location,
      endingContent,
      signatures,
      applyFooter
    };
    navigate('/notices/preview', { state: { noticeType: 'internship', data: formData, draftKey } });
  };

  return (
    <div className="space-y-6 text-black">
      <div>
        <label className="block font-semibold mb-1">Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border rounded-lg" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Introduction Content</label>
        <textarea value={introduction} onChange={e => setIntroduction(e.target.value)} rows={3} className="w-full p-3 border rounded-lg" placeholder="Enter introduction content..." />
      </div>

      <div>
        <label className="block font-semibold mb-1">Name of the Organization</label>
        <input type="text" value={organizationName} onChange={e => setOrganizationName(e.target.value)} className="w-full p-3 border rounded-lg" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Internship Profile (Bullets)</label>
        {internshipProfile.map((item, index) => (
          <div key={index} className="flex items-center mb-2 gap-2">
            <input
              type="text"
              value={item}
              onChange={e => handleProfileChange(index, e.target.value)}
              className="flex-grow p-2 border rounded-lg"
              placeholder="Enter bullet point"
            />
            <button type="button" onClick={() => removeProfileBullet(index)} className="px-2 py-1 bg-red-100 text-red-700 rounded">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addProfileBullet} className="px-3 py-1 bg-green-600 text-white rounded">+ Add Bullet</button>
      </div>

      <div>
        <label className="block font-semibold mb-1">Internship Duration</label>
        <input type="text" value={internshipDuration} onChange={e => setInternshipDuration(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="e.g. Approximately two months (Can be extended, based on performance)" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Stipend</label>
        <input type="text" value={stipend} onChange={e => setStipend(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="e.g. Rupees 5,500/- per month" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Location</label>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="e.g. MCCIA offices (S.B. Road / Tilak Road)" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Ending Content</label>
        <textarea value={endingContent} onChange={e => setEndingContent(e.target.value)} rows={3} className="w-full p-3 border rounded-lg" placeholder="Enter ending content, e.g. contact email and deadline" />
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
          <div className="ml-auto bg-gray-100 px-2 py-1 rounded-full">
            <span className="text-xs font-semibold text-gray-600">OPTIONAL</span>
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

export default InternshipNoticeForm;
