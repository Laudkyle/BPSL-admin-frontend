import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useForm } from "react-hook-form";
import { Edit, Tag, FileText, Image, Star } from "lucide-react";
import api from "../Api";
import { Plus, Trash2, Pencil } from "lucide-react";
import InputComponent from "../Components/InputComponent";

function Products() {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const { register, handleSubmit, reset, getValues, setValue } = useForm();

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
    
    // Check if we're trying to feature a 6th product
    if (newStatus === 1) {
      const featuredCount = products.filter(p => p.featured).length;
      if (featuredCount >= 5) {
        const confirm = window.confirm(
          'Only 5 products can be featured at a time. The oldest featured product will be unfeatured. Continue?'
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

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category_id", data.category_id);
      formData.append("subcategory_id", data.subcategory_id);
      formData.append("description", data.description);
      formData.append("features", JSON.stringify(data.features || []));
      formData.append("featured", data.featured ? 1 : 0);

      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }

      fetchProducts();
      reset();
      setModalOpen(false);
      setEditingProduct(null);
      setSelectedCategoryId(null);
    } catch (error) {
      console.error("Error saving product", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product", error);
      }
    }
  };

  const columns = [
    { name: "Title", selector: (row) => row.title, sortable: true },
    { name: "Category", selector: (row) => row.category },
    { name: "Subcategory", selector: (row) => row.subcategory },
    { 
      name: "Featured", 
      cell: (row) => (
        <button
          onClick={() => toggleFeatured(row.id, row.featured)}
          className={`p-1 rounded-full ${row.featured ? 'text-yellow-500' : 'text-gray-400'}`}
          title={row.featured ? "Unmark as featured" : "Mark as featured"}
        >
          <Star size={18} fill={row.featured ? "currentColor" : "none"} />
        </button>
      ),
      width: '100px'
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="space-x-2">
          <button
            className="text-indigo-600 px-2 py-1 rounded"
            onClick={() => {
              setEditingProduct(row);
              setModalOpen(true);
              reset({
                title: row.title,
                description: row.description,
                features:
                  typeof row.features === "string"
                    ? JSON.parse(row.features)
                    : row.features || [],
                category_id: row.category_id,
                subcategory_id: row.subcategory_id,
                featured: row.featured
              });
              setSelectedCategoryId(row.category_id);
            }}
          >
            <Pencil size={18} />
          </button>
          <button
            className="text-red-600 px-2 py-1 rounded"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
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
          onClick={() => {
            setModalOpen(true);
            setEditingProduct(null);
            reset();
            setSelectedCategoryId(null);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
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
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-lg p-6 w-full max-w-xl space-y-4"
            encType="multipart/form-data"
          >
            <h3 className="text-lg font-semibold">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <InputComponent
                label="Title"
                name="title"
                placeholder="Product Title"
                icon={Edit}
                {...register("title")}
              />

              <div>
                <label className="block mb-1">Category</label>
                <select
                  {...register("category_id")}
                  className="border rounded px-3 py-2 w-full"
                  onChange={(e) => {
                    const categoryId = parseInt(e.target.value);
                    setSelectedCategoryId(categoryId);
                    setValue("subcategory_id", "");
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Subcategory</label>
                <select
                  {...register("subcategory_id")}
                  className="border rounded px-3 py-2 w-full"
                  disabled={!selectedCategoryId}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Subcategory
                  </option>
                  {subcategories
                    .filter((sub) => sub.category_id === selectedCategoryId)
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("image")}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </div>

            <InputComponent
              label="Description"
              name="description"
              placeholder="Product Description"
              icon={FileText}
              rows={3}
              {...register("description")}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                {...register("featured")}
                className="mr-2"
              />
              <label htmlFor="featured">Featured Product</label>
            </div>

            {/* Features Input - Dynamic Field */}
            <div>
              <label className="block font-medium mb-1">Features</label>
              {getValues("features")?.length > 0 &&
                getValues("features").map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...getValues("features")];
                        newFeatures[index] = e.target.value;
                        setValue("features", newFeatures);
                      }}
                      className="flex-1 border rounded px-3 py-2"
                      placeholder={`Feature ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newFeatures = getValues("features").filter(
                          (_, i) => i !== index
                        );
                        setValue("features", newFeatures);
                      }}
                      className="text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

              <button
                type="button"
                onClick={() => {
                  const current = getValues("features") || [];
                  setValue("features", [...current, ""]);
                }}
                className="flex items-center text-sm text-blue-600 mt-1"
              >
                <Plus size={16} className="mr-1" /> Add Feature
              </button>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {editingProduct ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Products;