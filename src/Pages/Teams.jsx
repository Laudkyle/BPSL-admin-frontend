import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  GripVertical,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getTeamMembers,
  deleteTeamMember,
  updateTeamMember,
  createTeamMember,
  updateTeamDisplayOrder, // Add this API function
} from "../Api"; 
import axios from "axios";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dinb6qtto/image/upload";
const UPLOAD_PRESET = "fuelme";

// Sortable Row Component
const SortableTableRow = ({ id, children, isDragDisabled = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? '#f3f4f6' : 'transparent',
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} className="hover:bg-gray-50 border-b">
      <td className="p-2 w-12">
        {!isDragDisabled && (
          <div {...listeners} className="cursor-move p-1 hover:bg-gray-200 rounded flex justify-center">
            <GripVertical size={16} className="text-gray-400" />
          </div>
        )}
      </td>
      {children}
    </tr>
  );
};

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
  const [activeTab, setActiveTab] = useState("management");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTeams = async () => {
    try {
      const res = await getTeamMembers();
      // Sort by display_order if it exists
      const sortedTeams = Array.isArray(res.data) 
        ? res.data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        : [];
      setTeams(sortedTeams);
    } catch (err) {
      toast.error("Failed to fetch teams");
      setTeams([]);
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
      setModalOpen(false);
      setEditingTeam(null);
    } catch (err) {
      toast.error("Failed to save team member");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = filteredTeams.findIndex((item) => (item.id || item._id).toString() === active.id.toString());
    const newIndex = filteredTeams.findIndex((item) => (item.id || item._id).toString() === over.id.toString());

    if (oldIndex !== -1 && newIndex !== -1) {
      const newFilteredTeams = arrayMove(filteredTeams, oldIndex, newIndex);
      const updatedFilteredTeams = newFilteredTeams.map((item, index) => ({
        ...item,
        display_order: index + 1
      }));

      // Update the main teams array with the new order
      const updatedTeams = teams.map(team => {
        const updatedTeam = updatedFilteredTeams.find(ft => (ft.id || ft._id) === (team.id || team._id));
        return updatedTeam || team;
      });

      setTeams(updatedTeams);

      try {
        // Call API to update display order
        await updateTeamDisplayOrder({
          items: updatedFilteredTeams.map((item, index) => ({
            id: item.id || item._id,
            display_order: index + 1
          }))
        });

        toast.success("Order updated successfully");
        fetchTeams()
      } catch (error) {
        console.error('Failed to update display order:', error);
        toast.error("Failed to update order");
        fetchTeams(); // Revert to server state
      }
    }
  };

  // Filter members by active tab
  const filteredTeams = teams.filter(
    (member) => member.category === activeTab
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredTeams.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Reset to first page when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {["management", "board of directors", "shareholders"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-4 py-2 -mb-[2px] border-b-2 transition-all",
              activeTab === tab
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-blue-500"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {currentItems.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500">No team members in this category</p>
          </div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={currentItems.map(item => (item.id || item._id).toString())}
                strategy={verticalListSortingStrategy}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((team) => (
                        <SortableTableRow key={team.id || team._id} id={(team.id || team._id).toString()}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img
                              src={team.image_url}
                              alt={team.name}
                              className="w-12 h-12 object-contain rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {team.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {team.position}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {team.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(team);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(team.id || team._id);
                                }}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </SortableTableRow>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SortableContext>
            </DndContext>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{startIndex + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(endIndex, filteredTeams.length)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{filteredTeams.length}</span>
                      {' '}results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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