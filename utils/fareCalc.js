/**
 * LastMileConnect - Fare Calculation Utility
 * 
 * Computes shared auto/e-rickshaw fares based on distance and number of co-riders,
 * and provides solo fare comparison to highlight passenger cost savings.
 * 
 * Location: /utils/fareCalc.js
 */

export const FARE_CONFIG = {
  DEFAULT_BASE_FARE: 30,     // Base fare in ₹ (first 1.5 - 2 km standard in metro autos)
  DEFAULT_PER_KM_RATE: 12,   // Per-km rate in ₹/km
  MIN_FARE: 30,              // Minimum ride fare in ₹
};

/**
 * Calculates total trip fare, split fare per rider, and solo fare for comparison.
 *
 * Formula:
 *   Total Trip Fare = max(MIN_FARE, baseFare + (distanceKm * perKmRate))
 *   Solo Fare = Total Trip Fare (what a single commuter would pay for the entire vehicle)
 *   Fare Per Person = Total Trip Fare / numRiders
 *   Savings = Solo Fare - Fare Per Person
 *
 * @param {number|string} distanceKm - Trip distance in kilometers
 * @param {number|string} [numRiders=1] - Number of passengers sharing the ride
 * @param {Object} [options={}] - Custom pricing overrides
 * @param {number} [options.baseFare=30] - Base starting fare in ₹
 * @param {number} [options.perKmRate=12] - Per kilometer charge in ₹
 * @param {number} [options.minFare=30] - Absolute minimum trip fare in ₹
 * @returns {Object} Fare breakdown object
 */
export function calculateFare(distanceKm, numRiders = 1, options = {}) {
  // Validate and parse distance
  const parsedDistance = parseFloat(distanceKm);
  const validDistance = isNaN(parsedDistance) || parsedDistance < 0 ? 0 : parsedDistance;

  // Validate and parse riders count (must be at least 1)
  const parsedRiders = parseInt(numRiders, 10);
  const validRiders = isNaN(parsedRiders) || parsedRiders < 1 ? 1 : parsedRiders;

  const baseFare = typeof options.baseFare === "number" ? options.baseFare : FARE_CONFIG.DEFAULT_BASE_FARE;
  const perKmRate = typeof options.perKmRate === "number" ? options.perKmRate : FARE_CONFIG.DEFAULT_PER_KM_RATE;
  const minFare = typeof options.minFare === "number" ? options.minFare : FARE_CONFIG.MIN_FARE;

  // Calculate total ride fare
  const rawTotal = baseFare + (validDistance * perKmRate);
  const totalFare = Math.max(minFare, Math.round(rawTotal));

  // Solo fare is the cost if one commuter hired the entire vehicle alone
  const soloFare = totalFare;

  // Split fare per person rounded cleanly to nearest rupee
  const farePerPerson = Math.max(1, Math.round(totalFare / validRiders));

  // Passenger savings
  const savings = Math.max(0, soloFare - farePerPerson);
  const savingsPercent = soloFare > 0 ? Math.round((savings / soloFare) * 100) : 0;

  return {
    totalFare,
    farePerPerson,
    soloFare,
    savings,
    savingsPercent,
    numRiders: validRiders,
    distanceKm: validDistance,
    formatted: {
      farePerPerson: `₹${farePerPerson}`,
      soloFare: `₹${soloFare}`,
      totalFare: `₹${totalFare}`,
      savings: `₹${savings}`,
      savingsPercent: `${savingsPercent}%`,
    },
    summaryText: `You pay ₹${farePerPerson} instead of ₹${soloFare} (Save ₹${savings} / ${savingsPercent}%)`,
  };
}

/**
 * Formats a numeric currency value with Indian Rupee symbol (₹).
 * @param {number|string} amount 
 * @returns {string} e.g. "₹45"
 */
export function formatCurrency(amount) {
  const num = Math.round(parseFloat(amount) || 0);
  return `₹${num}`;
}

export default calculateFare;
