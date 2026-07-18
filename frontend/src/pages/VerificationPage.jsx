import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { FaRobot } from 'react-icons/fa';

const VerificationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('Missing validation verification token URL parameters.');
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        if (res.data.success) {
          setSuccess(true);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Verification link expired or invalid.');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center select-none">
      <div className="border border-border-main p-6 rounded-3xl bg-bg-card glass-effect glow-card space-y-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl animate-spin">
          <FaRobot />
        </div>

        {loading && (
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-text-main">Verifying Account...</h2>
            <p className="text-xs text-text-muted">Analyzing verification token credentials with database entries.</p>
          </div>
        )}

        {success && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-accent">Email Verified!</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Your account has been successfully verified. You can now access full platform booking capabilities.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-primary text-white text-xs font-bold w-full py-2.5 rounded-xl hover:bg-primary/95 transition-colors cursor-pointer"
            >
              Proceed to Login
            </button>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-red-500">Verification Failed</h2>
            <p className="text-xs text-red-500 bg-red-500/5 p-2 rounded-lg border border-red-500/10 font-semibold">
              {error}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-bg-main border border-border-main text-text-main text-xs font-bold w-full py-2.5 rounded-xl hover:bg-border-main transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;
