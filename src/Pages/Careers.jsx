import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, ChevronDown, X } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {getCareers,
getCareer,
createCareer,
updateCareers,
deleteCareers} from '../Api'
const RolesManager = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    location: '',
    type: '',
    description: '',
    payStart: '',
    payEnd: '',
    skills: [''],
    responsibilities: [''],
    qualifications: [''],
    certifications: [''],
    salaryBenefits: ['']
  });

  // Fetch all roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await getCareers();
      setRoles(response.data);
    } catch (error) {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle array field changes
  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  // Add new item to array field
  const addArrayItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  // Remove item from array field
  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentRole) {
        // Update existing role
        await updateCareers(currentRole.id, formData);
        toast.success('Role updated successfully');
      } else {
        // Create new role
        await createCareer(formData);
        toast.success('Role created successfully');
      }
      
      setIsModalOpen(false);
      setCurrentRole(null);
    } catch (error) {
      toast.error('Error saving role');
    }finally{fetchRoles();}
  };

  // Edit role
  const handleEdit = (role) => {
    setCurrentRole(role);
    setFormData({
      category: role.category,
      title: role.title,
      location: role.location,
      type: role.type,
      description: role.description,
      payStart: role.payStart,
      payEnd: role.payEnd,
      skills: role.skills,
      responsibilities: role.responsibilities,
      qualifications: role.qualifications,
      certifications: role.certifications,
      salaryBenefits: role.salaryBenefits
    });
    setIsModalOpen(true);
  };

  // Delete role
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteCareers(id);
        toast.success('Role deleted successfully');
        fetchRoles();
      } catch (error) {
        toast.error('Failed to delete role');
      }
    }
  };

  // Filter roles by search term and category
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || role.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const defaultCategories = ["HR", "Operations", "Corporate Communication", "Audit", "IT"];
const roleCategories = Array.from(new Set(roles.map(role => role.category)));
const categories = ["All", ...new Set([...defaultCategories, ...roleCategories])];

  return (
    <div className="container mx-auto px-4 py-8 h-[95vh] overflow-scroll">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Roles Management</h1>
        <button
          onClick={() => {
            setCurrentRole(null);
            setFormData({
              category: '',
              title: '',
              location: '',
              type: '',
              description: '',
              payStart: '',
              payEnd: '',
              skills: [''],
              responsibilities: [''],
              qualifications: [''],
              certifications: [''],
              salaryBenefits: ['']
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={18} />
          Add New Role
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <ToastContainer />
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative w-full md:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
        </div>
      </div>

      {/* Roles List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No roles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map(role => (
            <div key={role.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{role.title}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {role.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-1">{role.location} • {role.type}</p>
                <p className="text-gray-800 font-medium mb-3">
                  ${role.payStart} - ${role.payEnd}
                </p>
                <p className="text-gray-700 mb-4 line-clamp-2">{role.description}</p>
                
                <div className="flex justify-end items-center mt-4">
                 
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(role)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {currentRole ? 'Edit Role' : 'Add New Role'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentRole(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.filter(c => c !== 'All').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Full time">Full time</option>
                      <option value="Part time">Part time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Salary Start ($)</label>
                    <input
                      type="number"
                      name="payStart"
                      value={formData.payStart}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Salary End ($)</label>
                    <input
                      type="number"
                      name="payEnd"
                      value={formData.payEnd}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows="3"
                    required
                  />
                </div>

                {/* Array Fields */}
                {['skills', 'responsibilities', 'qualifications', 'certifications', 'salaryBenefits'].map((field) => (
                  <div key={field} className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium capitalize">
                        {field.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem(field)}
                        className="text-blue-600 text-sm flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add Item
                      </button>
                    </div>
                    {formData[field].map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleArrayChange(field, index, e.target.value)}
                          className="flex-1 p-2 border rounded"
                          required
                        />
                        {formData[field].length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem(field, index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setCurrentRole(null);
                    }}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {currentRole ? 'Update Role' : 'Create Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesManager;