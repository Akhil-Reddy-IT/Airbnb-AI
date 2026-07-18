import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FaEnvelope, FaLock, FaSignInAlt, FaRobot } from 'react-icons/fa';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
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
          <h2 className="text-lg font-bold text-text-main">Log In to AirbnbAI</h2>
          <p className="text-xs text-text-muted">Welcome back! Sign in to book vacation stays.</p>
        </div>

        {error && (
          <p className="text-xs text-red-500 font-semibold bg-red-500/5 p-2 rounded-lg border border-red-500/10 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-text-muted text-xs" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input text-xs pl-8.5 w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-xl text-xs font-bold hover:bg-primary/95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <FaSignInAlt />
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-text-muted border-t border-border-main/50">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-primary font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
