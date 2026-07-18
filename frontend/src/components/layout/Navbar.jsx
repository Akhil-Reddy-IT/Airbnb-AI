import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import ThemeSelector from '../common/ThemeSelector.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaRegHeart, FaRegCalendarAlt, FaRobot } from 'react-icons/fa';
import { IoNotificationsOutline, IoCloseOutline } from 'react-icons/io5';
import { MdOutlineDashboard } from 'react-icons/md';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border-main glass-effect shadow-sm py-4 px-6 md:px-12 flex justify-between items-center">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 cursor-pointer">
        <div className="text-primary text-3xl font-bold flex items-center gap-1.5">
          <span className="font-extrabold tracking-tight">Airbnb</span>
          <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
            <FaRobot /> AI
          </span>
        </div>
      </Link>

      {/* Navigation Links / Central search shortcut */}
      <div className="hidden md:flex items-center gap-6">
        <Link to="/" className="text-sm font-medium hover:text-primary transition-colors text-text-main">
          Home
        </Link>
        <Link to="/travel-planner" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 text-text-main">
          <FaRobot className="text-primary" /> AI Travel Planner
        </Link>
        <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors text-text-main">
          About Us
        </Link>
        <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors text-text-main">
          Contact
        </Link>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Switch to Host / Manage listing link */}
        {isAuthenticated && user?.role === 'guest' && (
          <Link
            to="/profile"
            className="hidden lg:block text-xs font-semibold px-4 py-2 border border-border-main rounded-full hover:bg-bg-main text-text-main transition-colors"
          >
            Become a Host
          </Link>
        )}
        {isAuthenticated && user?.role === 'host' && (
          <Link
            to="/dashboard"
            className="hidden lg:block text-xs font-semibold px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-colors"
          >
            Host Dashboard
          </Link>
        )}
        {isAuthenticated && user?.role === 'admin' && (
          <Link
            to="/admin"
            className="hidden lg:block text-xs font-semibold px-4 py-2 bg-accent/10 text-accent border border-accent/20 rounded-full hover:bg-accent/25 transition-colors"
          >
            Admin Panel
          </Link>
        )}

        {/* Theme Selector */}
        <ThemeSelector />

        {/* Notifications Icon & Popover */}
        {isAuthenticated && (
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-full border border-border-main hover:bg-bg-main relative cursor-pointer"
            >
              <IoNotificationsOutline className="w-5 h-5 text-text-main" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0" onClick={() => setShowNotifications(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 p-3 rounded-2xl glass-effect glow-card shadow-xl z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between border-b border-border-main pb-2 mb-2">
                      <h4 className="font-bold text-sm text-text-main">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-xs text-text-muted text-center py-6">No notifications yet</p>
                    ) : (
                      <div className="space-y-1.5">
                        {notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              markAsRead(n._id);
                              if (n.link) navigate(n.link);
                              setShowNotifications(false);
                            }}
                            className={`p-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer border ${
                              n.isRead
                                ? 'bg-transparent border-transparent hover:bg-bg-main text-text-muted'
                                : 'bg-primary/5 border-primary/10 hover:bg-primary/10 text-text-main font-medium'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-0.5">
                              <span className="font-bold">{n.title}</span>
                              {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>}
                            </div>
                            <p>{n.message}</p>
                            <span className="text-[10px] text-text-muted block mt-1">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-2 border border-border-main rounded-full hover:bg-bg-main transition-colors cursor-pointer"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <FaUserCircle className="w-6 h-6 text-text-muted" />
            )}
            <span className="hidden md:inline-block text-xs font-semibold text-text-main max-w-20 truncate">
              {isAuthenticated ? user.name.split(' ')[0] : 'Profile'}
            </span>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div className="fixed inset-0" onClick={() => setShowUserMenu(false)}></div>
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-52 p-2 rounded-2xl glass-effect glow-card shadow-xl z-50 text-left"
                >
                  {isAuthenticated ? (
                    <div className="space-y-1">
                      <div className="px-3 py-2 border-b border-border-main mb-1.5">
                        <p className="text-xs font-bold text-text-main">{user.name}</p>
                        <p className="text-[10px] text-text-muted truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-sm text-text-main hover:bg-bg-main transition-colors cursor-pointer"
                      >
                        <FaUserCircle className="text-text-muted" /> Profile
                      </Link>

                      <Link
                        to="/bookings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-sm text-text-main hover:bg-bg-main transition-colors cursor-pointer"
                      >
                        <FaRegCalendarAlt className="text-text-muted" /> Bookings
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-sm text-text-main hover:bg-bg-main transition-colors cursor-pointer"
                      >
                        <FaRegHeart className="text-text-muted" /> Wishlist
                      </Link>

                      {user?.role === 'host' && (
                        <Link
                          to="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 p-2 rounded-lg text-sm text-text-main hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                        >
                          <MdOutlineDashboard /> Host Dashboard
                        </Link>
                      )}

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 p-2 rounded-lg text-sm text-text-main hover:bg-accent/10 hover:text-accent transition-colors cursor-pointer"
                        >
                          <MdOutlineDashboard /> Admin Panel
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-sm text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
                      >
                        Log Out
                      </button>
                    </div>
                  ) : (
                    <div className="p-1 space-y-1">
                      <Link
                        to="/login"
                        onClick={() => setShowUserMenu(false)}
                        className="block w-full text-center p-2 rounded-lg text-sm text-text-main hover:bg-bg-main transition-colors cursor-pointer font-semibold"
                      >
                        Log In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setShowUserMenu(false)}
                        className="block w-full text-center p-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
