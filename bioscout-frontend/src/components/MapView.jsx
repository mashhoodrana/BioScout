import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "./MapView.css";

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons for different species types
const createCustomIcon = (type) => {
  // Colors matching the original Flask CSS
  const colors = {
    bird: "#ff9800", // Orange
    mammal: "#e91e63", // Pink/Magenta
    reptile: "#9c27b0", // Purple
    fish: "#2196f3", // Blue
    amphibian: "#009688", // Teal
    plant: "#4CAF50", // Green
    tree: "#8BC34A", // Light Green
    default: "#2e7d32", // Dark Green
  };

  // Letter labels matching original: B=Bird, M=Mammal, T=Tree, P=Plant, R=Reptile, F=Fish, A=Amphibian
  const labels = {
    bird: "B",
    mammal: "M",
    reptile: "R",
    fish: "F",
    amphibian: "A",
    plant: "P",
    tree: "T",
    default: "•",
  };

  const iconLabel = labels[type] || labels.default;

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${colors[type] || colors.default}; 
                  width: 30px; height: 30px; border-radius: 50%; 
                  display: flex; align-items: center; justify-content: center;
                  color: white; font-weight: bold; border: 2px solid white;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
              ${iconLabel}
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// Helper function to determine species type from name
const getSpeciesType = (speciesName) => {
  const name = speciesName.toLowerCase();

  if (
    name.includes("bird") ||
    name.includes("duck") ||
    name.includes("eagle") ||
    name.includes("vulture") ||
    name.includes("griffon") ||
    name.includes("owl") ||
    name.includes("treepie")
  ) {
    return "bird";
  } else if (
    name.includes("deer") ||
    name.includes("leopard") ||
    name.includes("fox") ||
    name.includes("jackal") ||
    name.includes("boar") ||
    name.includes("monkey") ||
    name.includes("bear") ||
    name.includes("pangolin") ||
    name.includes("mongoose") ||
    name.includes("marten") ||
    name.includes("flying fox")
  ) {
    return "mammal";
  } else if (
    name.includes("snake") ||
    name.includes("cobra") ||
    name.includes("viper") ||
    name.includes("lizard")
  ) {
    return "reptile";
  } else if (name.includes("fish") || name.includes("carp")) {
    return "fish";
  } else if (
    name.includes("frog") ||
    name.includes("toad") ||
    name.includes("amphibian")
  ) {
    return "amphibian";
  } else if (
    name.includes("pine") ||
    name.includes("cedar") ||
    name.includes("oak") ||
    name.includes("himalayan") ||
    name.includes("mulberry") ||
    name.includes("date palm") ||
    name.includes("neem") ||
    name.includes("shisham")
  ) {
    return "tree";
  } else if (
    name.includes("plant") ||
    name.includes("flower") ||
    name.includes("herb") ||
    name.includes("shrub") ||
    name.includes("amaltas") ||
    name.includes("botanical") ||
    name.includes("tulsi") ||
    name.includes("bottle brush")
  ) {
    return "plant";
  }
  return "default";
};

/**
 * MapController Component
 * Controls map zoom and fitting bounds
 */
const MapController = ({ observations }) => {
  const map = useMap();

  useEffect(() => {
    if (!observations || observations.length === 0) {
      // Default view of Islamabad
      map.setView([33.6844, 73.0479], 11);
      return;
    }

    // Collect all valid coordinates
    const coordinates = observations
      .map((obs) => {
        try {
          const coords =
            typeof obs.coordinates === "string"
              ? JSON.parse(obs.coordinates)
              : obs.coordinates;

          if (coords && coords.length === 2) {
            const [lng, lat] = coords;
            return [lat, lng]; // Leaflet uses [lat, lng]
          }
        } catch (e) {
          return null;
        }
        return null;
      })
      .filter((coord) => coord !== null);

    // If valid coordinates, fit map to bounds
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [observations, map]);

  return null;
};

/**
 * Displays observations on an interactive Leaflet map
 */
const MapView = ({ observations = [], onMarkerClick, onSubmitQuery }) => {
  const [center] = useState([33.6844, 73.0479]); // Islamabad coordinates
  const [zoom] = useState(11);

  // Handler for "Learn more" button click
  const handleLearnMore = (speciesName) => {
    if (onSubmitQuery && speciesName) {
      onSubmitQuery(`Tell me about ${speciesName}`);
    }
  };

  return (
    <div className="map-view">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map controller to handle zoom and fit bounds */}
        <MapController observations={observations} />

        {observations.map((obs) => {
          // Parse coordinates for each observation
          let coordinates;
          try {
            coordinates =
              typeof obs.coordinates === "string"
                ? JSON.parse(obs.coordinates)
                : obs.coordinates;
          } catch (e) {
            console.error("Invalid coordinates for observation:", obs);
            return null;
          }

          if (!coordinates || coordinates.length !== 2) return null;

          const [lng, lat] = coordinates;
          // Use species_type from backend if available, otherwise determine from species name
          const speciesType =
            obs.species_type || getSpeciesType(obs.species_name || "");
          const customIcon = createCustomIcon(speciesType);

          return (
            <Marker
              key={obs.observation_id}
              position={[lat, lng]}
              icon={customIcon}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(obs),
              }}
            >
              <Popup>
                <div className="marker-popup">
                  <h3>{obs.species_name || "Unknown Species"}</h3>
                  <p>
                    <strong>Location:</strong> {obs.location}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(obs.date_observed).toLocaleDateString()}
                  </p>
                  {obs.notes && (
                    <p>
                      <strong>Notes:</strong> {obs.notes}
                    </p>
                  )}
                  {obs.image_url && (
                    <img
                      src={obs.image_url}
                      alt={obs.species_name}
                      style={{
                        width: "100%",
                        marginTop: "10px",
                        borderRadius: "4px",
                      }}
                    />
                  )}
                  {/* Type label badge */}
                  <p>
                    <strong>Type:</strong>{" "}
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "white",
                        backgroundColor: "#2e7d32",
                      }}
                    >
                      {speciesType.charAt(0).toUpperCase() +
                        speciesType.slice(1)}
                    </span>
                  </p>
                  {/* Learn more button */}
                  <button
                    style={{
                      backgroundColor: "#2e7d32",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      marginTop: "10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      width: "100%",
                    }}
                    onClick={() => handleLearnMore(obs.species_name)}
                  >
                    Learn more about this species
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
