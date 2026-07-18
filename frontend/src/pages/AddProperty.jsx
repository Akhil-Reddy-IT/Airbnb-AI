import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import AIPropertyDescription from '../components/property/AIPropertyDescription.jsx';
import { FaHome, FaRobot, FaUpload, FaMapMarkerAlt, FaDollarSign, FaMagic } from 'react-icons/fa';

const AMENITY_OPTIONS = ['Wi-Fi', 'Pool', 'Kitchen', 'Pet-Friendly', 'Gym', 'AC', 'Free Parking'];
const TYPE_OPTIONS = ['Apartment', 'House', 'Villa', 'Cabin', 'Cottage', 'Mansions', 'Treehouse', 'Other'];

const AddProperty = () => {
  const navigate = useNavigate();

  // Form Fields States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [zip, setZip] = useState('');
  
  // Amenities & Images States
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Control States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleApplyAICopywriting = (aiData) => {
    setTitle(aiData.title);
    setDescription(aiData.description);
    setSuccessMessage('Gemini copywriting applied successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (imageFiles.length === 0) {
      setErrorMessage('Please upload at least one image photo for your listing.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('propertyType', propertyType);
      formData.append('street', street);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('country', country);
      formData.append('zip', zip);
      
      // Append amenities array as a JSON string
      formData.append('amenities', JSON.stringify(selectedAmenities));

      // Append files
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await api.post('/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setSuccessMessage('Property created successfully! Pending admin approval.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error submitting listing details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-8 space-y-8 text-left select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-text-main">Create New Listing</h1>
        <p className="text-xs text-text-muted mt-0.5">Fill in property attributes. Real-time Gemini copywriting is available.</p>
      </div>

      {successMessage && (
        <p className="text-xs text-accent font-semibold bg-accent/5 p-2 rounded-lg border border-accent/10">
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p className="text-xs text-red-500 font-semibold bg-red-500/5 p-2 rounded-lg border border-red-500/10">
          {errorMessage}
        </p>
      )}

      {/* Grid splits: Left details form, Right Gemini AI helper panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form panel */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="border border-border-main p-5 rounded-2xl bg-bg-card glass-effect glow-card space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted mb-2">
              Property Details
            </h3>

            {/* Type selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="glass-input text-xs bg-transparent cursor-pointer"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t} className="bg-bg-card text-text-main">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Listing Title</label>
              <input
                type="text"
                required
                maxLength={60}
                placeholder="e.g. Cozy Beach House with Private Pool"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input text-xs"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Description</label>
              <textarea
                required
                placeholder="Describe your stay, comfort, landmarks..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="glass-input text-xs h-28 resize-none font-medium"
              />
            </div>

            {/* Price */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Price per night (INR / ₹)</label>
              <div className="relative">
                <FaDollarSign className="absolute left-3.5 top-3.5 text-text-muted text-xs" />
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="3000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="glass-input text-xs pl-8 w-full"
                />
              </div>
            </div>
          </div>

          {/* Location details */}
          <div className="border border-border-main p-5 rounded-2xl bg-bg-card glass-effect glow-card space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1">
              <FaMapMarkerAlt /> Location Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="123 Ocean Drive"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">City</label>
                <input
                  type="text"
                  required
                  placeholder="Goa"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">State / Province</label>
                <input
                  type="text"
                  placeholder="Goa State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Country</label>
                <input
                  type="text"
                  required
                  placeholder="India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Postal / Zip</label>
                <input
                  type="text"
                  placeholder="403001"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
            </div>
          </div>

          {/* Amenities & Photos */}
          <div className="border border-border-main p-5 rounded-2xl bg-bg-card glass-effect glow-card space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted mb-2">
              Amenities & Photos
            </h3>

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Amenities Provided</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {AMENITY_OPTIONS.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-xs text-text-main cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(a)}
                      onChange={() => handleAmenityChange(a)}
                      className="w-3.5 h-3.5 border-border-main accent-primary cursor-pointer"
                    />
                    <span>{a}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Photo selector */}
            <div className="space-y-2 pt-2 border-t border-border-main/50">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Upload Property Images</label>
              <div className="border-2 border-dashed border-border-main hover:border-primary/50 rounded-xl p-6 text-center transition-colors cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FaUpload className="mx-auto w-6 h-6 text-text-muted mb-2" />
                <p className="text-xs font-bold text-text-main">Choose or Drag Files</p>
                <p className="text-[10px] text-text-muted mt-0.5">JPEG, PNG, WEBP (Max 5MB each)</p>
              </div>

              {/* Previews grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 pt-3">
                  {imagePreviews.map((url, index) => (
                    <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden border border-border-main">
                      <img src={url} alt={`preview-${index}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary/95 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <FaHome className="w-4 h-4" />
            {loading ? 'Submitting Property Details...' : 'Submit Listing for Approval'}
          </button>
        </form>

        {/* Gemini AI assistant widget on the right */}
        <aside className="lg:col-span-1 lg:sticky lg:top-28">
          <AIPropertyDescription
            propertyType={propertyType}
            location={{ city, state, country }}
            amenities={selectedAmenities}
            onApply={handleApplyAICopywriting}
          />
        </aside>
      </div>
    </div>
  );
};

export default AddProperty;
