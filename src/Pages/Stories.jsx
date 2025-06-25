import DataTable from "react-data-table-component";
import clsx from "clsx";
import {
  Pencil,
  Plus,
  Edit,
  Trash2,
  Loader,
  AlignLeft,
  Upload,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from "../Api"; // your API file path

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dinb6qtto/image/upload";
const UPLOAD_PRESET = "fuelme";

const TABS = ["Articles", "Gallery", "Blogs"];

// Reusable Modal for Articles, Gallery, Blogs
const ContentModal = ({ isOpen, onClose, onSubmit, content, contentType }) => {
  // common fields
  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    img: "",
    image: "",
    excerpt: "",
    story: "",
    quote_person: "",
    quote_text: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (content) {
      setFormData(content);
      setImageFile(null);
    } else {
      setFormData({
        title: "",
        subTitle: "",
        img: "",
        image: "",
        excerpt: "",
        story: "",
        quote_person: "",
        quote_text: "",
      });
      setImageFile(null);
    }
  }, [content]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const uploadToCloudinary = async (imageFile) => {
    if (!imageFile) return "";

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

    // Upload img and image (if applicable)
    const uploadedImgUrl = await uploadToCloudinary(
      imageFile || formData.img || formData.image
    );

    if (!uploadedImgUrl) {
      setIsLoading(false);
      return;
    }

    // Prepare data depending on contentType (gallery may only have img)
    let dataToSubmit = { ...formData };
    if (contentType === "Gallery") {
      dataToSubmit.img = uploadedImgUrl;
      delete dataToSubmit.image; // This completely removes the image property
    } else {
      dataToSubmit.img = uploadedImgUrl;
      dataToSubmit.image = uploadedImgUrl;
    }
    await onSubmit(dataToSubmit);
    setIsLoading(false);
    toast.success("Entry made successfully!!");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
      <ToastContainer />

      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-2xl max-h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {content ? `Edit ${contentType}` : `Add ${contentType}`}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full border p-2 rounded"
            required
          />
          <input
            name="subTitle"
            value={formData.subTitle}
            onChange={handleChange}
            placeholder="Sub Title"
            className="w-full border p-2 rounded"
          />
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Excerpt"
            className="w-full border p-2 rounded"
          />
          <textarea
            name="story"
            value={formData.story}
            onChange={handleChange}
            placeholder="Story"
            className="w-full border p-2 rounded"
          />
          <input
            name="quote_person"
            value={formData.quote_person}
            onChange={handleChange}
            placeholder="Quote Person"
            className="w-full border p-2 rounded"
          />
          <textarea
            name="quote_text"
            value={formData.quote_text}
            onChange={handleChange}
            placeholder="Quote Text"
            className="w-full border p-2 rounded"
          />
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

          {(formData.img || formData.image) && (
            <img
              src={formData.img || formData.image}
              alt="Preview"
              className="w-24 h-24 object-cover rounded mt-2"
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

export default function ContentTable({
  contentType = "Articles",
  fetchAll,
  createItem,
  updateItem,
  deleteItem,
}) {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const timeout = setTimeout(() => {
        setLoading(false);
        toast.warn("Loading is taking longer than expected");
      }, 5000); // 10 second timeout

      const res = await fetchAll();
      clearTimeout(timeout);
      setData(res.data);
    } catch (error) {
      toast.error(
        `Failed to load ${contentType.toLowerCase()}: ${error.message}`
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Loading data for:", contentType); // Debug log
    loadData().catch((err) => {
      console.error("Error in loadData:", err);
      setLoading(false);
    });
  }, [contentType]); // Remove fetchAll from dependencies if it's stable

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${contentType.toLowerCase()}?`)) return;
    try {
      await deleteItem(id);
      toast.success(`${contentType} deleted successfully`);
      loadData();
    } catch (error) {
      toast.error(
        `Failed to delete ${contentType.toLowerCase()}: ${error.message}`
      );
    }
  };
  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      if (editingItem) {
        await updateItem(editingItem.id, formData);
        toast.success(`${contentType} updated successfully`);
      } else {
        const response = await createItem(formData);
        console.log("Creation response:", response); // Add this for debugging
        toast.success(`${contentType} created successfully`);
      }
    } catch (error) {
      console.error("Submission error:", error); // Add this for debugging
      toast.error(
        `Failed to save ${contentType.toLowerCase()}: ${error.message}`
      );
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditingItem(null);

      loadData(); // Move this inside finally to ensure it runs after success or error
    }
  };
  const columns = [
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
      wrap: true,
    },
    {
      name: "Description",
      selector: (row) => row.description || "-",
      wrap: true,
      grow: 2,
    },
    {
      name: "Image",
      cell: (row) =>
        row.image ? (
          <img
            src={row.image}
            alt={row.title}
            className="w-16 h-10 object-cover rounded"
          />
        ) : (
          "-"
        ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
            aria-label={`Edit ${contentType}`}
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-800"
            aria-label={`Delete ${contentType}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add {contentType}
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        pagination
        highlightOnHover
        dense
        persistTableHead
        noHeader
      />

      <ContentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        content={editingItem}
        contentType={contentType}
      />
    </div>
  );
}

export function ContentManagerTabs() {
  const [activeTab, setActiveTab] = useState("Articles");

  const getContentProps = (tab) => {
    switch (tab) {
      case "Articles":
        return {
          contentType: "Articles",
          fetchAll: getArticles,
          createItem: createArticle,
          updateItem: updateArticle,
          deleteItem: deleteArticle,
        };
      case "Blogs":
        return {
          contentType: "Blogs",
          fetchAll: getBlogs,
          createItem: createBlog,
          updateItem: updateBlog,
          deleteItem: deleteBlog,
        };
      case "Gallery":
        return {
          contentType: "Gallery",
          fetchAll: getGalleryItems,
          createItem: createGalleryItem,
          updateItem: updateGalleryItem,
          deleteItem: deleteGalleryItem,
        };
      default:
        return {
          contentType: "Articles",
          fetchAll: getArticles,
          createItem: createArticle,
          updateItem: updateArticle,
          deleteItem: deleteArticle,
        };
    }
  };
  return (
    <div className=" w-full p-6">
      <ToastContainer />

      <div className="flex space-x-4 mb-6">
        {["Articles", "Blogs", "Gallery"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Articles" && (
        <ContentTable {...getContentProps("Articles")} />
      )}
      {activeTab === "Blogs" && <ContentTable {...getContentProps("Blogs")} />}
      {activeTab === "Gallery" && (
        <ContentTable {...getContentProps("Gallery")} />
      )}
    </div>
  );
}
