import React, { useState, useEffect } from "react";
import { submitQuery, fetchObservations } from "../services/api";
import { useChatHistory } from "../context/ChatHistoryContext";
import "./QueryPanel.css";

/**
 * QueryPanel Component
 * Allows users to ask natural language questions about biodiversity
 */
const QueryPanel = ({
  onQueryResults,
  externalQuery,
  onExternalQueryProcessed,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { currentChatId, createNewChat, addMessageToChat } = useChatHistory();

  const exampleQueries = [
    {
      label: "🌿 All Plants",
      query: "Show me all plants on the map",
      icon: "🌿",
    },
    {
      label: "🦅 All Birds",
      query: "Show me all birds",
      icon: "🦅",
    },
    {
      label: "🐆 Show Leopards",
      query: "Show leopards",
      icon: "🐆",
    },
    {
      label: "🌲 Chir Pine",
      query: "Tell me about Chir Pine",
      icon: "🌲",
    },
  ];

  // Handle external query submissions (e.g., from map popup "Learn more" button)
  useEffect(() => {
    if (externalQuery) {
      setQuery(externalQuery);
      // Trigger submit
      handleSubmitWithQuery(externalQuery);
      // Notify parent that external query has been processed
      onExternalQueryProcessed && onExternalQueryProcessed();
    }
  }, [externalQuery]);

  const handleSubmitWithQuery = async (queryText) => {
    if (!queryText.trim()) return;

    setLoading(true);
    setShowResults(true);
    let responseText = ""; // Capture response for chat history

    try {
      // 1) Try direct map filter detection first (replicates original query.js)
      const directFilter = parseMapFilterQuery(queryText);
      if (directFilter) {
        const obsData = await fetchWithFilter(directFilter);
        const obsArray = Array.isArray(obsData)
          ? obsData
          : obsData.observations || [];
        onQueryResults && onQueryResults(obsArray);
        responseText = buildFilterMessage(directFilter, obsArray.length);
        setResults({
          response: responseText,
          observations: [],
        });
        // Save to chat history with actual response
        try {
          if (currentChatId) {
            await addMessageToChat(currentChatId, queryText, responseText);
          } else {
            await createNewChat(queryText, responseText);
          }
        } catch (historyError) {
          console.error("Failed to save to chat history", historyError);
        }
        return;
      }

      // 2) Fall back to RAG processing
      console.log("Submitting RAG query:", queryText);
      const response = await submitQuery(queryText);
      console.log("RAG response:", response);
      responseText = response?.response || "Query processed";
      setResults(response);

      // Notify parent component with observations if available
      if (response.observations && response.observations.length > 0) {
        let obsToDisplay = response.observations;

        // If observations are in GeoJSON format (from RAG), convert them
        if (obsToDisplay.length > 0 && obsToDisplay[0].type === "Feature") {
          obsToDisplay = obsToDisplay.map((feature) => ({
            id: feature.properties?.id,
            species_name: feature.properties?.species,
            date_observed: feature.properties?.date,
            location: feature.properties?.location,
            notes: feature.properties?.notes,
            coordinates: feature.geometry?.coordinates,
          }));
        }

        // If RAG returned a small subset and we can extract a filter, fetch full set
        const extracted = extractFilterFromQuery(queryText);
        if (extracted && obsToDisplay.length < 5) {
          const fullData = await fetchWithFilter(extracted);
          const fullArray = Array.isArray(fullData)
            ? fullData
            : fullData.observations || [];
          if (fullArray.length > obsToDisplay.length) {
            // Only use filtered data if it has more observations
            onQueryResults(fullArray);
            responseText =
              response.response +
              `\n\nFound ${fullArray.length} ${extracted.species || extracted.type || extracted.category} observations on the map.`;
            setResults({
              ...response,
              response: responseText,
            });
          } else {
            onQueryResults(obsToDisplay);
          }
        } else {
          onQueryResults(obsToDisplay);
        }
      } else {
        // RAG returned info but no observations (e.g., "Tell me about Silver Oak")
        // Try to extract filter and show related observations if available
        const extracted = extractFilterFromQuery(queryText);
        if (extracted) {
          const fullData = await fetchWithFilter(extracted);
          const fullArray = Array.isArray(fullData)
            ? fullData
            : fullData.observations || [];
          if (fullArray.length > 0) {
            onQueryResults(fullArray);
          }
        }
      }
    } catch (error) {
      console.error("Query error details:", error);
      console.error("Error response:", error.response);
      responseText =
        error.response?.data?.error ||
        error.message ||
        "Error processing your query. Please try again.";
      setResults({
        error: true,
        message: responseText,
      });
    } finally {
      setLoading(false);

      // Save to chat history with the actual response text
      if (responseText) {
        try {
          if (currentChatId) {
            await addMessageToChat(currentChatId, queryText, responseText);
          } else {
            await createNewChat(queryText, responseText);
          }
        } catch (historyError) {
          console.error("Failed to save to chat history", historyError);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSubmitWithQuery(query);
  };

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
    // Auto-submit after a short delay
    setTimeout(() => {
      handleSubmitWithQuery(exampleQuery);
    }, 100);
  };

  const handleClose = () => {
    setShowResults(false);
    setResults(null);
    // Reset map if needed
    if (onQueryResults) {
      onQueryResults(null);
    }
  };

  return (
    <div className="query-panel">
      <div className="query-container">
        <div className="example-tags">
          <span>Quick Filters:</span>
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              className="example-tag"
              onClick={() => handleExampleClick(example.query)}
              title={example.query}
            >
              {example.label}
            </button>
          ))}
        </div>

        <form id="query-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about biodiversity or type 'show me plants' to filter map..."
            className="query-input"
          />
          <button type="submit" className="query-submit">
            Ask
          </button>
        </form>
      </div>

      {showResults && (
        <div className="query-results">
          <div className="results-header">
            <h3>Results</h3>
            <button className="close-btn" onClick={handleClose}>
              ×
            </button>
          </div>
          <div className="results-content">
            {loading ? (
              <p>Processing your query...</p>
            ) : results?.error ? (
              <p className="error">{results.message}</p>
            ) : results?.response ? (
              <div>
                <p className="query-request">
                  Your request: <em>"{query}"</em>
                </p>
                <p>{results.response}</p>
                {results.observations && results.observations.length > 0 && (
                  <div className="observations-count">
                    Found {results.observations.length} related observations
                  </div>
                )}
              </div>
            ) : (
              <p>No results found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helper functions replicated from original query.js logic ---
const parseMapFilterQuery = (q) => {
  const query = q.toLowerCase().trim();
  const showPatterns = [
    /show\s+(?:me\s+)?(?:all\s+)?(.+?)(?:\s+on\s+(?:the\s+)?map)?$/i,
    /display\s+(?:all\s+)?(.+?)(?:\s+on\s+(?:the\s+)?map)?$/i,
    /find\s+(?:all\s+)?(.+?)(?:\s+on\s+(?:the\s+)?map)?$/i,
    /where\s+(?:are\s+)(?:the\s+)?(.+?)(?:\s+on\s+(?:the\s+)?map)?$/i,
    /map\s+(?:of\s+)?(.+?)$/i,
    /locate\s+(?:all\s+)?(.+?)(?:\s+on\s+(?:the\s+)?map)?$/i,
  ];
  for (const pattern of showPatterns) {
    const m = query.match(pattern);
    if (m) {
      const target = m[1].trim();
      if (target === "plants" || target === "plant")
        return { category: "plant" };
      if (target === "animals" || target === "animal")
        return { category: "animal" };
      const pluralMap = {
        mammals: "mammal",
        birds: "bird",
        reptiles: "reptile",
        fishes: "fish",
        amphibians: "amphibian",
        trees: "tree",
      };
      if (pluralMap[target]) return { type: pluralMap[target] };
      const types = ["mammal", "bird", "reptile", "fish", "amphibian", "tree"];
      if (types.includes(target)) return { type: target };
      return { species: target };
    }
  }
  return null;
};

const extractFilterFromQuery = (q) => {
  const query = q.toLowerCase();
  if (
    query.includes("plant") ||
    query.includes("tree") ||
    query.includes("flora")
  ) {
    return { category: "plant" };
  }
  if (
    query.includes("animal") ||
    query.includes("mammal") ||
    query.includes("bird") ||
    query.includes("reptile") ||
    query.includes("wildlife") ||
    query.includes("fauna")
  ) {
    return { category: "animal" };
  }
  const typeKeywords = {
    mammal: ["mammal", "fox", "bear", "deer", "leopard"],
    bird: ["bird", "duck", "eagle", "owl", "vulture"],
    reptile: ["reptile", "snake", "cobra", "lizard"],
    fish: ["fish", "carp"],
    amphibian: ["amphibian", "frog", "toad"],
    tree: ["pine", "cedar", "oak", "neem"],
  };
  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some((k) => query.includes(k))) return { type };
  }
  return null;
};

const fetchWithFilter = async (filter) => {
  const params = {};
  if (filter.category) params.category = filter.category;
  if (filter.type) params.type = filter.type;
  if (filter.species) params.species = filter.species;
  return await fetchObservations(params);
};

const buildFilterMessage = (filter, count) => {
  const label = filter.species || filter.type || filter.category || "matching";
  return `Found ${count} ${label} observations on the map.`;
};

export default QueryPanel;
