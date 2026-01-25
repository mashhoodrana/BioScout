import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { createObservation } from "../services/api";
import "./ObservationModal.css";

/**
 * LocationPicker Component
 * Allows users to click on map to select location
 */
const LocationPicker = ({ onLocationSelect, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

/**
 * ObservationModal Component
 * Multi-step form for adding new observations
 */
const ObservationModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentTab, setCurrentTab] = useState("basic-info");
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // Form data
  const [formData, setFormData] = useState({
    species_name: "",
    category: "",
    date_observed: "",
    quantity: 1,
    notes: "",
    location: "",
    latitude: "",
    longitude: "",
    habitat: "",
  });

  const tabs = [
    { id: "basic-info", label: "Basic Info" },
    { id: "species-details", label: "Species Details" },
    { id: "location", label: "Location" },
  ];

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setCurrentTab("basic-info");
      setImagePreview(null);
      setSelectedImage(null);
      setCoordinates(null);
      setError(null);
      setFormData({
        species_name: "",
        category: "",
        date_observed: "",
        quantity: 1,
        notes: "",
        location: "",
        latitude: "",
        longitude: "",
        habitat: "",
      });
    }
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (latlng) => {
    setCoordinates(latlng);
    setFormData((prev) => ({
      ...prev,
      latitude: latlng.lat.toFixed(6),
      longitude: latlng.lng.toFixed(6),
    }));
  };

  const handleTabClick = (tabId) => {
    setCurrentTab(tabId);
  };

  const handleNext = () => {
    const currentIndex = tabs.findIndex((t) => t.id === currentTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    const currentIndex = tabs.findIndex((t) => t.id === currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1].id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedImage) {
      setError("Please upload an image");
      setCurrentTab("basic-info");
      return;
    }
    if (!formData.location) {
      setError("Please enter a location name");
      setCurrentTab("location");
      return;
    }
    if (!coordinates) {
      setError("Please select a location on the map");
      setCurrentTab("location");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData object - matching Flask backend expectations
      const submitData = new FormData();
      submitData.append("image", selectedImage);
      submitData.append("user_id", "anonymous");
      submitData.append("species_name", formData.species_name || "");
      submitData.append("category", formData.category || "");
      submitData.append(
        "date_observed",
        formData.date_observed || new Date().toISOString(),
      );
      submitData.append("quantity", formData.quantity || "1");
      submitData.append("notes", formData.notes || "");
      submitData.append("location", formData.location);
      submitData.append("habitat", formData.habitat || "");
      submitData.append(
        "coordinates",
        JSON.stringify([coordinates.lng, coordinates.lat]),
      );
      submitData.append("use_ai", "true");

      const result = await createObservation(submitData);

      // Success!
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err) {
      console.error("Error submitting observation:", err);
      setError(
        err.response?.data?.error ||
          "Failed to submit observation. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const progress =
    ((tabs.findIndex((t) => t.id === currentTab) + 1) / tabs.length) * 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Observation</h2>
          <button className="close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="progress-status">
          Step {tabs.findIndex((t) => t.id === currentTab) + 1} of {tabs.length}
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`tab-btn ${currentTab === tab.id ? "active" : ""}`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Basic Info Tab */}
            {currentTab === "basic-info" && (
              <div className="tab-content">
                <h3>Basic Observation Information</h3>

                <div className="form-group required">
                  <label>
                    Upload Image <span className="required-mark">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="remove-image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Species Name</label>
                  <input
                    type="text"
                    name="species_name"
                    value={formData.species_name}
                    onChange={handleInputChange}
                    placeholder="Enter species name (if known)"
                  />
                  <small>If unknown, leave blank for AI identification</small>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select if known --</option>
                    <option value="plant">Plant</option>
                    <option value="animal">Animal</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-next"
                  >
                    Next: Species Details
                  </button>
                </div>
              </div>
            )}

            {/* Species Details Tab */}
            {currentTab === "species-details" && (
              <div className="tab-content">
                <h3>Species Details</h3>

                <div className="form-group">
                  <label>Date Observed</label>
                  <input
                    type="datetime-local"
                    name="date_observed"
                    value={formData.date_observed}
                    onChange={handleInputChange}
                  />
                  <small>Leave blank for current date/time</small>
                </div>

                <div className="form-group">
                  <label>Quantity Observed</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Observation Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Describe what you observed (size, behavior, condition, etc.)"
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="btn-prev"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-next"
                  >
                    Next: Location
                  </button>
                </div>
              </div>
            )}

            {/* Location Tab */}
            {currentTab === "location" && (
              <div className="tab-content">
                <h3>Location Information</h3>

                <div className="form-group required">
                  <label>
                    Location Name <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Margalla Hills Trail 3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Click on map to select coordinates</label>
                  <div className="location-map-container">
                    <MapContainer
                      center={[33.6844, 73.0479]}
                      zoom={12}
                      style={{ height: "300px", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <LocationPicker
                        onLocationSelect={handleLocationSelect}
                        initialPosition={coordinates}
                      />
                    </MapContainer>
                  </div>
                  {coordinates && (
                    <div className="coordinates-display">
                      Latitude: {coordinates.lat.toFixed(6)}, Longitude:{" "}
                      {coordinates.lng.toFixed(6)}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Habitat Type</label>
                  <select
                    name="habitat"
                    value={formData.habitat}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Habitat --</option>
                    <option value="Forest">Forest</option>
                    <option value="Grassland">Grassland</option>
                    <option value="Wetland/Lake">Wetland/Lake</option>
                    <option value="Urban/Park">Urban/Park</option>
                    <option value="Mountainous">Mountainous</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="btn-prev"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Observation"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ObservationModal;
