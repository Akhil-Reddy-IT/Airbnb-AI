import React, { useState } from 'react';
import api from '../../utils/api.js';
import { FaRobot, FaMagic, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AIPropertyDescription = ({ propertyType, location, amenities = [], onApply }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    setResult(null);

    if (!propertyType || !location.city || !location.country) {
      setError('Please specify Property Type, City, and Country first to generate listing copywriting.');
      return;
    }

    if (amenities.length === 0) {
      setError('Please select at least one amenity to enrich the description.');
      return;
    }

    setLoading(true);
    try {
      const locationString = `${location.city}, ${location.state || ''} ${location.country}`.trim();
      const res = await api.post('/ai/generate-description', {
        propertyType,
        location: locationString,
        amenities,
      });

      if (res.data.success) {
        setResult(res.data.result);
      } else {
        setError('Failed to generate description. Try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating copywriting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-primary/20 rounded-2xl p-5 bg-primary/5 glass-effect text-left relative overflow-hidden">
      {/* Background neon grid lines */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-3">
        <FaRobot className="text-primary w-5 h-5 animate-pulse" />
        <h3 className="font-bold text-sm text-text-main flex items-center gap-1.5">
          Gemini Copywriting Wizard <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full uppercase font-mono font-bold tracking-wider">AI Assistant</span>
        </h3>
      </div>

      <p className="text-xs text-text-muted mb-4 leading-relaxed">
        Let Gemini draft a professional, search-engine-optimized title and description for your property. We will analyze your selection of amenities and location to compose highly persuasive copy.
      </p>

      {error && (
        <p className="text-xs text-red-500 mb-4 bg-red-500/5 p-2 rounded-lg border border-red-500/10 font-medium">
          {error}
        </p>
      )}

      {/* Action Button */}
      {!result && !loading && (
        <button
          type="button"
          onClick={handleGenerate}
          className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-primary/95 flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md"
        >
          <FaMagic className="w-3.5 h-3.5" />
          Draft Listing with Gemini
        </button>
      )}

      {/* Loading Shimmer */}
      {loading && (
        <div className="space-y-3 py-2">
          <div className="flex items-center gap-2 text-xs text-text-muted font-semibold animate-pulse">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            Writing descriptive hooks...
          </div>
          <div className="h-4 bg-border-main rounded w-1/3 animate-pulse"></div>
          <div className="h-16 bg-border-main rounded w-full animate-pulse"></div>
        </div>
      )}

      {/* Copywriting Review Panel */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4 pt-3 border-t border-border-main/50"
          >
            {/* Title */}
            <div>
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                Suggested Title
              </h4>
              <p className="text-sm font-bold text-text-main bg-bg-main/50 p-2.5 rounded-lg border border-border-main">
                {result.title}
              </p>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                SEO Property Description
              </h4>
              <p className="text-xs text-text-main bg-bg-main/50 p-3 rounded-lg border border-border-main leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line">
                {result.description}
              </p>
            </div>

            {/* Highlights */}
            {result.highlights && result.highlights.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                  AI Key Selling Points
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Accept Hooks */}
            <div className="flex gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => {
                  onApply({ title: result.title, description: result.description });
                  setResult(null);
                }}
                className="bg-accent text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-accent/90 transition-all flex items-center gap-1.5 cursor-pointer shadow"
              >
                <FaCheck /> Apply to Listing
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="text-xs font-semibold px-4 py-2 border border-border-main rounded-lg hover:bg-bg-main text-text-main cursor-pointer transition-colors"
              >
                Regenerate Copy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIPropertyDescription;
