import React, { useEffect, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import { Plus, Trash2, Pencil,  X } from "lucide-react";
import api from "../Api";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [form, setForm] = useState({ id: null, name: "" });
  const [subForm, setSubForm] = useState({
    id: null,
    name: "",
    category_id: "",
  });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const subcategoryFormRef = useRef(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, subRes] = await Promise.all([
        api.getCategories(),
        api.getSubcategories(),
      ]);
      setCategories(catRes.data);
      setSubcategories(subRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.updateCategory(form.id, { name: form.name });
      } else {
        await api.createCategory({ name: form.name });
      }
      setForm({ id: null, name: "" });
      setShowCategoryForm(false);
      await fetchData();
    } catch (error) {
      console.error("Operation failed:", error);
    }
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: subForm.name,
        category_id: subForm.category_id,
      };
      if (subForm.id) {
        await api.updateSubcategory(subForm.id, data);
      } else {
        await api.createSubcategory(data);
      }
      setSubForm({ id: null, name: "", category_id: "" });
      setShowSubcategoryForm(false);
      await fetchData();
    } catch (error) {
      console.error("Operation failed:", error);
    }
  };

  const editCategory = (cat) => {
    setForm(cat);
    setShowCategoryForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteCategory = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? All associated subcategories will also be removed."
      )
    ) {
      try {
        await api.deleteCategory(id);
        await fetchData();
      } catch (error) {
        console.error("Deletion failed:", error);
      }
    }
  };

  const editSubcategory = (sub) => {
    setShowSubcategoryForm(true)
    setSubForm(sub);
    subcategoryFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const deleteSubcategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await api.deleteSubcategory(id);
        await fetchData();
      } catch (error) {
        console.error("Deletion failed:", error);
      }
    }
  };

  const toggleCategoryExpand = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const categoryColumns = [
    {
      name: "NAME",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center">
          <button
            onClick={() => toggleCategoryExpand(row.id)}
            className="mr-2 text-gray-500 hover:text-gray-700"
          >
          
          </button>
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    {
      name: "ACTIONS",
      cell: (row) => (
        <div className="flex gap-3 items-center">
          <button
            onClick={() => editCategory(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            aria-label="Edit category"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => deleteCategory(row.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
            aria-label="Delete category"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => {
              setSubForm({ id: null, name: "", category_id: row.id });
              setShowSubcategoryForm(true); // Show subcategory form
              subcategoryFormRef.current?.scrollIntoView({
                behavior: "smooth",
              });
            }}
            className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors flex items-center gap-1"
          >
            <Plus size={16} /> Add Subcategory
          </button>
        </div>
      ),
      width: "220px",
    },
  ];

  const subcategoryColumns = [
    { name: "NAME", selector: (row) => row.name, sortable: true },
    {
      name: "DESCRIPTION",
      selector: (row) => {
        const category = subcategories.find((cat) => cat.id === row.id);
        return category ? category.description : "—";
      },
      sortable: true,
    },
    {
      name: "ACTIONS",
      cell: (row) => (
        <div className="flex gap-3">
          <button
            onClick={() => editSubcategory(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            aria-label="Edit subcategory"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => deleteSubcategory(row.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
            aria-label="Delete subcategory"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
      width: "120px",
    },
  ];

  const ExpandedCategoryRow = ({ data }) => {
    const categorySubs = subcategories.filter(
      (sub) => sub.category_id === data.id
    );

    return (
      <div className="px-16 py-4 bg-gray-50 border-t">
        {categorySubs.length > 0 ? (
          <DataTable
            columns={subcategoryColumns}
            data={categorySubs}
            noHeader
            dense
            customStyles={{
              headCells: {
                style: {
                  paddingLeft: "0",
                  fontWeight: "600",
                  color: "#4b5563",
                },
              },
              cells: {
                style: {
                  paddingLeft: "0",
                },
              },
            }}
          />
        ) : (
          <p className="text-gray-500 text-sm">
            No subcategories for this category
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 h-screen overflow-scroll w-full mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Category Management
        </h1>
        <button
          onClick={() => {
            setShowCategoryForm(!showCategoryForm);
            setForm({ id: null, name: "" });
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            showCategoryForm
              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {showCategoryForm ? (
            <>
              <X size={18} /> Cancel
            </>
          ) : (
            <>
              <Plus size={18} /> Add Category
            </>
          )}
        </button>
      </div>

      {/* Modal for Category Form */}
      {showCategoryForm && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-1/3">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {form.id ? "Edit Category" : "Create New Category"}
            </h3>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="categoryName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category Name
                </label>
                <input
                  id="categoryName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> {form.id ? "Update" : "Create"} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
        </div>
        <DataTable
          columns={categoryColumns}
          data={categories}
          noHeader
          pagination
          progressPending={isLoading}
          expandableRows
          expandableRowsComponent={ExpandedCategoryRow}
          customStyles={{
            headCells: {
              style: {
                paddingLeft: "0",
                fontWeight: "600",
                color: "#4b5563",
              },
            },
            cells: {
              style: {
                paddingLeft: "0",
              },
            },
          }}
        />
      </div>

      {/* Modal for Subcategory Form */}
      {showSubcategoryForm && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-1/3" ref={subcategoryFormRef}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {subForm.id ? "Edit Subcategory" : "Create New Subcategory"}
            </h3>
            <form onSubmit={handleSubcategorySubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="subcategoryName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subcategory Name
                </label>
                <input
                  id="subcategoryName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subcategory name"
                  value={subForm.name}
                  onChange={(e) =>
                    setSubForm({ ...subForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="categorySelect"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Category
                </label>
                <select
                  id="categorySelect"
                  value={subForm.category_id}
                  onChange={(e) =>
                    setSubForm({ ...subForm, category_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubcategoryForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> {subForm.id ? "Update" : "Create"}{" "}
                  Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
