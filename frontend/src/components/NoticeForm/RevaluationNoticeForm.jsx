import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RevaluationTableNotice from "./RevaluationTableNotice";

const RevaluationNoticeForm = () => {
  const navigate = useNavigate();

  // Fields
  const [resultTitle, setResultTitle] = useState("");
  const [introductionContent, setIntroductionContent] = useState("");
  const [instructions, setInstructions] = useState([""]);
  const [endingContent, setEndingContent] = useState("");

  // Signatures
  const [signatures, setSignatures] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Table
  const [rows, setRows] = useState([]);

  // Draft
  const draftKey = 'revaluation_notice_draft';
  const saveDraft = () => {
    const draft = {
      resultTitle,
      introductionContent,
      instructions,
      endingContent,
      signatures,
      rows,
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
    } catch {}
  };
  useEffect(() => { loadDraft(); }, []);
  useEffect(() => {
    const t = setTimeout(saveDraft, 800);
    return () => clearTimeout(t);
  }, [resultTitle, introductionContent, instructions, endingContent, signatures, rows]);

  const token = localStorage.getItem("access_token");

  // Predefined roles
  const signatureRoles = [
    { id: "principal", name: "Principal" },
    { id: "vice_principal", name: "Vice Principal" },
    { id: "office_superintendent", name: "Office Superintendent" },
    { id: "senior_clerk", name: "Senior Clerk" },
    { id: "hod", name: "Head of Department" },
    { id: "teacher", name: "Teacher" }
  ];

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

  // Signatures handlers
  const handleAddSignature = () => {
    setSignatures([...signatures, { role: "", custom_role: "", person: "", person_name: "" }]);
  };
  const removeSignature = (index) => {
    setSignatures(signatures.filter((_, i) => i !== index));
  };
  const handleSignatureChange = (index, field, value) => {
    const updated = [...signatures];
    updated[index][field] = value;
    if (field === "person_name" && value) {
      updated[index]["person"] = ""; // prioritize custom name
    }
    setSignatures(updated);
  };

  // Instructions handlers
  const addInstruction = () => setInstructions([...instructions, ""]);
  const removeInstruction = (i) => setInstructions(instructions.filter((_, idx) => idx !== i));
  const updateInstruction = (i, value) => {
    const next = [...instructions];
    next[i] = value;
    setInstructions(next);
  };

  const handleSubmit = () => {
    if (!resultTitle) {
      alert("Please enter revaluation notice title.");
      return;
    }

    const payload = {
      notice_type: "revaluation",
      title: "Revaluation Results Notice",
      content_data: {
        result_title: resultTitle,
        introduction_content: introductionContent,
        instructions: instructions.filter((i) => i.trim() !== ""),
        ending_content: endingContent,
        signatures,
        revaluation_table: rows
      },
      revaluation_table: rows // for preview compatibility
    };

    navigate("/notices/preview", { state: { data: payload, noticeType: "revaluation" } });
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
                <h2 className="text-2xl font-bold text-white mb-1">Revaluation Results Notice</h2>
                <p className="text-white/90 text-sm font-medium">Create a notice for revaluation results</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 space-y-8">
          {/* Title */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                Title<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={resultTitle}
                onChange={(e) => setResultTitle(e.target.value)}
                placeholder="e.g., Revaluation Results (March 2025)"
                className="w-full p-3 border-2 border-gray-300 rounded-xl"
              />
            </div>
          </div>

          {/* Introduction */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-800">Introduction</label>
            <textarea
              value={introductionContent}
              onChange={(e) => setIntroductionContent(e.target.value)}
              rows="3"
              className="w-full p-3 border-2 border-gray-300 rounded-xl text-black"
              placeholder="Students are informed that the following revaluation results have been declared."
            />
          </div>

          {/* Table */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800">Revaluation Results Table</label>
            <RevaluationTableNotice onChange={setRows} />
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800">Instructions (optional)</label>
            <div className="space-y-2">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span>{index + 1}.</span>
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    className="flex-1 p-3 border-2 border-gray-300 rounded-lg"
                    placeholder={`Instruction ${index + 1}`}
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="px-2 py-1 bg-red-100 text-red-600 rounded"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addInstruction}
                className="mt-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg"
              >
                + Add Instruction
              </button>
            </div>
          </div>

          {/* Ending */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-800">Ending Content (optional)</label>
            <textarea
              value={endingContent}
              onChange={(e) => setEndingContent(e.target.value)}
              rows="3"
              className="w-full p-3 border-2 border-gray-300 rounded-xl text-black"
              placeholder="For any queries, contact the examination department."
            />
          </div>

          {/* Signatures */}
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

          {/* Submit */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold"
            >
              Preview Notice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevaluationNoticeForm;