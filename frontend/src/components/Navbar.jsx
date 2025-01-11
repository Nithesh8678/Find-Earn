import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Bell, UserCircle } from "lucide-react";
import NotificationBell from "./NotificationBell";

const Navbar = ({ account, onDisconnect }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Optimized scroll handler
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setIsScrolled(currentScrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const navLinks = [
    { path: "/home", label: "Home" },
    { path: "/report-lost", label: "Report Lost" },
    { path: "/submit-found", label: "Submit Found" },
  ];

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div
        className={`mx-4 mt-4 rounded-full ${
          isScrolled ? "bg-black/80" : "bg-black/50"
        } backdrop-blur-md shadow-lg transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/home" className="flex items-center">
              <div className="text-white text-xl font-semibold font-iceberg">
                Find&Earn
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    className="text-white hover:text-purple-400 px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Here"
                  className="w-[200px] bg-[#2563EB]/20 border-0 text-white placeholder:text-white/70 rounded-md px-3 py-1.5"
                />
              </div>
              <button className="text-white hover:text-purple-400 transition-colors duration-200">
                <Bell className="h-5 w-5" />
              </button>
              <div className="relative">
                <button
                  className="flex items-center text-white hover:text-purple-400 transition-colors duration-200"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <UserCircle className="h-6 w-6" />
                </button>
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5"
                      onMouseEnter={() => setShowDropdown(true)}
                      onMouseLeave={() => setShowDropdown(false)}
                    >
                      <button
                        className="block px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
                        onClick={() => {
                          setShowDropdown(false);
                          navigate("/profile");
                        }}
                      >
                        Your Profile
                      </button>
                      <button
                        className="block px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
                        onClick={() => {
                          setShowDropdown(false);
                          navigate("/settings");
                        }}
                      >
                        Settings
                      </button>
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        className="block px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full text-left"
                        onClick={onDisconnect}
                      >
                        Disconnect
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <NotificationBell account={account} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
