import React, { useState, useEffect } from "react";

// Reusable table builder with two modes: predefined and custom
// - predefined: common revaluation result columns
// - custom: user chooses number of columns and edits headers
const RevaluationTableNotice = ({ onChange }) => {
  const [mode, setMode] = useState("predefined");
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(3);
  const [colCount, setColCount] = useState(7);

const predefinedHeadersRow1 = [
  { label: "Sr No", rowSpan: 2, width: "5%" },
  { label: "Name of Students", rowSpan: 2, width: "20%" },
  { label: "Class", rowSpan: 2, width: "8%" },
  { label: "Sem", rowSpan: 2, width: "5%" },
  { label: "Seat No", rowSpan: 2, width: "5%" },
  { label: "Subject Code", rowSpan: 2, width: "10%" },
  { label: "Subject", rowSpan: 2, width: "15%" },
  { label: "Result of Verification of Mark", colSpan: 3, width: "22%" },
  { label: "Student Signature Received Result", rowSpan: 2, width: "10%" }
];

const predefinedHeadersRow2 = [
  "Previous Marks",
  "Marks after Revaluation",
  "Result of the Revaluation"
];

  const generateTable = () => {
    let headers;
    if (mode === "predefined") {
      headers = [
        "Sr. No",
        "Name of Students",
        "Class",
        "Sem",
        "Seat No",
        "Subject Code",
        "Subject",
        "Previous Marks",
        "Marks after Revaluation",
        "Result of the Revaluation",
        "Student Signature Received Result"
      ];
    } else {
      headers = Array(colCount).fill("");
    }
    const table = [headers];
    for (let i = 0; i < rowCount; i++) table.push(Array(headers.length).fill(""));
    setRows(table);
    onChange?.(table);
  };

  useEffect(() => {
    generateTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const updateCell = (r, c, value) => {
    const updated = rows.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row));
    setRows(updated);
    onChange?.(updated);
  };

  const deleteRow = (r) => {
    if (r === 0) return;
    const updated = rows.filter((_, i) => i !== r);
    setRows(updated);
    onChange?.(updated);
  };

  const addRow = () => {
    if (rows.length === 0) return;
    const updated = [...rows, Array(rows[0].length).fill("")];
    setRows(updated);
    onChange?.(updated);
  };

  const renderInput = (header, value, onChange, colIndex) => {
    // For the last column "Student Signature Received Result", show disabled empty input
    if (header === "Student Signature Received Result") {
      return (
        <input
          type="text"
          value=""
          disabled
          className="w-full p-1 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
          placeholder={header}
        />
      );
    }
    // For the three sub-columns under "Result of Verification of Mark"
    if (
      header === "Previous Marks" ||
      header === "Marks after Revaluation" ||
      header === "Result of the Revaluation"
    ) {
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-1 border rounded bg-white text-black"
          placeholder={header}
        />
      );
    }
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-1 border rounded bg-white text-black"
        placeholder={header}
      />
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
      {/* Mode Switch */}
      <div className="flex mb-4">
        <button
          onClick={() => setMode("predefined")}
          className={`px-4 py-2 rounded-l-lg font-medium transition-colors duration-200 ${
            mode === "predefined" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Predefined
        </button>
        <button
          onClick={() => setMode("custom")}
          className={`px-4 py-2 rounded-r-lg font-medium transition-colors duration-200 ${
            mode === "custom" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Custom
        </button>
      </div>

      {/* Config */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Rows</label>
          <input
            type="number"
            min="1"
            value={rowCount}
            onChange={(e) => setRowCount(parseInt(e.target.value) || 1)}
            className="mt-1 p-2 border rounded w-24"
          />
        </div>
        {mode === "custom" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Columns</label>
            <input
              type="number"
              min="1"
              value={colCount}
              onChange={(e) => setColCount(parseInt(e.target.value) || 1)}
              className="mt-1 p-2 border rounded w-24"
            />
          </div>
        )}
        <button
          type="button"
          onClick={generateTable}
          className="self-end bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Generate Table
        </button>
      </div>

      {/* Table */}
      {rows.length > 0 && (
    <div className="overflow-x-auto rounded-lg p-4 shadow-sm border border-gray-300 bg-white">
      <table className="w-full border border-gray-300">
        <thead>
          {mode === "predefined" ? (
            <>
              <tr className="bg-gray-100 text-black">
                <th className="p-3 border w-16 min-w-[64px]" rowSpan={2}>Actions</th>
              {predefinedHeadersRow1.map((header, idx) => (
                <th
                  key={idx}
                  className="p-3 border text-center whitespace-normal break-words min-w-[80px]"
                  colSpan={header.colSpan || 1}
                  rowSpan={header.rowSpan || 1}
                  style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                >
                  {header.label}
                </th>
              ))}
              </tr>
              <tr className="bg-gray-100 text-black">
              {predefinedHeadersRow2.map((header, idx) => (
                <th key={idx} className="p-3 border text-center whitespace-normal break-words min-w-[80px]" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
                  {header}
                </th>
              ))}
              </tr>
            </>
          ) : (
            <tr className="bg-gray-100 text-black">
              <th className="p-3 border w-24 min-w-[96px]">Actions</th>
              {rows[0].map((header, ci) => (
                <th key={ci} className="p-3 border text-left whitespace-normal break-words min-w-[80px]" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => updateCell(0, ci, e.target.value)}
                    className="w-full p-2 border rounded break-words whitespace-normal"
                    placeholder={`Header ${ci + 1}`}
                  />
                </th>
              ))}
            </tr>
          )}
        </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri}>
                  <td className="p-3 border text-center w-24 min-w-[96px]">
                    <button
                      type="button"
                      onClick={() => deleteRow(ri + 1)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                    >
                      ×
                    </button>
                  </td>
                  {row.map((cell, ci) => {
                    // Determine header label for this column
                    let headerLabel = "";
                    if (mode === "predefined") {
                      // Map column index to header label for predefined mode
                      const predefinedHeadersFlat = [
                        "Sr No",
                        "Name of Students",
                        "Class",
                        "Sem",
                        "Seat No",
                        "Subject Code",
                        "Subject",
                        "Previous Marks",
                        "Marks after Revaluation",
                        "Result of the Revaluation",
                        "Student Signature Received Result"
                      ];
                      headerLabel = predefinedHeadersFlat[ci] || "";
                    } else {
                      headerLabel = rows[0][ci];
                    }
                    return (
                      <td
                        key={ci}
                        className="p-3 border break-words whitespace-normal"
                        style={{
                          textAlign: "center",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {renderInput(headerLabel, cell, (v) => updateCell(ri + 1, ci, v), ci)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={addRow}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Add Row
          </button>
        </div>
      )}
    </div>
  );
};

export default RevaluationTableNotice;