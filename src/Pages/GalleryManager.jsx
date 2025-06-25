import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { Edit, Trash2, Plus, Upload, Loader } from 'lucide-react';
import { toast,ToastContainer } from 'react-toastify';
import { 
  getGalleryItems,
  getGalleryImages,
  getGalleryImage,
  deleteGalleryImage,
  createGalleryImage 
} from '../Api';
import axios from 'axios';
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dinb6qtto/image/upload";
const UPLOAD_PRESET = "fuelme";

const GalleryImagesManager = () => {
  const [galleries, setGalleries] = useState([]);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Fetch all galleries
  const fetchGalleries = async () => {
    setIsLoading(true);
    try {
      const response = await getGalleryItems();
      setGalleries(response.data);
    } catch (error) {
      toast.error('Failed to fetch galleries');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch images for selected gallery
  const fetchGalleryImages = async (galleryId) => {
    if (!galleryId) return;
    setIsLoading(true);
    try {
      const response = await getGalleryImages(galleryId);
      setGalleryImages(response.data);
    } catch (error) {
      toast.error('Failed to fetch gallery images');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload images to Cloudinary and save to database
  const uploadImages = async () => {
    if (!selectedGallery || selectedFiles.length === 0) return;
    
    setUploading(true);
    try {
      const uploadPromises = selectedFiles.map(file => 
        uploadToCloudinary(file)
      );
      
      const imageUrls = await Promise.all(uploadPromises);
      
      // Filter out any failed uploads
      const validUrls = imageUrls.filter(url => url !== null);
      
      if (validUrls.length === 0) {
        toast.error('No images were uploaded successfully');
        return;
      }
      
      // Save to database using createGalleryImage
      const savePromises = validUrls.map(url => 
        createGalleryImage({
          gallery_id: selectedGallery.id,
          image_url: url
        })
      );
      
      await Promise.all(savePromises);
      toast.success(`${validUrls.length} images uploaded successfully`);
      fetchGalleryImages(selectedGallery.id);
      setIsModalOpen(false);
      setSelectedFiles([]);
    } catch (error) {
      toast.error('Failed to save images');
    } finally {
      setUploading(false);
    }
  };

  // Cloudinary upload function
  const uploadToCloudinary = async (imageFile) => {
    if (!imageFile) return null;

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

  // Delete an image
  const deleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await deleteGalleryImage(imageId);
      toast.success('Image deleted successfully');
      fetchGalleryImages(selectedGallery.id);
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  // Columns for DataTable
  const columns = [
    {
      name: 'Image',
      cell: (row) => (
        <img 
          src={row.image_url} 
          alt="Gallery" 
          className="w-16 h-16 object-cover rounded"
        />
      ),
    },
    {
      name: 'Actions',
      cell: (row) => (
        <button 
          onClick={() => deleteImage(row.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={18} />
        </button>
      ),
    },
  ];

  useEffect(() => {
    fetchGalleries();
  }, []);

  useEffect(() => {
    if (selectedGallery) {
      fetchGalleryImages(selectedGallery.id);
    }
  }, [selectedGallery]);

  return (
    <div className="p-6 w-full h-[90vh] overflow-scroll ">
      <h1 className="text-2xl font-bold mb-6">Gallery Images Manager</h1>
      <ToastContainer />
      {/* Gallery Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Gallery</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedGallery?.id || ''}
          onChange={(e) => {
            const gallery = galleries.find(g => g.id === parseInt(e.target.value));
            setSelectedGallery(gallery || null);
          }}
        >
          <option value="">Select a gallery</option>
          {galleries.map(gallery => (
            <option key={gallery.id} value={gallery.id}>
              {gallery.title}
            </option>
          ))}
        </select>
      </div>

      {/* Add Images Button */}
      {selectedGallery && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Images
        </button>
      )}

      {/* Images Table */}
      <DataTable
        columns={columns}
        data={galleryImages}
        progressPending={isLoading}
        pagination
        highlightOnHover
        noDataComponent={<p className="py-4">No images found for this gallery</p>}
      />

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Upload Images to {selectedGallery?.title}
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Select Images (Multiple)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            {/* Preview Selected Images */}
            {selectedFiles.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Selected Images:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFiles([]);
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={uploadImages}
                disabled={selectedFiles.length === 0 || uploading}
                className={`px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 ${
                  (selectedFiles.length === 0 || uploading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryImagesManager;