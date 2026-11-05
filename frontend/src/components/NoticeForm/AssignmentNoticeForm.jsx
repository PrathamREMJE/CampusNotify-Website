import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AssignmentTableForm from "./AssignmentTableNotice";

const AssignmentNoticeForm = () => {
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [targetGroups, setTargetGroups] = useState([]);
  const [targetDepartments, setTargetDepartments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [introductionContent, setIntroductionContent] = useState("");
  const [instructions, setInstructions] = useState([""]);
  const [endingContent, setEndingContent] = useState("");
  const [signatures, setSignatures] = useState([]);
  const [applyFooter, setApplyFooter] = useState(false);

  const [rows, setRows] = useState([]);
  const [staffList, setStaffList] = useState([]);

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

  // Draft: autosave/load without UI changes
  const draftKey = 'assignment_notice_draft';
  const saveDraft = () => {
    try {
      const draft = {
        assignmentTitle,
        targetGroups,
        targetDepartments,
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
      setAssignmentTitle(p.assignmentTitle || '');
      setTargetGroups(Array.isArray(p.targetGroups) ? p.targetGroups : []);
      setTargetDepartments(Array.isArray(p.targetDepartments) ? p.targetDepartments : []);
      setIntroductionContent(p.introductionContent || '');
      setInstructions(Array.isArray(p.instructions) ? p.instructions : ['']);
      setEndingContent(p.endingContent || '');
      setSignatures(Array.isArray(p.signatures) ? p.signatures : []);
      setRows(Array.isArray(p.rows) ? p.rows : []);
      setApplyFooter(p.applyFooter || false);
    } catch (_) {}
  };
  useEffect(() => { loadDraft(); }, []);
  useEffect(() => {
    const id = setTimeout(saveDraft, 1000);
    return () => clearTimeout(id);
  }, [assignmentTitle, targetGroups, targetDepartments, introductionContent, instructions, endingContent, signatures, rows, applyFooter]);

  // Fetch departments and staff list
  const token = localStorage.getItem("access_token");
  useEffect(() => {
    if (!token) return;
    
    // Fetch departments
    fetch("http://127.0.0.1:8000/api/departments/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch(() => setDepartments([]));
    
    // Fetch staff list
   fetch('http://127.0.0.1:8000/api/staff/list/', {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(data => setStaffList(Array.isArray(data) ? data : []))
    .catch(() => setStaffList([]));

  // departments
  fetch('http://127.0.0.1:8000/api/departments/', {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(data => setDepartments(Array.isArray(data) ? data : []))
    .catch(() => setDepartments([]));
}, [token]);
  

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
  if (!assignmentTitle || rows.length <= 1) {
    alert("Please fill in all required fields and ensure the assignment table is not empty.");
    return;
  }

  // ✅ Transform rows into structured objects
  const headers = rows[0];
  const structuredRows = rows.slice(1).map(row =>
    headers.reduce((acc, header, idx) => {
      acc[header.toLowerCase()] = row[idx];
      return acc;
    }, {})
  );

  const payload = {
    notice_type: "assignment",
    content_data: {
      assignment_title: assignmentTitle,
      target_groups: targetGroups,
      target_departments: targetDepartments,
      introduction_content: introductionContent,
      instructions: instructions.filter(i => i.trim() !== ""),
      ending_content: endingContent,
      signatures: signatures,
      assignment_table: structuredRows,
      apply_footer: applyFooter
    },
    // Also include the raw 2D array for the preview component
    assignment_table: rows
  };

  console.log("Final Assignment Notice JSON:", payload);
  navigate("/notices/preview", { state: { data: payload, noticeType: "assignment" } });
};

  return (
    <div className="p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Assignment Notice Generator
                </h2>
                <p className="text-white/90 text-sm font-medium">
                  Create professional assignment submission notices
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
        {/* Assignment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignment Title */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
                Assignment Title<span className="text-red-500 ml-2">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Financial Accounting Project"
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                className="w-full p-4 border-2 border-gray-300 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Target Group */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
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
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
              <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              Target Departments
              <div className="ml-auto bg-gray-100 px-2 py-1 rounded-full">
                <span className="text-xs font-semibold text-gray-600">OPTIONAL</span>
              </div>
            </label>
            <select
  multiple
  value={targetDepartments}
  onChange={e => {
    const options = Array.from(e.target.options);
    setTargetDepartments(options.filter(o => o.selected).map(o => o.text));
  }}
  className="w-full border px-4 py-2 rounded bg-white text-black h-32"
>
  {departments.map(dep => (
    <option key={dep.id} value={dep.name}>{dep.name}</option>
  ))}
</select>


          </div>

          {/* Introduction Content */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800 mb-1">
              Introduction Content
            </label>
            <textarea
              placeholder="Enter introduction content here..."
              value={introductionContent}
              onChange={(e) => setIntroductionContent(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-black"
              rows="4"
            />
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800 mb-1">
              Instructions (Optional)
            </label>
            <div className="space-y-2">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span>{index + 1}.</span>
                  <input
                    type="text"
                    placeholder={`Instruction ${index + 1}`}
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    className="flex-1 p-3 border-2 border-gray-300 rounded-lg"
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

          {/* Assignment Table */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800">
              Assignment Submission Table<span className="text-red-500 ml-2">*</span>
            </label>
            <AssignmentTableForm onChange={setRows} />
          </div>

          {/* Footer Option */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Apply Footer
              <div className="ml-auto bg-gray-100 px-2 py-1 rounded-full">
                <span className="text-xs font-semibold text-gray-600">OPTIONAL</span>
              </div>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={applyFooter}
                onChange={(e) => setApplyFooter(e.target.checked)}
                className="w-5 h-5 accent-green-600"
              />
              <span className="text-sm text-gray-700">Include footer with institution details</span>
            </div>
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

          {/* Submit */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              Save Assignment Notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentNoticeForm;
