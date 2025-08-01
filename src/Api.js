import axios from "axios";


const api = axios.create({
  baseURL: "https://bpsl-admin-backend.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, 
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("api_token"); 
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===================== Products =====================
export const getProducts = () => api.get("/products");
export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const updateProductFeaturedStatus = (id, data) =>
  api.patch(`/products/${id}/featured`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ===================== Categories =====================
export const getCategories = () => api.get("/categories");
export const createCategory = (data) => api.post("/categories", data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// ===================== Subcategories =====================
export const getSubcategories = () => api.get("/subcategories");
export const createSubcategory = (data) => api.post("/subcategories", data);
export const updateSubcategory = (id, data) =>
  api.put(`/subcategories/${id}`, data);
export const deleteSubcategory = (id) => api.delete(`/subcategories/${id}`);

// ===================== Carousel =====================
export const getCarouselItems = () => api.get("/carousel");
export const createCarouselItem = (data) => api.post("/carousel", data);
export const updateCarouselItem = (id, data) =>
  api.put(`/carousel/${id}`, data);
export const deleteCarouselItem = (id) => api.delete(`/carousel/${id}`);
export const updateDisplayOrder = (data) =>
  api.patch("/carousel/display-order", data);
// ===================== Awards =====================
export const getAwards = () => api.get("/awards");
export const createAward = (data) => api.post("/awards", data);
export const updateAward = (id, data) => api.put(`/awards/${id}`, data);
export const deleteAward = (id) => api.delete(`/awards/${id}`);

// ===================== Dashboard =====================
export const getDashboardStats = () => api.get("/dashboard/stats");
// ===================== Teams =====================
export const getTeamMembers = () => api.get("/team");
export const getTeamMember = (id) => api.get(`/team/${id}`);
export const createTeamMember = (data) => api.post("/team", data);
export const updateTeamMember = (id, data) => api.put(`/team/${id}`, data);
export const deleteTeamMember = (id) => api.delete(`/team/${id}`);
// ===================== Careers =====================
export const getCareers = () => api.get("/roles");
export const getCareer = (id) => api.get(`/roles/${id}`);
export const createCareer = (data) => api.post("/roles", data);
export const updateCareers = (id, data) => api.put(`/roles/${id}`, data);
export const deleteCareers = (id) => api.delete(`/roles/${id}`);

// ===================== Users =====================
export const getUsers = () => api.get("/users");
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const updateUserStatus = (id, data) => api.put(`/users/${id}/status`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);


// ===================== Branches =====================
export const getBranches = () => api.get("/branches");
export const getRegions = () => api.get("/branches/regions");
export const getBranch = (id) => api.get(`/branches/${id}`);
export const createBranch = (data) => api.post("/branches", data);
export const updateBranches = (id, data) => api.put(`/branches/${id}`, data);
export const deleteBranches = (id) => api.delete(`/branches/${id}`);

// ===================== Notices =====================
export const getNotices = () => api.get("/notices");
export const getNotice = (id) => api.get(`/notices/${id}`);
export const createNotice = (data) => api.post("/notices", data);
export const updateNotice = (id, data) => api.put(`/notices/${id}`, data);
export const deleteNotice = (id) => api.delete(`/notices/${id}`);

// ===================== Customers =====================
export const getCustomers = () => api.get("/customer-counts");
export const getCustomer = (id) => api.get("/customer-counts/latest");
export const createCustomer = (data) => api.post("/customer-counts", data);
export const updateCustomer = (id, data) => api.put(`/customer-counts/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customer-counts/${id}`);

// ===================== Articles =====================
export const getArticles = () => api.get("/content/articles");
export const getArticle = (id) => api.get(`/content/articles/${id}`);
export const createArticle = (data) => api.post("/content/articles", data);
export const updateArticle = (id, data) =>
  api.put(`/content/articles/${id}`, data);
export const deleteArticle = (id) => api.delete(`/content/articles/${id}`);

// ===================== Reports =====================
export const getAnnualReports = () => api.get("/report");
export const createAnnualReport = (data) => api.post("/report", data);
export const updateAnnualReport = (id, data) =>
  api.put(`/report/${id}`, data);
export const deleteAnnualReport = (id) => api.delete(`/report/${id}`);

// ===================== Blogs =====================
export const getBlogs = () => api.get("/content/blogs");
export const getBlog = (id) => api.get(`/content/blogs/${id}`);
export const createBlog = (data) => api.post("/content/blogs", data);
export const updateBlog = (id, data) => api.put(`/content/blogs/${id}`, data);
export const deleteBlog = (id) => api.delete(`/content/blogs/${id}`);

// ===================== Gallery =====================
export const getGalleryItems = () => api.get("/content/gallery");
export const getAllContent = () => api.get("/content/content/all");
export const getGalleryItem = (id) => api.get(`/content/gallery/${id}`);
export const createGalleryItem = (data) => api.post("/content/gallery", data);
export const updateGalleryItem = (id, data) =>
  api.put(`/content/gallery/${id}`, data);
export const deleteGalleryItem = (id) => api.delete(`/content/gallery/${id}`);
// ===================== GalleryImages =====================
export const getGalleryImages = (id) =>
  api.get(`/gallery_images?gallery_id=${id}`);
export const getGalleryImage = (id) => api.get(`/gallery_images${id}`);
export const createGalleryImage = (data) => api.post("/gallery_images", data);
export const deleteGalleryImage = (id) => api.delete(`/gallery_images/${id}`);

// ===================== Authentication =====================
export const login = (credentials) => api.post("/auth/login", {
  login: credentials.login, 
  password: credentials.password
});

export const getCurrentUser = () => api.get("/auth/me");


export default {
    // Authentication
  login,
  getCurrentUser,
    // Dashboard
  getDashboardStats,
  
  // Products
  getProducts,
  createProduct,
  updateProduct,
  updateProductFeaturedStatus,
  deleteProduct,

  // Categories
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,

  // Subcategories
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,

  // Carousel
  getCarouselItems,
  createCarouselItem,
  updateCarouselItem,
  deleteCarouselItem,
  updateDisplayOrder,

  // Awards
  getAwards,
  createAward,
  updateAward,
  deleteAward,

  // Reprots
  getAnnualReports,
  createAnnualReport,
  updateAnnualReport,
  deleteAnnualReport,

  // customers
getCustomers,
getCustomer,
createCustomer,
updateCustomer,
deleteCustomer,


  // Teams
  getTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,

  // Notices
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice,

   // Users
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  // Articles
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,

  // Blogs
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,

  
  // Careers
  getCareers,
  getCareer,
  createCareer,
  updateCareers,
  deleteCareers,
  

  //branches
  getBranches,
getRegions,
getBranch,
createBranch,
updateBranches,
deleteBranches,

  // Gallery
  getGalleryItems,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getGalleryImages,
  getGalleryImage,
  createGalleryImage,
  deleteGalleryImage,
  //All Content
  getAllContent,
};
