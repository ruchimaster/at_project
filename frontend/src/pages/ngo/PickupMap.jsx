import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../../api/api";

import { ErrorBox, PageTitle } from "../../components/UI";

import { getErrorMessage, mapsUrl } from "../../utils/format";

import RouteMap from "../../components/maps/RouteMap";

import "./PickupMap.css";

export default function PickupMap() {
  const { request_id } = useParams();

  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequest() {
      try {
        const response = await api.get(`/pickup-requests/${request_id}`);

        setRequest(response.data);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    loadRequest();
  }, [request_id]);

  if (error) {
    return (
      <div className="ngo-pickup-map-page">
        <PageTitle title="Pickup Map" />

        <ErrorBox message={error} />

        <div className="ngo-map-back-row">
          <Link to="/ngo/current-pickups">← Back to Current Pickups</Link>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="ngo-pickup-map-page">
        <PageTitle
          title="Pickup Route"
          subtitle="Loading the donor-to-NGO route..."
        />

        <div className="ngo-map-loading">
          <div className="ngo-map-spinner"></div>

          <strong>Loading pickup route...</strong>

          <p>Fetching the pickup details and route information.</p>
        </div>
      </div>
    );
  }

  const pickupAddress = request.donation?.pickup_address || "";

  const ngoAddress = request.ngo?.address || "";

  const foodName = request.donation?.food_name || "Food Donation";

  const donorName = request.donor?.organization_name || "Unknown Organization";

  const quantity = request.donation?.quantity || "-";

  const status = request.request_status || "Unknown";

  function getStatusClass(value) {
    if (value === "Pending") {
      return "ngo-map-status-pending";
    }

    if (value === "Accepted") {
      return "ngo-map-status-accepted";
    }

    if (value === "Completed") {
      return "ngo-map-status-completed";
    }

    if (value === "Cancelled") {
      return "ngo-map-status-cancelled";
    }

    if (value === "Rejected") {
      return "ngo-map-status-rejected";
    }

    return "ngo-map-status-default";
  }

  return (
    <div className="ngo-pickup-map-page">
      {/* HEADER */}
      <div className="ngo-map-header">
        <Link to="/ngo/current-pickups" className="ngo-map-back-button">
          ← Back to Current Pickups
        </Link>
      </div>

      {/* PICKUP SUMMARY */}
      <section className="ngo-map-summary">
        <div className="ngo-map-food">
          <div className="ngo-map-food-icon">♻</div>

          <div>
            <span className="ngo-map-request-id">{request.request_id}</span>

            <h2>{foodName}</h2>

            <p>Food rescue pickup operation</p>
          </div>
        </div>

        <div className={"ngo-map-status " + getStatusClass(status)}>
          <span className="ngo-map-status-dot"></span>
          {status}
        </div>
      </section>

      {/* QUICK DETAILS */}
      <section className="ngo-map-details">
        <div className="ngo-map-detail">
          <span>DONOR</span>
          <strong>{donorName}</strong>
        </div>

        <div className="ngo-map-detail">
          <span>QUANTITY</span>
          <strong>{quantity}</strong>
        </div>

        <div className="ngo-map-detail">
          <span>PICKUP LOCATION</span>

          <strong>{pickupAddress || "Address not available"}</strong>
        </div>

        <div className="ngo-map-detail">
          <span>NGO DESTINATION</span>

          <strong>{ngoAddress || "Address not available"}</strong>
        </div>
      </section>

      {/* ROUTE */}
      {pickupAddress && ngoAddress ? (
        <>
          <section className="ngo-map-route-heading">
            <div>
              <span>LIVE ROUTE</span>

              <h2>Donor → NGO</h2>

              <p>
                Follow the calculated route between the food collection point
                and your destination.
              </p>
            </div>

            <a
              href={mapsUrl(pickupAddress, ngoAddress)}
              target="_blank"
              rel="noreferrer"
              className="ngo-google-map-button"
            >
              <span>↗</span>
              Open in Google Maps
            </a>
          </section>

          <div className="ngo-route-map-wrapper">
            <RouteMap
              originAddress={pickupAddress}
              destinationAddress={ngoAddress}
            />
          </div>
        </>
      ) : (
        <div className="ngo-map-missing">
          <div className="ngo-map-missing-icon">!</div>

          <div>
            <h3>Route information unavailable</h3>

            <p>
              Pickup address or NGO destination address is missing. A route
              cannot be calculated until both locations are available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
