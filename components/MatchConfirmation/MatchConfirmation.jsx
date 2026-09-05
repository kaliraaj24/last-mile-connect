/**
 * LastMileConnect - Match Confirmation Screen
 * 
 * Payoff screen shown after a commuter is matched with co-riders.
 * Displays co-rider avatars, shared pickup point, live auto arrival ETA,
 * and high-impact fare savings highlight (e.g. "You pay ₹45 instead of ₹120").
 * 
 * Location: /components/MatchConfirmation/MatchConfirmation.jsx
 */

import React, { useState, useEffect, useMemo } from "react";
import { calculateFare, formatCurrency } from "../../utils/fareCalc.js";
import "./MatchConfirmation.css";

// Avatar background palette for co-riders using shared theme variables
const AVATAR_PALETTES = [
  "var(--lmc-primary)",
  "var(--lmc-teal)",
  "var(--lmc-primary-dark)",
  "var(--lmc-teal-hover)",
];

// Fallback co-rider profiles if storage contains limited request metadata
const FALLBACK_RIDERS = [
  { name: "Aarav Sharma", isUser: true, status: "Ready at Gate 1" },
  { name: "Priya Patel", isUser: false, status: "At Metro Exit" },
  { name: "Rohan Verma", isUser: false, status: "Arrived at Pillar #4" },
];

/**
 * Extracts 2-letter initials from a full name (e.g. "Aarav Sharma" -> "AS")
 */
function getInitials(name) {
  if (!name || typeof name !== "string") return "LM";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function MatchConfirmation({
  matchGroup: propMatchGroup,
  tripId,
  userName,
  onBack,
  onDone,
}) {
  const [matchData, setMatchData] = useState(propMatchGroup || null);
  const [riderProfiles, setRiderProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoPin] = useState(() => Math.floor(1000 + Math.random() * 9000));
  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Read MatchGroup and TripRequests from localStorage or props
  useEffect(() => {
    if (propMatchGroup) {
      setMatchData(propMatchGroup);
      resolveRiders(propMatchGroup);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch match groups from localStorage
      const rawMatchGroups = localStorage.getItem("matchGroups");
      const matchGroups = rawMatchGroups ? JSON.parse(rawMatchGroups) : [];

      let targetMatch = null;

      if (matchGroups && matchGroups.length > 0) {
        if (tripId) {
          // Find specific match containing this tripId
          targetMatch = matchGroups.find(
            (mg) => mg.tripIds && mg.tripIds.includes(tripId)
          );
        }

        // If not found by tripId, fallback to latest match group
        if (!targetMatch) {
          targetMatch = matchGroups[matchGroups.length - 1];
        }
      }

      // Also check fallback storage key
      if (!targetMatch) {
        const rawCurrent = localStorage.getItem("currentMatch");
        if (rawCurrent) targetMatch = JSON.parse(rawCurrent);
      }

      if (targetMatch) {
        setMatchData(targetMatch);
        resolveRiders(targetMatch);
      }
    } catch (err) {
      console.error("[MatchConfirmation] Error reading localStorage:", err);
    } finally {
      setIsLoading(false);
    }
  }, [propMatchGroup, tripId]);

  /**
   * Resolves rider names from tripRequests in localStorage, or falls back gracefully
   */
  const resolveRiders = (match) => {
    try {
      const rawRequests = localStorage.getItem("tripRequests");
      const tripRequests = rawRequests ? JSON.parse(rawRequests) : [];
      const matchedIds = match.tripIds || [];

      // Find requests matching tripIds in the MatchGroup
      const matchedRequests = tripRequests.filter(
        (req) => req && matchedIds.includes(req.id)
      );

      if (matchedRequests.length > 0) {
        const profiles = matchedRequests.map((req, idx) => {
          const isCurrentUser =
            (userName && req.userName && req.userName.toLowerCase() === userName.toLowerCase()) ||
            (tripId && req.id === tripId) ||
            idx === 0;

          return {
            name: req.userName || `Rider ${idx + 1}`,
            isUser: isCurrentUser,
            status: idx === 0 ? "You (Confirmed)" : "Confirmed co-commuter",
          };
        });
        setRiderProfiles(profiles);
        return;
      }
    } catch (e) {
      console.warn("[MatchConfirmation] Failed to parse tripRequests:", e);
    }

    // Default fallback rider names if requests not in storage
    setRiderProfiles(FALLBACK_RIDERS);
  };

  /**
   * Handles manual demo seeding if user lands on screen with empty storage
   */
  const handleLoadDemoMatch = () => {
    const demoMatch = {
      id: `match_${Date.now()}_demo`,
      tripIds: ["trip_demo_1", "trip_demo_2", "trip_demo_3"],
      destinationZone: "Koramangala Block 4",
      farePerPerson: 40,
      totalFare: 120,
      pickupPoint: "Indiranagar Metro - Main Auto Stand (Exit Gate 1)",
    };

    try {
      localStorage.setItem("matchGroups", JSON.stringify([demoMatch]));
    } catch (e) {
      console.warn("Storage unavailable:", e);
    }

    setMatchData(demoMatch);
    setRiderProfiles(FALLBACK_RIDERS);
  };

  /**
   * Computes high-impact fare savings breakdown
   */
  const fareBreakdown = useMemo(() => {
    if (!matchData) return null;

    const totalFare = matchData.totalFare || 120;
    const numRiders = (matchData.tripIds && matchData.tripIds.length) || riderProfiles.length || 3;
    const farePerPerson = matchData.farePerPerson || Math.round(totalFare / numRiders);

    // Solo fare: what one commuter would pay for hiring the entire auto alone
    const soloFare = totalFare;
    const savings = Math.max(0, soloFare - farePerPerson);
    const savingsPercent = soloFare > 0 ? Math.round((savings / soloFare) * 100) : 0;

    return {
      farePerPerson,
      soloFare,
      totalFare,
      savings,
      savingsPercent,
      numRiders,
    };
  }, [matchData, riderProfiles.length]);

  const handleCopyShare = () => {
    const shareText = `🛺 LastMileConnect Shared Ride:\nPickup: ${matchData?.pickupPoint}\nDestination: ${matchData?.destinationZone}\nFare: ₹${fareBreakdown?.farePerPerson}/rider (Auto arriving in 4 min!)`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // --------------------------------------------------------------------------
  // RENDER: Loading or Empty State
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="lmc-mc-container">
        <div className="lmc-mc-wrapper">
          <div className="lmc-mc-empty-card">
            <div className="lmc-mc-empty-icon">⏳</div>
            <h2 className="lmc-mc-empty-title">Loading Match Details...</h2>
            <p className="lmc-mc-empty-desc">Fetching co-rider details and fare split from transit pool.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="lmc-mc-container">
        <div className="lmc-mc-wrapper">
          <div className="lmc-mc-empty-card">
            <div className="lmc-mc-empty-icon">🔍</div>
            <h2 className="lmc-mc-empty-title">No Active Match Found</h2>
            <p className="lmc-mc-empty-desc">
              We couldn't locate a MatchGroup in local storage. Submit a ride request from the form or launch the demo match below.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                type="button"
                className="lmc-mc-btn lmc-mc-btn-primary"
                style={{ width: "auto" }}
                onClick={handleLoadDemoMatch}
              >
                ⚡ Load Demo Match (Instant)
              </button>
              {onBack && (
                <button
                  type="button"
                  className="lmc-mc-btn lmc-mc-btn-secondary"
                  style={{ width: "auto" }}
                  onClick={onBack}
                >
                  ← Go to Request Form
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Active Match Confirmation Screen
  // --------------------------------------------------------------------------
  const { farePerPerson, soloFare, savings, savingsPercent, numRiders } = fareBreakdown || {};

  return (
    <div className="lmc-mc-container">
      <div className="lmc-mc-wrapper">
        
        {/* Navigation & Header Controls */}
        <div className="lmc-mc-header-nav">
          {onBack && (
            <button type="button" className="lmc-mc-back-btn" onClick={onBack}>
              ← Back
            </button>
          )}
          <span className="lmc-mc-demo-badge">Live Auto Match</span>
        </div>

        {/* Hero Celebration Banner */}
        <div className="lmc-mc-hero-card">
          <div className="lmc-mc-badge-row">
            <span className="lmc-mc-success-chip">
              <span className="lmc-mc-pulse-dot"></span>
              RIDE CONFIRMED
            </span>
          </div>
          <h1 className="lmc-mc-hero-title">You're Matched! 🎉</h1>
          <p className="lmc-mc-hero-sub">
            Shared auto with {numRiders} co-riders heading towards {matchData.destinationZone || "your zone"}.
          </p>
        </div>

        {/* VISUAL HIGHLIGHT: Large Fare Savings Payoff */}
        <div className="lmc-mc-payoff-card">
          <div className="lmc-mc-payoff-top">
            <span className="lmc-mc-payoff-label">Fare Split Savings</span>
            <span className="lmc-mc-savings-pill">
              🔥 Save ₹{savings} ({savingsPercent}% OFF)
            </span>
          </div>

          <div className="lmc-mc-fare-comparison">
            <div className="lmc-mc-fare-main">
              <span className="lmc-mc-fare-subtag">Your Shared Share</span>
              <div className="lmc-mc-fare-huge">
                ₹{farePerPerson}
                <span className="lmc-mc-fare-unit">/ person</span>
              </div>
            </div>

            <div className="lmc-mc-fare-comparison-tag">
              <span className="lmc-mc-solo-tag">Solo Auto Fare</span>
              <div className="lmc-mc-solo-fare">₹{soloFare}</div>
            </div>
          </div>

          {/* Large Highlight Callout */}
          <div className="lmc-mc-payoff-highlight-banner">
            <span className="lmc-mc-payoff-text">
              ✨ You pay <strong>₹{farePerPerson}</strong> instead of <strong>₹{soloFare}</strong>
            </span>
            <span className="lmc-mc-payoff-tag">Total savings ₹{savings}</span>
          </div>
        </div>

        {/* Live Vehicle & Pickup Location Card */}
        <div className="lmc-mc-arrival-card">
          {/* Arrival Status & OTP */}
          <div className="lmc-mc-arrival-row">
            <div className="lmc-mc-auto-badge">
              <div className="lmc-mc-auto-icon-box">🛺</div>
              <div className="lmc-mc-auto-text">
                <div className="lmc-mc-eta-badge">
                  Auto arriving in 4 min
                  <span className="lmc-mc-eta-live-tag">ON THE WAY</span>
                </div>
                <div className="lmc-mc-auto-detail">
                  Bajaj RE Electric • KA 03 MB 4821 • Ramesh K.
                </div>
              </div>
            </div>

            <div className="lmc-mc-pin-box">
              <span className="lmc-mc-pin-label">Ride PIN</span>
              <span className="lmc-mc-pin-value">{autoPin}</span>
            </div>
          </div>

          {/* Route & Designated Pickup Point */}
          <div className="lmc-mc-route-box">
            <div className="lmc-mc-route-point">
              <div className="lmc-mc-route-dot pickup"></div>
              <div className="lmc-mc-route-info">
                <span className="lmc-mc-route-label">Designated Shared Pickup Point</span>
                <span className="lmc-mc-route-title">
                  {matchData.pickupPoint || "Station Exit Gate 1 - Auto Stand"}
                </span>
                <span className="lmc-mc-route-sub">Look for Pillar #4 / Auto Stand Bay 2</span>
              </div>
            </div>

            <div className="lmc-mc-route-point">
              <div className="lmc-mc-route-dot drop"></div>
              <div className="lmc-mc-route-info">
                <span className="lmc-mc-route-label">Destination Zone</span>
                <span className="lmc-mc-route-title">
                  {matchData.destinationZone || "Destination"}
                </span>
                <span className="lmc-mc-route-sub">Co-riders dropped along this common corridor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Matched Co-Riders Card */}
        <div className="lmc-mc-riders-card">
          <div className="lmc-mc-riders-header">
            <div className="lmc-mc-riders-title">
              <span>👥 Matched Co-Riders</span>
            </div>
            <span className="lmc-mc-riders-count">{riderProfiles.length} Commuters</span>
          </div>

          <div className="lmc-mc-riders-list">
            {riderProfiles.map((rider, index) => {
              const bgGradient = AVATAR_PALETTES[index % AVATAR_PALETTES.length];
              const initials = getInitials(rider.name);

              return (
                <div key={rider.name + index} className="lmc-mc-rider-item">
                  <div className="lmc-mc-rider-left">
                    <div 
                      className="lmc-mc-avatar"
                      style={{ background: bgGradient }}
                    >
                      {initials}
                    </div>
                    <div className="lmc-mc-rider-info">
                      <span className="lmc-mc-rider-name">
                        {rider.name}
                        {rider.isUser && <span className="lmc-mc-you-tag">You</span>}
                      </span>
                      <span className="lmc-mc-rider-status">
                        <span className="lmc-mc-rider-status-dot"></span>
                        {rider.status || "Confirmed Rider"}
                      </span>
                    </div>
                  </div>

                  <div className="lmc-mc-rider-split-tag">
                    ₹{farePerPerson}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lmc-mc-actions">
          <button
            type="button"
            className="lmc-mc-btn lmc-mc-btn-primary"
            onClick={handleCopyShare}
          >
            <span>{copiedLink ? "✅ Ride Info Copied!" : "📋 Share Ride Details with Co-Riders"}</span>
          </button>

          {onDone && (
            <button
              type="button"
              className="lmc-mc-btn lmc-mc-btn-secondary"
              onClick={onDone}
            >
              Done / Book Another Ride
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default MatchConfirmation;
