import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "./images/logo/logo-p.png";
import {
  Home,
  Package,
  Info,
  Briefcase,
  BookOpen,
  Bell,
  Settings,
  X,
  ChevronDown,
  Package2,
} from "lucide-react";
import Pages from "./Pages";
import { getDashboardStats } from "./Api";
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const navItems = [
    { name: "Home", path: "/home", icon: <Home size={18} /> },
    {
      name: "Products",
      icon: <Package size={18} />,
      subItems: [
        {
          name: "Categories",
          path: "/categories",
          icon: <Package2 size={18} />,
        },
        { name: "Product List", path: "/products" },
      ],
    },
    {
      name: "About",
      icon: <Info size={18} />,
      subItems: [
        { name: "Awards", path: "/about/awards" },
        { name: "Team", path: "/about/teams" },
      ],
    },
    { name: "Careers", path: "/careers", icon: <Briefcase size={18} /> },
    {
      name: "Stories",
      icon: <BookOpen size={18} />,
      subItems: [
        { name: "Stories", path: "/stories" },
        { name: "Gallery", path: "/stories/gallery" },
      ],
    },
    { name: "Notices", path: "/notices", icon: <Bell size={18} /> },
    {
      name: "Settings",
      icon: <Settings size={18} />,
      subItems: [
        { name: "Branches", path: "/settings/branches" },
        { name: "Reports", path: "/settings/reports" },
        { name: "Customer Count", path: "/settings/counts" },
      ],
    },
  ];

  return (
    <div
      className={`bg-gray-800 text-white h-screen fixed md:relative transition-all duration-300 ease-in-out ${
        isOpen ? "min-w-64" : "w-0 md:min-w-64"
      } overflow-hidden`}
    >
      <div className="p-4">
        {/* Logo + Mobile Close Button */}
        <div className="flex items-center justify-between mb-4">
          <img src={logo} alt="Logo" className="w-36 h-10" />
          <button
            onClick={toggleSidebar}
            className="md:hidden text-white focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        {/* Dashboard Label */}
        <div className="mb-6 text-center md:text-left">
          <NavLink to="/" className="text-xl font-bold">
            Dashboard
          </NavLink>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="flex items-center justify-between w-full py-2 px-4 rounded hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        {item.icon}
                        {item.name}
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openDropdown === item.name && (
                      <ul className="ml-8 mt-1 space-y-1">
                        {item.subItems.map((sub) => (
                          <li key={sub.name}>
                            <NavLink
                              to={sub.path}
                              className={({ isActive }) =>
                                `block py-1 px-2 rounded text-sm ${
                                  isActive
                                    ? "bg-gray-700 font-semibold"
                                    : "hover:bg-gray-700"
                                }`
                              }
                            >
                              {sub.name}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 py-2 px-4 rounded transition-colors ${
                        isActive ? "bg-gray-700" : "hover:bg-gray-700"
                      }`
                    }
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};
// MainPage Component
export const MainPage = ({ toggleSidebar }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalBranches: 0,
    totalProducts: 0,
    totalOpenRoles: 0,
    latestNotices: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboardStats();
        setDashboardStats(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error("Failed to fetch dashboard stats:", err);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <div className="md:hidden flex items-center justify-between mb-4">
          <img src={logo} alt="Logo" className="w-36 h-10" />
          <button
            onClick={toggleSidebar}
            className="bg-gray-200 p-2 rounded-md focus:outline-none"
          >
            {/* Menu icon */}
          </button>
        </div>
        <div className="flex justify-center items-center h-64">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <div className="md:hidden flex items-center justify-between mb-4">
          <img src={logo} alt="Logo" className="w-36 h-10" />
          <button
            onClick={toggleSidebar}
            className="bg-gray-200 p-2 rounded-md focus:outline-none"
          >
            {/* Menu icon */}
          </button>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8">
      {/* Mobile top bar with logo and menu button */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <img src={logo} alt="Logo" className="w-36 h-10" />
        <button
          onClick={toggleSidebar}
          className="bg-gray-200 p-2 rounded-md focus:outline-none"
        >
          {/* Menu icon */}
        </button>
      </div>

      <h1 className="text-2xl text-center font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Branches Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Branches</h3>
          <p className="text-gray-600 text-4xl font-bold">
            {dashboardStats.totalBranches}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Total branches across all regions
          </p>
        </div>

        {/* Products Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Products</h3>
          <p className="text-gray-600 text-4xl font-bold">
            {dashboardStats.totalProducts}
          </p>
          <p className="text-sm text-gray-500 mt-2">Products in your catalog</p>
        </div>

        {/* Cutomer Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Customers</h3>
          <p className="text-gray-600 text-4xl font-bold">
            {dashboardStats.totalCustomers}
          </p>
        </div>

        {/* Open Roles Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Open Roles</h3>
          <p className="text-gray-600 text-4xl font-bold">
            {dashboardStats.totalOpenRoles}
          </p>
          <p className="text-sm text-gray-500 mt-2">Current job openings</p>
        </div>
      </div>

      {/* Recent Notices Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Notices</h3>
        {dashboardStats.latestNotices.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {dashboardStats.latestNotices.map((notice) => (
              <li key={notice.id} className="py-3">
                <div className="flex items-center space-x-4">
                  {notice.image && (
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={notice.image}
                        alt={notice.title}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notice.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {notice.description.split(" ").slice(0, 12).join(" ")}
                      {notice.description.split(" ").length > 12 && "..."}
                    </p>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {notice.category}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No recent notices found</p>
        )}
      </div>
    </div>
  );
};

// Homepage Component
function Homepage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Pages toggleSidebar={toggleSidebar} />
    </div>
  );
}

export default Homepage;
