import React, { useState } from "react";

// A small, focused grid builder for class timetable matching the sample layout
// Headers: Timing | Lecture No | Mon | Tue | Wed | Thu | Fri | Sat
const defaultHeaders = [
  "Timing",
  "Lecture No",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const ClassTimetableTable = ({ onChange }) => {
  const [rows, setRows] = useState([defaultHeaders, ...Array.from({ length: 5 }, () => Array(defaultHeaders.length).fill(""))]);

  const updateCell = (rowIdx, colIdx, value) => {
    const updated = rows.map((r, i) => (i === rowIdx ? r.map((c, j) => (j === colIdx ? value : c)) : r));
    setRows(updated);
    onChange && onChange(updated);
  };

  const addRow = () => {
    const updated = [...rows, Array(rows[0].length).fill("")];
    setRows(updated);
    onChange && onChange(updated);
  };

  const deleteRow = (rowIdx) => {
    if (rowIdx === 0) return; // keep header
    const updated = rows.filter((_, i) => i !== rowIdx);
    setRows(updated);
    onChange && onChange(updated);
  };

  const addBreakRow = () => {
    // Create a break row with "BREAK" in day columns and empty timing
    const breakRow = Array(defaultHeaders.length).fill("");
    // Set "BREAK" for all day columns (Mon, Tue, Wed, Thu, Fri, Sat)
    for (let i = 2; i < defaultHeaders.length; i++) {
      breakRow[i] = "BREAK";
    }
    // Set empty timing and lecture number
    breakRow[0] = ""; // Timing
    breakRow[1] = ""; // Lecture No
    
    const updated = [...rows, breakRow];
    setRows(updated);
    onChange && onChange(updated);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-black">
              <th className="p-2 border w-16">Actions</th>
              {rows[0].map((header, colIdx) => (
                <th key={colIdx} className="p-2 border text-center">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="p-2 border text-center w-16">
                  <button
                    type="button"
                    onClick={() => deleteRow(rowIdx + 1)}
                    className="px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-xs"
                  >
                    ×
                  </button>
                </td>
                {row.map((cell, colIdx) => {
                  const header = rows[0][colIdx];

                  // Provide convenient input types for specific columns
                  if (header === "Timing") {
                    return (
                      <td key={colIdx} className="p-2 border">
                        <div className="flex gap-1 items-center">
                          <input
                            type="time"
                            value={cell.split(" to ")[0] || ""}
                            onChange={(e) => {
                              const start = e.target.value;
                              const end = cell.includes(" to ") ? cell.split(" to ")[1] : "";
                              const newValue = end ? `${start} to ${end}` : start;
                              updateCell(rowIdx + 1, colIdx, newValue);
                            }}
                            className="w-full p-1 border rounded bg-white text-black"
                          />
                          <span className="text-sm text-gray-600">to</span>
                          <input
                            type="time"
                            value={cell.includes(" to ") ? cell.split(" to ")[1] : ""}
                            onChange={(e) => {
                              const end = e.target.value;
                              const start = cell.includes(" to ") ? cell.split(" to ")[0] : cell;
                              const newValue = start ? `${start} to ${end}` : end;
                              updateCell(rowIdx + 1, colIdx, newValue);
                            }}
                            className="w-full p-1 border rounded bg-white text-black"
                          />
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={colIdx} className="p-2 border">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIdx + 1, colIdx, e.target.value)}
                        className="w-full p-1 border rounded bg-white text-black"
                        placeholder={header}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={addRow}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Row
        </button>
        <button
          type="button"
          onClick={addBreakRow}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Break
        </button>
      </div>
    </div>
  );
};

export default ClassTimetableTable;