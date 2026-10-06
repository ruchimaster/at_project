import { useEffect, useState } from "react";

import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

// ============================================================
// FIX DEFAULT LEAFLET MARKER ICONS
// ============================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ============================================================
// HELPERS
// ============================================================

function normalizeAddress(address) {
  return String(address || "")
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .trim();
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPinCode(address) {
  const match = normalizeAddress(address).match(/\b[1-9][0-9]{5}\b/);

  return match ? match[0] : "";
}

function extractAddressParts(address) {
  return normalizeAddress(address)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function isValidIndiaCoordinate(lat, lng) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= 6 &&
    lat <= 37 &&
    lng >= 68 &&
    lng <= 98
  );
}

// ============================================================
// BUILD DYNAMIC GEOCODING QUERIES
// ============================================================

function buildQueries(address) {
  const cleaned = normalizeAddress(address);

  const parts = extractAddressParts(cleaned);

  const pinCode = extractPinCode(cleaned);

  const queries = [];

  function addQuery(query) {
    const normalized = normalizeAddress(query);

    if (!normalized) {
      return;
    }

    if (
      !queries.some(
        (existing) => existing.toLowerCase() === normalized.toLowerCase(),
      )
    ) {
      queries.push(normalized);
    }
  }

  // ----------------------------------------------------------
  // 1. COMPLETE ADDRESS
  // ----------------------------------------------------------

  addQuery(cleaned);

  // ----------------------------------------------------------
  // 2. COMPLETE ADDRESS + INDIA
  // ----------------------------------------------------------

  if (!/\bindia\b/i.test(cleaned)) {
    addQuery(`${cleaned}, India`);
  }

  // ----------------------------------------------------------
  // 3. REMOVE PIN
  // ----------------------------------------------------------

  if (pinCode) {
    const withoutPin = normalizeAddress(
      cleaned
        .replace(pinCode, "")
        .replace(/,\s*,/g, ",")
        .replace(/\s+,/g, ",")
        .replace(/,\s*$/g, ""),
    );

    addQuery(withoutPin);

    if (!/\bindia\b/i.test(withoutPin)) {
      addQuery(`${withoutPin}, India`);
    }
  }

  // ----------------------------------------------------------
  // 4. LAST THREE ADDRESS PARTS
  // ----------------------------------------------------------

  const withoutPinParts = parts.filter((part) => !/^[1-9][0-9]{5}$/.test(part));

  if (withoutPinParts.length >= 2) {
    const localityQuery = withoutPinParts.slice(-3).join(", ");

    addQuery(localityQuery);

    if (!/\bindia\b/i.test(localityQuery)) {
      addQuery(`${localityQuery}, India`);
    }
  }

  return queries;
}

// ============================================================
// NOMINATIM
// ============================================================

async function searchNominatim(query) {
  const url =
    "https://nominatim.openstreetmap.org/search" +
    `?format=jsonv2` +
    `&q=${encodeURIComponent(query)}` +
    `&countrycodes=in` +
    `&addressdetails=1` +
    `&limit=10`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed: ${response.status}`);
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
}

// ============================================================
// PHOTON FALLBACK
// ============================================================

async function searchPhoton(query) {
  const url =
    "https://photon.komoot.io/api/" +
    `?q=${encodeURIComponent(query)}` +
    "&limit=10" +
    "&lang=en";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Photon request failed: ${response.status}`);
  }

  const data = await response.json();

  return Array.isArray(data?.features) ? data.features : [];
}

// ============================================================
// NORMALIZE NOMINATIM RESULT
// ============================================================

function normalizeNominatimResult(result) {
  const address = result.address || {};

  const lat = Number(result.lat);
  const lng = Number(result.lon);

  return {
    lat,
    lng,

    source: "Nominatim",

    displayName: result.display_name || "",

    name: result.name || "",

    street: address.road || address.pedestrian || address.residential || "",

    city:
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      "",

    district: address.county || address.district || "",

    state: address.state || "",

    postcode: address.postcode || "",

    country: address.country || "",

    type: result.type || "",
  };
}

// ============================================================
// NORMALIZE PHOTON RESULT
// ============================================================

function normalizePhotonResult(feature) {
  const properties = feature?.properties || {};

  const coordinates = feature?.geometry?.coordinates || [];

  const lng = Number(coordinates[0]);
  const lat = Number(coordinates[1]);

  const fullAddress = [
    properties.name,
    properties.street,
    properties.locality,
    properties.suburb,
    properties.district,
    properties.city,
    properties.county,
    properties.state,
    properties.postcode,
    properties.country,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    lat,
    lng,

    source: "Photon",

    displayName: fullAddress,

    name: properties.name || "",

    street: properties.street || "",

    city:
      properties.city ||
      properties.town ||
      properties.village ||
      properties.locality ||
      "",

    district: properties.district || properties.county || "",

    state: properties.state || "",

    postcode: properties.postcode || "",

    country: properties.country || "",

    type: properties.osm_value || properties.type || "",
  };
}

// ============================================================
// SCORE GEOCODER RESULT
// ============================================================

function scoreCandidate(candidate, requestedAddress) {
  const requested = normalizeText(requestedAddress);

  const requestedPin = extractPinCode(requestedAddress);

  const candidateText = normalizeText(candidate.displayName);

  let score = 0;

  // ----------------------------------------------------------
  // INDIA CHECK
  // ----------------------------------------------------------

  if (!isValidIndiaCoordinate(candidate.lat, candidate.lng)) {
    return -100000;
  }

  // ----------------------------------------------------------
  // PIN CODE
  //
  // Exact PIN is extremely important.
  // Wrong PIN should heavily reduce the candidate.
  // ----------------------------------------------------------

  if (requestedPin) {
    const candidatePin = String(candidate.postcode || "").trim();

    if (candidatePin) {
      if (candidatePin === requestedPin) {
        score += 250;
      } else {
        score -= 300;
      }
    }
  }

  // ----------------------------------------------------------
  // COUNTRY
  // ----------------------------------------------------------

  if (
    normalizeText(candidate.country) === "india" ||
    candidateText.includes("india")
  ) {
    score += 20;
  }

  // ----------------------------------------------------------
  // REQUESTED WORD MATCHING
  // ----------------------------------------------------------

  const requestedWords = requested
    .split(" ")
    .filter((word) => word.length >= 3);

  for (const word of requestedWords) {
    if (candidateText.includes(word)) {
      score += 5;
    }
  }

  // ----------------------------------------------------------
  // STREET MATCH
  // ----------------------------------------------------------

  const street = normalizeText(candidate.street);

  if (street && requested.includes(street)) {
    score += 100;
  }

  // ----------------------------------------------------------
  // CITY MATCH
  // ----------------------------------------------------------

  const city = normalizeText(candidate.city);

  if (city && requested.includes(city)) {
    score += 100;
  }

  // ----------------------------------------------------------
  // DISTRICT MATCH
  // ----------------------------------------------------------

  const district = normalizeText(candidate.district);

  if (district && requested.includes(district)) {
    score += 80;
  }

  // ----------------------------------------------------------
  // STATE MATCH
  // ----------------------------------------------------------

  const state = normalizeText(candidate.state);

  if (state && requested.includes(state)) {
    score += 40;
  }

  return score;
}

// ============================================================
// DYNAMIC GEOCODING
// ============================================================

async function geocodeAddress(address) {
  const cleanedAddress = normalizeAddress(address);

  if (!cleanedAddress) {
    throw new Error("Address is empty.");
  }

  const queries = buildQueries(cleanedAddress);

  console.log("================================================");

  console.log("FOODRESCUE DYNAMIC GEOCODING");

  console.log("Requested address:", cleanedAddress);

  console.log("Queries:", queries);

  console.log("================================================");

  let allCandidates = [];

  // ========================================================
  // NOMINATIM FIRST
  // ========================================================

  for (const query of queries) {
    try {
      const results = await searchNominatim(query);

      const candidates = results
        .map(normalizeNominatimResult)
        .filter((candidate) =>
          isValidIndiaCoordinate(candidate.lat, candidate.lng),
        );

      allCandidates.push(...candidates);

      // ------------------------------------------------------
      // If we already found an exact PIN match,
      // stop searching more queries.
      // ------------------------------------------------------

      const requestedPin = extractPinCode(cleanedAddress);

      if (
        requestedPin &&
        candidates.some((candidate) => candidate.postcode === requestedPin)
      ) {
        break;
      }
    } catch (error) {
      console.warn("Nominatim failed:", query, error);
    }

    await delay(1100);
  }

  // ========================================================
  // PHOTON FALLBACK
  // ========================================================

  if (allCandidates.length === 0) {
    console.warn("Nominatim returned no usable results.");

    console.warn("Trying Photon dynamically...");

    for (const query of queries) {
      try {
        const results = await searchPhoton(query);

        const candidates = results
          .map(normalizePhotonResult)
          .filter((candidate) =>
            isValidIndiaCoordinate(candidate.lat, candidate.lng),
          );

        allCandidates.push(...candidates);
      } catch (error) {
        console.warn("Photon failed:", query, error);
      }

      await delay(400);
    }
  }

  // ========================================================
  // REMOVE DUPLICATE COORDINATES
  // ========================================================

  const uniqueCandidates = [];

  const seen = new Set();

  for (const candidate of allCandidates) {
    const key = `${candidate.lat.toFixed(6)},` + `${candidate.lng.toFixed(6)}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    uniqueCandidates.push(candidate);
  }

  // ========================================================
  // SCORE ALL RESULTS
  // ========================================================

  const scored = uniqueCandidates
    .map((candidate) => ({
      candidate,

      score: scoreCandidate(candidate, cleanedAddress),
    }))
    .filter((item) => item.score > -100000)
    .sort((a, b) => b.score - a.score);

  // ========================================================
  // DEBUG TABLE
  // ========================================================

  console.table(
    scored.slice(0, 10).map((item) => ({
      score: item.score,

      source: item.candidate.source,

      address: item.candidate.displayName,

      street: item.candidate.street,

      city: item.candidate.city,

      district: item.candidate.district,

      state: item.candidate.state,

      postcode: item.candidate.postcode,

      latitude: item.candidate.lat,

      longitude: item.candidate.lng,
    })),
  );

  // ========================================================
  // NO RESULT
  // ========================================================

  if (scored.length === 0) {
    throw new Error(`Could not dynamically locate "${cleanedAddress}".`);
  }

  // ========================================================
  // CHOOSE BEST RESULT
  // ========================================================

  const best = scored[0];

  const selected = best.candidate;

  // ========================================================
  // IMPORTANT VALIDATION
  // ========================================================

  const requestedPin = extractPinCode(cleanedAddress);

  if (requestedPin && selected.postcode && selected.postcode !== requestedPin) {
    throw new Error(
      `The geocoder found "${selected.displayName}", but its PIN code (${selected.postcode}) does not match the requested PIN code (${requestedPin}).`,
    );
  }

  // ========================================================
  // LOG SELECTED LOCATION
  // ========================================================

  console.log("================================================");

  console.log("FOODRESCUE SELECTED LOCATION");

  console.log("Source:", selected.source);

  console.log("Requested:", cleanedAddress);

  console.log("Resolved:", selected.displayName);

  console.log("Latitude:", selected.lat);

  console.log("Longitude:", selected.lng);

  console.log("Postcode:", selected.postcode);

  console.log("City:", selected.city);

  console.log("District:", selected.district);

  console.log("State:", selected.state);

  console.log("Score:", best.score);

  console.log("================================================");

  return {
    lat: selected.lat,
    lng: selected.lng,

    displayName: selected.displayName || cleanedAddress,
  };
}

// ============================================================
// MAIN ROUTE MAP
// ============================================================

export default function RouteMap({
  originAddress = "",
  destinationAddress = "",
}) {
  const [origin, setOrigin] = useState(null);

  const [destination, setDestination] = useState(null);

  const [route, setRoute] = useState(null);

  const [distance, setDistance] = useState(null);

  const [duration, setDuration] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD ROUTE
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadRoute() {
      setLoading(true);
      setError("");

      setOrigin(null);
      setDestination(null);
      setRoute(null);
      setDistance(null);
      setDuration(null);

      try {
        // ------------------------------------------------------
        // VALIDATE ADDRESSES
        // ------------------------------------------------------

        if (!originAddress?.trim() || !destinationAddress?.trim()) {
          throw new Error("Pickup address or NGO address is missing.");
        }

        // ------------------------------------------------------
        // DYNAMIC PICKUP GEOCODING
        // ------------------------------------------------------

        const originLocation = await geocodeAddress(originAddress);

        if (cancelled) {
          return;
        }

        // ------------------------------------------------------
        // DYNAMIC NGO GEOCODING
        // ------------------------------------------------------

        const destinationLocation = await geocodeAddress(destinationAddress);

        if (cancelled) {
          return;
        }

        // ------------------------------------------------------
        // SAVE LOCATIONS
        // ------------------------------------------------------

        setOrigin(originLocation);

        setDestination(destinationLocation);

        // ======================================================
        // OSRM ROUTING
        // ======================================================

        const routeUrl =
          "https://router.project-osrm.org" +
          "/route/v1/driving/" +
          `${originLocation.lng},${originLocation.lat};` +
          `${destinationLocation.lng},${destinationLocation.lat}` +
          "?overview=full&geometries=geojson";

        console.log("================================================");

        console.log("FOODRESCUE OSRM REQUEST");

        console.log("Origin:", originLocation);

        console.log("Destination:", destinationLocation);

        console.log("================================================");

        const routeResponse = await fetch(routeUrl);

        if (cancelled) {
          return;
        }

        if (!routeResponse.ok) {
          throw new Error(`OSRM request failed: ${routeResponse.status}`);
        }

        const routeData = await routeResponse.json();

        if (routeData.code !== "Ok" || !routeData.routes?.length) {
          throw new Error(
            "No driving route could be found between the pickup location and NGO.",
          );
        }

        const selectedRoute = routeData.routes[0];

        // ======================================================
        // ROUTE GEOMETRY
        // ======================================================

        if (
          !selectedRoute.geometry ||
          !Array.isArray(selectedRoute.geometry.coordinates)
        ) {
          throw new Error("The routing service did not return a valid route.");
        }

        const coordinates = selectedRoute.geometry.coordinates.map(
          ([lng, lat]) => [Number(lat), Number(lng)],
        );

        if (coordinates.length < 2) {
          throw new Error(
            "The route was found, but no route path was returned.",
          );
        }

        // ======================================================
        // ACTUAL OSRM DISTANCE
        // ======================================================

        const routeDistance = Number(selectedRoute.distance);

        // ======================================================
        // ACTUAL OSRM DURATION
        // ======================================================

        const routeDuration = Number(selectedRoute.duration);

        // ======================================================
        // VALIDATE CALCULATION
        // ======================================================

        if (!Number.isFinite(routeDistance) || routeDistance <= 0) {
          throw new Error("OSRM returned an invalid road distance.");
        }

        if (!Number.isFinite(routeDuration) || routeDuration <= 0) {
          throw new Error("OSRM returned an invalid route duration.");
        }

        if (cancelled) {
          return;
        }

        // ======================================================
        // SAVE ROUTE DATA
        // ======================================================

        setRoute(coordinates);

        setDistance(routeDistance);

        setDuration(routeDuration);

        // ======================================================
        // CALCULATED VALUES FOR DEBUGGING
        // ======================================================

        const distanceKm = routeDistance / 1000;

        const durationMinutes = routeDuration / 60;

        const averageSpeed = distanceKm / (routeDuration / 3600);

        // ======================================================
        // FINAL LOG
        // ======================================================

        console.log("================================================");

        console.log("FOODRESCUE OSRM RESULT");

        console.log("Route:", selectedRoute);

        console.log(`ROAD DISTANCE = ${distanceKm.toFixed(2)} KM`);

        console.log(`ROAD DISTANCE = ${Math.round(routeDistance)} METRES`);

        console.log(`OSRM DURATION = ${durationMinutes.toFixed(1)} MIN`);

        console.log(`OSRM DURATION = ${Math.round(routeDuration)} SECONDS`);

        console.log(
          `CALCULATED AVERAGE SPEED = ${averageSpeed.toFixed(1)} KM/H`,
        );

        console.log(
          "IMPORTANT: Distance and ETA displayed by FoodRescue come directly from OSRM.",
        );

        console.log("================================================");
      } catch (err) {
        if (!cancelled) {
          console.error("FOODRESCUE ROUTE ERROR:", err);

          setError(err?.message || "Unable to load the pickup route.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [originAddress, destinationAddress]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="card">
        <p>
          <strong>Finding pickup and NGO locations...</strong>
        </p>

        <p>
          <small>
            Dynamically geocoding both addresses and calculating the driving
            route.
          </small>
        </p>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="card">
        <p>
          <strong>Route unavailable:</strong> {error}
        </p>
      </div>
    );
  }

  // ==========================================================
  // NO DATA
  // ==========================================================

  if (!origin || !destination || !route) {
    return null;
  }

  // ==========================================================
  // DISPLAY
  // ==========================================================

  return (
    <div className="card">
      <h3>Pickup Route</h3>

      <RouteMapView
        origin={origin}
        destination={destination}
        route={route}
        originAddress={originAddress}
        destinationAddress={destinationAddress}
      />

      <div className="button-row">
        <div>
          <strong>Distance:</strong> {formatDistance(distance)}
        </div>

        <div>
          <strong>Estimated time:</strong> {formatDuration(duration)}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAP VIEW
// ============================================================

function RouteMapView({
  origin,
  destination,
  route,
  originAddress,
  destinationAddress,
}) {
  const center = [
    (origin.lat + destination.lat) / 2,

    (origin.lng + destination.lng) / 2,
  ];

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "12px",
        marginTop: "15px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ======================================================
          PICKUP MARKER
          ====================================================== */}

      <Marker position={[origin.lat, origin.lng]}>
        <Popup>
          <strong>Food Pickup</strong>

          <br />

          {originAddress}

          <br />

          <small>Dynamically located</small>
        </Popup>
      </Marker>

      {/* ======================================================
          NGO MARKER
          ====================================================== */}

      <Marker position={[destination.lat, destination.lng]}>
        <Popup>
          <strong>NGO Destination</strong>

          <br />

          {destinationAddress}

          <br />

          <small>Dynamically located</small>
        </Popup>
      </Marker>

      {/* ======================================================
          DYNAMIC OSRM ROUTE
          ====================================================== */}

      <Polyline
        positions={route}
        pathOptions={{
          weight: 5,
        }}
      />

      {/* ======================================================
          FIT MAP TO ROUTE
          ====================================================== */}

      <FitRouteBounds origin={origin} destination={destination} route={route} />
    </MapContainer>
  );
}

// ============================================================
// FIT MAP TO ROUTE
// ============================================================

function FitRouteBounds({ origin, destination, route }) {
  const map = useMap();

  useEffect(() => {
    if (!origin || !destination) {
      return;
    }

    const routePoints =
      route?.length > 0
        ? route
        : [
            [origin.lat, origin.lng],
            [destination.lat, destination.lng],
          ];

    const bounds = L.latLngBounds(routePoints);

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [40, 40],
      });
    }
  }, [map, origin, destination, route]);

  return null;
}

// ============================================================
// FORMAT DISTANCE
// ============================================================

function formatDistance(meters) {
  if (
    meters === null ||
    meters === undefined ||
    !Number.isFinite(Number(meters))
  ) {
    return "-";
  }

  const numericMeters = Number(meters);

  if (numericMeters < 1000) {
    return `${Math.round(numericMeters)} m`;
  }

  return `${(numericMeters / 1000).toFixed(1)} km`;
}

// ============================================================
// FORMAT DURATION
// ============================================================

function formatDuration(seconds) {
  if (
    seconds === null ||
    seconds === undefined ||
    !Number.isFinite(Number(seconds))
  ) {
    return "-";
  }

  const totalMinutes = Math.max(1, Math.round(Number(seconds) / 60));

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);

  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}

// ============================================================
// DELAY
// ============================================================

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
