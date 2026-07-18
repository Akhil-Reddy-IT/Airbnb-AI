import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import PropertyGrid from '../components/property/PropertyGrid.jsx';
import { PropertyGridSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { FaHeart } from 'react-icons/fa';

const Wishlist = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setProperties(res.data.properties);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleWishlistToggle = (id, isAdded) => {
    if (!isAdded) {
      // Remove from list immediately on unsave
      setProperties((prev) => prev.filter((p) => p._id.toString() !== id));
    }
  };

  const wishlistIds = properties.map((p) => p._id.toString());

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-6 text-left">
      <div className="flex items-center gap-2 border-b border-border-main pb-4">
        <FaHeart className="text-primary w-5 h-5" />
        <h1 className="text-2xl font-bold text-text-main">Your Saved Stays</h1>
      </div>

      {loading ? (
        <PropertyGridSkeleton count={4} />
      ) : properties.length === 0 ? (
        <div className="text-center py-16 px-4 bg-bg-card border border-border-main rounded-2xl glass-effect select-none">
          <h3 className="font-bold text-lg text-text-main mb-2">Wishlist is empty</h3>
          <p className="text-sm text-text-muted max-w-xs mx-auto mb-4">
            Tap the heart icon on any property card to save your favorite vacation stays here.
          </p>
        </div>
      ) : (
        <PropertyGrid
          properties={properties}
          wishlistIds={wishlistIds}
          onWishlistToggle={handleWishlistToggle}
        />
      )}
    </div>
  );
};

export default Wishlist;
