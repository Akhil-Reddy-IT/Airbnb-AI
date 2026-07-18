import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import { FaUserShield, FaCheck, FaTimes, FaUsers, FaHome, FaRegCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals', 'users'

  const fetchAdminData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setPendingProperties(statsRes.data.propertiesPendingApproval);
      }

      const usersRes = await api.get('/admin/users');
      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      console.error('Error loading admin dashboard stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveListing = async (id, approve) => {
    const action = approve ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${action} this property listing?`)) return;

    try {
      const res = await api.put(`/admin/properties/${id}/approve`, { approve });
      if (res.data.success) {
        setPendingProperties((prev) => prev.filter((p) => p._id !== id));
        alert(`Property listing successfully ${approve ? 'approved and published' : 'rejected and deleted'}.`);
        await fetchAdminData(); // refresh stats counts
      }
    } catch (error) {
      alert('Error updating listing approval status.');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const res = await api.put(`/admin/users/${userId}`, { role });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role } : u))
        );
        alert('User role updated successfully.');
      }
    } catch (error) {
      alert('Error updating user role.');
    }
  };

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
      <section>
        <h1 className="text-2xl font-extrabold text-text-main flex items-center gap-2">
          <FaUserShield className="text-accent" /> Administration Panel
        </h1>
        <p className="text-xs text-text-muted mt-0.5">Control platform properties approvals, user rolls, and system stats.</p>
      </section>

      {/* Metrics Cards */}
      {stats && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="border border-border-main p-4 rounded-2xl bg-bg-card glass-effect flex items-center gap-3.5 glow-card">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FaMoneyBillWave className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Total Revenue</p>
              <p className="text-lg font-bold text-text-main">₹{stats.totalRevenue}</p>
            </div>
          </div>

          {/* Users */}
          <div className="border border-border-main p-4 rounded-2xl bg-bg-card glass-effect flex items-center gap-3.5 glow-card">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
              <FaUsers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Total Accounts</p>
              <p className="text-lg font-bold text-text-main">{stats.totalUsers}</p>
            </div>
          </div>

          {/* Properties */}
          <div className="border border-border-main p-4 rounded-2xl bg-bg-card glass-effect flex items-center gap-3.5 glow-card">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FaHome className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Listed Properties</p>
              <p className="text-lg font-bold text-text-main">{stats.totalProperties}</p>
            </div>
          </div>

          {/* Bookings */}
          <div className="border border-border-main p-4 rounded-2xl bg-bg-card glass-effect flex items-center gap-3.5 glow-card">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
              <FaRegCalendarAlt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Total Bookings</p>
              <p className="text-lg font-bold text-text-main">{stats.totalBookings}</p>
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <section className="border-b border-border-main flex gap-6 text-sm font-semibold select-none">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'approvals'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          Pending Approvals ({pendingProperties.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'users'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          Manage Users ({users.length})
        </button>
      </section>

      {/* Panels */}
      <section className="pt-2">
        {/* Tab 1: Pending Approvals */}
        {activeTab === 'approvals' && (
          <div className="border border-border-main rounded-2xl overflow-hidden bg-bg-card glass-effect glow-card">
            {pendingProperties.length === 0 ? (
              <p className="text-xs text-text-muted italic p-6 text-center">
                No properties are currently awaiting approval.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-main border-b border-border-main text-text-muted uppercase font-bold tracking-wider text-[10px]">
                      <th className="p-3.5">Property Title</th>
                      <th className="p-3.5">Host Name</th>
                      <th className="p-3.5">City</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingProperties.map((p) => (
                      <tr key={p._id} className="border-b border-border-main/50 hover:bg-bg-main/20">
                        <td className="p-3.5 font-semibold text-text-main truncate max-w-48">
                          {p.title}
                        </td>
                        <td className="p-3.5 text-text-main">
                          {p.host?.name || 'Local Host'}
                        </td>
                        <td className="p-3.5 text-text-muted">
                          {p.location.city}, {p.location.country}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-text-main">
                          ₹{p.price}/night
                        </td>
                        <td className="p-3.5 flex justify-center gap-2">
                          <button
                            onClick={() => handleApproveListing(p._id, true)}
                            className="bg-accent/15 hover:bg-accent/25 text-accent border border-accent/20 px-2 py-1 rounded font-bold cursor-pointer transition-colors flex items-center gap-1 text-[10px]"
                          >
                            <FaCheck /> Approve
                          </button>
                          <button
                            onClick={() => handleApproveListing(p._id, false)}
                            className="bg-red-500/15 hover:bg-red-500/25 text-red-500 border border-red-500/20 px-2 py-1 rounded font-bold cursor-pointer transition-colors flex items-center gap-1 text-[10px]"
                          >
                            <FaTimes /> Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Users management */}
        {activeTab === 'users' && (
          <div className="border border-border-main rounded-2xl overflow-hidden bg-bg-card glass-effect glow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-bg-main border-b border-border-main text-text-muted uppercase font-bold tracking-wider text-[10px]">
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Verified</th>
                    <th className="p-3.5">Registered</th>
                    <th className="p-3.5">Role Roll</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-border-main/50 hover:bg-bg-main/20">
                      <td className="p-3.5 font-semibold text-text-main">{u.name}</td>
                      <td className="p-3.5 text-text-muted">{u.email}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.25 rounded border uppercase ${
                            u.isVerified
                              ? 'bg-accent/10 text-accent border-accent/20'
                              : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          }`}
                        >
                          {u.isVerified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-3.5 text-text-muted">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-transparent border border-border-main text-text-main rounded p-1 font-bold outline-none cursor-pointer text-[11px]"
                        >
                          <option value="guest">Guest</option>
                          <option value="host">Host</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
