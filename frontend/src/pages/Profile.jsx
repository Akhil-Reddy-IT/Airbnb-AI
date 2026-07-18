import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { FaUserCircle, FaSave, FaUserShield, FaSync } from 'react-icons/fa';

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
];

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role || 'guest');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setLoading(true);
    try {
      const data = { name, avatar, role };
      if (password) data.password = password;

      const res = await updateProfile(data);
      if (res.success) {
        setSuccess('Profile updated successfully! Refreshing session...');
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = () => {
    const nextRole = role === 'guest' ? 'host' : 'guest';
    setRole(nextRole);
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12 text-left space-y-8 select-none">
      <div className="border border-border-main rounded-3xl p-6 bg-bg-card glass-effect glow-card space-y-6">
        <div className="flex items-center gap-4 border-b border-border-main pb-4">
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-primary" />
          ) : (
            <FaUserCircle className="w-14 h-14 text-text-muted border-2 border-transparent rounded-full" />
          )}
          <div>
            <h2 className="text-lg font-bold text-text-main">Account Settings</h2>
            <p className="text-xs text-text-muted">Manage your profile details and user roles</p>
          </div>
        </div>

        {success && (
          <p className="text-xs text-accent font-semibold bg-accent/5 p-2 rounded-lg border border-accent/10">
            {success}
          </p>
        )}
        {error && (
          <p className="text-xs text-red-500 font-semibold bg-red-500/5 p-2 rounded-lg border border-red-500/10">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
              Choose Profile Avatar
            </label>
            <div className="flex gap-3">
              {AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(url)}
                  className={`w-11 h-11 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                    avatar === url ? 'border-primary scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`avatar-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Name Field */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input text-xs"
            />
          </div>

          {/* Email (Read Only) */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="glass-input text-xs opacity-50 cursor-not-allowed bg-border-main/20"
            />
          </div>

          {/* Password Reset */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">New Password (leave blank to keep current)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="glass-input text-xs"
            />
          </div>

          {/* Role switcher */}
          {user?.role !== 'admin' && (
            <div className="p-4 border border-border-main bg-bg-main/30 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-text-main flex items-center gap-1.5">
                  <FaUserShield /> User Role Type
                </h4>
                <p className="text-[10px] text-text-muted mt-0.5">
                  Current: <span className="font-bold uppercase text-primary">{role}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleRoleToggle}
                className="bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/20 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <FaSync /> Switch to {role === 'guest' ? 'Host' : 'Guest'}
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-xl text-xs font-bold hover:bg-primary/95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FaSave />
            {loading ? 'Saving Profile...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
