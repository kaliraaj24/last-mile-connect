/**
 * LastMileConnect - Matching Engine
 * 
 * Target path: /utils/matching.js
 */

import { STORAGE_KEYS, TRIP_STATUS, createMatchGroup, createTripRequest } from "../data/models.js";

/**
 * Safe wrapper to retrieve parsed JSON from localStorage.
 * Works in browser environment or falls back safely.
 * @param {string} key 
 * @returns {Array}
 */
function getStorageArray(key) {
  try {
    if (typeof localStorage === "undefined") return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`[LastMileConnect] Error reading key "${key}" from localStorage:`, error);
    return [];
  }
}

/**
 * Safe wrapper to write JSON data to localStorage.
 * @param {string} key 
 * @param {Array} value 
 */
function setStorageArray(key, value) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error(`[LastMileConnect] Error saving key "${key}" to localStorage:`, error);
  }
}

/**
 * Pre-populates 3-4 dummy TripRequest entries in localStorage if empty or forced.
 * Allows instant demo matching on app load without waiting for concurrent users.
 * @param {boolean} [force=false] If true, overwrites existing tripRequests.
 * @returns {Array} Seeded trip requests array
 */
export function seedDummyTripRequests(force = false) {
  const existing = getStorageArray(STORAGE_KEYS.TRIP_REQUESTS);
  if (!force && existing.length > 0) {
    console.log("[LastMileConnect] LocalStorage already contains trip requests. Skipping seed.");
    return existing;
  }

  const dummyRequests = [
    createTripRequest({
      id: "trip_seed_1",
      userName: "Aarav Sharma",
      stationName: "Indiranagar Metro Station",
      destinationZone: "Koramangala Block 4",
      status: TRIP_STATUS.WAITING,
    }),
    createTripRequest({
      id: "trip_seed_2",
      userName: "Priya Patel",
      stationName: "Indiranagar Metro Station",
      destinationZone: "Koramangala Block 4",
      status: TRIP_STATUS.WAITING,
    }),
    createTripRequest({
      id: "trip_seed_3",
      userName: "Rohan Verma",
      stationName: "Indiranagar Metro Station",
      destinationZone: "Koramangala Block 4",
      status: TRIP_STATUS.WAITING,
    }),
    createTripRequest({
      id: "trip_seed_4",
      userName: "Ananya Iyer",
      stationName: "MG Road Metro Station",
      destinationZone: "Whitefield Phase 1",
      status: TRIP_STATUS.WAITING,
    }),
  ];

  setStorageArray(STORAGE_KEYS.TRIP_REQUESTS, dummyRequests);
  console.log("[LastMileConnect] Pre-populated localStorage with dummy TripRequests:", dummyRequests);
  return dummyRequests;
}

/**
 * Helper to fetch all trip requests from localStorage.
 * @returns {Array}
 */
export function getTripRequests() {
  return getStorageArray(STORAGE_KEYS.TRIP_REQUESTS);
}

/**
 * Helper to fetch all match groups from localStorage.
 * @returns {Array}
 */
export function getMatchGroups() {
  return getStorageArray(STORAGE_KEYS.MATCH_GROUPS);
}

/**
 * Helper to add a new TripRequest to localStorage.
 * @param {Object} tripData 
 * @returns {Object} Newly added TripRequest
 */
export function addTripRequest(tripData) {
  const requests = getTripRequests();
  const newRequest = tripData.id ? tripData : createTripRequest(tripData);
  requests.push(newRequest);
  setStorageArray(STORAGE_KEYS.TRIP_REQUESTS, requests);
  console.log("[LastMileConnect] Added new TripRequest:", newRequest);
  return newRequest;
}

/**
 * 1. Reads all TripRequest objects with status "waiting" from localStorage.
 * 2. Groups requests by matching stationName AND destinationZone (exact match / normalized).
 * 3. When 2 or more requests match, creates a MatchGroup object, updates those TripRequests' status
 *    to "matched" in localStorage, and saves the MatchGroup under "matchGroups".
 * 
 * @returns {Array} Array of newly created MatchGroup objects
 */
export function findMatches() {
  console.log("[LastMileConnect] Running matching engine (findMatches)...");
  
  const allRequests = getTripRequests();
  const waitingRequests = allRequests.filter(req => req.status === TRIP_STATUS.WAITING);

  if (waitingRequests.length === 0) {
    console.log("[LastMileConnect] No waiting trip requests found.");
    return [];
  }

  console.log(`[LastMileConnect] Found ${waitingRequests.length} waiting request(s). Grouping by station & zone...`);

  // Group waiting requests by normalized stationName and destinationZone
  const groupedByStationAndZone = {};

  waitingRequests.forEach(request => {
    const normStation = (request.stationName || "").trim().toLowerCase();
    const normZone = (request.destinationZone || "").trim().toLowerCase();
    const groupKey = `${normStation}::${normZone}`;

    if (!groupedByStationAndZone[groupKey]) {
      groupedByStationAndZone[groupKey] = [];
    }
    groupedByStationAndZone[groupKey].push(request);
  });

  const newMatchGroups = [];
  const existingMatchGroups = getMatchGroups();
  const matchedTripIdsSet = new Set();

  // Process groups that have 2 or more requests
  Object.keys(groupedByStationAndZone).forEach(groupKey => {
    const groupRequests = groupedByStationAndZone[groupKey];

    if (groupRequests.length >= 2) {
      const tripIds = groupRequests.map(req => req.id);
      const destinationZone = groupRequests[0].destinationZone; // Keep original formatting
      const stationName = groupRequests[0].stationName;
      
      // Calculate fare logic (default auto fare estimate ₹120 per auto trip)
      const baseTotalFare = 120;
      const farePerPerson = Math.round(baseTotalFare / groupRequests.length);

      const matchGroup = createMatchGroup({
        tripIds,
        destinationZone,
        farePerPerson,
        totalFare: baseTotalFare,
        pickupPoint: `${stationName} - Main Auto Stand (Exit Gate 1)`,
      });

      newMatchGroups.push(matchGroup);
      tripIds.forEach(id => matchedTripIdsSet.add(id));

      console.log(
        `[LastMileConnect] MATCH FOUND! Created MatchGroup ${matchGroup.id} for ${groupRequests.length} commuters at ${stationName} -> ${destinationZone}.`
      );
    }
  });

  if (newMatchGroups.length > 0) {
    // 1. Update statuses of matched TripRequests in localStorage
    const updatedRequests = allRequests.map(req => {
      if (matchedTripIdsSet.has(req.id)) {
        return { ...req, status: TRIP_STATUS.MATCHED };
      }
      return req;
    });
    setStorageArray(STORAGE_KEYS.TRIP_REQUESTS, updatedRequests);

    // 2. Append new MatchGroups to localStorage
    const updatedMatchGroups = [...existingMatchGroups, ...newMatchGroups];
    setStorageArray(STORAGE_KEYS.MATCH_GROUPS, updatedMatchGroups);

    console.log(`[LastMileConnect] Successfully saved ${newMatchGroups.length} new MatchGroup(s) to localStorage.`);
  } else {
    console.log("[LastMileConnect] No matching pairs (2 or more commuters) found in current waiting pool.");
  }

  return newMatchGroups;
}

/**
 * 4. Retrieves the MatchGroup a specific user landed in.
 * Supports searching by trip ID, user ID, or user name.
 * 
 * @param {string} userId - Can be trip ID or user ID / user name
 * @returns {Object|null} The MatchGroup object if found, otherwise null
 */
export function getMatchForUser(userId) {
  if (!userId) {
    console.warn("[LastMileConnect] getMatchForUser called with empty userId.");
    return null;
  }

  const matchGroups = getMatchGroups();
  const allRequests = getTripRequests();

  // First check if userId directly matches a tripId in matchGroups
  let targetMatch = matchGroups.find(group => group.tripIds.includes(userId));

  if (targetMatch) {
    console.log(`[LastMileConnect] Found MatchGroup ${targetMatch.id} for direct tripId "${userId}".`);
    return targetMatch;
  }

  // If not found directly, check if userId corresponds to a userName or id in tripRequests
  const userTrip = allRequests.find(
    req => req.id === userId || req.userName?.toLowerCase() === userId.toLowerCase()
  );

  if (userTrip) {
    targetMatch = matchGroups.find(group => group.tripIds.includes(userTrip.id));
    if (targetMatch) {
      console.log(`[LastMileConnect] Found MatchGroup ${targetMatch.id} for user "${userId}" (Trip ID: ${userTrip.id}).`);
      return targetMatch;
    }
  }

  console.log(`[LastMileConnect] No MatchGroup found for user/trip ID "${userId}".`);
  return null;
}

/**
 * Helper to clear all trip and match data from localStorage (useful for demo reset).
 */
export function clearMatchingData() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.TRIP_REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.MATCH_GROUPS);
    console.log("[LastMileConnect] Matching data cleared from localStorage.");
  }
}
