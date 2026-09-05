/**
 * LastMileConnect - Ride Request Form Screen
 * 
 * Screen where commuters enter their station exit, choose destination zone,
 * and submit a pooling request. Matches immediately with waiting co-commuters.
 * 
 * Location: /components/RequestForm/RequestForm.jsx
 * Assigned Branch: priya-request-screen (Assigned to: Priya)
 */

import React, { useState } from "react";
import { METRO_STATIONS, DESTINATION_ZONES } from "../../data/seedData.js";
import { processRequestAndMatch } from "../../utils/storage.js";
import { calculateFare } from "../../utils/fareCalc.js";
import "./RequestForm.css";

export function RequestForm({ onMatchFound, onCancel }) {
  // Preset defaults configured for instant demo matching
  const [userName, setUserName] = useState("Aarav Sharma");
  const [selectedStation, setSelectedStation] = useState("Indiranagar Metro Station");
  const [selectedZone, setSelectedZone] = useState("Koramangala Block 4");
  const [selectedPillar, setSelectedPillar] = useState("Exit Gate 1 (Main Auto Stand)");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active station data
  const currentStationObj = METRO_STATIONS.find((s) => s.name === selectedStation) || METRO_STATIONS[0];
  const currentZoneObj = DESTINATION_ZONES.find((z) => z.name === selectedZone) || DESTINATION_ZONES[0];

  // Fare estimation for 1 person vs 3-person split
  const fareEstimates = calculateFare(currentZoneObj.distanceKm, 3);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setIsSubmitting(true);

    const tripReq = {
      userName: userName.trim(),
      stationName: selectedStation,
      destinationZone: selectedZone,
      distanceKm: currentZoneObj.distanceKm,
      pickupPillar: selectedPillar,
    };

    // Simulate minor 600ms matching search delay for realistic UX
    setTimeout(() => {
      const matchResult = processRequestAndMatch(tripReq);
      setIsSubmitting(false);

      if (onMatchFound) {
        onMatchFound(matchResult);
      }
    }, 600);
  };

  return (
    <div className="lmc-rf-container">
      <div className="lmc-rf-card">
        <div className="lmc-rf-header">
          <div className="lmc-rf-badge">⚡ Instant Auto Pooling</div>
          <h2 className="lmc-rf-title">Request a Shared Ride</h2>
          <p className="lmc-rf-subtitle">
            Match with co-commuters exiting your metro station & split the fare.
          </p>
        </div>

        <form className="lmc-rf-form" onSubmit={handleSubmit}>
          {/* User Name */}
          <div className="lmc-rf-field">
            <label className="lmc-rf-label" htmlFor="userName">
              Your Name
            </label>
            <input
              id="userName"
              type="text"
              className="lmc-rf-input"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              required
            />
          </div>

          {/* Metro Station */}
          <div className="lmc-rf-field">
            <label className="lmc-rf-label" htmlFor="metroStation">
              Metro Station Exit
            </label>
            <select
              id="metroStation"
              className="lmc-rf-select"
              value={selectedStation}
              onChange={(e) => {
                setSelectedStation(e.target.value);
                const stn = METRO_STATIONS.find((s) => s.name === e.target.value);
                if (stn && stn.exitPillars && stn.exitPillars.length > 0) {
                  setSelectedPillar(stn.exitPillars[0]);
                }
              }}
            >
              {METRO_STATIONS.map((stn) => (
                <option key={stn.id} value={stn.name}>
                  {stn.name} ({stn.line})
                </option>
              ))}
            </select>
          </div>

          {/* Pickup Pillar / Exit */}
          <div className="lmc-rf-field">
            <label className="lmc-rf-label" htmlFor="pickupPillar">
              Pickup Point / Gate
            </label>
            <select
              id="pickupPillar"
              className="lmc-rf-select"
              value={selectedPillar}
              onChange={(e) => setSelectedPillar(e.target.value)}
            >
              {currentStationObj.exitPillars.map((pillar, idx) => (
                <option key={idx} value={pillar}>
                  {pillar}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Zone */}
          <div className="lmc-rf-field">
            <label className="lmc-rf-label">
              <span>Destination Zone</span>
              <span style={{ color: "#0D9488", fontWeight: "700" }}>
                Est. ₹{fareEstimates.farePerPerson} (Save ₹{fareEstimates.savings})
              </span>
            </label>
            <div className="lmc-rf-zones-grid">
              {DESTINATION_ZONES.map((zone) => {
                const isSelected = selectedZone === zone.name;
                return (
                  <div
                    key={zone.id}
                    className={`lmc-rf-zone-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedZone(zone.name)}
                  >
                    <div className="lmc-rf-zone-name">{zone.name}</div>
                    <div className="lmc-rf-zone-meta">{zone.distanceKm} km</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="lmc-rf-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Matching with Co-Riders..." : "Find Auto Co-Riders 🚀"}
          </button>
        </form>

        <div className="lmc-rf-demo-hint">
          💡 <strong>Live Demo Preset:</strong> Pre-filled with Indiranagar Metro & Koramangala Block 4. 2 waiting co-riders (Priya & Rohan) are seeded in demo data for instant match.
        </div>
      </div>
    </div>
  );
}

export default RequestForm;
