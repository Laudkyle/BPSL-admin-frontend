import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import clsx from "clsx";
import {
  Pencil,
  Trash2,
  Plus,
  Loader,
  User,
  Briefcase,
  AlignLeft,
  Upload,
  Layers,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getTeamMembers,
  deleteTeamMember,
  updateTeamMember,
  createTeamMember,
} from "../Api"; // You already added these
import axios from "axios";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dinb6qtto/image/upload";
const UPLOAD_PRESET = "fuelme";

const TeamModal = ({ isOpen, onClose, onSubmit, team }) => {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    biography: "",
    category: "management",
    image_url: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (team) {
      setFormData(team);
      setImageFile(null);
    } else {
      setFormData({
        name: "",
        position: "",
        biography: "",
        category: "management",
        image_url: "",
      });
      setImageFile(null);
    }
  }, [team]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const uploadToCloudinary = async (imageFile) => {
    if (typeof imageFile === "string") return imageFile;

    const data = new FormData();
    data.append("file", imageFile);
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

    const image_url = await uploadToCloudinary(imageFile || formData.image_url);
    if (!image_url) {
      setIsLoading(false);
      return;
    }

    const dataToSubmit = { ...formData, image_url };
    await onSubmit(dataToSubmit);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {team ? "Edit" : "Add"} Team Member
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-2 top-2.5 text-gray-400" size={18} />
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full border p-2 pl-8 rounded"
              required
            />
          </div>

          <div className="relative">
            <Briefcase
              className="absolute left-2 top-2.5 text-gray-400"
              size={18}
            />
            <input
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Position"
              className="w-full border p-2 pl-8 rounded"
              required
            />
          </div>

          <div className="relative">
            <Layers
              className="absolute left-2 top-2.5 text-gray-400"
              size={18}
            />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border p-2 pl-8 rounded"
              required
            >
              <option value="management">Management</option>
              <option value="board of directors">Board of Directors</option>
              <option value="shareholders">Share Holders</option>
            </select>
          </div>

          <div className="relative">
            <AlignLeft
              className="absolute left-2 top-2.5 text-gray-400"
              size={18}
            />
            <textarea
              name="biography"
              value={formData.biography}
              onChange={handleChange}
              placeholder="Biography"
              className="w-full border p-2 pl-8 rounded"
              required
            />
          </div>

          <div className="relative">
            <Upload
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

          {formData.image_url && typeof formData.image_url === "string" && (
            <img
              src={formData.image_url}
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
              {isLoading ? <Loader size={18} className="animate-spin" /> : null}
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TeamsTable = () => {
  const [teams, setTeams] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  const fetchTeams = async () => {
    try {
      const res = await getTeamMembers();
      setTeams(res.data);
    } catch (err) {
      toast.error("Failed to fetch teams");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await deleteTeamMember(id);
        toast.success("Team member deleted");
        fetchTeams();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTeam(null);
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingTeam) {
        await updateTeamMember(editingTeam.id || editingTeam._id, data);
        toast.success("Updated successfully");
      } else {
        await createTeamMember(data);
        toast.success("Created successfully");
      }
      fetchTeams();
    } catch (err) {
      toast.error("Failed to save team member");
    }
  };

  const columns = [
    {
      name: "Image",
      selector: (row) => row.image_url,
      cell: (row) => (
        <img
          src={row.image_url}
          alt={row.name}
          className="w-12 h-12 object-contain"
        />
      ),
      width: "100px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Position",
      selector: (row) => row.position,
      sortable: true,
      wrap: true,
    },
    {
      name: "category",
      selector: (row) => row.category,
      sortable: true,
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
        <h1 className="text-2xl font-bold">Team Members</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Plus size={18} /> Add Member
        </button>
      </div>

      <DataTable
        columns={columns}
        data={teams}
        pagination
        responsive
        striped
        highlightOnHover
        noDataComponent="No team members available"
      />

      <TeamModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        team={editingTeam}
      />
    </div>
  );
};

export default TeamsTable;
