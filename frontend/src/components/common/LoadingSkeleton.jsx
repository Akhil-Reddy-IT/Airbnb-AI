import React from 'react';

export const PropertyCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-border-main overflow-hidden p-3 animate-pulse bg-bg-card glass-effect space-y-4">
      {/* Shimmer Image */}
      <div className="aspect-[4/3] w-full bg-border-main rounded-xl"></div>
      
      {/* Title & Price */}
      <div className="space-y-2">
        <div className="h-4 bg-border-main rounded w-3/4"></div>
        <div className="h-3 bg-border-main rounded w-1/2"></div>
        <div className="h-3 bg-border-main rounded w-1/4"></div>
      </div>
    </div>
  );
};

export const PropertyGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid-listings mt-6">
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const DetailPageSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 animate-pulse space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="h-8 bg-border-main rounded w-1/3"></div>
        <div className="h-4 bg-border-main rounded w-1/4"></div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[350px]">
        <div className="col-span-2 bg-border-main rounded-2xl h-full"></div>
        <div className="bg-border-main rounded-2xl h-full hidden md:block"></div>
        <div className="bg-border-main rounded-2xl h-full hidden md:block"></div>
      </div>

      {/* Description & Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 bg-border-main rounded w-1/4"></div>
          <div className="h-4 bg-border-main rounded w-full"></div>
          <div className="h-4 bg-border-main rounded w-full"></div>
          <div className="h-4 bg-border-main rounded w-2/3"></div>
        </div>
        <div className="h-[250px] bg-border-main rounded-2xl"></div>
      </div>
    </div>
  );
};
