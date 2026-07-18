import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FaUserCircle, FaEnvelope, FaLock, FaUserPlus, FaRobot, FaUserShield } from 'react-icons/fa';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('guest'); // 'guest', 'host'
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password, role);
      if (res.success) {
        setSuccess('Registration successful! Please verify by checking email logs.');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-left select-none">
      <div className="border border-border-main p-6 rounded-3xl bg-bg-card glass-effect glow-card space-y-6">
        <div className="text-center space-y-2 pb-2 border-b border-border-main/50">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl">
            <FaRobot />
          </div>
          <h2 className="text-lg font-bold text-text-main">Create Account</h2>
          <p className="text-xs text-text-muted">Register to search, host, and book AI stays.</p>
        </div>

        {success && (
          <p className="text-xs text-accent font-semibold bg-accent/5 p-2.5 rounded-lg border border-accent/10 text-center">
            {success}
          </p>
        )}
        {error && (
          <p className="text-xs text-red-500 font-semibold bg-red-500/5 p-2 rounded-lg border border-red-500/10 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <FaUserCircle className="absolute left-3 top-3 text-text-muted text-xs" />
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input text-xs pl-8.5 w-full"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-text-muted text-xs" />
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input text-xs pl-8.5 w-full"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-text-muted text-xs" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input text-xs pl-8.5 w-full"
              />
            </div>
          </div>

          {/* Role Checkboxes */}
          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('guest')}
                className={`py-2 px-3 border text-xs font-semibold rounded-xl cursor-pointer text-center transition-colors ${
                  role === 'guest'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-main hover:bg-bg-main text-text-muted'
                }`}
              >
                Traveler (Guest)
              </button>
              <button
                type="button"
                onClick={() => setRole('host')}
                className={`py-2 px-3 border text-xs font-semibold rounded-xl cursor-pointer text-center transition-colors ${
                  role === 'host'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-main hover:bg-bg-main text-text-muted'
                }`}
              >
                Owner (Host)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-xl text-xs font-bold hover:bg-primary/95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <FaUserPlus />
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-text-muted border-t border-border-main/50">
          <span>Already have an account? </span>
          <Link to="/login" className="text-primary font-bold hover:underline">
            Log In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
