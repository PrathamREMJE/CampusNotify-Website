import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResultMarksheetDistributionTableNotice from "./ResultMarksheetDistributionTableNotice";

const ResultMarksheetDistributionForm = () => {
  const navigate = useNavigate();

  // Core fields
  const [resultTitle, setResultTitle] = useState("");

  // Content sections
  const [introductionContent, setIntroductionContent] = useState("");
  const [instructions, setInstructions] = useState([""]);
  const [endingContent, setEndingContent] = useState("");

  // Signatures
  const [signatures, setSignatures] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Footer option
  const [applyFooter, setApplyFooter] = useState(false);

  // Table
  const [rows, setRows] = useState([]);

  // Draft
  const draftKey = 'result_marksheet_distribution_draft';
  const saveDraft = () => {
    const draft = {
      resultTitle,
      introductionContent,
      instructions,
      endingContent,
      signatures,
      rows,
      applyFooter,
    };
    try { localStorage.setItem(draftKey, JSON.stringify(draft)); } catch {}
  };
  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (typeof d.resultTitle === 'string') setResultTitle(d.resultTitle);
      if (typeof d.introductionContent === 'string') setIntroductionContent(d.introductionContent);
      if (Array.isArray(d.instructions)) setInstructions(d.instructions.length ? d.instructions : ['']);
      if (typeof d.endingContent === 'string') setEndingContent(d.endingContent);
      if (Array.isArray(d.signatures)) setSignatures(d.signatures);
      if (Array.isArray(d.rows)) setRows(d.rows);
      if (typeof d.applyFooter === 'boolean') setApplyFooter(d.applyFooter);
    } catch {}
  };
  useEffect(() => { loadDraft(); }, []);
  useEffect(() => {
    const t = setTimeout(saveDraft, 800);
    return () => clearTimeout(t);
  }, [resultTitle, introductionContent, instructions, endingContent, signatures, rows]);

  const token = localStorage.getItem("access_token");

  // Predefined signature roles
  const signatureRoles = [
    { id: "principal", name: "Principal" },
    { id: "vice_principal", name: "Vice Principal" },
    { id: "office_superintendent", name: "Office Superintendent" },
    { id: "senior_clerk", name: "Senior Clerk" },
    { id: "hod", name: "Head of Department" },
    { id: "teacher", name: "Teacher" },
  ];

  useEffect(() => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      // Fetch staff list
      fetch("http://127.0.0.1:8000/api/staff/list/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => setStaffList(Array.isArray(data) ? data : []))
        .catch(() => setStaffList([]));

      // Fetch departments
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

  // Instructions handlers
  const addInstruction = () => setInstructions([...instructions, ""]);
  const removeInstruction = (i) => setInstructions(instructions.filter((_, idx) => idx !== i));
  const updateInstruction = (i, value) => {
    const next = [...instructions];
    next[i] = value;
    setInstructions(next);
  };

  // Signatures handlers
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
    if (!resultTitle) {
      alert("Please enter result/marksheet title.");
      return;
    }

    const payload = {
      notice_type: "result_marksheet_distribution",
      title: "Result / Marksheet Distribution",
      content_data: {
        result_title: resultTitle,
        introduction_content: introductionContent,
        instructions: instructions.filter((i) => i.trim() !== ""),
        ending_content: endingContent,
        signatures,
        distribution_table: rows,
        apply_footer: applyFooter,
      },
      distribution_table: rows, // keep raw 2D rows for preview compatibility
    };

    navigate("/notices/preview", { state: { data: payload, noticeType: "result_marksheet_distribution" } });
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-2xl">📜</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Result/Marksheet Distribution Notice</h2>
                <p className="text-white/90 text-sm font-medium">Create a result or marksheet distribution notice</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 space-y-8">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">Title<span className="text-red-500 ml-1">*</span></label>
              <input type="text" value={resultTitle} onChange={(e) => setResultTitle(e.target.value)} placeholder="e.g., FY BCom (Sem II) Marksheet Distribution (NEP II) March 2025" className="w-full p-3 border-2 border-gray-300 rounded-xl" />
            </div>
          </div>



          {/* Intro */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-800">Introduction</label>
            <textarea value={introductionContent} onChange={(e) => setIntroductionContent(e.target.value)} rows="3" className="w-full p-3 border-2 border-gray-300 rounded-xl text-black" placeholder="Intro text" />
          </div>

          {/* Table */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800">Distribution Table</label>
            <ResultMarksheetDistributionTableNotice onChange={setRows} />
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800">Instructions (optional)</label>
            <div className="space-y-2">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span>{index + 1}.</span>
                  <input type="text" value={instruction} onChange={(e) => updateInstruction(index, e.target.value)} className="flex-1 p-3 border-2 border-gray-300 rounded-lg" placeholder={`Instruction ${index + 1}`} />
                  {instructions.length > 1 && (
                    <button type="button" onClick={() => removeInstruction(index)} className="px-2 py-1 bg-red-100 text-red-600 rounded">×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addInstruction} className="mt-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">+ Add Instruction</button>
            </div>
          </div>

          {/* Ending */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-800">Ending Content (optional)</label>
            <textarea value={endingContent} onChange={(e) => setEndingContent(e.target.value)} rows="3" className="w-full p-3 border-2 border-gray-300 rounded-xl text-black" placeholder="Ending text" />
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
            <div
              key={index}
              className="flex flex-col md:flex-row gap-2 mb-2 p-2 border rounded text-black"
            >
              {/* Role selection */}
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
          <div className="pt-4">
            <button type="button" onClick={handleSubmit} className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">Preview Notice</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultMarksheetDistributionForm;