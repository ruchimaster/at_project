import { useEffect, useState } from "react";

import api from "../../api/api";

import { ErrorBox, Empty, PageTitle } from "../../components/UI";

import { formatDate, getErrorMessage } from "../../utils/format";

export default function PickupRequests({ ongoing = false }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  async function load() {
    try {
      setError("");

      const response = await api.get("/pickup-requests");

      const filtered = response.data.filter((request) => {
        if (ongoing) {
          return request.request_status === "Accepted";
        }

        return request.request_status === "Pending";
      });

      setRequests(filtered);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, [ongoing]);

  async function updateRequest(id, status) {
    try {
      setUpdatingId(id);
      setError("");

      await api.put(`/pickup-requests/${id}`, {
        request_status: status,
      });

      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <div className="pickup-requests-page">
      <PageTitle
        title={ongoing ? "Ongoing Pickup Requests" : "Pickup Requests"}
        subtitle={
          ongoing
            ? "Accepted requests currently in progress."
            : "Review and manage pickup requests for your donations."
        }
      />

      <ErrorBox message={error} />

      <div className="pickup-summary">
        <div className="pickup-summary-card">
          <span className="pickup-summary-label">
            {ongoing ? "Ongoing Pickups" : "Pending Requests"}
          </span>

          <strong>{requests.length}</strong>

          <p>
            {ongoing
              ? "Accepted requests currently in progress"
              : "Requests waiting for your response"}
          </p>
        </div>

        <div className="pickup-summary-card pickup-summary-highlight">
          <span className="pickup-summary-icon">{ongoing ? "✓" : "↗"}</span>

          <div>
            <strong>
              {ongoing ? "Pickup in progress" : "Action required"}
            </strong>

            <p>
              {ongoing
                ? "Coordinate with the NGO for collection."
                : "Review each request and respond accordingly."}
            </p>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="pickup-empty-wrapper">
          <Empty
            text={
              ongoing
                ? "No ongoing pickup requests."
                : "No pending pickup requests."
            }
          />

          <p className="pickup-empty-help">
            {ongoing
              ? "Accepted pickup requests will appear here once you approve an NGO request."
              : "New NGO pickup requests for your donations will appear here."}
          </p>
        </div>
      ) : (
        <section className="pickup-requests-card">
          <div className="pickup-card-header">
            <div>
              <span className="pickup-card-eyebrow">DONATION COLLECTION</span>

              <h2>
                {ongoing ? "Ongoing Pickups" : "Requests Awaiting Review"}
              </h2>

              <p>
                {ongoing
                  ? "These requests have been accepted and are currently being coordinated."
                  : "Review the NGO, quantity and pickup details before accepting a request."}
              </p>
            </div>

            <div className="pickup-count-badge">
              {requests.length} {requests.length === 1 ? "Request" : "Requests"}
            </div>
          </div>

          <div className="pickup-table-wrap">
            <table className="pickup-table">
              <thead>
                <tr>
                  <th>Food</th>
                  <th>NGO</th>
                  <th>Quantity</th>
                  <th>Pickup Address</th>
                  <th>Requested</th>
                  <th>Status</th>

                  {!ongoing && <th>Action</th>}
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => {
                  const isUpdating = updatingId === request.request_id;

                  return (
                    <tr key={request.request_id}>
                      <td>
                        <div className="pickup-food-cell">
                          <strong>
                            {request.donation?.food_name || "Food Donation"}
                          </strong>

                          <span>Request ID: {request.request_id}</span>
                        </div>
                      </td>

                      <td>
                        <div className="pickup-ngo-cell">
                          <span className="pickup-ngo-icon">NGO</span>

                          <strong>
                            {request.ngo?.organization_name || "NGO"}
                          </strong>
                        </div>
                      </td>

                      <td>
                        <span className="pickup-quantity">
                          {request.donation?.quantity ?? "—"}
                        </span>
                      </td>

                      <td>
                        <div className="pickup-address">
                          {request.donation?.pickup_address ||
                            "Address not available"}
                        </div>
                      </td>

                      <td>
                        <span className="pickup-date">
                          {formatDate(request.request_date)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`pickup-status ${
                            request.request_status === "Accepted"
                              ? "pickup-status-accepted"
                              : "pickup-status-pending"
                          }`}
                        >
                          <span className="pickup-status-dot" />

                          {request.request_status}
                        </span>
                      </td>

                      {!ongoing && (
                        <td>
                          <div className="pickup-actions">
                            <button
                              type="button"
                              className="pickup-accept-button"
                              disabled={isUpdating}
                              onClick={() =>
                                updateRequest(request.request_id, "Accepted")
                              }
                            >
                              {isUpdating ? "Updating..." : "Accept"}
                            </button>

                            <button
                              type="button"
                              className="pickup-reject-button"
                              disabled={isUpdating}
                              onClick={() =>
                                updateRequest(request.request_id, "Rejected")
                              }
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
