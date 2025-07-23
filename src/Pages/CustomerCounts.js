import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Pencil, Trash2, Plus, Calendar, Hash, Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../Api";

const CustomerCountModal = ({ isOpen, onClose, onSubmit, entry }) => {
  const [formData, setFormData] = useState({ date: "", number: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (entry) setFormData(entry);
    else setFormData({ date: "", number: "" });
  }, [entry]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSubmit(formData);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {entry ? "Edit" : "Add"} Customer Count
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Calendar
              className="absolute left-2 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border p-2 pl-8 rounded"
            />
          </div>

          <div className="relative">
            <Hash className="absolute left-2 top-2.5 text-gray-400" size={18} />
            <input
              type="number"
              name="number"
              value={formData.number}
              onChange={handleChange}
              placeholder="Customer count"
              className="w-full border p-2 pl-8 rounded"
              required
            />
          </div>

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
                  <Loader2 className="animate-spin" size={18} /> Saving...
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

const CustomerCounts = () => {
  const [entries, setEntries] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await getCustomers();
      setEntries(res.data);
    } catch (err) {
      toast.error("Failed to fetch entries");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteCustomer(id);
        toast.success("Entry deleted");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete entry");
        console.error(err);
      }
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingEntry) {
        await updateCustomer(editingEntry.id, data);
        toast.success("Entry updated");
      } else {
        await createCustomer(data);
        toast.success("Entry created");
      }
      fetchData();
    } catch (err) {
      toast.error("Failed to save entry");
      console.error(err);
    }
  };

  const columns = [
    {
      name: "Date",
      selector: (row) => row.date.slice(0, 10),
      sortable: true,
    },
    {
      name: "Number",
      selector: (row) => row.number,
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
            onClick={() => handleDelete(row.id)}
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
        <h1 className="text-2xl font-bold">Customer Counts</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Plus size={18} /> Add Entry
        </button>
      </div>

      <DataTable
        columns={columns}
        data={entries}
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
        noDataComponent="No customer count entries available"
      />

      <CustomerCountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        entry={editingEntry}
      />
    </div>
  );
};

export default CustomerCounts;
