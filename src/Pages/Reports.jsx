import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  Pencil,
  Trash2,
  Plus,
  Type,
  FileText,
  File,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAnnualReports,
  deleteAnnualReport,
  updateAnnualReport,
  createAnnualReport,
} from "../Api";
import axios from "axios";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dinb6qtto/image/upload";
const UPLOAD_PRESET = "fuelme";

const ReportModal = ({ isOpen, onClose, onSubmit, report }) => {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    year: "",
    file: "",
  });

  const [file, setFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (report) {
      setFormData(report);
      setFile(null);
    } else {
      setFormData({ title: "", excerpt: "", year: "", file: "" });
      setFile(null);
    }
  }, [report]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const uploadFile = async (fileToUpload) => {
    if (!fileToUpload) return null; // No file to upload

    const data = new FormData();
    data.append("file", fileToUpload);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.secure_url;
    } catch (error) {
      toast.error("File upload failed.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Only upload if there's a new file (for both create and edit)
    let fileUrl = formData.file; // Default to existing file

    if (file) {
      fileUrl = await uploadFile(file);
      if (!fileUrl && !report) {
        // For new reports, we need a file
        setIsSaving(false);
        return;
      }
    } else if (!report && !formData.file) {
      // For new reports, we need either a new file or existing file
      toast.error("Please upload a file");
      setIsSaving(false);
      return;
    }

    const dataToSubmit = { ...formData };
    if (fileUrl) {
      dataToSubmit.file = fileUrl;
    }

    await onSubmit(dataToSubmit);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {report ? "Edit" : "Add"} Annual Report
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Type className="absolute left-2 top-2.5 text-gray-400" size={18} />
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title (e.g., Annual Report 2023)"
              className="w-full border p-2 pl-8 rounded"
              required
            />
          </div>

          <div className="relative">
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="Year (e.g., 2023)"
              className="w-full border p-2 rounded"
              min="2000"
              max="2099"
              required
            />
          </div>

          <div className="relative">
            <FileText
              className="absolute left-2 top-2.5 text-gray-400"
              size={18}
            />
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Brief description"
              className="w-full border p-2 pl-8 rounded"
              required
            />
          </div>

          <div className="relative">
            <File className="absolute left-2 top-2.5 text-gray-400" size={18} />
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
              className="w-full border p-2 pl-8 rounded"
            />
          </div>

          {formData.link && typeof formData.link === "string" && (
            <div className="flex items-center gap-2 mt-2">
              <File size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600 truncate">
                {formData.link.split("/").pop()}
              </span>
              <span className="text-xs text-gray-500">
                (Current file - upload new file to replace)
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AnnualReportsTable = () => {
  const [reports, setReports] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await getAnnualReports();
      setReports(res.data);
    } catch (err) {
      toast.error("Failed to fetch annual reports");
      console.error("Failed to fetch annual reports", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this annual report?")) {
      try {
        await deleteAnnualReport(id);
        toast.success("Annual report deleted");
        fetchReports();
      } catch (err) {
        toast.error("Failed to delete annual report");
        console.error(err);
      }
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingReport(null);
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingReport) {
        await updateAnnualReport(editingReport.id || editingReport._id, data);
        toast.success("Annual report updated");
      } else {
        await createAnnualReport(data);
        toast.success("Annual report created");
      }
      fetchReports();
    } catch (err) {
      toast.error("Failed to save annual report");
      console.error(err);
    }
  };

  const columns = [
    {
      name: "Year",
      selector: (row) => row.year,
      sortable: true,
      width: "100px",
    },
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
      wrap: true,
    },
    {
      name: "Excerpt",
      selector: (row) => row.excerpt,
      sortable: false,
      wrap: true,
    },
    {
      name: "File",
      cell: (row) => (
        <div className="flex gap-2">
          <a
            href={row.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
            title="View"
          >
            <Eye size={18} />
          </a>
          <a
            href={row.link}
            download
            className="text-green-600 hover:text-green-800"
            title="Download"
          >
            <Download size={18} />
          </a>
        </div>
      ),
      width: "100px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id || row._id)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
      width: "120px",
    },
  ];

  return (
    <div className="p-6 w-full">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Annual Reports</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Plus size={18} /> Add Report
        </button>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        pagination
        responsive
        striped
        highlightOnHover
        progressPending={isLoading}
        progressComponent={
          <div className="p-4">
            <Loader2 className="animate-spin text-blue-500" size={24} />
          </div>
        }
        noDataComponent="No annual reports available"
      />

      <ReportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        report={editingReport}
      />
    </div>
  );
};

export default AnnualReportsTable;
