import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import api from '../utils/api.js';
import PropertyGrid from '../components/property/PropertyGrid.jsx';
import { PropertyGridSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FaSlidersH, FaRobot, FaSearch, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';

const AMENITY_OPTIONS = ['Wi-Fi', 'Pool', 'Kitchen', 'Pet-Friendly', 'Gym', 'AC', 'Free Parking'];
const TYPE_OPTIONS = ['Apartment', 'House', 'Villa', 'Cabin', 'Cottage', 'Mansions', 'Treehouse'];

const SearchResults = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters read from URL
  const urlCity = searchParams.get('city') || '';
  const urlMaxPrice = searchParams.get('maxPrice') || '';
  const urlPropertyType = searchParams.get('propertyType') || '';
  const urlAmenities = searchParams.get('amenities') ? searchParams.get('amenities').split(',') : [];
  const urlGuests = searchParams.get('guests') || '';
  const urlSmartQuery = searchParams.get('smartQuery') || '';

  // Filter States
  const [city, setCity] = useState(urlCity);
  const [maxPrice, setMaxPrice] = useState(urlMaxPrice);
  const [propertyType, setPropertyType] = useState(urlPropertyType);
  const [selectedAmenities, setSelectedAmenities] = useState(urlAmenities);
  const [ratingFilter, setRatingFilter] = useState('');
  const [sort, setSort] = useState('newest');

  // Listings States
  const [properties, setProperties] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state with URL change
  useEffect(() => {
    setCity(urlCity);
    setMaxPrice(urlMaxPrice);
    setPropertyType(urlPropertyType);
    setSelectedAmenities(urlAmenities);
  }, [searchParams]);

  // Fetch properties on filter change
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (city) queryParams.append('city', city);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
        if (propertyType) queryParams.append('propertyType', propertyType);
        if (selectedAmenities.length > 0) queryParams.append('amenities', selectedAmenities.join(','));
        if (ratingFilter) queryParams.append('rating', ratingFilter);
        if (sort && sort !== 'newest') queryParams.append('sort', sort);

        const res = await api.get(`/properties?${queryParams.toString()}`);
        if (res.data.success) {
          setProperties(res.data.properties);
        }

        if (isAuthenticated) {
          const wlRes = await api.get('/wishlist');
          if (wlRes.data.success) {
            setWishlistIds(wlRes.data.properties.map((p) => p._id.toString()));
          }
        }
      } catch (err) {
        console.error('Error fetching search results:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [city, maxPrice, propertyType, selectedAmenities, ratingFilter, sort, isAuthenticated]);

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setCity('');
    setMaxPrice('');
    setPropertyType('');
    setSelectedAmenities([]);
    setRatingFilter('');
    setSort('newest');
    setSearchParams({});
  };

  const handleWishlistToggle = (id, isAdded) => {
    setWishlistIds((prev) =>
      isAdded ? [...prev, id] : prev.filter((wId) => wId !== id)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col gap-6 text-left">
      {/* AI search indicator banner */}
      {urlSmartQuery && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FaRobot className="text-primary w-5 h-5 shrink-0 animate-bounce" />
            <div>
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider font-mono">
                AI Filters Applied
              </p>
              <p className="text-xs text-text-main font-medium mt-0.5">
                Parsed Query: <span className="italic font-bold">"{urlSmartQuery}"</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const currentParams = new URLSearchParams(searchParams);
              currentParams.delete('smartQuery');
              setSearchParams(currentParams);
            }}
            className="p-1 rounded-full hover:bg-primary/10 text-primary cursor-pointer"
            title="Clear AI search label"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Grid Layout splits: Left Filters, Center Stays, Right Mock Map */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 rounded-2xl border border-border-main p-5 bg-bg-card glass-effect space-y-6 h-fit glow-card select-none">
          <div className="flex items-center justify-between border-b border-border-main pb-3">
            <h3 className="font-bold text-sm text-text-main flex items-center gap-1.5">
              <FaSlidersH /> Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Location Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              City / Region
            </label>
            <input
              type="text"
              placeholder="e.g. Goa"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="glass-input text-xs w-full"
            />
          </div>

          {/* Property Type Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="glass-input text-xs w-full bg-transparent border border-border-main rounded-lg p-2.5 outline-none cursor-pointer"
            >
              <option value="">Any Type</option>
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t} className="bg-bg-card text-text-main">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-text-muted">
              <span>Max Price / Night</span>
              <span className="text-primary font-mono text-[11px]">
                {maxPrice ? `₹${maxPrice}` : 'Any'}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="30000"
              step="500"
              value={maxPrice || '30000'}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full h-1 bg-border-main rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Ratings */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Average Rating
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="glass-input text-xs w-full bg-transparent border border-border-main rounded-lg p-2.5 outline-none cursor-pointer"
            >
              <option value="">All Ratings</option>
              <option value="4.5">★ 4.5 & Above</option>
              <option value="4.0">★ 4.0 & Above</option>
              <option value="3.5">★ 3.5 & Above</option>
            </select>
          </div>

          {/* Amenities checklist */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Amenities
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {AMENITY_OPTIONS.map((a) => (
                <label key={a} className="flex items-center gap-2 text-xs text-text-main cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(a)}
                    onChange={() => handleAmenityChange(a)}
                    className="w-3.5 h-3.5 rounded border-border-main accent-primary cursor-pointer"
                  />
                  <span>{a}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Listings Display Panel & Simulated Map layout */}
        <main className="lg:col-span-3 space-y-6">
          {/* Toolbar Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-card border border-border-main p-3 rounded-2xl glass-effect glow-card">
            <div>
              <p className="text-xs text-text-muted">
                Showing{' '}
                <span className="font-bold text-text-main">{properties.length}</span> stays
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <label className="text-text-muted font-bold">Sort By:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent border border-border-main text-text-main rounded-lg px-2.5 py-1.5 outline-none font-semibold cursor-pointer"
              >
                <option value="newest">Newest Listed</option>
                <option value="priceLowToHigh">Price: Low to High</option>
                <option value="priceHighToLow">Price: High to Low</option>
                <option value="highestRated">Highest Rated</option>
                <option value="mostPopular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Split lists + maps */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* listings Grid */}
            <div className="xl:col-span-3">
              {loading ? (
                <PropertyGridSkeleton count={4} />
              ) : (
                <PropertyGrid
                  properties={properties}
                  wishlistIds={wishlistIds}
                  onWishlistToggle={handleWishlistToggle}
                />
              )}
            </div>

            {/* Simulated interactive Google Maps panel */}
            <div className="xl:col-span-2 hidden xl:block select-none">
              <div className="sticky top-28 rounded-2xl border border-border-main overflow-hidden h-[420px] bg-sky-100 relative shadow-inner flex items-center justify-center p-4">
                {/* Mock Grid Map Lines */}
                <div className="absolute inset-0 bg-opacity-30 bg-cover bg-[radial-gradient(#ddd_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none"></div>

                {/* Simulated Map Markers */}
                {properties.map((p, idx) => (
                  <div
                    key={p._id}
                    className="absolute cursor-pointer p-1 bg-white hover:bg-primary border border-primary text-text-main hover:text-white rounded-md text-[10px] font-bold shadow-md hover:scale-105 transition-all z-20 flex items-center gap-0.5"
                    style={{
                      top: `${20 + (idx * 30) % 60}%`,
                      left: `${25 + (idx * 25) % 55}%`,
                    }}
                    title={p.title}
                  >
                    <FaMapMarkerAlt className="text-primary hover:text-white" />
                    <span>₹{p.price}</span>
                  </div>
                ))}

                {/* Map Center Details */}
                <div className="absolute bottom-3 left-3 bg-bg-card/90 backdrop-blur border border-border-main p-3 rounded-xl max-w-44 text-left shadow-lg">
                  <h4 className="text-[10px] font-bold text-text-main truncate uppercase tracking-wide">
                    {city || 'Global Map View'}
                  </h4>
                  <p className="text-[9px] text-text-muted mt-0.5 leading-relaxed">
                    Interactive simulation plotting {properties.length} coordinate points.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchResults;
