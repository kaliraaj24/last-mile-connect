# LastMileConnect — Teammate Integration Guide

Quick reference for importing and using the data models and matching engine (`/data/models.js` and `/utils/matching.js`).

---

## 1. Data Models (`/data/models.js`)

### `TripRequest` Object
```js
{
  id: string,               // e.g. "trip_1788596966088_4s13n"
  userName: string,         // e.g. "Aarav Sharma"
  stationName: string,      // e.g. "Indiranagar Metro Station"
  destinationZone: string,  // e.g. "Koramangala Block 4"
  timestamp: number,        // e.g. 1788596966088
  status: "waiting" | "matched"
}
```

### `MatchGroup` Object
```js
{
  id: string,               // e.g. "match_1788596966091_4s13n"
  tripIds: string[],        // Array of matching TripRequest IDs
  destinationZone: string,  // Shared destination zone
  farePerPerson: number,    // Calculated fare per person (in ₹)
  totalFare: number,        // Total fare for the ride (in ₹)
  pickupPoint: string       // Designated pickup point at station
}
```

---

## 2. App Initialization (Seed Data)

Run `seedDummyTripRequests()` on app load (e.g. in `App.jsx` `useEffect`) to pre-populate dummy commuters so live demo requests match instantly.

```js
import { seedDummyTripRequests } from "./utils/matching.js";

useEffect(() => {
  // Seeds 4 dummy requests if localStorage is empty
  seedDummyTripRequests();
}, []);
```

---

## 3. Person A: Request Form Submission

When a user submits a trip request:
1. Call `addTripRequest()` to save their request.
2. Call `findMatches()` to evaluate and pair matching commuters.

```js
import { addTripRequest, findMatches } from "./utils/matching.js";
import { createTripRequest } from "./data/models.js";

const handleSubmit = (formData) => {
  // 1. Create and save trip request
  const newTrip = addTripRequest(createTripRequest({
    userName: formData.userName,
    stationName: formData.stationName,
    destinationZone: formData.destinationZone
  }));

  // 2. Trigger matching engine
  findMatches();

  // Redirect or update UI using newTrip.id or newTrip.userName
};
```

---

## 4. Person C: Confirmation & Match Retrieval

Call `getMatchForUser(userIdOrTripId)` to fetch the user's matched group.

```js
import { getMatchForUser } from "./utils/matching.js";

const match = getMatchForUser(currentTripIdOrUserName);

if (match) {
  console.log("Matched!", match.farePerPerson, match.pickupPoint, match.tripIds);
  // Display match details, fare split, and pickup point
} else {
  console.log("Still waiting for a matching commuter...");
  // Show waiting state screen
}
```
* **Returns**: The `MatchGroup` object if matched, or `null` if still waiting or not found.

---

## 5. Gotchas & Key Details

* **`localStorage` Keys**:
  * `"tripRequests"`: Stores array of all `TripRequest` objects.
  * `"matchGroups"`: Stores array of all formed `MatchGroup` objects.
* **Automatic Status Updates**: `findMatches()` automatically updates `TripRequest.status` from `"waiting"` to `"matched"` inside `localStorage` when 2+ commuters match.
* **Matching Criteria**: Matches require exact same `stationName` AND `destinationZone` (case-insensitive & trimmed).
* **Reset Helper**: Call `clearMatchingData()` from `./utils/matching.js` anytime during testing to clear `localStorage`.
