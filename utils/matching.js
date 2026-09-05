/**
 * LastMileConnect - Matching Engine
 * 
 * Target path: /utils/matching.js
 */

import { STORAGE_KEYS, TRIP_STATUS, createMatchGroup, createTripRequest } from "../data/models.js";

/**
 * Safe wrapper to retrieve parsed JSON array from localStorage.
 * Handles missing localStorage, corrupted JSON, and non-array types gracefully.
 * @param {string} key 
 * @returns {Array}
 */
function getStorageArray(key) {
  try {
    if (typeof localStorage === "undefined") return [];
    const rawData = localStorage.getItem(key);
    if (!rawData) return [];
    
    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      console.warn(`[LastMileConnect] Data under key "${key}" is not an array. Resetting.`);
      return [];
    }
    return parsed;
  } catch (error) {
    console.error(`[LastMileConnect] Corrupted localStorage data for key "${key}". Resetting to empty array.`, error);
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
  ].filter(Boolean);

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
 * Hardened against empty or missing fields.
 * 
 * @param {Object} tripData 
 * @returns {Object|null} Newly added TripRequest or null if invalid
 */
export function addTripRequest(tripData) {
  if (!tripData) {
    console.error("[LastMileConnect] addTripRequest called with null/empty data.");
    return null;
  }

  // Create request (validates userName, stationName, and destinationZone)
  const newRequest = createTripRequest(tripData);
  if (!newRequest) {
    console.error("[LastMileConnect] Cannot add invalid TripRequest.");
    return null;
  }

  const requests = getTripRequests();
  requests.push(newRequest);
  setStorageArray(STORAGE_KEYS.TRIP_REQUESTS, requests);
  console.log("[LastMileConnect] Added new TripRequest:", newRequest);
  return newRequest;
}

/**
 * 1. Reads all TripRequest objects with status "waiting" from localStorage.
 * 2. Groups requests by normalized stationName AND destinationZone (case-insensitive & trimmed).
 * 3. Dedupes requests by userName within each station+zone group to handle duplicate submissions.
 * 4. When 2 or more unique users match, creates a MatchGroup object, updates their status
 *    to "matched" in localStorage, and saves the MatchGroup under "matchGroups".
 * 
 * @returns {Array} Array of newly created MatchGroup objects
 */
export function findMatches() {
  console.log("[LastMileConnect] Running matching engine (findMatches)...");
  
  const allRequests = getTripRequests();
  const waitingRequests = allRequests.filter(
    req => req && req.status === TRIP_STATUS.WAITING && req.stationName && req.destinationZone && req.userName
  );

  if (waitingRequests.length === 0) {
    console.log("[LastMileConnect] No valid waiting trip requests found.");
    return [];
  }

  console.log(`[LastMileConnect] Found ${waitingRequests.length} waiting request(s). Grouping by normalized station & zone...`);

  // Group waiting requests by normalized stationName and destinationZone
  const groupedByStationAndZone = {};

  waitingRequests.forEach(request => {
    const normStation = String(request.stationName).trim().toLowerCase();
    const normZone = String(request.destinationZone).trim().toLowerCase();
    const groupKey = `${normStation}::${normZone}`;

    if (!groupedByStationAndZone[groupKey]) {
      groupedByStationAndZone[groupKey] = [];
    }
    groupedByStationAndZone[groupKey].push(request);
  });

  const newMatchGroups = [];
  const existingMatchGroups = getMatchGroups();
  const matchedTripIdsSet = new Set();

  // Process each station+zone group
  Object.keys(groupedByStationAndZone).forEach(groupKey => {
    const groupRequests = groupedByStationAndZone[groupKey];

    // Deduplicate by userName (keep earliest submission)
    const uniqueUserRequests = [];
    const seenUsers = new Set();

    groupRequests.forEach(req => {
      const normUserName = String(req.userName).trim().toLowerCase();
      if (!seenUsers.has(normUserName)) {
        seenUsers.add(normUserName);
        uniqueUserRequests.push(req);
      }
    });

    if (uniqueUserRequests.length >= 2) {
      const tripIds = uniqueUserRequests.map(req => req.id);
      const destinationZone = uniqueUserRequests[0].destinationZone; // Keep original user casing
      const stationName = uniqueUserRequests[0].stationName;
      
      const baseTotalFare = 120;
      const farePerPerson = Math.round(baseTotalFare / uniqueUserRequests.length);

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
        `[LastMileConnect] MATCH FOUND! Created MatchGroup ${matchGroup.id} for ${uniqueUserRequests.length} unique commuters at ${stationName} -> ${destinationZone}.`
      );
    }
  });

  if (newMatchGroups.length > 0) {
    // 1. Update statuses of matched TripRequests in localStorage
    const updatedRequests = allRequests.map(req => {
      if (req && matchedTripIdsSet.has(req.id)) {
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
    console.log("[LastMileConnect] No matching pairs (2 or more unique commuters) found in current waiting pool.");
  }

  return newMatchGroups;
}

/**
 * Retrieves the MatchGroup a specific user landed in.
 * Normalizes input string (trims whitespace, case-insensitive match on userName/tripId).
 * 
 * @param {string} userId - Can be trip ID or user name / user ID
 * @returns {Object|null} The MatchGroup object if found, otherwise null
 */
export function getMatchForUser(userId) {
  if (!userId || typeof userId !== "string") {
    console.warn("[LastMileConnect] getMatchForUser called with invalid or non-string input.");
    return null;
  }

  const rawInput = userId.trim();
  if (!rawInput) return null;

  const normInput = rawInput.toLowerCase();
  const matchGroups = getMatchGroups();
  const allRequests = getTripRequests();

  // 1. Direct match on tripId (case-insensitive & trimmed)
  let targetMatch = matchGroups.find(group => 
    group.tripIds && group.tripIds.some(id => String(id).trim().toLowerCase() === normInput)
  );

  if (targetMatch) {
    console.log(`[LastMileConnect] Found MatchGroup ${targetMatch.id} for direct tripId "${rawInput}".`);
    return targetMatch;
  }

  // 2. Lookup user in tripRequests by tripId or userName (case-insensitive)
  const userTrip = allRequests.find(
    req => req && (
      (req.id && String(req.id).trim().toLowerCase() === normInput) ||
      (req.userName && String(req.userName).trim().toLowerCase() === normInput)
    )
  );

  if (userTrip) {
    targetMatch = matchGroups.find(group => 
      group.tripIds && group.tripIds.includes(userTrip.id)
    );
    if (targetMatch) {
      console.log(`[LastMileConnect] Found MatchGroup ${targetMatch.id} for user "${rawInput}" (Trip ID: ${userTrip.id}).`);
      return targetMatch;
    }
  }

  console.log(`[LastMileConnect] No MatchGroup found for user/trip ID "${rawInput}".`);
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
