import React from "react";
import "./AboutPage.css";

/**
 * AboutPage Component
 * Information about the BioScout project
 */
const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>About BioScout Islamabad</h1>

        <section className="about-section">
          <h2>🌿 Our Mission</h2>
          <p>
            BioScout Islamabad is a biodiversity monitoring platform dedicated
            to tracking and documenting the rich flora and fauna of Islamabad's
            natural areas, particularly the Margalla Hills National Park.
          </p>
        </section>

        <section className="about-section">
          <h2>📱 Features</h2>
          <ul>
            <li>
              <strong>Record Observations:</strong> Upload photos and details of
              plants and animals you encounter
            </li>
            <li>
              <strong>AI-Powered Identification:</strong> Get species identified
              using advanced AI technology
            </li>
            <li>
              <strong>Interactive Map:</strong> Visualize biodiversity data
              across different locations
            </li>
            <li>
              <strong>Natural Language Queries:</strong> Ask questions about
              local flora and fauna
            </li>
            <li>
              <strong>Knowledge Base:</strong> Access information about
              Islamabad's ecosystem
            </li>
          </ul>
        </section>

        <section className="about-section">
          <h2>🔍 Species Identification</h2>
          <p>BioScout uses two powerful identification methods:</p>
          <ul>
            <li>
              <strong>OpenAI GPT-4 Vision:</strong> General AI-based species
              identification
            </li>
            <li>
              <strong>iNaturalist API:</strong> Specialized identification with
              taxonomic details and conservation status
            </li>
          </ul>
        </section>

        <section className="about-section">
          <h2>🌍 Coverage Area</h2>
          <p>
            Our primary focus is Islamabad and the Margalla Hills region, home
            to diverse species including leopards, barking deer, various bird
            species, and unique plant life.
          </p>
        </section>

        <section className="about-section">
          <h2>🤝 Get Involved</h2>
          <p>Help us document biodiversity by:</p>
          <ul>
            <li>Recording your observations during hikes and nature walks</li>
            <li>Contributing accurate species identifications</li>
            <li>Sharing knowledge about local ecosystems</li>
            <li>Reporting conservation concerns</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>💻 Technology</h2>
          <p>
            Built with React, Flask, OpenAI, LlamaIndex RAG, and Leaflet mapping
            technology.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
