import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  Pencil,
  Trash2,
  Plus,
  Type,
  FileText,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAwards, deleteAward, updateAward, createAward } from "../Api";
import axios from "axios";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dinb6qtto/image/upload";
const UPLOAD_PRESET = "fuelme";

const AwardModal = ({ isOpen, onClose, onSubmit, award }) => {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    image: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  React.useEffect(() => {
    if (award) {
      setFormData(award);
      setImageFile(null); // Reset any previous selected file
    } else {
      setFormData({ title: "", excerpt: "", image: "" });
      setImageFile(null);
    }
  }, [award]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const uploadToCloudinary = async (imageFile) => {
    if (typeof imageFile === "string") {
      // Already a URL, no need to upload again
      return imageFile;
    }
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.secure_url;
    } catch (error) {
      toast.error("Image upload failed.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const imageUrl = await uploadToCloudinary(imageFile || formData.image);
    if (!imageUrl) {
      setIsSaving(false);
      return;
    }

    const dataToSubmit = { ...formData, image: imageUrl };
    await onSubmit(dataToSubmit);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {award ? "Edit" : "Add"} Award
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Type className="absolute left-2 top-2.5 text-gray-400" size={18} />
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
            <FileText
              className="absolute left-2 top-2.5 text-gray-400"
              size={18}
            />
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Excerpt"
              className="w-full border p-2 pl-8 rounded"
              required
            />
          </div>

          <div className="relative">
            <ImageIcon
              className="absolute left-2 top-2.5 text-gray-400"
              size={18}
            />
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
              className="w-16 h-16 object-cover mt-2"
            />
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
const AwardsTable = () => {
  const [awards, setAwards] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState(null);

  const fetchAwards = async () => {
    try {
      const res = await getAwards();
      setAwards(res.data);
    } catch (err) {
      toast.error("Failed to fetch awards");
      console.error("Failed to fetch awards", err);
    }
  };

  React.useEffect(() => {
    fetchAwards();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this award?")) {
      try {
        await deleteAward(id);
        toast.success("Award deleted");
        fetchAwards();
      } catch (err) {
        toast.error("Failed to delete award");
        console.error(err);
      }
    }
  };

  const handleEdit = (award) => {
    setEditingAward(award);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAward(null);
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingAward) {
        await updateAward(editingAward.id || editingAward._id, data);
        toast.success("Award updated");
      } else {
        await createAward(data);
        toast.success("Award created");
      }
      fetchAwards();
    } catch (err) {
      toast.error("Failed to save award");
      console.error(err);
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
      name: "Excerpt",
      selector: (row) => row.excerpt,
      sortable: false,
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
        <h1 className="text-2xl font-bold">Awards</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Plus size={18} /> Add Award
        </button>
      </div>

      <DataTable
        columns={columns}
        data={awards}
        pagination
        responsive
        striped
        highlightOnHover
        noDataComponent="No awards available"
      />

      <AwardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        award={editingAward}
      />
    </div>
  );
};

export default AwardsTable;
