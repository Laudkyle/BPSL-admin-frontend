import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useForm } from "react-hook-form";
import { Edit, Tag, FileText, Image, Star } from "lucide-react";
import api from "../Api";
import { Plus, Trash2, Pencil } from "lucide-react";
import InputComponent from "../Components/InputComponent";

// Cloudinary configuration
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dinb6qtto/image/upload";
const UPLOAD_PRESET = "fuelme";
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB in bytes

function Products() {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const { 
    register, 
    handleSubmit, 
    reset, 
    getValues, 
    setValue, 
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: "",
      category_id: "",
      subcategory_id: "",
      description: "",
      features: [],
      featured: false,
      image: null
    },
  });

  // Watch image file for preview and category for subcategory filtering
  const imageFile = watch("image");
  const watchedCategoryId = watch("category_id");

  // Generate image preview when file is selected
  useEffect(() => {
    if (imageFile && imageFile[0]) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(imageFile[0]);
    } else if (editingProduct?.image && !imageFile) {
      setImagePreview(editingProduct.image);
    } else if (!imageFile) {
      setImagePreview(null);
    }
  }, [imageFile, editingProduct]);

  // Update selectedCategoryId when category changes and reset subcategory
  useEffect(() => {
    if (watchedCategoryId !== selectedCategoryId) {
      setSelectedCategoryId(watchedCategoryId);
      if (!editingProduct || watchedCategoryId !== editingProduct.category_id) {
        setValue("subcategory_id", "");
      }
    }
  }, [watchedCategoryId, selectedCategoryId, setValue, editingProduct]);

  const fetchProducts = async () => {
    try {
      const res = await api.getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await api.getSubcategories();
      setSubcategories(res.data);
    } catch (error) {
      console.error("Error fetching subcategories", error);
    }
  };

  const toggleFeatured = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus ? 0 : 1;

      if (newStatus === 1) {
        const featuredCount = products.filter((p) => p.featured).length;
        if (featuredCount >= 5) {
          const confirm = window.confirm(
            "Only 5 products can be featured at a time. The oldest featured product will be unfeatured. Continue?"
          );
          if (!confirm) return;
        }
      }

      await api.updateProductFeaturedStatus(id, { featured: newStatus });
      fetchProducts();
    } catch (error) {
      console.error("Error updating featured status", error);
      alert("Error updating featured status: " + error.message);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    if (!file) return null;

    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      alert("Image size cannot exceed 4MB");
      throw new Error("Image size exceeds 4MB limit");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      setIsUploading(true);
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      let imageUrl = editingProduct?.image || null;

      // Upload new image if provided
      if (data.image && data.image[0]) {
        imageUrl = await uploadImageToCloudinary(data.image[0]);
      }

      const productData = {
        title: data.title,
        category_id: parseInt(data.category_id),
        subcategory_id: parseInt(data.subcategory_id),
        description: data.description,
        features: JSON.stringify(data.features || []),
        featured: data.featured ? 1 : 0,
        image: imageUrl,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData);
      } else {
        await api.createProduct(productData);
      }

      fetchProducts();
      closeModal();
    } catch (error) {
      console.error("Error saving product", error);
      alert("Error saving product: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product", error);
        alert("Error deleting product: " + error.message);
      }
    }
  };

  const openAddModal = () => {
    setModalOpen(true);
    setEditingProduct(null);
    setSelectedCategoryId("");
    setImagePreview(null);
    reset({
      title: "",
      category_id: "",
      subcategory_id: "",
      description: "",
      features: [],
      featured: false,
      image: null
    });
  };

  const openEditModal = (row) => {
    setEditingProduct(row);
    setModalOpen(true);
    
    // Parse features properly
    let parsedFeatures = [];
    try {
      if (row.features) {
        parsedFeatures = typeof row.features === "string" 
          ? JSON.parse(row.features) 
          : Array.isArray(row.features) 
          ? row.features 
          : [];
      }
    } catch (e) {
      console.error("Error parsing features:", e);
      parsedFeatures = [];
    }

    reset({
      title: row.title || "",
      description: row.description || "",
      features: parsedFeatures,
      category_id: row.category_id?.toString() || "",
      subcategory_id: row.subcategory_id?.toString() || "",
      featured: Boolean(row.featured),
      image: null
    });
    
    setSelectedCategoryId(row.category_id?.toString() || "");
    setImagePreview(row.image || null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setSelectedCategoryId("");
    setImagePreview(null);
    reset();
  };

  const addFeature = () => {
    const current = getValues("features") || [];
    setValue("features", [...current, ""]);
  };

  const removeFeature = (index) => {
    const newFeatures = getValues("features").filter((_, i) => i !== index);
    setValue("features", newFeatures);
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...getValues("features")];
    newFeatures[index] = value;
    setValue("features", newFeatures);
  };

  const columns = [
    { name: "Title", selector: (row) => row.title, sortable: true },
    { name: "Category", selector: (row) => row.category },
    { name: "Subcategory", selector: (row) => row.subcategory },
    {
      name: "Image",
      cell: (row) =>
        row.image ? (
          <img
            src={row.image}
            alt={row.title}
            className="w-10 h-10 object-cover rounded"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
            <Image size={16} className="text-gray-400" />
          </div>
        ),
      width: "80px",
    },
    {
      name: "Featured",
      cell: (row) => (
        <button
          onClick={() => toggleFeatured(row.id, row.featured)}
          className={`p-1 rounded-full ${
            row.featured ? "text-yellow-500" : "text-gray-400"
          }`}
          title={row.featured ? "Unmark as featured" : "Mark as featured"}
        >
          <Star size={18} fill={row.featured ? "currentColor" : "none"} />
        </button>
      ),
      width: "100px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="space-x-2">
          <button
            className="text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50"
            onClick={() => openEditModal(row)}
          >
            <Pencil size={18} />
          </button>
          <button
            className="text-red-600 px-2 py-1 rounded hover:bg-red-50"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
      width: "120px",
    },
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubcategories();
  }, []);

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Products</h2>
        <button
          onClick={openAddModal}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          Add Product
        </button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        pagination
        highlightOnHover
        responsive
      />

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Title *</label>
                  <input
                    type="text"
                    placeholder="Product Title"
                    {...register("title", { required: "Title is required" })}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium">Category *</label>
                  <select
                    {...register("category_id", { required: "Category is required" })}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium">Subcategory *</label>
                  <select
                    {...register("subcategory_id", { required: "Subcategory is required" })}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedCategoryId}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories
                      .filter((sub) => sub.category_id === parseInt(selectedCategoryId))
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                  {errors.subcategory_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.subcategory_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium">Image (max 4MB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    {...register("image")}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Description *</label>
                <textarea
                  placeholder="Product Description"
                  rows={3}
                  {...register("description", { required: "Description is required" })}
                  className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  {...register("featured")}
                  className="mr-2"
                />
                <label htmlFor="featured" className="font-medium">Featured Product</label>
              </div>

              {/* Features Input - Dynamic Field */}
              <div>
                <label className="block font-medium mb-2">Features</label>
                {watch("features")?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Feature ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                >
                  <Plus size={16} className="mr-1" /> Add Feature
                </button>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  disabled={isUploading}
                >
                  {isUploading
                    ? "Uploading..."
                    : editingProduct
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;