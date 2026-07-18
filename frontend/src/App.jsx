import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

// Core layout
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';

// Pages
import Home from './pages/Home.jsx';
import SearchResults from './pages/SearchResults.jsx';
import PropertyDetails from './pages/PropertyDetails.jsx';
import AboutUs from './pages/AboutUs.jsx';
import ContactUs from './pages/ContactUs.jsx';
import Profile from './pages/Profile.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Bookings from './pages/Bookings.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddProperty from './pages/AddProperty.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import VerificationPage from './pages/VerificationPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="py-20 text-center text-text-muted">Verifying credentials...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const HostRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div className="py-20 text-center text-text-muted">Checking permissions...</div>;
  return isAuthenticated && (user?.role === 'host' || user?.role === 'admin') 
    ? children 
    : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div className="py-20 text-center text-text-muted">Loading administration controls...</div>;
  return isAuthenticated && user?.role === 'admin' 
    ? children 
    : <Navigate to="/" replace />;
};

const AppContent = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerificationPage />} />

          {/* Protected Guest Routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/travel-planner" element={<AITravelPlannerRoute />} />

          {/* Protected Host Routes */}
          <Route path="/dashboard" element={<HostRoute><Dashboard /></HostRoute>} />
          <Route path="/add-property" element={<HostRoute><AddProperty /></HostRoute>} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

// Route wrapper for planner
const AITravelPlannerRoute = () => {
  // Let's resolve AITravelPlanner imports dynamically
  const AITravelPlanner = React.lazy(() => import('./pages/AITravelPlanner.jsx'));
  return (
    <React.Suspense fallback={<div className="py-20 text-center text-text-muted">Loading planner modules...</div>}>
      <AITravelPlanner />
    </React.Suspense>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <AppContent />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
