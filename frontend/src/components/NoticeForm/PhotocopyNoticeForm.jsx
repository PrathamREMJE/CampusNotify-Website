import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PhotocopyNoticeForm = () => {
  const [mode, setMode] = useState("predefined");
  const [title, setTitle] = useState("");
  const [applicationStartDate, setApplicationStartDate] = useState("");
  const [applicationEndDate, setApplicationEndDate] = useState("");
  const [steps, setSteps] = useState([""]);
  const [fees, setFees] = useState({
    application_processing_fee: "",
    photocopy_per_subject_fee: ""
  });
  const [signatures, setSignatures] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Custom mode states
  // Custom mode states
  const [introductionContent, setIntroductionContent] = useState("");
  const [stepsTitle, setStepsTitle] = useState("");
  const [feesCustom, setFeesCustom] = useState([{ heading: "", amount: "" }]);
  const [note, setNote] = useState("");
  const [instructions, setInstructions] = useState([""]);   // ✅ Added
  const [endingContent, setEndingContent] = useState("");   // ✅ Added
  const [applyFooter, setApplyFooter] = useState(false);   // Footer option


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

  // Draft
  const draftKey = 'photocopy_notice_draft';
  const saveDraft = () => {
    const draft = {
      mode,
      title,
      applicationStartDate,
      applicationEndDate,
      steps,
      fees,
      signatures,
      introductionContent,
      stepsTitle,
      feesCustom,
      note,
      instructions,
      endingContent,
      applyFooter,
    };
    try { localStorage.setItem(draftKey, JSON.stringify(draft)); } catch {}
  };
  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.mode) setMode(d.mode);
      if (typeof d.title === 'string') setTitle(d.title);
      if (typeof d.applicationStartDate === 'string') setApplicationStartDate(d.applicationStartDate);
      if (typeof d.applicationEndDate === 'string') setApplicationEndDate(d.applicationEndDate);
      if (Array.isArray(d.steps)) setSteps(d.steps);
      if (d.fees && typeof d.fees === 'object') setFees(d.fees);
      if (Array.isArray(d.signatures)) setSignatures(d.signatures);
      if (typeof d.introductionContent === 'string') setIntroductionContent(d.introductionContent);
      if (typeof d.stepsTitle === 'string') setStepsTitle(d.stepsTitle);
      if (Array.isArray(d.feesCustom)) setFeesCustom(d.feesCustom);
      if (typeof d.note === 'string') setNote(d.note);
      if (Array.isArray(d.instructions)) setInstructions(d.instructions);
      if (typeof d.endingContent === 'string') setEndingContent(d.endingContent);
      if (typeof d.applyFooter === 'boolean') setApplyFooter(d.applyFooter);
    } catch {}
  };
  useEffect(() => { loadDraft(); }, []);
  useEffect(() => {
    const t = setTimeout(saveDraft, 800);
    return () => clearTimeout(t);
  }, [mode, title, applicationStartDate, applicationEndDate, steps, fees, signatures, introductionContent, stepsTitle, feesCustom, note, instructions, endingContent, applyFooter]);

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

  const addStep = () => {
    setSteps([...steps, ""]);
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  const updateStep = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addFee = () => {
    setFeesCustom([...feesCustom, { heading: "", amount: "" }]);
  };

  const removeFee = (index) => {
    const newFees = feesCustom.filter((_, i) => i !== index);
    setFeesCustom(newFees);
  };

  const updateFeeHeading = (index, value) => {
    const newFees = [...feesCustom];
    newFees[index].heading = value;
    setFeesCustom(newFees);
  };

  const updateFeeAmount = (index, value) => {
    const newFees = [...feesCustom];
    newFees[index].amount = value;
    setFeesCustom(newFees);
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
  if (!title.trim()) {
    alert("Please enter a title.");
    return;
  }

  if (mode === "predefined" && (!applicationStartDate || !applicationEndDate)) {
    alert("Please fill in start and end dates.");
    return;
  }

  const payload = {
    notice_type: "photocopy",
    mode: mode,
    content_data: {
      title: title,
      ...(mode === "custom" && {
        introduction_content: introductionContent || "",
        steps_title: stepsTitle || "",
        fees: feesCustom.filter(f => f.heading.trim() || f.amount.trim()),
        note: note || "",
        ending_content: endingContent || "",
      }),
      steps: steps.filter(s => s.trim() !== ""),
      ...(mode === "predefined" && {
        application_start_date: applicationStartDate,
        application_end_date: applicationEndDate,
        fees: fees,
      }),
      instructions: instructions.filter(i => i.trim() !== ""),
      signatures: signatures || [],
      apply_footer: applyFooter,
    }
  };

  console.log("Final Photocopy Notice JSON:", payload);
  navigate("/notices/preview", {
    state: { data: payload, noticeType: "photocopy" }
  });
};


  return (
    <div className="p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Photocopy Application Notice Generator
                </h2>
                <p className="text-white/90 text-sm font-medium">
                  Create professional photocopy application notices
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
          {/* Mode Selector */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800 mb-1">
              Mode
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setMode('predefined')}
                className={`px-4 py-2 rounded-xl font-semibold border-2 transition-all duration-200 ${mode === 'predefined' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
              >
                Predefined
              </button>
              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`px-4 py-2 rounded-xl font-semibold border-2 transition-all duration-200 ${mode === 'custom' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'}`}
              >
                Custom
              </button>
            </div>
          </div>

          {mode === "predefined" ? (
            <>
              {/* Title */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
                  Title<span className="text-red-500 ml-2">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Photocopy Application Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl"
                  required
                />
              </div>

              {/* Application Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Application Start Date */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
                    Application Start Date<span className="text-red-500 ml-2">*</span>
                  </label>
                  <input
                    type="date"
                    value={applicationStartDate}
                    onChange={(e) => setApplicationStartDate(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl"
                    required
                  />
                </div>

                {/* Application End Date */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
                    Application End Date<span className="text-red-500 ml-2">*</span>
                  </label>
                  <input
                    type="date"
                    value={applicationEndDate}
                    onChange={(e) => setApplicationEndDate(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Steps for the process */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800 mb-1">
                  Steps for the Process
                </label>
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span>{index + 1}.</span>
                      <input
                        type="text"
                        placeholder={`Step ${index + 1}`}
                        value={step}
                        onChange={(e) => updateStep(index, e.target.value)}
                        className="flex-1 p-3 border-2 border-gray-300 rounded-lg"
                      />
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="px-2 py-1 bg-red-100 text-red-600 rounded"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addStep}
                    className="mt-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg"
                  >
                    + Add Step
                  </button>
                </div>
              </div>

              {/* Fees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Application Processing Fee */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
                    Fees for Photocopy Application Processing Form
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Rs. 100/-"
                    value={fees.application_processing_fee}
                    onChange={(e) => setFees({ ...fees, application_processing_fee: e.target.value })}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl"
                  />
                </div>

                {/* Photocopy per Subject Fee */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
                    Fees for Photocopy of Answer Sheet per Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Rs. 50/-"
                    value={fees.photocopy_per_subject_fee}
                    onChange={(e) => setFees({ ...fees, photocopy_per_subject_fee: e.target.value })}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl"
                  />
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
            </>
          ) : (
            <>
              {/* Title */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl"
                />
              </div>

              {/* Introduction Content */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
                  Introduction Content
                </label>
                <textarea
                  placeholder="Enter introduction content"
                  value={introductionContent}
                  onChange={(e) => setIntroductionContent(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl text-black"
                  rows="3"
                />
              </div>

              {/* Steps Title */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
                  Steps Title
                </label>
                <input
                  type="text"
                  placeholder="Enter steps title"
                  value={stepsTitle}
                  onChange={(e) => setStepsTitle(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl"
                />
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800 mb-1">
                  Steps
                </label>
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span>{index + 1}.</span>
                      <input
                        type="text"
                        placeholder={`Step ${index + 1}`}
                        value={step}
                        onChange={(e) => updateStep(index, e.target.value)}
                        className="flex-1 p-3 border-2 border-gray-300 rounded-lg"
                      />
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="px-2 py-1 bg-red-100 text-red-600 rounded"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addStep}
                    className="mt-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg"
                  >
                    + Add Step
                  </button>
                </div>
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

              {/* Fees */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800 mb-1">
                  Fees
                </label>
                <div className="space-y-2">
                  {feesCustom.map((fee, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Fee Heading"
                        value={fee.heading}
                        onChange={(e) => updateFeeHeading(index, e.target.value)}
                        className="flex-1 p-3 border-2 border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Fee Amount"
                        value={fee.amount}
                        onChange={(e) => updateFeeAmount(index, e.target.value)}
                        className="flex-1 p-3 border-2 border-gray-300 rounded-lg"
                      />
                      {feesCustom.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFee(index)}
                          className="px-2 py-1 bg-red-100 text-red-600 rounded"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFee}
                    className="mt-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg"
                  >
                    + Add Fee
                  </button>
                </div>
              </div>

              {/* Note */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-1">
                  Note
                </label>
                <textarea
                  placeholder="Enter note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl text-black"
                  rows="3"
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
            </>
          )}

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

          {/* Submit */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              Save Photocopy Notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhotocopyNoticeForm;
