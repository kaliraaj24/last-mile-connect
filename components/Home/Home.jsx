/**
 * LastMileConnect - Home / Landing Screen
 * 
 * Main entry landing screen explaining the service, displaying value props,
 * and allowing the user to initiate a ride request or jump into demo previews.
 * 
 * Location: /components/Home/Home.jsx
 * Assigned Branch: main / scaffold
 */

import React from "react";
import { resetDemoData } from "../../utils/storage.js";
import "./Home.css";

export function Home({ onNavigateToRequest, onNavigateToMatch }) {
  const handleResetDemo = () => {
    resetDemoData();
    alert("Demo data successfully refreshed in localStorage!");
  };

  return (
    <div className="lmc-home-container">
      <div className="lmc-home-wrapper">
        {/* Hero Banner */}
        <div className="lmc-home-hero">
          <div className="lmc-home-pill">
            <span>🚇 Metro Exit Auto Pooling</span>
          </div>

          <h1 className="lmc-home-title">
            LastMile<span>Connect</span>
          </h1>

          <p className="lmc-home-subtitle">
            Match with fellow commuters exiting your metro station heading in your direction. Split the auto fare, skip the queue, travel safer.
          </p>

          <div className="lmc-home-actions">
            <button
              className="lmc-home-primary-btn"
              onClick={onNavigateToRequest}
            >
              Request a Shared Auto 🛺
            </button>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                className="lmc-home-secondary-btn"
                onClick={onNavigateToMatch}
              >
                View Match Screen Demo 👀
              </button>

              <button
                className="lmc-home-secondary-btn"
                onClick={handleResetDemo}
                title="Resets fake concurrent requests in localStorage"
              >
                🔄 Reset Demo Data
              </button>
            </div>
          </div>
        </div>

        {/* Stats Ribbon */}
        <div className="lmc-home-stats">
          <div className="lmc-stat-item">
            <span className="lmc-stat-value">60%</span>
            <span className="lmc-stat-label">Fare Savings</span>
          </div>
          <div className="lmc-stat-item">
            <span className="lmc-stat-value">&lt; 90s</span>
            <span className="lmc-stat-label">Match Time</span>
          </div>
          <div className="lmc-stat-item">
            <span className="lmc-stat-value">3,400+</span>
            <span className="lmc-stat-label">Shared Rides</span>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="lmc-home-features">
          <div className="lmc-home-card">
            <div className="lmc-home-card-icon">⚡</div>
            <h3 className="lmc-home-card-title">Instant Station Matching</h3>
            <p className="lmc-home-card-desc">
              Algorithms pair commuters walking out of the same metro exit gate going to the same neighborhood.
            </p>
          </div>

          <div className="lmc-home-card">
            <div className="lmc-home-card-icon">💰</div>
            <h3 className="lmc-home-card-title">Transparent Fare Split</h3>
            <p className="lmc-home-card-desc">
              Automatic fare division based on distance — pay ₹40 instead of ₹120 standard solo meter rate.
            </p>
          </div>

          <div className="lmc-home-card">
            <div className="lmc-home-card-icon">🛡️</div>
            <h3 className="lmc-home-card-title">Co-Rider Accountability</h3>
            <p className="lmc-home-card-desc">
              Verified co-rider initials, driver details, and designated station exit pickup bays for safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
