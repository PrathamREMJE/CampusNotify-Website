import React, { useState, useEffect } from "react";

const ResultMarksheetDistributionTableNotice = ({ onChange }) => {
  const [mode, setMode] = useState("predefined");
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(3);
  const [colCount, setColCount] = useState(3);

  const predefinedHeaders = ["Sr. no", "class", "place/venue"];

  // Generate table when mode changes or button clicked
  const generateTable = () => {
    let headers = mode === "predefined" ? predefinedHeaders : Array(colCount).fill("");
    let newTable = [headers];
    for (let i = 0; i < rowCount; i++) {
      newTable.push(Array(headers.length).fill(""));
    }
    setRows(newTable);
    onChange(newTable);
  };

  useEffect(() => {
    generateTable();
  }, [mode]);

  // Update cell
  const updateCell = (rowIdx, colIdx, value) => {
    const updated = rows.map((r, i) =>
      i === rowIdx ? r.map((c, j) => (j === colIdx ? value : c)) : r
    );
    setRows(updated);
    onChange(updated);
  };

  // Delete row
  const deleteRow = (rowIdx) => {
    if (rowIdx === 0) return; // don't delete header
    const updated = rows.filter((_, i) => i !== rowIdx);
    setRows(updated);
    onChange(updated);
  };

  // Add new row at bottom
  const addRow = () => {
    const updated = [...rows, Array(rows[0].length).fill("")];
    setRows(updated);
    onChange(updated);
  };

  // Helper function to get appropriate input for each column
  const getInputForColumn = (header, value, onChange, rowIdx, colIdx) => {
    if (header === "Sr. no") {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-1 border rounded bg-white text-black"
          placeholder="Sr. no"
        />
      );
    } else {
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
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
      {/* Mode switch */}
      <div className="flex mb-4">
        <button
          onClick={() => setMode("predefined")}
          className={`px-4 py-2 rounded-l-lg font-medium transition-colors duration-200 ${
            mode === "predefined"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Predefined
        </button>
        <button
          onClick={() => setMode("custom")}
          className={`px-4 py-2 rounded-r-lg font-medium transition-colors duration-200 ${
            mode === "custom"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Custom
        </button>
      </div>
      {/* Config panel */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rows
          </label>
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
            <label className="block text-sm font-medium text-gray-700">
              Columns
            </label>
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

      {/* Table grid */}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="p-2 border w-16">Actions</th>
                {rows[0].map((header, colIdx) => {
                  let colWidth = "";
                  if (mode === "predefined") {
                    if (header === "Sr. no") colWidth = "w-16";
                    else if (header === "class") colWidth = "w-32";
                    else if (header === "place/venue") colWidth = "w-48";
                  }
                  return (
                    <th key={colIdx} className={`p-2 border text-left ${colWidth}`}>
                      {mode === "predefined" ? (
                        header
                      ) : (
                        <input
                          type="text"
                          value={header}
                          onChange={(e) => updateCell(0, colIdx, e.target.value)}
                          className="w-full p-1 border rounded"
                          placeholder={`Header ${colIdx + 1}`}
                        />
                      )}
                    </th>
                  );
                })}
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
                    let colWidth = "";
                    
                    if (mode === "predefined") {
                      if (header === "Sr. no") colWidth = "w-16";
                      else if (header === "class") colWidth = "w-32";
                      else if (header === "place/venue") colWidth = "w-48";
                    }
                    
                    return (
                      <td key={colIdx} className={`p-2 border ${colWidth}`}>
                        {getInputForColumn(
                          header,
                          cell,
                          (value) => updateCell(rowIdx + 1, colIdx, value),
                          rowIdx,
                          colIdx
                        )}
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

export default ResultMarksheetDistributionTableNotice;
