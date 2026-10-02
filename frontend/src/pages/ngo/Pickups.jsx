import { useEffect, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle } from "../../components/UI";

import { formatDate, getErrorMessage, mapsUrl } from "../../utils/format";

export default function Pickups({ completed = false }) {
  const [requests, setRequests] = useState([]);

  const [error, setError] = useState("");

  async function load() {
    try {
      const response = await api.get("/pickup-requests");

      const filtered = response.data.filter((request) => {
        if (completed) {
          return request.request_status === "Completed";
        }

        return ["Pending", "Accepted"].includes(request.request_status);
      });

      setRequests(filtered);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, [completed]);

  async function updateRequest(id, status) {
    try {
      await api.put(`/pickup-requests/${id}`, {
        request_status: status,
      });

      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageTitle
        title={
          completed ? "Completed Pickup Requests" : "Current Pickup Requests"
        }
      />

      <ErrorBox message={error} />

      {requests.length === 0 ? (
        <Empty text="No pickup requests found." />
      ) : (
        <div className="cards-grid">
          {requests.map((request) => (
            <div className="card" key={request.request_id}>
              <h3>{request.donation?.food_name}</h3>

              <p>
                <strong>Donor:</strong>{" "}
                {request.donor?.organization_name || "Unknown Organization"}
              </p>

              <p>
                <strong>Quantity:</strong> {request.donation?.quantity}
              </p>

              <p>
                <strong>Pickup address:</strong>{" "}
                {request.donation?.pickup_address}
              </p>

              <p>
                <strong>Requested:</strong> {formatDate(request.request_date)}
              </p>

              <span className="status">{request.request_status}</span>

              <div className="button-row">
                <a
                  href={mapsUrl(request.donation?.pickup_address)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Maps
                </a>

                {!completed && (
                  <>
                    {request.request_status !== "Completed" && (
                      <button
                        onClick={() =>
                          updateRequest(request.request_id, "Cancelled")
                        }
                      >
                        Cancel
                      </button>
                    )}

                    {request.request_status === "Accepted" && (
                      <button
                        className="primary"
                        onClick={() =>
                          updateRequest(request.request_id, "Completed")
                        }
                      >
                        Complete Pickup
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
