import React, { useState } from "react";
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
     
      ],
    },
  ];

  return (
    <div
      className={`bg-gray-800 text-white h-screen fixed md:relative transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-0 md:w-64"
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
  return (
    <div className="flex-1 p-4 md:p-8">
      {/* Mobile menu button */}
      {/* Mobile top bar with logo and menu button */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <img src={logo} alt="Logo" className="w-36 h-10" />
        <button
          onClick={toggleSidebar}
          className="bg-gray-200 p-2 rounded-md focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Welcome to Your Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample cards */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          <p className="text-gray-600">
            Check your latest activities and updates.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Statistics</h3>
          <p className="text-gray-600">View your performance metrics.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Notifications</h3>
          <p className="text-gray-600">You have 3 new notifications.</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Updates</h3>
        <p className="text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui
          mauris. Vivamus hendrerit arcu sed erat molestie vehicula.
        </p>
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
