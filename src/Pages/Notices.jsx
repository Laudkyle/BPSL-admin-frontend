import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import clsx from "clsx";
import {
  Pencil,
  Trash2,
  Plus,
  Loader,
  Upload,
  AlignLeft,
  Layers,
  BookText,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import {
  getNotices,
  deleteNotice,
  updateNotice,
  createNotice,
} from "../Api"; // Assumed

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dinb6qtto/image/upload";
const UPLOAD_PRESET = "fuelme";

const NoticeModal = ({ isOpen, onClose, onSubmit, notice }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "announcement",
    image: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (notice) {
      setFormData(notice);
      setImageFile(null);
    } else {
      setFormData({
        title: "",
        description: "",
        category: "announcement",
        image: "",
      });
      setImageFile(null);
    }
  }, [notice]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const uploadToCloudinary = async (file) => {
    if (typeof file === "string") return file;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    try {
      const res = await axios.post(CLOUDINARY_URL, data);
      return res.data.secure_url;
    } catch (err) {
      toast.error("Image upload failed");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const image = await uploadToCloudinary(imageFile || formData.image);
    if (!image) {
      setIsLoading(false);
      return;
    }
    const dataToSubmit = { ...formData, image };
    await onSubmit(dataToSubmit);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {notice ? "Edit" : "Add"} Notice
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <BookText className="absolute left-2 top-2.5 text-gray-400" size={18} />
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
              className="w-full border p-2 pl-8 rounded"
              required
            />
          </div>

          <div className="relative">
            <Layers className="absolute left-2 top-2.5 text-gray-400" size={18} />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border p-2 pl-8 rounded"
              required
            >
              <option value="announcement">Announcement</option>
              <option value="news">News</option>
              <option value="update">Update</option>
            </select>
          </div>

          <div className="relative">
            <AlignLeft className="absolute left-2 top-2.5 text-gray-400" size={18} />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full border p-2 pl-8 rounded"
              required
            />
          </div>

          <div className="relative">
            <Upload className="absolute left-2 top-2.5 text-gray-400" size={18} />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border p-2 pl-8 rounded"
            />
          </div>

          {formData.image && typeof formData.image === "string" && (
            <img
              src={formData.image}
              alt="Preview"
              className="w-16 h-16 object-cover mt-2 rounded"
            />
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={clsx(
                "px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2",
                {
                  "opacity-70 cursor-not-allowed": isLoading,
                }
              )}
              disabled={isLoading}
            >
              {isLoading && <Loader size={18} className="animate-spin" />}
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NoticesTable = () => {
  const [notices, setNotices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  const fetchNotices = async () => {
    try {
      const res = await getNotices();
      setNotices(res.data);
    } catch (err) {
      toast.error("Failed to fetch notices");
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        await deleteNotice(id);
        toast.success("Notice deleted");
        fetchNotices();
      } catch {
        toast.error("Delete failed");
      }
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingNotice(null);
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingNotice) {
        await updateNotice(editingNotice.id || editingNotice._id, data);
        toast.success("Updated successfully");
      } else {
        await createNotice(data);
        toast.success("Created successfully");
      }
      fetchNotices();
    } catch {
      toast.error("Failed to save notice");
    }
  };

  const columns = [
    {
      name: "Image",
      selector: (row) => row.image,
      cell: (row) => (
        <img
          src={row.image}
          alt={row.title}
          className="w-12 h-12 object-contain"
        />
      ),
      width: "100px",
    },
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
      wrap: true,
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id || row._id)}
            className="text-red-600 hover:text-red-800"
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
        <h1 className="text-2xl font-bold">Notices</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Plus size={18} /> Add Notice
        </button>
      </div>

      <DataTable
        columns={columns}
        data={notices}
        pagination
        responsive
        striped
        highlightOnHover
        noDataComponent="No notices available"
      />

      <NoticeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        notice={editingNotice}
      />
    </div>
  );
};

export default NoticesTable;
