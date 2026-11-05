import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SeminarWorkshopTable from "./SeminarWorkshopTable";

const SeminarWorkshopWebinarNoticeForm = ({ initialData }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [endingContent, setEndingContent] = useState(initialData?.ending_content || "");
  const [signatures, setSignatures] = useState(initialData?.signatures || []);

  // Footer option
  const [applyFooter, setApplyFooter] = useState(initialData?.apply_footer || false);

  const [rows, setRows] = useState(initialData?.seminar_workshop_table || []);
  const [staffList, setStaffList] = useState([]);

  // Draft
  const draftKey = 'seminar_workshop_webinar_draft';
  const saveDraft = () => {
    const draft = { title, content, endingContent, signatures, rows, applyFooter };
    try { localStorage.setItem(draftKey, JSON.stringify(draft)); } catch {}
  };
  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (typeof d.title === 'string') setTitle(d.title);
      if (typeof d.content === 'string') setContent(d.content);
      if (typeof d.endingContent === 'string') setEndingContent(d.endingContent);
      if (Array.isArray(d.signatures)) setSignatures(d.signatures);
      if (Array.isArray(d.rows)) setRows(d.rows);
      if (typeof d.applyFooter === 'boolean') setApplyFooter(d.applyFooter);
    } catch {}
  };
  useEffect(() => { if (!initialData) loadDraft(); }, []);
  useEffect(() => {
    const t = setTimeout(saveDraft, 800);
    return () => clearTimeout(t);
  }, [title, content, endingContent, signatures, rows, applyFooter]);

  // Predefined signature roles
  const signatureRoles = [
    { id: "principal", name: "Principal" },
    { id: "vice_principal", name: "Vice Principal" },
    { id: "office_superintendent", name: "Office Superintendent" },
    { id: "senior_clerk", name: "Senior Clerk" },
    { id: "hod", name: "Head of Department" },
    { id: "teacher", name: "Teacher" },
  ];

  const navigate = useNavigate();

  // Fetch staff list
  const token = localStorage.getItem("access_token");
  useEffect(() => {
    if (!token) return;

    fetch('http://127.0.0.1:8000/api/staff/list/', {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => setStaffList(Array.isArray(data) ? data : []))
      .catch(() => setStaffList([]));
  }, [token]);

  const handleAddSignature = () => {
    setSignatures([
      ...signatures,
      { role: "", custom_role: "", person: "", person_name: "" },
    ]);
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

  const handleSubmit = () => {
    if (!title || !content || rows.length <= 1) {
      alert("Please fill in all required fields and ensure the table is not empty.");
      return;
    }

    // Transform rows into structured objects
    const headers = rows[0];
    const structuredRows = rows.slice(1).map(row =>
      headers.reduce((acc, header, idx) => {
        acc[header.toLowerCase()] = row[idx];
        return acc;
      }, {})
    );

    const payload = {
      notice_type: "seminar_workshop_webinar",
      content_data: {
        title: title,
        content: content,
        ending_content: endingContent,
        signatures: signatures,
        seminar_workshop_table: structuredRows,
        apply_footer: applyFooter
      },
      // Also include the raw 2D array for the preview component
      seminar_workshop_table: rows
    };

    console.log("Final Seminar/Workshop/Webinar Notice JSON:", payload);
    navigate("/notices/preview", { state: { data: payload, noticeType: "seminar_workshop_webinar" } });
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Seminar / Workshop / Webinar Notice Generator
                </h2>
                <p className="text-white/90 text-sm font-medium">
                  Create professional notices for seminars, workshops, and webinars
                </p>
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
          {/* Title */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
              Title<span className="text-red-500 ml-2">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Seminar on Artificial Intelligence"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
              Content<span className="text-red-500 ml-2">*</span>
            </label>
            <textarea
              placeholder="Enter the main content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-black"
              rows="6"
              required
            />
          </div>

          {/* Table */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800">
              Seminar / Workshop / Webinar Table<span className="text-red-500 ml-2">*</span>
            </label>
            <SeminarWorkshopTable
              onChange={setRows}
              initialData={initialData?.seminar_workshop_table}
            />
          </div>

          {/* Ending Content */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800 mb-1">
              Ending Content (Optional)
            </label>
            <textarea
              placeholder="Enter ending content here..."
              value={endingContent}
              onChange={(e) => setEndingContent(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-black"
              rows="3"
            />
          </div>

          {/* Signatures */}
          <h3 className="text-lg font-medium mb-2 text-black">Signatures</h3>
          {signatures.map((sig, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-2 mb-2 p-2 border rounded"
            >
              <select
                value={sig.role}
                onChange={(e) =>
                  handleSignatureChange(index, "role", e.target.value)
                }
                className="flex-1 border px-2 py-1 rounded text-black"
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
                onChange={(e) =>
                  handleSignatureChange(index, "custom_role", e.target.value)
                }
                className="flex-1 border px-2 py-1 rounded text-black"
              />

              <select
                value={sig.person || ""}
                onChange={(e) =>
                  handleSignatureChange(index, "person", e.target.value)
                }
                className="flex-1 border px-2 py-1 rounded text-black"
                disabled={!sig.role}
              >
                <option value="">
                  {!sig.role ? "Select a role first..." : "Select Person"}
                </option>
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
                onChange={(e) =>
                  handleSignatureChange(index, "person_name", e.target.value)
                }
                className="flex-1 border px-2 py-1 rounded"
              />

              <button
                type="button"
                onClick={() => removeSignature(index)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded"
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

          {/* Submit */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              Save Seminar / Workshop / Webinar Notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeminarWorkshopWebinarNoticeForm;
