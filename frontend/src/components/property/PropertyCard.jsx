import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import ImageSlider from '../common/ImageSlider.jsx';
import { FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import api from '../../utils/api.js';
import { motion } from 'framer-motion';

const PropertyCard = ({ property, isInitiallyWishlisted = false, onWishlistToggle }) => {
  const { isAuthenticated } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(isInitiallyWishlisted);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsWishlisted(isInitiallyWishlisted);
  }, [isInitiallyWishlisted]);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/wishlist/toggle', { propertyId: property._id });
      if (res.data.success) {
        setIsWishlisted(res.data.isWishlisted);
        if (onWishlistToggle) {
          onWishlistToggle(property._id, res.data.isWishlisted);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to={`/properties/${property._id}`} className="block select-none cursor-pointer">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.25 }}
        className="group relative rounded-2xl border border-border-main p-3 bg-bg-card glass-effect glow-card flex flex-col h-full"
      >
        {/* Slider wrapper */}
        <div className="aspect-[4/3] w-full rounded-xl overflow-hidden relative mb-3">
          <ImageSlider images={property.images} title={property.title} />

          {/* Favorite Heart Button */}
          <button
            onClick={handleWishlistClick}
            disabled={loading}
            className="absolute top-2.5 right-2.5 z-10 bg-white/70 hover:bg-white text-gray-800 hover:scale-110 p-2 rounded-full shadow-md backdrop-blur-sm transition-all cursor-pointer"
          >
            {isWishlisted ? (
              <FaHeart className="w-4 h-4 text-red-500" />
            ) : (
              <FaRegHeart className="w-4 h-4 text-gray-800" />
            )}
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-bold text-sm text-text-main group-hover:text-primary transition-colors line-clamp-1">
              {property.title}
            </h3>
            {property.ratings?.average > 0 && (
              <div className="flex items-center gap-1 text-xs text-text-main font-semibold shrink-0">
                <FaStar className="text-yellow-400 w-3.5 h-3.5" />
                <span>{property.ratings.average}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-text-muted mb-1 truncate">
            {property.location.city}, {property.location.country}
          </p>

          <p className="text-xs text-text-muted mb-2 font-medium">
            {property.propertyType}
          </p>

          {/* Pricing bottom */}
          <div className="mt-auto border-t border-border-main/50 pt-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-text-main">
              ₹{property.price.toLocaleString('en-IN')}{' '}
              <span className="text-[11px] text-text-muted font-normal">
                (${Math.round(property.price / 83)})
              </span>{' '}
              <span className="text-[11px] font-normal text-text-muted">/ night</span>
            </p>
            {!property.isApproved && (
              <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full font-medium">
                Pending Approval
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default PropertyCard;
