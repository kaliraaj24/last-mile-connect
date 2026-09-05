/**
 * LastMileConnect - Seed and Demo Data
 * 
 * Contains sample metro stations, popular destination zones,
 * and concurrent TripRequest entries for live demo matching.
 */

export const METRO_STATIONS = [
  { id: "stn_indiranagar", name: "Indiranagar Metro Station", line: "Purple Line", exitPillars: ["Exit Gate 1 (Main Auto Stand)", "Exit Gate 2 (CMH Road)"] },
  { id: "stn_mg_road", name: "MG Road Metro Station", line: "Purple Line", exitPillars: ["Exit 1 (Church Street)", "Exit 2 (Trinity side)"] },
  { id: "stn_baiyappanahalli", name: "Baiyappanahalli Metro Station", line: "Purple Line", exitPillars: ["Terminal Auto Stand", "South Gate"] },
  { id: "stn_hsr_silkboard", name: "Silk Board Metro Station", line: "Yellow Line", exitPillars: ["Pillar #14", "Service Road Auto Bay"] },
  { id: "stn_koramangala", name: "Sony World Junction / Forum", line: "Transit Hub", exitPillars: ["Main Stand", "Bus Bay"] },
];

export const DESTINATION_ZONES = [
  { id: "zone_kora_4", name: "Koramangala Block 4", distanceKm: 4.5, defaultFare: 84 },
  { id: "zone_indira_100ft", name: "Indiranagar 100ft Road", distanceKm: 2.2, defaultFare: 56 },
  { id: "zone_domlur_egl", name: "Domlur / Embassy GolfLinks (EGL)", distanceKm: 3.8, defaultFare: 75 },
  { id: "zone_hsr_sec1", name: "HSR Layout Sector 1", distanceKm: 6.0, defaultFare: 102 },
  { id: "zone_marathahalli", name: "Marathahalli Bridge / ORR", distanceKm: 7.5, defaultFare: 120 },
];

// Initial concurrent trip requests waiting at Indiranagar Metro for Koramangala Block 4
export const INITIAL_TRIP_REQUESTS = [
  {
    id: "req_demo_001",
    userName: "Priya Patel",
    userPhone: "+91 98765 43210",
    stationId: "stn_indiranagar",
    stationName: "Indiranagar Metro Station",
    destinationZone: "Koramangala Block 4",
    distanceKm: 4.5,
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    status: "WAITING", // WAITING | MATCHED | CANCELLED
    pickupPillar: "Exit Gate 1 (Main Auto Stand)",
    notes: "Near ticketing counter, blue backpack"
  },
  {
    id: "req_demo_002",
    userName: "Rohan Verma",
    userPhone: "+91 98123 45678",
    stationId: "stn_indiranagar",
    stationName: "Indiranagar Metro Station",
    destinationZone: "Koramangala Block 4",
    distanceKm: 4.5,
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    status: "WAITING",
    pickupPillar: "Exit Gate 1 (Main Auto Stand)",
    notes: "Waiting at auto queue"
  },
  {
    id: "req_demo_003",
    userName: "Ananya Iyer",
    userPhone: "+91 99001 22334",
    stationId: "stn_indiranagar",
    stationName: "Indiranagar Metro Station",
    destinationZone: "Domlur / Embassy GolfLinks (EGL)",
    distanceKm: 3.8,
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    status: "WAITING",
    pickupPillar: "Exit Gate 2 (CMH Road)",
    notes: "Heading to office tech park"
  }
];

export const INITIAL_MATCH_GROUPS = [
  {
    id: "match_demo_sample",
    tripIds: ["req_demo_001", "req_demo_002"],
    stationName: "Indiranagar Metro Station",
    destinationZone: "Koramangala Block 4",
    pickupPoint: "Indiranagar Metro - Main Auto Stand (Exit Gate 1)",
    distanceKm: 4.5,
    totalFare: 90,
    farePerPerson: 45,
    status: "CONFIRMED",
    autoDetails: {
      driverName: "Manjunath K.",
      vehicleNumber: "KA 01 EK 4482",
      vehicleType: "Electric Auto / Rickshaw",
      driverRating: 4.9,
      etaMinutes: 2
    },
    createdAt: new Date().toISOString()
  }
];
