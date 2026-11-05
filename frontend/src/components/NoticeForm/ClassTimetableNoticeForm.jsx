import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClassTimetableTable from "./ClassTimetableTable";

const ClassTimetableNoticeForm = () => {
  const [timetableTitle, setTimetableTitle] = useState("Timetable for SEM-V AY 2025-26");
  const [semesterTitle, setSemesterTitle] = useState("TY BBA CA");
  const [signatures, setSignatures] = useState([
    { role: "Co-ordinator", person: "", person_name: "Dr. Sandeep Rathod", custom_role: "Co-ordinator" },
    { role: "Principal", person: "", person_name: "Dr. Kishor Desarda", custom_role: "Principal" },
  ]);
  const [rows, setRows] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const navigate = useNavigate();

  // Draft: autosave/load without UI changes
  const draftKey = 'class_timetable_draft';
  const saveDraft = () => {
    try {
      const draft = {
        timetableTitle,
        semesterTitle,
        signatures,
        rows,
      };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch (_) {}
  };
  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setTimetableTitle(parsed.timetableTitle || "");
      setSemesterTitle(parsed.semesterTitle || "");
      setSignatures(Array.isArray(parsed.signatures) ? parsed.signatures : []);
      setRows(Array.isArray(parsed.rows) ? parsed.rows : []);
    } catch (_) {}
  };
  useEffect(() => { loadDraft(); }, []);
  useEffect(() => {
    const id = setTimeout(saveDraft, 1000);
    return () => clearTimeout(id);
  }, [timetableTitle, semesterTitle, signatures, rows]);

  const token = localStorage.getItem("access_token");
  useEffect(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/staff/list/", {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => setStaffList(Array.isArray(data) ? data : []))
      .catch(() => setStaffList([]));
  }, [token]);

  const handleSignatureChange = (index, field, value) => {
    const updated = [...signatures];
    updated[index][field] = value;
    if (field === "person_name" && value) {
      updated[index]["person"] = ""; // prefer explicit name
    }
    setSignatures(updated);
  };

  const addSignature = () => setSignatures([...signatures, { role: "", person: "", person_name: "", custom_role: "" }]);
  const removeSignature = (idx) => setSignatures(signatures.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!timetableTitle || rows.length <= 1) {
      alert("Please enter title and fill the timetable table.");
      return;
    }

    const payload = {
      notice_type: "class_timetable",
      title: "Class Timetable",
      content_data: {
        timetable_title: timetableTitle,
        semester_title: semesterTitle,
        signatures: signatures,
        timetable_table: rows,
      },
      timetable_table: rows,
    };

    navigate("/notices/preview", { state: { data: payload, noticeType: "class_timetable" } });
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Class Timetable Notice</h2>
                <p className="text-white/90 text-sm font-medium">Create a timetable grid like the sample</p>
              </div>
            </div>
          </div>
        </div>

        <form className="p-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">Main Title</label>
              <input
                type="text"
                value={timetableTitle}
                onChange={(e) => setTimetableTitle(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-xl"
                placeholder="Timetable for SEM-V AY 2025-26"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">Sub Title</label>
              <input
                type="text"
                value={semesterTitle}
                onChange={(e) => setSemesterTitle(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-xl"
                placeholder="TY BBA CA"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800">Timetable Grid</label>
            <ClassTimetableTable onChange={setRows} />
          </div>

          <h3 className="text-lg font-medium mb-2 text-black">Signatures</h3>
          {signatures.map((sig, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-2 mb-2 p-2 border rounded">
              <input
                type="text"
                value={sig.custom_role || sig.role}
                onChange={(e) => handleSignatureChange(index, "custom_role", e.target.value)}
                placeholder="Role"
                className="flex-1 border px-2 py-1 rounded text-black"
              />
              <input
                type="text"
                value={sig.person_name || ""}
                onChange={(e) => handleSignatureChange(index, "person_name", e.target.value)}
                placeholder="Signatory Name"
                className="flex-1 border px-2 py-1 rounded text-black"
              />
              <button type="button" onClick={() => removeSignature(index)} className="px-2 py-1 bg-red-100 text-red-600 rounded">
                ×
              </button>
            </div>
          ))}
          <button type="button" onClick={addSignature} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
            + Add Signature
          </button>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Preview Timetable Notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassTimetableNoticeForm;