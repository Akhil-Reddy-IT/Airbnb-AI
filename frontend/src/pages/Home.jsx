import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import PropertyGrid from '../components/property/PropertyGrid.jsx';
import { PropertyGridSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { FaRobot, FaMagic, FaSearch, FaHistory, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { name: 'Apartment', icon: '🏢' },
  { name: 'House', icon: '🏡' },
  { name: 'Villa', icon: '🏰' },
  { name: 'Cabin', icon: '🪵' },
  { name: 'Cottage', icon: '🌾' },
  { name: 'Mansions', icon: '🏛️' },
  { name: 'Treehouse', icon: '🌳' },
];

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Smart Search States
  const [smartQuery, setSmartQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [smartSearchError, setSmartSearchError] = useState('');

  // Standard Search States
  const [citySearch, setCitySearch] = useState('');

  // listings States
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  // Recommendations States
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Wishlist Cache
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoadingProperties(true);
      try {
        // Fetch properties
        const propRes = await api.get('/properties');
        if (propRes.data.success) {
          setProperties(propRes.data.properties.slice(0, 8));
        }

        // Fetch wishlist ids if authenticated
        if (isAuthenticated) {
          const wlRes = await api.get('/wishlist');
          if (wlRes.data.success) {
            setWishlistIds(wlRes.data.properties.map((p) => p._id.toString()));
          }
        }
      } catch (error) {
        console.error('Error loading home data:', error.message);
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchHomeData();
  }, [isAuthenticated]);

  // Load AI Recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthenticated) return;
      setLoadingRecs(true);
      try {
        const res = await api.post('/ai/recommendations');
        if (res.data.success) {
          setRecommendations(res.data.recommendations);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error.message);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchRecommendations();
  }, [isAuthenticated]);

  const handleSmartSearch = async (e) => {
    e.preventDefault();
    if (!smartQuery.trim()) return;

    setAiSearching(true);
    setSmartSearchError('');
    try {
      const res = await api.post('/ai/smart-search', { query: smartQuery });
      if (res.data.success) {
        const filters = res.data.filters;
        
        // Build query params
        const params = new URLSearchParams();
        if (filters.location) params.append('city', filters.location);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.propertyType) params.append('propertyType', filters.propertyType);
        if (filters.amenities?.length > 0) params.append('amenities', filters.amenities.join(','));
        if (filters.guestCount) params.append('guests', filters.guestCount);
        
        // Also carry smart query text for reference
        params.append('smartQuery', smartQuery);
        
        navigate(`/search?${params.toString()}`);
      }
    } catch (error) {
      setSmartSearchError('The smart search parser experienced an issue. Please try manual filters or rewrite the query.');
    } finally {
      setAiSearching(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!citySearch.trim()) return;
    navigate(`/search?city=${citySearch.trim()}`);
  };

  const handleWishlistToggle = (id, isAdded) => {
    setWishlistIds((prev) =>
      isAdded ? [...prev, id] : prev.filter((wId) => wId !== id)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-16 text-left select-none">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden py-20 px-8 md:px-16 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border-main text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/20 text-xs font-bold text-primary tracking-wider uppercase font-mono">
            <FaMagic /> AI-Powered Vacation Stays
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-main leading-tight max-w-2xl mx-auto">
            Find Stays Smarter with <span className="text-primary">Gemini AI</span>
          </h1>
          <p className="text-sm md:text-base text-text-muted max-w-lg mx-auto">
            Search naturally, draft booking summaries, and consult property-trained chatbot assistants instantly.
          </p>
        </motion.div>

        {/* AI Smart Search Assistant Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-2xl mx-auto rounded-2xl glass-effect glow-card border border-primary/25 p-4 md:p-6 text-left"
        >
          <div className="flex items-center gap-2 mb-3">
            <FaRobot className="text-primary w-5 h-5 animate-pulse" />
            <h3 className="font-bold text-xs md:text-sm text-text-main">
              Gemini Smart Search Searcher
            </h3>
          </div>

          <form onSubmit={handleSmartSearch} className="space-y-3">
            <div className="relative">
              <textarea
                placeholder='Try: "Family-friendly villa in Goa under ₹8000 per night with Wi-Fi and pool"'
                rows={2}
                value={smartQuery}
                onChange={(e) => setSmartQuery(e.target.value)}
                className="glass-input text-xs w-full pr-10 resize-none font-medium h-16"
              />
              <button
                type="submit"
                disabled={aiSearching || !smartQuery.trim()}
                className="absolute right-3.5 bottom-3.5 bg-primary text-white p-2.5 rounded-xl hover:bg-primary/95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center shadow-lg"
              >
                {aiSearching ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  <FaSearch className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            {smartSearchError && <p className="text-red-500 text-xs font-semibold">{smartSearchError}</p>}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-text-muted font-bold">Suggested searches:</span>
              <button
                type="button"
                onClick={() => setSmartQuery('Pet-friendly apartment in Bangalore near airport')}
                className="text-[9px] bg-bg-main hover:bg-primary/10 hover:text-primary px-2 py-0.5 rounded-full border border-border-main text-text-muted transition-colors cursor-pointer"
              >
                Pet apartment in Bangalore
              </button>
              <button
                type="button"
                onClick={() => setSmartQuery('Villa in Goa with pool under 9000')}
                className="text-[9px] bg-bg-main hover:bg-primary/10 hover:text-primary px-2 py-0.5 rounded-full border border-border-main text-text-muted transition-colors cursor-pointer"
              >
                Goa villa with pool under 9000
              </button>
            </div>
          </form>
        </motion.div>
      </section>

      {/* Categories Chips bar */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-text-main">Explore by Property Type</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={i}
              to={`/search?propertyType=${cat.name}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border-main bg-bg-card glass-effect hover:border-primary/50 text-xs font-semibold text-text-main shrink-0 shadow-sm transition-all cursor-pointer"
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Personalized Recommendations Shelf */}
      {isAuthenticated && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FaMagic className="text-primary w-5 h-5" />
            <h2 className="text-xl font-bold text-text-main">Recommended For You</h2>
          </div>
          {loadingRecs ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-48 bg-border-main animate-pulse rounded-2xl"></div>
              <div className="h-48 bg-border-main animate-pulse rounded-2xl"></div>
              <div className="h-48 bg-border-main animate-pulse rounded-2xl"></div>
            </div>
          ) : recommendations.length === 0 ? (
            <p className="text-xs text-text-muted italic bg-bg-card border border-border-main p-4 rounded-xl glass-effect">
              Search properties or add items to your wishlist. Gemini will analyze your activities to formulate recommendations here!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex flex-col">
                  {/* Property Card */}
                  <div className="flex-1">
                    <PropertyGrid
                      properties={[rec.property]}
                      wishlistIds={wishlistIds}
                      onWishlistToggle={handleWishlistToggle}
                    />
                  </div>
                  {/* Matching Reason */}
                  <div className="mt-2.5 bg-primary/10 border border-primary/20 p-2.5 rounded-xl text-left">
                    <p className="text-[10px] text-primary font-bold flex items-center gap-1">
                      <FaRobot /> GEMINI MATCHING REASON:
                    </p>
                    <p className="text-[11px] text-text-main font-medium mt-0.5 leading-relaxed">{rec.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Trending stays */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-main">Trending Stays on AirbnbAI</h2>
          <Link to="/search" className="text-xs font-bold text-primary hover:underline">
            View All Stays
          </Link>
        </div>

        {loadingProperties ? (
          <PropertyGridSkeleton count={8} />
        ) : (
          <PropertyGrid
            properties={properties}
            wishlistIds={wishlistIds}
            onWishlistToggle={handleWishlistToggle}
          />
        )}
      </section>
    </div>
  );
};

export default Home;
