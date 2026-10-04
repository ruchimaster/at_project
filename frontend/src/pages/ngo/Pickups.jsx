import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import { Empty, ErrorBox, PageTitle } from "../../components/UI";
import { formatDate, getErrorMessage } from "../../utils/format";
import "./Pickups.css";

export default function Pickups({ completed = false }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  async function load() {
    try {
      setLoading(true);

      const response = await api.get("/pickup-requests");

      const filtered = response.data.filter((request) => {
        if (completed) {
          return request.request_status === "Completed";
        }

        return (
          request.request_status === "Pending" ||
          request.request_status === "Accepted"
        );
      });

      setRequests(filtered);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [completed]);

  async function updateRequest(id, status) {
    try {
      setError("");
      setUpdatingId(id + "-" + status);

      await api.put("/pickup-requests/" + id, {
        request_status: status,
      });

      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId("");
    }
  }

  function getStatusClass(status) {
    if (status === "Pending") {
      return "ngo-pickup-status-pending";
    }

    if (status === "Accepted") {
      return "ngo-pickup-status-accepted";
    }

    if (status === "Completed") {
      return "ngo-pickup-status-completed";
    }

    if (status === "Cancelled") {
      return "ngo-pickup-status-cancelled";
    }

    if (status === "Rejected") {
      return "ngo-pickup-status-rejected";
    }

    return "ngo-pickup-status-default";
  }

  return (
    <div className="ngo-pickups-page">
      {/* HEADER */}
      <div className="ngo-pickups-header">
        <div>
          <div className="ngo-pickups-eyebrow">
            {completed ? "RESCUE HISTORY" : "ACTIVE OPERATIONS"}
          </div>

          <PageTitle
            title={completed ? "Completed Pickups" : "Current Pickups"}
            subtitle={
              completed
                ? "Review your successfully completed food rescue operations."
                : "Track and manage your active food pickup requests."
            }
          />
        </div>

        <div className="ngo-pickups-total">
          <span>{completed ? "Completed Operations" : "Active Requests"}</span>

          <strong>{loading ? "..." : requests.length}</strong>
        </div>
      </div>

      <ErrorBox message={error} />

      {/* ACTIVE NOTICE */}
      {!completed && !loading && (
        <div className="ngo-pickup-notice">
          <div className="ngo-pickup-notice-icon">✓</div>

          <div>
            <strong>Pickup operations are active</strong>

            <p>
              Complete an accepted request after collecting the food from the
              donor.
            </p>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="ngo-pickups-loading">
          <div className="ngo-loading-spinner"></div>

          <strong>
            {completed
              ? "Loading completed pickups..."
              : "Loading current pickups..."}
          </strong>

          <p>Fetching your latest pickup requests.</p>
        </div>
      ) : requests.length === 0 ? (
        /* EMPTY */
        <div className="ngo-pickups-empty">
          <div className="ngo-empty-circle">{completed ? "✓" : "⇄"}</div>

          <Empty
            text={
              completed
                ? "No completed pickup requests yet."
                : "No current pickup requests found."
            }
          />

          {!completed && (
            <Link
              to="/ngo/request-donation"
              className="ngo-find-donation-button"
            >
              <span>+</span>
              Find Donations
              <strong>→</strong>
            </Link>
          )}
        </div>
      ) : (
        /* COMPACT PICKUP LIST */
        <div className="ngo-pickups-list">
          {requests.map((request) => {
            const isCancelling =
              updatingId === request.request_id + "-Cancelled";

            const isCompleting =
              updatingId === request.request_id + "-Completed";

            const canOpenMap =
              request.donation &&
              request.donation.pickup_address &&
              request.ngo &&
              request.ngo.address;

            return (
              <article className="ngo-pickup-item" key={request.request_id}>
                {/* TOP */}
                <div className="ngo-pickup-item-top">
                  <div className="ngo-pickup-food">
                    <div className="ngo-pickup-food-icon">♻</div>

                    <div>
                      <span className="ngo-pickup-id">
                        {request.request_id}
                      </span>

                      <h2>
                        {request.donation && request.donation.food_name
                          ? request.donation.food_name
                          : "Food Donation"}
                      </h2>
                    </div>
                  </div>

                  <div
                    className={
                      "ngo-pickup-status " +
                      getStatusClass(request.request_status)
                    }
                  >
                    <span className="ngo-status-dot"></span>
                    {request.request_status}
                  </div>
                </div>

                {/* DETAILS */}
                <div className="ngo-pickup-details">
                  <div className="ngo-pickup-detail">
                    <span className="ngo-detail-label">DONOR</span>

                    <strong>
                      {request.donor && request.donor.organization_name
                        ? request.donor.organization_name
                        : "Unknown Organization"}
                    </strong>
                  </div>

                  <div className="ngo-pickup-detail">
                    <span className="ngo-detail-label">QUANTITY</span>

                    <strong>
                      {request.donation && request.donation.quantity
                        ? request.donation.quantity
                        : "-"}
                    </strong>
                  </div>

                  <div className="ngo-pickup-detail ngo-pickup-route-detail">
                    <span className="ngo-detail-label">ROUTE</span>

                    <div className="ngo-mini-route">
                      <span className="ngo-mini-donor">D</span>

                      <strong>
                        {request.donation && request.donation.pickup_address
                          ? request.donation.pickup_address
                          : "Donor address unavailable"}
                      </strong>

                      <span className="ngo-route-arrow">→</span>

                      <span className="ngo-mini-ngo">N</span>

                      <strong>
                        {request.ngo && request.ngo.address
                          ? request.ngo.address
                          : "NGO address unavailable"}
                      </strong>
                    </div>
                  </div>

                  <div className="ngo-pickup-detail">
                    <span className="ngo-detail-label">REQUESTED</span>

                    <strong>{formatDate(request.request_date)}</strong>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="ngo-pickup-item-bottom">
                  <div className="ngo-pickup-status-text">
                    {request.request_status === "Completed" && (
                      <>
                        <span>✓</span>
                        Successfully rescued
                      </>
                    )}

                    {request.request_status === "Accepted" && (
                      <>
                        <span>●</span>
                        Ready for pickup
                      </>
                    )}

                    {request.request_status === "Pending" && (
                      <>
                        <span>●</span>
                        Waiting for approval
                      </>
                    )}
                  </div>

                  <div className="ngo-pickup-actions">
                    {canOpenMap && (
                      <Link
                        to={"/ngo/pickup-map/" + request.request_id}
                        className="ngo-map-button"
                      >
                        <span>⌖</span>
                        Open Map
                      </Link>
                    )}

                    {!completed && request.request_status === "Pending" && (
                      <button
                        className="ngo-cancel-button"
                        onClick={() =>
                          updateRequest(request.request_id, "Cancelled")
                        }
                        disabled={updatingId !== ""}
                      >
                        {isCancelling ? "Cancelling..." : "Cancel"}
                      </button>
                    )}

                    {!completed && request.request_status === "Accepted" && (
                      <>
                        <button
                          className="ngo-cancel-button"
                          onClick={() =>
                            updateRequest(request.request_id, "Cancelled")
                          }
                          disabled={updatingId !== ""}
                        >
                          {isCancelling ? "Cancelling..." : "Cancel"}
                        </button>

                        <button
                          className="ngo-complete-button"
                          onClick={() =>
                            updateRequest(request.request_id, "Completed")
                          }
                          disabled={updatingId !== ""}
                        >
                          {isCompleting ? (
                            <>
                              <span className="ngo-button-spinner"></span>
                              Completing...
                            </>
                          ) : (
                            <>
                              Complete Pickup
                              <span>✓</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
