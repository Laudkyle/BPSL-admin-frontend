import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, MapPin, ChevronDown, X } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getBranches,
  getRegions,
  getBranch,
  createBranch,
  updateBranches,
  deleteBranches,
} from "../Api";

import MapComponent from "./MapComponent";

const BranchesManager = () => {
  const [branchesData, setBranchesData] = useState({});
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [branchTotal, setBranchTotal] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    regionName: "",
    location: "",
    lat: "",
    lng: "",
    area: "",
  });

  // Fetch all branches
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await getBranches();
      setBranchesData(response.data.regions);
      setBranchTotal(response.data.totalBranches);
      // Extract regions from the data
      const regionsResponse = await getRegions();
      setRegions(regionsResponse.data);
      console.log("Regions", regions);
    } catch (error) {
      toast.error("Failed to fetch branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle map location selection
  const handleMapClick = (lat, lng) => {
    setSelectedLocation({ lat, lng });
    setFormData((prev) => ({
      ...prev,
      lat: lat.toString(),
      lng: lng.toString(),
    }));
    setIsMapOpen(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { regionName, location, lat, lng, area } = formData;
      console.log(currentBranch);
      if (currentBranch) {
        // Update existing branch
        await updateBranches(currentBranch.id, {
          regionName,
          location,
          lat,
          lng,
          area,
        });
        toast.success("Branch updated successfully");
      } else {
        // Create new branch
        await createBranch({
          regionName,
          location,
          lat,
          lng,
          area,
        });
        toast.success("Branch created successfully");
      }

      fetchBranches();
      setIsModalOpen(false);
      setCurrentBranch(null);
      setFormData({
        regionName: "",
        location: "",
        lat: "",
        lng: "",
        area: "",
      });
      setSelectedLocation(null);
    } catch (error) {
      toast.error("Error saving branch");
    }
  };

  // Edit branch
  const handleEdit = (regionName, branch) => {
    setCurrentBranch({
      id: branch.id,
      regionName,
    });
    setFormData({
      regionName,
      location: branch.location,
      lat: branch.gps?.lat || "",
      lng: branch.gps?.lng || "",
      area: branch.area || "",
    });
    if (branch.gps) {
      setSelectedLocation({ lat: branch.gps.lat, lng: branch.gps.lng });
    }
    setIsModalOpen(true);
  };

  // Delete branch
  const handleDelete = async (branchId) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        await deleteBranches(branchId);
        toast.success("Branch deleted successfully");
        fetchBranches();
      } catch (error) {
        toast.error("Failed to delete branch");
      }
    }
  };

  // Filter branches by selected region
  const filteredBranches = selectedRegion
    ? { [selectedRegion]: branchesData[selectedRegion] || [] }
    : branchesData;

  return (
    <div className="container mx-auto px-4 py-8 h-[90vh] overflow-scroll">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Branches Management</h1>
        <button
          onClick={() => {
            setCurrentBranch(null);
            setFormData({
              regionName: "",
              location: "",
              lat: "",
              lng: "",
              area: "",
            });
            setSelectedLocation(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={18} />
          Add New Branch
        </button>
      </div>

      {/* Region Filter */}
      <div className="mb-6 flex justify-between px-6">
        <div className="">
          <label className="block text-sm font-medium mb-2">
            Filter by Region
          </label>
          <div className="relative w-full md:w-64">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Regions</option>
              {regions.map((region) => (
                <option key={region.id} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-3 text-gray-400 pointer-events-none"
              size={18}
            />
          </div>
        </div>
        <div className="">
          <span className="text-lg">{branchTotal} Branches</span>
        </div>
      </div>

      {/* Branches List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : Object.keys(filteredBranches).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No branches found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(filteredBranches).map(([region, branches]) => (
            <div key={region} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-6 py-3 border-b">
                <h2 className="text-xl font-semibold">{region}</h2>
              </div>
              <div className="divide-y">
                {branches.map((branch, index) => (
                  <div
                    key={index}
                    className="p-6 flex justify-between items-start"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={18} className="text-gray-500" />
                        <h3 className="text-lg font-medium">
                          {branch.location}
                        </h3>
                      </div>
                      <p className="text-gray-600">{branch.area}</p>
                      {branch.gps && (
                        <p className="text-sm text-gray-500 mt-1">
                          GPS: {branch.gps.lat}, {branch.gps.lng}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(region, branch)}
                        className="text-gray-600 hover:text-gray-800"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Branch Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {currentBranch ? "Edit Branch" : "Add New Branch"}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentBranch(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Region
                    </label>
                    <select
                      name="regionName"
                      value={formData.regionName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Region</option>
                      {regions.map((region) => (
                        <option key={region.id} value={region.name}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Location Name
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Latitude
                      </label>
                      <input
                        type="text"
                        name="lat"
                        value={formData.lat}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        placeholder="Click map to select"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Longitude
                      </label>
                      <input
                        type="text"
                        name="lng"
                        value={formData.lng}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        placeholder="Click map to select"
                        readOnly
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMapOpen(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <MapPin size={16} />
                    {selectedLocation
                      ? "Change Location on Map"
                      : "Select Location on Map"}
                  </button>

                  {selectedLocation && (
                    <p className="text-sm text-gray-600">
                      Selected: {selectedLocation.lat}, {selectedLocation.lng}
                    </p>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Area Description
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setCurrentBranch(null);
                    }}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {currentBranch ? "Update Branch" : "Create Branch"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isMapOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh]">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold">Select Location</h2>
              <button
                onClick={() => setIsMapOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="h-full">
              <MapComponent
                onLocationSelect={handleMapClick}
                initialLocation={selectedLocation}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchesManager;
