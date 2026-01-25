import React, { useState } from "react";
import { fetchObservations } from "../services/api";
import "./FilterPanel.css";

/**
 * FilterPanel Component
 * Allows users to filter observations by category and species type
 */
const FilterPanel = ({ observations, filteredCount, onFilterChange }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTypes, setSelectedTypes] = useState(new Set(["all-types"]));
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ left: 20, top: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const categories = ["all", "plants", "animals"];
  const types = [
    "all-types",
    "mammal",
    "bird",
    "reptile",
    "amphibian",
    "fish",
    "tree",
    "plant",
  ];

  const categoryLabels = {
    all: "All",
    plants: "Plants",
    animals: "Animals",
  };

  const typeLabels = {
    "all-types": "All Types",
    mammal: "Mammal",
    bird: "Bird",
    reptile: "Reptile",
    amphibian: "Amphibian",
    fish: "Fish",
    tree: "Tree",
    plant: "Plant",
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    setSelectedTypes(new Set(["all-types"]));
    setLoading(true);

    try {
      const params = {};
      if (category !== "all") {
        params.category = category.endsWith("s")
          ? category.slice(0, -1)
          : category;
      }
      const data = await fetchObservations(params);
      const obsArray = Array.isArray(data) ? data : data.observations || [];
      onFilterChange(obsArray);
    } catch (e) {
      console.error("Error fetching observations for category:", category, e);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeToggle = (type) => {
    let newTypes = new Set(selectedTypes);

    if (type === "all-types") {
      // If clicking "All Types", clear all and select all-types
      newTypes.clear();
      newTypes.add("all-types");
    } else {
      // Remove "all-types" if it exists
      newTypes.delete("all-types");

      // Toggle the clicked type
      if (newTypes.has(type)) {
        newTypes.delete(type);
      } else {
        newTypes.add(type);
      }

      // If no types selected, default to all-types
      if (newTypes.size === 0) {
        newTypes.add("all-types");
      }
    }

    setSelectedTypes(newTypes);
    applyTypeFilters(newTypes);
  };

  const applyTypeFilters = (types) => {
    let filtered = observations || [];
    if (!types.has("all-types")) {
      filtered = filtered.filter((obs) => {
        const speciesType = getSpeciesType(
          obs.species_name || "",
          obs.species_type || obs.category,
        );
        return types.has(speciesType);
      });
    }
    onFilterChange(filtered);
  };

  const getSpeciesType = (speciesName, dbSpeciesType) => {
    // First check if database has a species_type
    if (dbSpeciesType && dbSpeciesType !== "unknown") {
      return dbSpeciesType.toLowerCase();
    }

    // Otherwise, infer from species name
    const name = speciesName.toLowerCase();

    // Bird detection
    if (
      name.includes("bird") ||
      name.includes("duck") ||
      name.includes("eagle") ||
      name.includes("vulture") ||
      name.includes("griffon") ||
      name.includes("owl") ||
      name.includes("hawk")
    ) {
      return "bird";
    }
    // Mammal detection
    else if (
      name.includes("deer") ||
      name.includes("leopard") ||
      name.includes("fox") ||
      name.includes("boar") ||
      name.includes("monkey") ||
      name.includes("bear") ||
      name.includes("wolf")
    ) {
      return "mammal";
    }
    // Reptile detection
    else if (
      name.includes("snake") ||
      name.includes("lizard") ||
      name.includes("cobra") ||
      name.includes("turtle")
    ) {
      return "reptile";
    }
    // Fish detection
    else if (name.includes("fish") || name.includes("carp")) {
      return "fish";
    }
    // Amphibian detection
    else if (name.includes("frog") || name.includes("toad")) {
      return "amphibian";
    }
    // Tree detection (specific trees)
    else if (
      name.includes("pine") ||
      name.includes("cedar") ||
      name.includes("oak") ||
      name.includes("palm") ||
      name.includes("deodar") ||
      name.includes("spruce") ||
      name.includes("maple")
    ) {
      return "tree";
    }
    // Plant/Flower/Herb detection
    else if (
      name.includes("plant") ||
      name.includes("flower") ||
      name.includes("herb") ||
      name.includes("grass") ||
      name.includes("bush") ||
      name.includes("shrub") ||
      name.includes("jasmine") ||
      name.includes("rose") ||
      name.includes("mint") ||
      name.includes("sage")
    ) {
      return "plant";
    }

    // Default to plant if we can't determine (assume plants if unknown)
    return "plant";
  };

  const handleMouseDown = (e) => {
    // Only allow dragging from the title area, not buttons
    if (e.target.closest(".filter-title")) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.left,
        y: e.clientY - position.top,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        left: e.clientX - dragOffset.x,
        top: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div
      className="filter-panel"
      style={{ left: `${position.left}px`, top: `${position.top}px` }}
      onMouseDown={handleMouseDown}
    >
      <div className="filter-section">
        <h3 className="filter-title">Category:</h3>
        <div className="filter-buttons">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
              onClick={() => handleCategoryChange(category)}
              disabled={loading}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Filter By Type:</h3>
        <div className="filter-buttons-grid">
          {types.map((type) => (
            <button
              key={type}
              className={`filter-btn type-btn ${selectedTypes.has(type) ? "active" : ""}`}
              onClick={() => handleTypeToggle(type)}
              disabled={loading}
            >
              {typeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-info">
        <p>Showing {filteredCount || 0} observations</p>
        {loading && <p className="loading-text">Loading...</p>}
      </div>
    </div>
  );
};

export default FilterPanel;
