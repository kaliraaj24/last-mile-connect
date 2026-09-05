/**
 * LastMileConnect - LocalStorage & Matching Service
 * 
 * Manages client-side persistence for TripRequests and MatchGroups,
 * and handles instant matching when matching criteria are satisfied.
 */

import { INITIAL_TRIP_REQUESTS, INITIAL_MATCH_GROUPS } from "../data/seedData.js";
import { calculateFare } from "./fareCalc.js";

const STORAGE_KEYS = {
  TRIP_REQUESTS: "tripRequests",
  MATCH_GROUPS: "matchGroups",
  CURRENT_USER: "currentUser",
  CURRENT_MATCH: "currentMatch",
  DEMO_INITIALIZED: "lmc_demo_initialized",
};

/**
 * Ensures demo data is populated into localStorage on first load.
 */
export function initDemoStorage(force = false) {
  try {
    const initialized = localStorage.getItem(STORAGE_KEYS.DEMO_INITIALIZED);
    if (!initialized || force) {
      localStorage.setItem(STORAGE_KEYS.TRIP_REQUESTS, JSON.stringify(INITIAL_TRIP_REQUESTS));
      localStorage.setItem(STORAGE_KEYS.MATCH_GROUPS, JSON.stringify(INITIAL_MATCH_GROUPS));
      localStorage.setItem(STORAGE_KEYS.DEMO_INITIALIZED, "true");
      console.log("[LastMileConnect] Seed data successfully loaded into localStorage.");
    }
  } catch (err) {
    console.error("[LastMileConnect] Failed to initialize localStorage:", err);
  }
}

export function getTripRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRIP_REQUESTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveTripRequests(requests) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRIP_REQUESTS, JSON.stringify(requests));
  } catch (e) {
    console.error("Failed to save trip requests:", e);
  }
}

export function getMatchGroups() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATCH_GROUPS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveMatchGroups(groups) {
  try {
    localStorage.setItem(STORAGE_KEYS.MATCH_GROUPS, JSON.stringify(groups));
  } catch (e) {
    console.error("Failed to save match groups:", e);
  }
}

/**
 * Attempts to match a newly created trip request with concurrent pending requests.
 * Instant match occurs if another rider shares the same station and destination zone.
 * 
 * @param {Object} userRequest - { userName, stationName, destinationZone, distanceKm, pickupPillar }
 * @returns {Object} { matched: boolean, matchGroup: Object|null, waitingRidersCount: number }
 */
export function processRequestAndMatch(userRequest) {
  initDemoStorage();

  const requests = getTripRequests();
  const newReq = {
    ...userRequest,
    id: userRequest.id || `req_${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: "WAITING",
  };

  // Find concurrent requests matching same station and destination zone
  const compatibleWaiters = requests.filter(
    (r) =>
      r.status === "WAITING" &&
      r.stationName?.toLowerCase() === newReq.stationName?.toLowerCase() &&
      r.destinationZone?.toLowerCase() === newReq.destinationZone?.toLowerCase()
  );

  if (compatibleWaiters.length > 0) {
    // We have a match! Group the user with up to 2 other waiters (3 passengers total max)
    const selectedWaiters = compatibleWaiters.slice(0, 2);
    const coRiderIds = selectedWaiters.map((r) => r.id);
    const allRiderIds = [...coRiderIds, newReq.id];
    const totalRiders = allRiderIds.length;

    // Calculate split fare
    const distance = newReq.distanceKm || selectedWaiters[0]?.distanceKm || 4.5;
    const fareInfo = calculateFare(distance, totalRiders);

    // Update statuses to MATCHED
    newReq.status = "MATCHED";
    const updatedRequests = requests.map((r) => {
      if (coRiderIds.includes(r.id)) {
        return { ...r, status: "MATCHED" };
      }
      return r;
    });
    updatedRequests.push(newReq);
    saveTripRequests(updatedRequests);

    // Create Match Group
    const newMatchGroup = {
      id: `match_${Date.now()}`,
      tripIds: allRiderIds,
      stationName: newReq.stationName,
      destinationZone: newReq.destinationZone,
      pickupPoint: newReq.pickupPillar || `${newReq.stationName} - Exit Gate 1 (Auto Stand)`,
      distanceKm: distance,
      totalFare: fareInfo.totalFare,
      farePerPerson: fareInfo.farePerPerson,
      status: "CONFIRMED",
      autoDetails: {
        driverName: "Manjunath K.",
        vehicleNumber: "KA 01 EK 4482",
        vehicleType: "Electric Auto / Rickshaw",
        driverRating: 4.9,
        etaMinutes: 2,
      },
      createdAt: new Date().toISOString(),
    };

    const matchGroups = getMatchGroups();
    matchGroups.push(newMatchGroup);
    saveMatchGroups(matchGroups);

    // Cache current match for quick retrieval by MatchConfirmation screen
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_MATCH, JSON.stringify(newMatchGroup));
    } catch (e) {}

    return {
      matched: true,
      matchGroup: newMatchGroup,
      userRequest: newReq,
    };
  }

  // No match yet — save user request as WAITING
  requests.push(newReq);
  saveTripRequests(requests);

  return {
    matched: false,
    matchGroup: null,
    userRequest: newReq,
  };
}

export function resetDemoData() {
  initDemoStorage(true);
}
