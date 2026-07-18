import React, { useState } from 'react';
import api from '../../utils/api.js';
import { FaRobot, FaMagic, FaCheck, FaTimes, FaThumbsUp, FaThumbsDown, FaMeh } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewSummaryWidget = ({ propertyId, reviewsCount = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    setError('');
    setSummary(null);

    if (reviewsCount === 0) {
      setError('This property has no reviews to summarize yet.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/ai/summarize-reviews', { propertyId });
      if (res.data.success) {
        setSummary(res.data.summary);
      } else {
        setError('Failed to analyze reviews. Try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error compiling reviews summary.');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment) => {
    const s = sentiment?.toLowerCase() || '';
    if (s.includes('pos')) return <FaThumbsUp className="text-accent w-4 h-4" />;
    if (s.includes('neg')) return <FaThumbsDown className="text-red-500 w-4 h-4" />;
    return <FaMeh className="text-yellow-500 w-4 h-4" />;
  };

  const getSentimentBadgeColor = (sentiment) => {
    const s = sentiment?.toLowerCase() || '';
    if (s.includes('pos')) return 'bg-accent/10 text-accent border-accent/20';
    if (s.includes('neg')) return 'bg-red-500/10 text-red-500 border-red-500/20';
    return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  };

  return (
    <div className="border border-primary/20 rounded-2xl p-5 bg-bg-card glass-effect text-left glow-card select-none">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <FaRobot className="text-primary w-5 h-5" />
          <h3 className="font-bold text-sm text-text-main flex items-center gap-1.5">
            Gemini Review Analytics
          </h3>
        </div>
        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-mono font-bold">
          {reviewsCount} {reviewsCount === 1 ? 'Review' : 'Reviews'}
        </span>
      </div>

      <p className="text-xs text-text-muted mb-4 leading-relaxed">
        Let Gemini extract core feedback, pros, cons, and user sentiment from all guest comments automatically.
      </p>

      {error && (
        <p className="text-xs text-red-500 mb-4 bg-red-500/5 p-2 rounded-lg border border-red-500/10 font-medium">
          {error}
        </p>
      )}

      {/* Action Button */}
      {!summary && !loading && (
        <button
          onClick={handleSummarize}
          disabled={reviewsCount === 0}
          className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-primary/95 disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md"
        >
          <FaMagic className="w-3.5 h-3.5" />
          Analyze Reviews
        </button>
      )}

      {/* Loading animation */}
      {loading && (
        <div className="space-y-3 py-2">
          <div className="flex items-center gap-2 text-xs text-text-muted font-semibold animate-pulse">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            Analyzing guest comments...
          </div>
          <div className="h-3 bg-border-main rounded w-full animate-pulse"></div>
          <div className="h-3 bg-border-main rounded w-3/4 animate-pulse"></div>
        </div>
      )}

      {/* Summary View */}
      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4 pt-3 border-t border-border-main/50"
          >
            {/* Sentiment */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-bold">Overall Guest Sentiment:</span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${getSentimentBadgeColor(
                  summary.sentiment
                )}`}
              >
                {getSentimentIcon(summary.sentiment)}
                {summary.sentiment}
              </span>
            </div>

            {/* Summary Text */}
            <p className="text-xs text-text-main leading-relaxed bg-bg-main/50 p-3 rounded-xl border border-border-main/80">
              {summary.summary}
            </p>

            {/* Pros / Cons grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Pros */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                  <FaCheck className="w-2.5 h-2.5" /> Key Pros
                </h4>
                <ul className="space-y-1">
                  {summary.pros?.map((pro, i) => (
                    <li key={i} className="text-xs text-text-main flex items-start gap-1">
                      <span className="text-accent shrink-0 mt-0.5">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                  <FaTimes className="w-2.5 h-2.5" /> Areas to Improve
                </h4>
                <ul className="space-y-1">
                  {summary.cons?.map((con, i) => (
                    <li key={i} className="text-xs text-text-main flex items-start gap-1">
                      <span className="text-red-500 shrink-0 mt-0.5">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <button
              onClick={handleSummarize}
              className="text-[10px] text-text-muted hover:text-primary hover:underline cursor-pointer block mt-2"
            >
              Re-run Analysis
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewSummaryWidget;
