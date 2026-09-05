/**
 * LastMileConnect - Shared Data Models
 * 
 * Target path: /data/models.js
 */

export const TRIP_STATUS = {
  WAITING: "waiting",
  MATCHED: "matched",
};

export const STORAGE_KEYS = {
  TRIP_REQUESTS: "tripRequests",
  MATCH_GROUPS: "matchGroups",
};

/**
 * Creates a standard TripRequest object.
 * Returns null if required fields (userName, stationName, destinationZone) are empty/missing.
 * 
 * @param {Object} params
 * @param {string} [params.id]
 * @param {string} params.userName
 * @param {string} params.stationName
 * @param {string} params.destinationZone
 * @param {number} [params.timestamp]
 * @param {"waiting" | "matched"} [params.status]
 * @returns {Object|null} TripRequest object or null if invalid input
 */
export function createTripRequest({
  id = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
  userName,
  stationName,
  destinationZone,
  timestamp = Date.now(),
  status = TRIP_STATUS.WAITING,
} = {}) {
  const cleanName = typeof userName === "string" ? userName.trim() : "";
  const cleanStation = typeof stationName === "string" ? stationName.trim() : "";
  const cleanZone = typeof destinationZone === "string" ? destinationZone.trim() : "";

  if (!cleanName || !cleanStation || !cleanZone) {
    console.error("[LastMileConnect] Invalid TripRequest: userName, stationName, and destinationZone cannot be empty.");
    return null;
  }

  return {
    id,
    userName: cleanName,
    stationName: cleanStation,
    destinationZone: cleanZone,
    timestamp,
    status,
  };
}

/**
 * Creates a standard MatchGroup object.
 * 
 * @param {Object} params
 * @param {string} [params.id]
 * @param {string[]} params.tripIds
 * @param {string} params.destinationZone
 * @param {number} params.farePerPerson
 * @param {number} params.totalFare
 * @param {string} [params.pickupPoint]
 * @returns {Object} MatchGroup
 */
export function createMatchGroup({
  id = `match_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
  tripIds = [],
  destinationZone = "",
  farePerPerson = 0,
  totalFare = 0,
  pickupPoint = "Auto Stand Exit Gate 1",
} = {}) {
  return {
    id,
    tripIds,
    destinationZone: typeof destinationZone === "string" ? destinationZone.trim() : "",
    farePerPerson,
    totalFare,
    pickupPoint,
  };
}
