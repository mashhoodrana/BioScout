import React, { useState, useEffect } from "react";
import MapView from "../components/MapView";
import QueryPanel from "../components/QueryPanel";
import FilterPanel from "../components/FilterPanel";
import { fetchObservations } from "../services/api";
import "./HomePage.css";

/**
 * HomePage Component
 * Main page displaying the map with observations and query interface
 */
const HomePage = () => {
  const [observations, setObservations] = useState([]);
  const [filteredObservations, setFilteredObservations] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [externalQuery, setExternalQuery] = useState(null);

  // Load observations on component mount
  useEffect(() => {
    loadObservations();
  }, []);

  // Update filtered count when filteredObservations changes
  useEffect(() => {
    setFilteredCount(filteredObservations.length);
  }, [filteredObservations]);

  const loadObservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchObservations();
      // Handle both array and object responses from Flask
      const obsArray = Array.isArray(data) ? data : data.observations || [];
      setObservations(obsArray);
      setFilteredObservations(obsArray);
    } catch (err) {
      console.error("Error loading observations:", err);
      setError("Failed to load observations. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleQueryResults = (queryObservations) => {
    if (queryObservations && queryObservations.length > 0) {
      // Update map to show only query result observations
      setFilteredObservations(queryObservations);
    } else if (queryObservations === null) {
      // Reset to show all observations
      setFilteredObservations(observations);
    } else if (queryObservations && queryObservations.length === 0) {
      // Query returned no results - show empty
      setFilteredObservations([]);
    }
  };

  const handleMarkerClick = (observation) => {
    console.log("Marker clicked:", observation);
    // Could open a detail modal or sidebar here
  };

  const handleSubmitQuery = (query) => {
    // This function is called from the MapView popup "Learn more" button
    setExternalQuery(query);
  };

  const handleFilterChange = (filtered) => {
    setFilteredObservations(filtered);
  };

  return (
    <div className="home-page">
      {error && <div className="error-banner">{error}</div>}

      <div className="map-container">
        {loading ? (
          <div className="loading-indicator">Loading observations...</div>
        ) : (
          <>
            <FilterPanel
              observations={observations}
              filteredCount={filteredCount}
              onFilterChange={handleFilterChange}
            />
            <MapView
              observations={filteredObservations}
              onMarkerClick={handleMarkerClick}
              onSubmitQuery={handleSubmitQuery}
            />
            <QueryPanel
              onQueryResults={handleQueryResults}
              externalQuery={externalQuery}
              onExternalQueryProcessed={() => setExternalQuery(null)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
