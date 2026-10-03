import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import api from "../../api/api";

import { ErrorBox, PageTitle } from "../../components/UI";

import { getErrorMessage, mapsUrl } from "../../utils/format";

import RouteMap from "../../components/maps/RouteMap";

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
      <>
        <PageTitle title="Pickup Map" />

        <ErrorBox message={error} />

        <div className="button-row">
          <Link to="/ngo/current-pickups">
            ← Back to Current Pickup Requests
          </Link>
        </div>
      </>
    );
  }

  if (!request) {
    return (
      <>
        <PageTitle title="Pickup Map" />

        <p>Loading pickup route...</p>
      </>
    );
  }

  const pickupAddress = request.donation?.pickup_address || "";

  const ngoAddress = request.ngo?.address || "";

  return (
    <>
      <PageTitle
        title="Pickup Route"
        subtitle="View the route from the donor pickup location to your NGO."
      />

      <div className="button-row">
        <Link to="/ngo/current-pickups">← Back to Current Pickup Requests</Link>
      </div>

      <div className="card">
        <h3>{request.donation?.food_name || "Food Donation"}</h3>

        <p>
          <strong>Donor:</strong>{" "}
          {request.donor?.organization_name || "Unknown Organization"}
        </p>

        <p>
          <strong>Quantity:</strong> {request.donation?.quantity || "-"}
        </p>

        <p>
          <strong>Pickup location:</strong>{" "}
          {pickupAddress || "Address not available"}
        </p>

        <p>
          <strong>NGO destination:</strong>{" "}
          {ngoAddress || "Address not available"}
        </p>

        <p>
          <strong>Status:</strong> {request.request_status}
        </p>
      </div>

      {pickupAddress && ngoAddress ? (
        <RouteMap
          originAddress={pickupAddress}
          destinationAddress={ngoAddress}
        />
      ) : (
        <ErrorBox message="Pickup address or NGO destination address is missing." />
      )}

      {pickupAddress && ngoAddress && (
        <div className="button-row">
          <a
            href={mapsUrl(pickupAddress, ngoAddress)}
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps
          </a>
        </div>
      )}
    </>
  );
}
