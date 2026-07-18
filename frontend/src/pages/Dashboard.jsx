import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { RevenueLineChart, OccupancyDoughnutChart } from '../components/dashboard/AnalyticsChart.jsx';
import { FaHome, FaPlus, FaMoneyBillWave, FaCalendarAlt, FaStar, FaTrash } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'listings', 'bookings'

  const fetchHostData = async () => {
    try {
      const propRes = await api.get('/properties/host');
      if (propRes.data.success) {
        setProperties(propRes.data.properties);
      }

      const bookRes = await api.get('/bookings/host-requests');
      if (bookRes.data.success) {
        setBookings(bookRes.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching host dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostData();
  }, []);

  const handleDeleteListing = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this property listing permanently?')) return;

    try {
      const res = await api.delete(`/properties/${id}`);
      if (res.data.success) {
        setProperties((prev) => prev.filter((p) => p._id !== id));
        alert('Listing deleted successfully!');
      }
    } catch (error) {
      alert('Failed to delete property listing.');
    }
  };

  // Calculations
  const totalEarnings = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  const activeBookingsCount = bookings.filter((b) => b.status === 'confirmed').length;

  const averageRating =
    properties.length > 0
      ? Number(
          (
            properties.reduce((acc, curr) => acc + curr.ratings.average, 0) /
            properties.filter((p) => p.ratings.average > 0).length
          ).toFixed(1)
        ) || 0
      : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center space-y-4 animate-pulse">
        <div className="h-8 bg-border-main rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-24 bg-border-main rounded-xl"></div>
          <div className="h-24 bg-border-main rounded-xl"></div>
          <div className="h-24 bg-border-main rounded-xl"></div>
          <div className="h-24 bg-border-main rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-8 text-left select-none">
      {/* Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-main">Host Control Panel</h1>
          <p className="text-xs text-text-muted mt-0.5">Welcome back, {user?.name}. Manage listings and view metrics.</p>
        </div>
        <Link
          to="/add-property"
          className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/95 shadow flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <FaPlus /> Add New Listing
        </Link>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Earnings */}
        <div className="border border-border-main p-4 rounded-2xl bg-bg-card glass-effect flex items-center gap-3.5 glow-card">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FaMoneyBillWave className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Total Revenue</p>
            <p className="text-lg font-bold text-text-main">₹{totalEarnings}</p>
          </div>
        </div>

        {/* Listings count */}
        <div className="border border-border-main p-4 rounded-2xl bg-bg-card glass-effect flex items-center gap-3.5 glow-card">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <FaHome className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Active Listings</p>
            <p className="text-lg font-bold text-text-main">{properties.length}</p>
          </div>
        </div>

        {/* Confirmed bookings */}
        <div className="border border-border-main p-4 rounded-2xl bg-bg-card glass-effect flex items-center gap-3.5 glow-card">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FaCalendarAlt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Total Bookings</p>
            <p className="text-lg font-bold text-text-main">{activeBookingsCount}</p>
          </div>
        </div>

        {/* Ratings average */}
        <div className="border border-border-main p-4 rounded-2xl bg-bg-card glass-effect flex items-center gap-3.5 glow-card">
          <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-500 shrink-0">
            <FaStar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Rating Average</p>
            <p className="text-lg font-bold text-text-main">{averageRating > 0 ? averageRating : 'N/A'}</p>
          </div>
        </div>
      </section>

      {/* Tabs Switcher */}
      <section className="border-b border-border-main flex gap-6 text-sm font-semibold select-none">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'analytics'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          Analytics & Graphs
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'listings'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          Manage Listings ({properties.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'bookings'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          Trip Bookings ({bookings.length})
        </button>
      </section>

      {/* Tab Panels */}
      <section className="pt-2">
        {/* Tab 1: Analytics charts */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 border border-border-main p-5 rounded-2xl bg-bg-card glass-effect glow-card">
              <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted mb-4">
                Revenue Trajectory
              </h3>
              <RevenueLineChart dataPoints={bookings.filter(b => b.status === 'confirmed').map(b => b.totalPrice)} />
            </div>

            <div className="lg:col-span-1 border border-border-main p-5 rounded-2xl bg-bg-card glass-effect glow-card">
              <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted mb-4 text-center">
                Stays Occupancy Rate
              </h3>
              <OccupancyDoughnutChart bookedNights={activeBookingsCount * 3} totalNights={30} />
            </div>
          </div>
        )}

        {/* Tab 2: Manage listings */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {properties.length === 0 ? (
              <p className="text-xs text-text-muted italic bg-bg-card border border-border-main p-5 rounded-2xl text-center">
                You haven't listed any properties yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((p) => (
                  <div
                    key={p._id}
                    className="border border-border-main p-3.5 rounded-xl bg-bg-card glass-effect flex justify-between items-center gap-4 glow-card"
                  >
                    <div className="flex items-center gap-3 truncate">
                      {p.images[0] && (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-12 h-12 rounded-lg object-cover border border-border-main"
                        />
                      )}
                      <div className="truncate text-left">
                        <Link
                          to={`/properties/${p._id}`}
                          className="text-xs font-bold text-text-main hover:text-primary transition-colors hover:underline block truncate"
                        >
                          {p.title}
                        </Link>
                        <p className="text-[10px] text-text-muted truncate">
                          {p.location.city}, {p.location.country}
                        </p>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.25 rounded border mt-1 inline-block uppercase ${
                            p.isApproved
                              ? 'bg-accent/10 text-accent border-accent/20'
                              : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          }`}
                        >
                          {p.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleDeleteListing(p._id, e)}
                        className="p-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/20 text-red-500 rounded-lg cursor-pointer transition-colors"
                        title="Delete listing"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Trip bookings */}
        {activeTab === 'bookings' && (
          <div className="border border-border-main rounded-2xl overflow-hidden bg-bg-card glass-effect glow-card">
            {bookings.length === 0 ? (
              <p className="text-xs text-text-muted italic p-6 text-center">
                No booking requests have been received for your property listings.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-main border-b border-border-main text-text-muted uppercase font-bold tracking-wider text-[10px]">
                      <th className="p-3.5">Property</th>
                      <th className="p-3.5">Guest</th>
                      <th className="p-3.5">Dates</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="border-b border-border-main/50 hover:bg-bg-main/20">
                        <td className="p-3.5 font-semibold text-text-main truncate max-w-44">
                          {booking.property?.title || 'Unknown stay'}
                        </td>
                        <td className="p-3.5 text-text-main">
                          {booking.guest?.name || 'Anonymous Guest'}
                        </td>
                        <td className="p-3.5 text-text-muted">
                          {new Date(booking.checkIn).toLocaleDateString()} -{' '}
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-text-main">
                          ₹{booking.totalPrice}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                              booking.status === 'confirmed'
                                ? 'bg-accent/10 text-accent border-accent/20'
                                : booking.status === 'cancelled'
                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
