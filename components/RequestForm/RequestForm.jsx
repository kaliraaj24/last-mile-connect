import React, { useState, useEffect } from "react";
import "./RequestForm.css";

// Sample transit stations with destination zones
export const SAMPLE_STATIONS = [
  {
    id: "st_indiranagar",
    name: "Indiranagar Metro Station",
    code: "IND-MTR",
    type: "Metro (Purple Line)",
    exitPoint: "Gate 1 - Auto Stand",
    zones: [
      { id: "z_krm4", name: "Koramangala Block 4", distance: "4.2 km", estSoloFare: 120, estSharedFare: 40 },
      { id: "z_krm5", name: "Koramangala Block 5", distance: "4.8 km", estSoloFare: 130, estSharedFare: 45 },
      { id: "z_100ft", name: "Indiranagar 100ft Road", distance: "1.5 km", estSoloFare: 60, estSharedFare: 25 },
      { id: "z_domlur", name: "Domlur Flyover", distance: "2.8 km", estSoloFare: 90, estSharedFare: 30 },
      { id: "z_oar", name: "Old Airport Road", distance: "3.5 km", estSoloFare: 100, estSharedFare: 35 }
    ]
  },
  {
    id: "st_mgroad",
    name: "MG Road Metro Station",
    code: "MGR-MTR",
    type: "Metro (Purple Line)",
    exitPoint: "Gate 2 - Church Street Exit",
    zones: [
      { id: "z_whitefield", name: "Whitefield Phase 1", distance: "14.5 km", estSoloFare: 320, estSharedFare: 110 },
      { id: "z_brigade", name: "Brigade Road", distance: "1.0 km", estSoloFare: 50, estSharedFare: 20 },
      { id: "z_commercial", name: "Commercial Street", distance: "2.2 km", estSoloFare: 80, estSharedFare: 30 },
      { id: "z_lavelle", name: "Lavelle Road", distance: "2.0 km", estSoloFare: 75, estSharedFare: 25 },
      { id: "z_richmond", name: "Richmond Town", distance: "3.0 km", estSoloFare: 95, estSharedFare: 35 }
    ]
  },
  {
    id: "st_majestic",
    name: "Majestic Metro Station (Kempegowda)",
    code: "KGW-MTR",
    type: "Interchange Hub",
    exitPoint: "Gate 3 - City Bus Terminal Auto Bay",
    zones: [
      { id: "z_malleshwaram", name: "Malleshwaram 8th Cross", distance: "3.8 km", estSoloFare: 110, estSharedFare: 40 },
      { id: "z_rajajinagar", name: "Rajajinagar 1st Block", distance: "4.5 km", estSoloFare: 125, estSharedFare: 45 },
      { id: "z_gandhinagar", name: "Gandhi Nagar", distance: "1.8 km", estSoloFare: 65, estSharedFare: 25 },
      { id: "z_basavanagudi", name: "Basavanagudi", distance: "5.2 km", estSoloFare: 140, estSharedFare: 50 }
    ]
  },
  {
    id: "st_hsr",
    name: "HSR Layout Metro Station",
    code: "HSR-MTR",
    type: "Metro (Yellow Line)",
    exitPoint: "Gate 1 - Ring Road Service Road",
    zones: [
      { id: "z_hsr1", name: "HSR Sector 1", distance: "2.1 km", estSoloFare: 75, estSharedFare: 25 },
      { id: "z_hsr2", name: "HSR Sector 2", distance: "2.7 km", estSoloFare: 85, estSharedFare: 30 },
      { id: "z_silkboard", name: "Silk Board Junction", distance: "3.2 km", estSoloFare: 100, estSharedFare: 35 },
      { id: "z_bellandur", name: "Bellandur EcoSpace", distance: "6.0 km", estSoloFare: 160, estSharedFare: 55 },
      { id: "z_krm1", name: "Koramangala Block 1", distance: "3.9 km", estSoloFare: 115, estSharedFare: 40 }
    ]
  },
  {
    id: "st_byph",
    name: "Baiyappanahalli Metro Station",
    code: "BYP-MTR",
    type: "Metro / Railway Hub",
    exitPoint: "Main Concourse - Pre-paid Auto Booth",
    zones: [
      { id: "z_itpl", name: "ITPL Main Road", distance: "9.5 km", estSoloFare: 240, estSharedFare: 80 },
      { id: "z_hoodi", name: "Hoodi Circle", distance: "7.8 km", estSoloFare: 200, estSharedFare: 70 },
      { id: "z_kalyannagar", name: "Kalyan Nagar", distance: "5.5 km", estSoloFare: 150, estSharedFare: 50 },
      { id: "z_krpuram", name: "KR Puram Railway Station", distance: "4.0 km", estSoloFare: 110, estSharedFare: 40 }
    ]
  },
  {
    id: "st_hebbal",
    name: "Hebbal Bus & Rail Station",
    code: "HBL-TRM",
    type: "Bus & Suburban Rail",
    exitPoint: "Flyover Underpass Stand",
    zones: [
      { id: "z_manyata", name: "Manyata Tech Park", distance: "4.1 km", estSoloFare: 115, estSharedFare: 40 },
      { id: "z_sahakara", name: "Sahakara Nagar", distance: "3.4 km", estSoloFare: 95, estSharedFare: 35 },
      { id: "z_yelahanka", name: "Yelahanka Old Town", distance: "8.2 km", estSoloFare: 210, estSharedFare: 70 },
      { id: "z_nagavara", name: "Nagavara Junction", distance: "4.8 km", estSoloFare: 130, estSharedFare: 45 }
    ]
  }
];

// Quick commuter profile presets
const COMMUTER_PROFILES = ["Aarav Sharma", "Rohan Verma", "Sneha Rao", "Kavya Iyer", "Vikram Malhotra"];

/**
 * Trip Request Screen Component
 * 
 * @param {Object} props
 * @param {Function} [props.onTripCreated] - Callback receiving the created TripRequest
 * @param {Function} [props.onBack] - Callback to return to home screen
 */
export default function RequestForm({ onTripCreated, onBack }) {
  const [userName, setUserName] = useState("Aarav Sharma");
  const [selectedStationName, setSelectedStationName] = useState(SAMPLE_STATIONS[0].name);
  const [selectedZoneName, setSelectedZoneName] = useState(SAMPLE_STATIONS[0].zones[0].name);
  
  // Submission & Matching State
  const [submittedTrip, setSubmittedTrip] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [matchStatus, setMatchStatus] = useState("waiting"); // "waiting" | "matched"
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTimer, setSearchTimer] = useState(0);

  // Find active station object
  const currentStation = SAMPLE_STATIONS.find(s => s.name === selectedStationName) || SAMPLE_STATIONS[0];
  // Find active zone object
  const currentZone = currentStation.zones.find(z => z.name === selectedZoneName) || currentStation.zones[0];

  // Handle station change: update station and default to its first zone
  const handleStationChange = (e) => {
    const stationName = e.target.value;
    setSelectedStationName(stationName);
    const stationObj = SAMPLE_STATIONS.find(s => s.name === stationName);
    if (stationObj && stationObj.zones.length > 0) {
      setSelectedZoneName(stationObj.zones[0].name);
    }
  };

  // Submit Handler: Creates TripRequest and appends to localStorage["tripRequests"]
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedName = userName.trim();
    if (!trimmedName) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!selectedStationName || !selectedZoneName) {
      setErrorMessage("Please select both a transit station and destination zone.");
      return;
    }

    // Exact shared data model specified by team
    const newTripRequest = {
      id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userName: trimmedName,
      stationName: selectedStationName.trim(),
      destinationZone: selectedZoneName.trim(),
      timestamp: Date.now(),
      status: "waiting"
    };

    try {
      // Safely read and parse existing trip requests from localStorage
      let existingRequests = [];
      const storedData = localStorage.getItem("tripRequests");
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          if (Array.isArray(parsed)) {
            existingRequests = parsed;
          }
        } catch (err) {
          console.warn("[LastMileConnect] Corrupt tripRequests in localStorage, resetting array:", err);
          existingRequests = [];
        }
      }

      // Append new request without overwriting
      const updatedRequests = [...existingRequests, newTripRequest];
      localStorage.setItem("tripRequests", JSON.stringify(updatedRequests));
      console.log("[LastMileConnect] Successfully saved TripRequest to localStorage:", newTripRequest);

      // Set component state to "searching" loading view
      setSubmittedTrip(newTripRequest);
      setIsSearching(true);
      setMatchStatus("waiting");
      setSearchTimer(0);

      // Trigger optional parent callback
      if (typeof onTripCreated === "function") {
        onTripCreated(newTripRequest);
      }
    } catch (err) {
      console.error("[LastMileConnect] Error saving TripRequest to localStorage:", err);
      setErrorMessage("Failed to save your request. Please check browser storage permissions.");
    }
  };

  // Polling / listening effect to check if matching engine matched this trip
  useEffect(() => {
    let interval = null;
    if (isSearching && submittedTrip) {
      interval = setInterval(() => {
        setSearchTimer(prev => prev + 1);

        try {
          // Check if the trip status in localStorage was updated to 'matched'
          const stored = localStorage.getItem("tripRequests");
          if (stored) {
            const list = JSON.parse(stored);
            const myTrip = list.find(t => t.id === submittedTrip.id);
            if (myTrip && myTrip.status === "matched") {
              setMatchStatus("matched");
            }
          }

          // Also check if matchGroups contains this trip ID
          const storedGroups = localStorage.getItem("matchGroups");
          if (storedGroups) {
            const groups = JSON.parse(storedGroups);
            const myGroup = groups.find(g => g.tripIds && g.tripIds.includes(submittedTrip.id));
            if (myGroup) {
              setMatchStatus("matched");
            }
          }
        } catch (e) {
          // Ignore parsing errors during poll
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSearching, submittedTrip]);

  // Cancel / Reset request
  const handleCancel = () => {
    setIsSearching(false);
    setSubmittedTrip(null);
    setMatchStatus("waiting");
    setSearchTimer(0);
  };

  // --------------------------------------------------------------------------
  // RENDER: Searching / Loading State Screen
  // --------------------------------------------------------------------------
  if (isSearching && submittedTrip) {
    return (
      <div className="lmc-rf-container">
        <div className="lmc-rf-wrapper">
          {/* Header */}
          <div className="lmc-rf-header">
            <button type="button" className="lmc-rf-back-link" onClick={handleCancel}>
              ← Back to Request Form
            </button>
            <span className="lmc-rf-badge pulse">
              {matchStatus === "matched" ? "🎉 MATCH FOUND!" : "🟢 LIVE SEARCH ACTIVE"}
            </span>
          </div>

          <div className="lmc-match-loading-card">
            {/* Animated Pulse Radar */}
            <div className={`lmc-radar-box ${matchStatus === "matched" ? "success" : ""}`}>
              <div className="lmc-radar-pulse outer"></div>
              <div className="lmc-radar-pulse middle"></div>
              <div className="lmc-radar-pulse inner"></div>
              <div className="lmc-radar-center-icon">
                {matchStatus === "matched" ? "🤝" : "🛺"}
              </div>
            </div>

            {/* Status Headings */}
            <div className="lmc-match-text-content">
              {matchStatus === "matched" ? (
                <>
                  <h2 className="lmc-match-title success-text">You're Matched with Co-Commuters!</h2>
                  <p className="lmc-match-desc">
                    A ride-sharing group has been formed for your route. Head to the pickup auto stand.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="lmc-match-title">Looking for matches...</h2>
                  <p className="lmc-match-desc">
                    Scanning commuters arriving at <strong>{submittedTrip.stationName}</strong> heading to <strong>{submittedTrip.destinationZone}</strong>.
                  </p>
                </>
              )}
            </div>

            {/* Trip Request Details Box */}
            <div className="lmc-trip-summary-box">
              <div className="lmc-summary-row">
                <span className="summary-label">Commuter Name</span>
                <span className="summary-val highlight">{submittedTrip.userName}</span>
              </div>
              <div className="lmc-summary-row">
                <span className="summary-label">Transit Station</span>
                <span className="summary-val">{submittedTrip.stationName}</span>
              </div>
              <div className="lmc-summary-row">
                <span className="summary-label">Destination Zone</span>
                <span className="summary-val target-zone">📍 {submittedTrip.destinationZone}</span>
              </div>
              <div className="lmc-summary-row">
                <span className="summary-label">Status</span>
                <span className={`lmc-status-pill ${submittedTrip.status}`}>
                  {matchStatus === "matched" ? "MATCHED (Ready)" : "WAITING (In Pool)"}
                </span>
              </div>
              <div className="lmc-summary-row">
                <span className="summary-label">Request ID</span>
                <span className="summary-val code-font">{submittedTrip.id}</span>
              </div>
            </div>

            {/* Fare & Savings Estimate */}
            <div className="lmc-fare-split-preview">
              <div className="lmc-split-card">
                <span className="split-title">Estimated Split Fare</span>
                <div className="split-numbers">
                  <span className="solo-price strike">₹{currentZone?.estSoloFare || 120}</span>
                  <span className="arrow-right">→</span>
                  <span className="shared-price">₹{currentZone?.estSharedFare || 40} <small>/ rider</small></span>
                </div>
                <span className="split-subtext">You save ~65% by sharing the auto</span>
              </div>
            </div>

            {/* Live Indicator Timer */}
            <div className="lmc-scan-ticker">
              <span className="ticker-dot"></span>
              <span>Scanning live station queue... <strong>{searchTimer}s elapsed</strong></span>
            </div>

            {/* Action Buttons */}
            <div className="lmc-match-actions">
              <button 
                type="button" 
                className="lmc-btn lmc-btn-secondary"
                onClick={handleCancel}
              >
                Cancel &amp; Modify Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Request Form Screen
  // --------------------------------------------------------------------------
  return (
    <div className="lmc-rf-container">
      <div className="lmc-rf-wrapper">
        {/* Navigation Bar / Top Bar */}
        <div className="lmc-rf-header">
          {onBack && (
            <button type="button" className="lmc-rf-back-btn" onClick={onBack}>
              ← Back to Home
            </button>
          )}
          <div className="lmc-rf-title-box">
            <h1 className="lmc-form-main-title">Request a Shared Ride</h1>
            <p className="lmc-form-main-sub">
              Select your arrival transit station and target destination zone to match with co-commuters.
            </p>
          </div>
        </div>

        {/* Form Error Alert */}
        {errorMessage && (
          <div className="lmc-rf-alert error">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        <form className="lmc-request-form" onSubmit={handleSubmit}>
          {/* Section 1: User Name & Commuter Profile Selector */}
          <div className="lmc-form-section">
            <label className="lmc-form-label" htmlFor="userNameInput">
              <span className="lmc-label-icon">👤</span> Commuter Name
            </label>
            <input 
              id="userNameInput"
              type="text" 
              className="lmc-input-text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name (e.g. Aarav Sharma)"
              required
            />
            {/* Quick Commuter Profile Fillers */}
            <div className="lmc-quick-profile-names">
              <span className="profile-label">Quick Select:</span>
              {COMMUTER_PROFILES.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`lmc-quick-pill ${userName === name ? "active" : ""}`}
                  onClick={() => setUserName(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Transit Station Dropdown */}
          <div className="lmc-form-section">
            <label className="lmc-form-label" htmlFor="stationSelect">
              <span className="lmc-label-icon">🚉</span> Current Transit Station
            </label>
            <div className="lmc-select-wrapper">
              <select 
                id="stationSelect"
                className="lmc-select"
                value={selectedStationName}
                onChange={handleStationChange}
              >
                {SAMPLE_STATIONS.map((station) => (
                  <option key={station.id} value={station.name}>
                    {station.name} — {station.type}
                  </option>
                ))}
              </select>
            </div>
            <div className="lmc-station-info-chip">
              <span>📍 Pickup Point: <strong>{currentStation.exitPoint}</strong></span>
            </div>
          </div>

          {/* Section 3: Destination Zone Dropdown & Zone Pills */}
          <div className="lmc-form-section">
            <div className="lmc-label-row">
              <label className="lmc-form-label" htmlFor="zoneSelect">
                <span className="lmc-label-icon">📍</span> Destination Zone
              </label>
              <span className="lmc-zone-count">{currentStation.zones.length} zones available</span>
            </div>
            
            <div className="lmc-select-wrapper">
              <select 
                id="zoneSelect"
                className="lmc-select"
                value={selectedZoneName}
                onChange={(e) => setSelectedZoneName(e.target.value)}
              >
                {currentStation.zones.map((zone) => (
                  <option key={zone.id} value={zone.name}>
                    {zone.name} (~{zone.distance}) • ₹{zone.estSharedFare} shared
                  </option>
                ))}
              </select>
            </div>

            {/* Interactive Quick Zone Pills */}
            <div className="lmc-zone-pills-grid">
              {currentStation.zones.map((zone) => {
                const isSelected = selectedZoneName === zone.name;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    className={`lmc-zone-pill-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedZoneName(zone.name)}
                  >
                    <div className="zone-pill-name">{zone.name}</div>
                    <div className="zone-pill-meta">
                      <span>{zone.distance}</span>
                      <span className="zone-pill-fare">₹{zone.estSharedFare}/seat</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Live Fare & Trip Estimate Card */}
          <div className="lmc-route-summary-preview">
            <div className="lmc-rsp-header">
              <span className="rsp-title">Route &amp; Fare Estimate</span>
              <span className="rsp-badge">High Demand Route</span>
            </div>

            <div className="lmc-rsp-body">
              <div className="lmc-rsp-stops">
                <div className="stop-item">
                  <div className="stop-dot station"></div>
                  <div className="stop-info">
                    <span className="stop-tag">From</span>
                    <strong>{selectedStationName}</strong>
                    <small>{currentStation.exitPoint}</small>
                  </div>
                </div>
                <div className="stop-line"></div>
                <div className="stop-item">
                  <div className="stop-dot dest"></div>
                  <div className="stop-info">
                    <span className="stop-tag">To</span>
                    <strong>{selectedZoneName}</strong>
                    <small>Approx. {currentZone?.distance || "3.5 km"}</small>
                  </div>
                </div>
              </div>

              <div className="lmc-rsp-pricing">
                <div className="pricing-box">
                  <span className="p-label">Solo Fare</span>
                  <span className="p-val strike">₹{currentZone?.estSoloFare || 120}</span>
                </div>
                <div className="pricing-arrow">➡️</div>
                <div className="pricing-box shared">
                  <span className="p-label">Shared (3 riders)</span>
                  <span className="p-val highlight">₹{currentZone?.estSharedFare || 40}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="lmc-form-actions">
            <button 
              type="submit" 
              className="lmc-btn lmc-btn-primary lmc-btn-large lmc-submit-btn"
            >
              <span className="lmc-btn-icon">🔍</span>
              Find Match &amp; Split Fare
            </button>
          </div>
        </form>

        {/* Persistence Notice */}
        <div className="lmc-storage-note">
          <span>🛡️ Requests are synced directly to your local transit pool for co-commuter matching.</span>
        </div>
      </div>
    </div>
  );
}
