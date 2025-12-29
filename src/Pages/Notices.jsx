import React, { useEffect, useState } from "react";
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
  GripVertical,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// dnd-kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// API
import {
  getNotices,
  deleteNotice,
  updateNotice,
  createNotice,
  updateNoticesDisplayOrder,
} from "../Api";

const UPLOAD_PRESET = "bestpointgh";

/* -----------------------------
   Sortable Row Component
------------------------------ */
const SortableTableRow = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? "#f3f4f6" : "white",
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="hover:bg-gray-50 border-b"
    >
      <td className="p-2 w-12">
        <div
          {...listeners}
          className="cursor-move p-1 hover:bg-gray-200 rounded flex justify-center"
          title="Drag to reorder"
        >
          <GripVertical size={16} className="text-gray-400" />
        </div>
      </td>
      {children}
    </tr>
  );
};


const NoticeModal = ({ isOpen, onClose, onSubmit, notice }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Security",
    image: "",
    document: "",
    links: [],
  });

  const [documentFile, setDocumentFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (notice) {
      setFormData({
        ...notice,
        document: notice.document || notice.file_url || notice.document || "",
        links: notice.links || [],
      });
      setImageFile(null);
      setDocumentFile(null);
    } else {
      setFormData({
        title: "",
        description: "",
        category: "Security",
        image: "",
        document: "",
        links: [],
      });
      setImageFile(null);
      setDocumentFile(null);
    }
  }, [notice]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setDocumentFile(file);
  };

  // Links
  const handleLinkChange = (index, value) => {
    const updatedLinks = [...(formData.links || [])];
    updatedLinks[index] = value;
    setFormData({ ...formData, links: updatedLinks });
  };

  const addLink = () => {
    setFormData({ ...formData, links: [...(formData.links || []), ""] });
  };

  const removeLink = (index) => {
    const updatedLinks = (formData.links || []).filter((_, i) => i !== index);
    setFormData({ ...formData, links: updatedLinks });
  };

  const uploadToCloudinary = async (file, resourceType = "image") => {
    if (!file) return null;
    if (typeof file === "string") return file;

    const maxSize = resourceType === "raw" ? 15 * 1024 * 1024 : 12 * 1024 * 1024;
    if (file?.size > maxSize) {
      toast.error(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
      return null;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dvadtratp/${resourceType}/upload`,
        data
      );
      return res.data.secure_url;
    } catch (err) {
      console.error(`Upload error (${resourceType}):`, err.response?.data || err.message);
      toast.error(
        `Upload failed: ${resourceType} - ${
          err.response?.data?.error?.message || "Unknown error"
        }`
      );
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // image required in your original logic
    const image = await uploadToCloudinary(imageFile || formData.image, "image");
    const document = documentFile
      ? await uploadToCloudinary(documentFile, "raw")
      : formData.document;

    if (!image) {
      setIsLoading(false);
      return;
    }

    const cleanedLinks = (formData.links || [])
      .map((l) => (typeof l === "string" ? l.trim() : ""))
      .filter(Boolean);

    const dataToSubmit = {
      ...formData,
      image,
      document,
      links: cleanedLinks,
    };

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
              value={formData.title || ""}
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
              value={formData.category || "Security"}
              onChange={handleChange}
              className="w-full border p-2 pl-8 rounded"
              required
            >
              <option value="BOG Notices">BOG Notices</option>
              <option value="Finance">Finance</option>
              <option value="Security">Security</option>
            </select>
          </div>

          <div className="relative">
            <AlignLeft className="absolute left-2 top-2.5 text-gray-400" size={18} />
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Description"
              className="w-full border p-2 pl-8 rounded"
              required
            />
          </div>

          {/* Links */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related Links
            </label>

            <div className="space-y-2">
              {(formData.links || []).map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="px-3 bg-red-500 text-white rounded"
                    aria-label="Remove link"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLink}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              + Add another link
            </button>
          </div>

          {/* Image */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related Image
            </label>
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
          </div>

          {/* Document */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related File (PDF, DOC, DOCX)
            </label>
            <div className="relative">
              <Upload className="absolute left-2 top-2.5 text-gray-400" size={18} />
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleDocumentChange}
                className="w-full border p-2 pl-8 rounded"
              />
            </div>

            {formData.document && typeof formData.document === "string" && (
              <a
                href={formData.document}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm underline mt-2 inline-block"
              >
                View Attached Document
              </a>
            )}
          </div>

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
                { "opacity-70 cursor-not-allowed": isLoading }
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


const NoticesWithOrdering = () => {
  const [notices, setNotices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await getNotices();

      // Prefer display_order if present, otherwise fallback to id desc
      const data = Array.isArray(res.data) ? res.data : [];
      const sorted = [...data].sort((a, b) => {
        const ao = a.display_order ?? null;
        const bo = b.display_order ?? null;

        if (ao != null && bo != null) return ao - bo;
        if (ao != null && bo == null) return -1;
        if (ao == null && bo != null) return 1;

        // fallback
        return (b.id ?? 0) - (a.id ?? 0);
      });

      setNotices(sorted);
    } catch (err) {
      toast.error("Failed to fetch notices");
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleAdd = () => {
    setEditingNotice(null);
    setModalOpen(true);
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    try {
      await deleteNotice(id);
      toast.success("Notice deleted");
      fetchNotices();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingNotice) {
        await updateNotice(editingNotice.id, data);
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

  // Pagination derived
  const totalPages = Math.ceil(notices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = notices.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

   
    const oldIndex = currentItems.findIndex(
      (n) => n.id.toString() === active.id.toString()
    );
    const newIndex = currentItems.findIndex(
      (n) => n.id.toString() === over.id.toString()
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedPage = arrayMove(currentItems, oldIndex, newIndex);

    // merge back into full list preserving other pages
    const newNotices = [...notices];
    for (let i = 0; i < reorderedPage.length; i++) {
      newNotices[startIndex + i] = reorderedPage[i];
    }

    // compute display_order across full list (1..N)
    const withOrder = newNotices.map((n, index) => ({
      ...n,
      display_order: index + 1,
    }));

    setNotices(withOrder);

    try {
      await updateNoticesDisplayOrder({
        items: withOrder.map((n) => ({
          id: n.id,
          display_order: n.display_order,
        })),
      });

      toast.success("Order updated sucessfully!!!");
    } catch (err) {
      console.error("Failed to update notice order:", err);
      toast.error("Failed to save order. Reverting...");
      fetchNotices();
    }
  };

  return (
    <div className="p-6">
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={currentItems.map((n) => n.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                <div className="overflow-x-auto max-w-[calc(100vw-300px)] overflow-scroll">
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
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Links
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((notice) => (
                        <SortableTableRow key={notice.id} id={notice.id.toString()}>
                          {/* Image */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {notice?.image ? (
                              <img
                                src={notice.image}
                                alt={notice.title}
                                className="w-20 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="text-gray-400 text-sm">No image</div>
                            )}
                          </td>

                          {/* Title */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {notice?.title || ""}
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {notice?.category || ""}
                          </td>

                          {/* Description */}
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            <div className="truncate" title={notice?.description || ""}>
                              {notice?.description || ""}
                            </div>
                          </td>

                          {/* Links */}
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            {Array.isArray(notice.links) && notice.links.length > 0 ? (
                              <div className="space-y-1">
                                {notice.links.slice(0, 2).map((l, idx) => (
                                  <div key={idx} className="truncate" title={l}>
                                    {l}
                                  </div>
                                ))}
                                {notice.links.length > 2 && (
                                  <div className="text-xs text-gray-400">
                                    +{notice.links.length - 2} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">No links</div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(notice);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notice.id);
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
                      Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(endIndex, notices.length)}
                      </span>{" "}
                      of <span className="font-medium">{notices.length}</span> results
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
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
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

      <NoticeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        notice={editingNotice}
      />
    </div>
  );
};

export default NoticesWithOrdering;
