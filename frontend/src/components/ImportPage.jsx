import React, { useState, useCallback } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { Upload, Edit, Trash2, Plus } from "lucide-react";
import DataTable from "react-data-table-component";
import Select from "react-select";

const ExcelFileManager = () => {
  // State variables
  const [uploadedFile, setUploadedFile] = useState(null);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState(null);
  const [dataRows, setDataRows] = useState([]);
  const [columnHeaders, setColumnHeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editedRowValues, setEditedRowValues] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [rowToDeleteIndex, setRowToDeleteIndex] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAddRowDialog, setShowAddRowDialog] = useState(false);
  const [newRowValues, setNewRowValues] = useState([]);

  // Validate row data
  const isRowValid = (row) => {
    const [name, amount, date] = row;
    const currentMonth = new Date().getMonth();
    const rowDate = new Date(date);
    return name && amount > 0 && rowDate.getMonth() === currentMonth;
  };

  // Handle file selection and upload
  const onFileSelect = async (file) => {
    if (!file) return;

    setUploadedFile(file);
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "backend_deployment_uri/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          },
        }
      );
      const sheets = response.data.sheetNames.map((sheet) => ({
        label: sheet,
        value: sheet,
      }));
      setAvailableSheets(sheets);
      setActiveSheet(sheets[0]);
      loadSheetData(sheets[0].value);
    } catch (err) {
      setError("File upload failed. Please try again.");
      console.error("File upload failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data for the selected sheet
  const loadSheetData = async (sheetName) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `backend_deployment_uri/api/data/${sheetName}`
      );

      // Split headers and data rows
      const [headers, ...dataRows] = response.data.data;
      setColumnHeaders(headers || []);
      setDataRows(dataRows);
    } catch (err) {
      setError("Error fetching sheet data. Please try again.");
      console.error("Error fetching sheet data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sheet change
  const handleSheetChange = (selectedOption) => {
    setActiveSheet(selectedOption);
    loadSheetData(selectedOption.value);
  };

  // Edit row
  const editRow = (row) => {
    const rowIndex = dataRows.findIndex((r) => r === row);
    setEditingRowIndex(rowIndex);
    setEditedRowValues([...row]);
  };

  // Update edited row
  const updateEditedRow = (value, cellIndex) => {
    const updatedRow = [...editedRowValues];
    updatedRow[cellIndex] = value;
    setEditedRowValues(updatedRow);
  };

  // Submit edited row
  const submitEditedRow = async () => {
    if (!isRowValid(editedRowValues)) {
      setShowValidationModal(true);
      return;
    }

    try {
      await axios.put("backend_deployment_uri/api/data", {
        sheetName: activeSheet.value,
        rowIndex: editingRowIndex,
        updatedRow: editedRowValues,
      });
      const updatedRows = [...dataRows];
      updatedRows[editingRowIndex] = editedRowValues;
      setDataRows(updatedRows);
      setEditingRowIndex(null);
    } catch (err) {
      setError("Error updating row. Please try again.");
      console.error("Error updating row:", err);
    }
  };

  // Confirm row deletion
  const confirmRowDeletionStart = (row) => {
    const rowIndex = dataRows.findIndex((r) => r === row);
    setRowToDeleteIndex(rowIndex);
    setShowDeleteConfirmation(true);
  };

  // Execute row deletion
  const executeRowDeletion = async () => {
    try {
      await axios.delete(
        `backend_deployment_uri/api/data/${activeSheet.value}/${rowToDeleteIndex}`
      );
      const updatedRows = dataRows.filter((_, index) => index !== rowToDeleteIndex);
      setDataRows(updatedRows);
      setShowDeleteConfirmation(false);
    } catch (err) {
      setError("Error deleting row. Please try again.");
      console.error("Error deleting row:", err);
    }
  };

  // Cancel row deletion
  const cancelRowDeletion = () => {
    setShowDeleteConfirmation(false);
  };

  // Add new row
  const addNewRow = () => {
    setNewRowValues(Array(columnHeaders.length).fill(""));
    setShowAddRowDialog(true);
  };

  // Update new row values
  const updateNewRowValues = (value, cellIndex) => {
    const updatedRow = [...newRowValues];
    updatedRow[cellIndex] = value;
    setNewRowValues(updatedRow);
  };

  // Submit new row
  const submitNewRow = async () => {
    if (!isRowValid(newRowValues)) {
      setShowValidationModal(true);
      return;
    }

    try {
      await axios.post("backend_deployment_uri/api/data", {
        sheetName: activeSheet.value,
        newRow: newRowValues,
      });
      setDataRows([...dataRows, newRowValues]);
      setShowAddRowDialog(false);
    } catch (err) {
      setError("Error adding new row. Please try again.");
      console.error("Error adding new row:", err);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([columnHeaders, ...dataRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeSheet.value);
    XLSX.writeFile(workbook, `${activeSheet.value}_export.xlsx`);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  // Define table columns
  const tableColumns = columnHeaders.map((header, index) => ({
    name: header,
    selector: (row) => row[index],
    sortable: true,
  }));

  tableColumns.push({
    name: "Actions",
    cell: (row) => (
      <div className="flex space-x-4 items-center justify-center">
        <button
          onClick={() => editRow(row)}
          className="text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg py-2 px-4 hover:bg-gradient-to-l transition ease-in-out"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => confirmRowDeletionStart(row)}
          className="text-white bg-gradient-to-r from-red-500 to-red-700 rounded-lg py-2 px-4 hover:bg-gradient-to-l transition ease-in-out"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  });

  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 min-h-screen py-12 px-8">
      <div className="bg-white shadow-lg rounded-lg p-10 mb-8 max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-4xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
          Upload Your Excel File
        </h2>

        {/* Drag & Drop Section */}
        <div
          className="w-full flex justify-center items-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg p-8 text-center flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 w-full max-w-lg transform transition-all duration-500 hover:scale-105">
            <div className="w-full flex justify-center items-center gap-4">
              <div className="w-20 h-20 rounded-full border-4 border-white flex justify-center items-center bg-white bg-opacity-30 hover:bg-opacity-40 transition-all duration-300 animate-pulse bounce-animation">
                <Upload className="text-white w-10 h-10" />
              </div>
              <p className="text-white font-medium text-xl md:text-2xl">Drag & Drop your file here</p>
            </div>

            <div className="mt-6">
              <input
                id="fileInput"
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => onFileSelect(e.target.files[0])}
                className="hidden"
              />
              <button
                onClick={() => document.getElementById("fileInput").click()}
                className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-full shadow-md hover:bg-blue-100 transition duration-200 ease-in-out transform hover:scale-105"
              >
                Browse Files
              </button>
            </div>

            <p className="mt-4 text-white text-sm">
              Supported formats: <strong>.xlsx, .xls</strong>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-6 w-full">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 text-center mt-2">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Available Sheets Dropdown */}
        {availableSheets.length > 0 && (
          <div className="mt-6 w-full max-w-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a Sheet
            </label>
            <Select
              options={availableSheets}
              value={activeSheet}
              onChange={handleSheetChange}
              placeholder="Select a sheet..."
              className="basic-single"
              classNamePrefix="select"
            />
          </div>
        )}
      </div>

      {/* Data Table Section */}
      <div className="bg-white shadow-xl rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Data Table</h2>
        <div className="flex space-x-4 mb-4">
          <button
            onClick={exportToExcel}
            className="bg-gradient-to-r from-green-500 to-green-700 text-white py-2 px-6 rounded-lg hover:bg-gradient-to-l transition ease-in-out transform hover:scale-105"
          >
            Export to Excel
          </button>
          <button
            onClick={addNewRow}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg hover:bg-gradient-to-l transition ease-in-out transform hover:scale-105"
          >
            <Plus size={16} className="inline-block mr-2" />
            Add Row
          </button>
        </div>
        <DataTable
          columns={tableColumns}
          data={dataRows}
          progressPending={isLoading}
          pagination
          highlightOnHover
          responsive
        />
      </div>

      {/* Add Row Dialog */}
      {showAddRowDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Row</h2>
            {columnHeaders.map((header, index) => (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {header}
                </label>
                <input
                  type="text"
                  value={newRowValues[index] || ""}
                  onChange={(e) => updateNewRowValues(e.target.value, index)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            ))}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowAddRowDialog(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={submitNewRow}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition ease-in-out"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Row Dialog */}
      {editingRowIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Row</h2>
            {columnHeaders.map((header, index) => (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {header}
                </label>
                <input
                  type="text"
                  value={editedRowValues[index] || ""}
                  onChange={(e) => updateEditedRow(e.target.value, index)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            ))}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setEditingRowIndex(null)}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={submitEditedRow}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition ease-in-out"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this row?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelRowDeletion}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={executeRowDeletion}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition ease-in-out"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Validation Error</h2>
            <p className="mb-6">Please ensure all fields are filled correctly.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowValidationModal(false)}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition ease-in-out"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelFileManager;