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
// ROUTE MAP
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

  // ----------------------------------------------------------
  // GEOCODE ADDRESS
  // ----------------------------------------------------------

  async function geocodeAddress(address) {
    if (!address?.trim()) {
      return null;
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
        address,
      )}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Unable to find the location.");
    }

    const data = await response.json();

    if (!data.length) {
      return null;
    }

    return {
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
    };
  }

  // ----------------------------------------------------------
  // LOAD LOCATIONS + ROUTE
  // ----------------------------------------------------------

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
        if (!originAddress?.trim() || !destinationAddress?.trim()) {
          throw new Error("Pickup address or NGO address is missing.");
        }

        const originLocation = await geocodeAddress(originAddress);

        if (!originLocation) {
          throw new Error("Pickup location could not be found.");
        }

        const destinationLocation = await geocodeAddress(destinationAddress);

        if (!destinationLocation) {
          throw new Error("NGO destination could not be found.");
        }

        if (cancelled) {
          return;
        }

        setOrigin(originLocation);

        setDestination(destinationLocation);

        // ----------------------------------------------------
        // OSRM ROUTING
        // ----------------------------------------------------

        const routeResponse = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${originLocation.lng},${originLocation.lat};${destinationLocation.lng},${destinationLocation.lat}?overview=full&geometries=geojson&steps=true`,
        );

        if (!routeResponse.ok) {
          throw new Error("Unable to calculate the route.");
        }

        const routeData = await routeResponse.json();

        if (routeData.code !== "Ok" || !routeData.routes?.length) {
          throw new Error("No driving route could be found.");
        }

        const selectedRoute = routeData.routes[0];

        const coordinates = selectedRoute.geometry.coordinates.map(
          ([lng, lat]) => [lat, lng],
        );

        if (cancelled) {
          return;
        }

        setRoute(coordinates);

        setDistance(selectedRoute.distance);

        setDuration(selectedRoute.duration);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load route.");
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

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="card">
        <p>Finding pickup and NGO locations...</p>
      </div>
    );
  }

  // ----------------------------------------------------------
  // ERROR
  // ----------------------------------------------------------

  if (error) {
    return (
      <div className="card">
        <p>
          <strong>Route unavailable:</strong> {error}
        </p>
      </div>
    );
  }

  // ----------------------------------------------------------
  // NO ROUTE
  // ----------------------------------------------------------

  if (!origin || !destination || !route) {
    return null;
  }

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

      <Marker position={[origin.lat, origin.lng]}>
        <Popup>
          <strong>Food Pickup</strong>

          <br />

          {originAddress}
        </Popup>
      </Marker>

      <Marker position={[destination.lat, destination.lng]}>
        <Popup>
          <strong>NGO Destination</strong>

          <br />

          {destinationAddress}
        </Popup>
      </Marker>

      <Polyline
        positions={route}
        pathOptions={{
          weight: 5,
        }}
      />

      <FitRouteBounds origin={origin} destination={destination} />
    </MapContainer>
  );
}

// ============================================================
// FIT MAP TO ROUTE
// ============================================================

function FitRouteBounds({ origin, destination }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ]);

    map.fitBounds(bounds, {
      padding: [40, 40],
    });
  }, [map, origin, destination]);

  return null;
}

// ============================================================
// FORMAT DISTANCE
// ============================================================

function formatDistance(meters) {
  if (meters === null || meters === undefined) {
    return "-";
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

// ============================================================
// FORMAT DURATION
// ============================================================

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) {
    return "-";
  }

  const totalMinutes = Math.round(seconds / 60);

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
