import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const IndustrialVisitNoticeForm = () => {
  const navigate = useNavigate();

  // Common
  const [mode, setMode] = useState('predefined');
  // Remove language state and control from this form as per request to hide language field for industrial_visit
  // const [language, setLanguage] = useState('english');
  const [endingMessage, setEndingMessage] = useState('');

  // Predefined specific
  const [visitTitle, setVisitTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [visitDate, setVisitDate] = useState('');

  const [consentDeadlineDate, setConsentDeadlineDate] = useState('');
  const [consentDeadlineTime, setConsentDeadlineTime] = useState('');
  const [consentSubmissionPlace, setConsentSubmissionPlace] = useState('');

  const [briefingDate, setBriefingDate] = useState('');
  const [briefingTime, setBriefingTime] = useState('');
  const [briefingVenue, setBriefingVenue] = useState('');

  const [targetGroups, setTargetGroups] = useState([]); // array of strings e.g. ['FY', 'SY', 'TY']
  const [targetDepartments, setTargetDepartments] = useState([]); // array of strings e.g. ['Commerce', 'Science']
  const [departments, setDepartments] = useState([]);

  // Custom specific
  const [customContent, setCustomContent] = useState('');

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

  // Draft helpers
  const draftKey = 'industrial_visit_notice_draft';

  const saveDraft = () => {
    const draft = {
      mode, endingMessage,
      visitTitle, destination, visitDate,
      consentDeadlineDate, consentDeadlineTime, consentSubmissionPlace,
      briefingDate, briefingTime, briefingVenue,
      targetGroups, targetDepartments, customContent,
      applyFooter,
      signatures
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  };

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      setMode(d.mode || 'predefined');
      setEndingMessage(d.endingMessage || '');
      setVisitTitle(d.visitTitle || '');
      setDestination(d.destination || '');
      setVisitDate(d.visitDate || '');
      setConsentDeadlineDate(d.consentDeadlineDate || '');
      setConsentDeadlineTime(d.consentDeadlineTime || '');
      setConsentSubmissionPlace(d.consentSubmissionPlace || '');
      setBriefingDate(d.briefingDate || '');
      setBriefingTime(d.briefingTime || '');
      setBriefingVenue(d.briefingVenue || '');
      setTargetGroups(Array.isArray(d.targetGroups) ? d.targetGroups : []);
      setTargetDepartments(Array.isArray(d.targetDepartments) ? d.targetDepartments : []);
      setCustomContent(d.customContent || '');
      setSignatures(Array.isArray(d.signatures) ? d.signatures : []);
    } catch {}
  };

  const clearDraft = () => localStorage.removeItem(draftKey);

  useEffect(() => { loadDraft(); }, []);

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

    // Departments
    fetch("http://127.0.0.1:8000/api/departments/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(saveDraft, 800);
    return () => clearTimeout(t);
  }, [mode, endingMessage, visitTitle, destination, visitDate, consentDeadlineDate, consentDeadlineTime, consentSubmissionPlace, briefingDate, briefingTime, briefingVenue, targetGroups, targetDepartments, customContent, signatures]);

  const currentDate = new Date().toISOString().split('T')[0];

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

  const handlePreview = () => {
    const cleanSignatures = signatures.filter(s => (s.role || s.person_name || s.custom_role || s.person).trim()).map(s => ({ role: s.role, custom_role: s.custom_role, person: s.person, person_name: s.person_name }));

    let formData;
    if (mode === 'custom') {
      formData = {
        notice_type: 'industrial_visit',
        mode: 'custom',
        custom_content: customContent,
        destination,
        visit_date: visitDate,
        briefing_date: briefingDate,
        briefing_time: briefingTime,
        briefing_venue: briefingVenue,
        ending_message: endingMessage,
        apply_footer: applyFooter,
        signatures: cleanSignatures
      };
    } else {
      formData = {
        notice_type: 'industrial_visit',
        mode: 'predefined',
        visit_title: visitTitle,
        destination,
        visit_date: visitDate,
        consent_deadline_date: consentDeadlineDate,
        consent_deadline_time: consentDeadlineTime,
        consent_submission_place: consentSubmissionPlace,
        briefing_date: briefingDate,
        briefing_time: briefingTime,
        briefing_venue: briefingVenue,
        target_groups: targetGroups,
        target_departments: targetDepartments,
        apply_footer: applyFooter,
        signatures: cleanSignatures
      };
    }

    navigate('/notices/preview', { state: { noticeType: 'industrial_visit', data: formData, draftKey } });
  };



  const isFormValid = mode === 'custom'
    ? customContent.trim().length > 0
    : destination.trim() && visitDate;

  return (
<div className="space-y-8 text-black">
      {/* Mode Toggle */}
      <div className="flex gap-4">
        <button type="button" className={`px-4 py-2 rounded-xl font-semibold border-2 transition-all duration-200 ${mode==='predefined' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`} onClick={()=>setMode('predefined')}>Predefined</button>
        <button type="button" className={`px-4 py-2 rounded-xl font-semibold border-2 transition-all duration-200 ${mode==='custom' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'}`} onClick={()=>setMode('custom')}>Custom</button>
      </div>

      {/* Predefined fields */}
      {mode === 'predefined' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-1">Visit Title</label>
            <input type="text" value={visitTitle} onChange={e=>setVisitTitle(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Industry Visit to ..." />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Destination<span className="text-red-500">*</span></label>
            <input type="text" value={destination} onChange={e=>setDestination(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Baramati Agro Tourism" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Visit Date<span className="text-red-500">*</span></label>
            <input type="date" min={currentDate} value={visitDate} onChange={e=>setVisitDate(e.target.value)} className="w-full p-3 border rounded-lg" required />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Consent Deadline Date</label>
              <input type="date" value={consentDeadlineDate} onChange={e=>setConsentDeadlineDate(e.target.value)} className="w-full p-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Consent Deadline Time</label>
              <input type="text" value={consentDeadlineTime} onChange={e=>setConsentDeadlineTime(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="e.g. 3:00 pm" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Consent Submission Place</label>
              <input type="text" value={consentSubmissionPlace} onChange={e=>setConsentSubmissionPlace(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Respective classrooms" />
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Briefing Date</label>
              <input type="date" value={briefingDate} onChange={e=>setBriefingDate(e.target.value)} className="w-full p-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Briefing Time</label>
              <input type="text" value={briefingTime} onChange={e=>setBriefingTime(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="e.g. 11:00 am" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Briefing Venue</label>
              <input type="text" value={briefingVenue} onChange={e=>setBriefingVenue(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Classroom 102" />
            </div>
          </div>

          {/* Target Groups */}
          <div className="md:col-span-2">
            <label className="flex items-center text-sm font-semibold mb-2">
              <div className="w-6 h-6 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              Target Year Groups
              <div className="ml-auto bg-gray-100 px-2 py-1 rounded-full">
                <span className="text-xs font-semibold text-gray-600">OPTIONAL</span>
              </div>
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

          {/* Target Departments */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Target Departments</label>
            <select
              multiple
              value={targetDepartments}
              onChange={e => {
                const options = e.target.options;
                const selected = [];
                for (let i = 0; i < options.length; i++) {
                  if (options[i].selected) {
                    selected.push(options[i].value);
                  }
                }
                setTargetDepartments(selected);
              }}
              className="w-full p-3 border rounded-lg"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>


        </div>
      ) : (
        // Custom fields
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Custom Content<span className="text-red-500">*</span></label>
            <textarea value={customContent} onChange={e=>setCustomContent(e.target.value)} rows={8} className="w-full p-3 border rounded-lg" placeholder="Write your custom content here..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Destination</label>
              <input type="text" value={destination} onChange={e=>setDestination(e.target.value)} className="w-full p-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Visit Date</label>
              <input type="date" min={currentDate} value={visitDate} onChange={e=>setVisitDate(e.target.value)} className="w-full p-3 border rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Briefing Date</label>
              <input type="date" value={briefingDate} onChange={e=>setBriefingDate(e.target.value)} className="w-full p-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Briefing Time</label>
              <input type="text" value={briefingTime} onChange={e=>setBriefingTime(e.target.value)} className="w-full p-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Briefing Venue</label>
              <input type="text" value={briefingVenue} onChange={e=>setBriefingVenue(e.target.value)} className="w-full p-3 border rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Ending message */}
      {mode === 'custom' && (
        <div>
          <label className="block text-sm font-semibold mb-1">Ending Message</label>
          <textarea value={endingMessage} onChange={e=>setEndingMessage(e.target.value)} rows={3} className="w-full p-3 border rounded-lg" placeholder="Optional closing line" />
        </div>
      )}

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

      {/* Actions */}
      <div className="flex items-center justify-between">
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

export default IndustrialVisitNoticeForm;
