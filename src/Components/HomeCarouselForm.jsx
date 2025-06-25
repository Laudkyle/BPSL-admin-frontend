import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getProducts } from '../Api';


const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dinb6qtto/image/upload";
const UPLOAD_PRESET = "fuelme";

function CarouselForm({ initialData = null, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    image: null, // can be File or string URL
    link: '',
    text_btn: '',
  });
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [products, setProducts] = useState([])  // <-- products state
  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        text: initialData.text || '',
        image: initialData.image || null, // string url here
        link: initialData.link || '',
        text_btn: initialData.text_btn || '',
      });
      setPreviewImage(initialData.image || null);
    } else {
      setFormData({
        title: '',
        text: '',
        image: null,
        link: '',
        text_btn: '',
      });
      setPreviewImage(null);
    }
  }, [initialData]);


 useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await getProducts()
        setProducts(res.data) 
      } catch (error) {
        console.error('Failed to fetch products:', error)
        toast.error('Failed to load products')
      }
    }
    fetchProducts()
  }, [])

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({ ...prev, image: file }));
      if (file) {
        setPreviewImage(URL.createObjectURL(file));
      } else {
        setPreviewImage(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const uploadToCloudinary = async (imageFile) => {
    if (typeof imageFile === 'string') {
      // Already a URL, no need to upload again
      return imageFile;
    }
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.secure_url;
    } catch (error) {
      toast.error('Image upload failed.');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = null;

    if (formData.image) {
      imageUrl = await uploadToCloudinary(formData.image);
      if (!imageUrl) {
        setLoading(false);
        return;
      }
    }

    // Prepare data to send back to parent
    const submitData = {
      title: formData.title,
      text: formData.text,
      image: imageUrl || formData.image, // use existing image URL if no new upload
      link: formData.link,
      text_btn: formData.text_btn,
    };

    if (onSubmit) {
      await onSubmit(submitData);
    }

    setLoading(false);
  };

  return (
    <div>
      <ToastContainer position="top-center" />
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter main headline"
          />
        </div>

        {/* Button Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
          <input
            type="text"
            name="text_btn"
            value={formData.text_btn}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="e.g., Apply Now"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="text"
            value={formData.text}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter supporting description"
            rows={4}
          />
        </div>

         {/* Associated Product select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Associated Product</label>
          <select
            name="link"
            value={formData.link}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="" disabled>Select a product link</option>
            {products.map(product => (
              <option key={product.id} value={product.name}>
                {product.title || product.name || 'Untitled Product'}
              </option>
            ))}
          </select>
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Carousel Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="block w-full p-3 border border-gray-300 rounded-lg"
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="mt-2 rounded-lg"
              style={{ width: '100%', maxHeight: 150, objectFit: 'cover' }}
            />
          )}
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex space-x-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold transition duration-200 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Saving...' : 'Save Carousel Item'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-lg font-semibold bg-gray-300 hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
export default CarouselForm;
