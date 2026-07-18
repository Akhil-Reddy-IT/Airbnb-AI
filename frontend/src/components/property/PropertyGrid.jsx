import React from 'react';
import PropertyCard from './PropertyCard.jsx';

const PropertyGrid = ({ properties = [], wishlistIds = [], onWishlistToggle }) => {
  if (properties.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-bg-card border border-border-main rounded-2xl glass-effect mt-6">
        <h3 className="font-bold text-lg text-text-main mb-2">No Properties Found</h3>
        <p className="text-sm text-text-muted max-w-sm mx-auto">
          We couldn't find any listings matching your criteria. Try adjusting your filters or search keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="grid-listings mt-6">
      {properties.map((property) => (
        <PropertyCard
          key={property._id}
          property={property}
          isInitiallyWishlisted={wishlistIds.includes(property._id.toString())}
          onWishlistToggle={onWishlistToggle}
        />
      ))}
    </div>
  );
};

export default PropertyGrid;
