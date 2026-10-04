import { useEffect, useMemo, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle } from "../../components/UI";

import { formatDate, getErrorMessage, mapsUrl } from "../../utils/format";

import "./Pickups.css";

export default function Pickups() {
  const [requests, setRequests] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPickups() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/pickup-requests");

        setRequests(response.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadPickups();
  }, []);

  const statuses = useMemo(() => {
    return [
      ...new Set(
        requests.map((request) => request.request_status).filter(Boolean),
      ),
    ];
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        !searchText ||
        (request.request_id || "").toLowerCase().includes(searchText) ||
        (request.donation?.food_name || "")
          .toLowerCase()
          .includes(searchText) ||
        (request.donor?.organization_name || "")
          .toLowerCase()
          .includes(searchText) ||
        (request.ngo?.organization_name || "")
          .toLowerCase()
          .includes(searchText) ||
        (request.donation?.pickup_address || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" || request.request_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const statusCounts = useMemo(() => {
    return requests.reduce((counts, request) => {
      const status = request.request_status || "Unknown";

      counts[status] = (counts[status] || 0) + 1;

      return counts;
    }, {});
  }, [requests]);

  function getStatusClass(status) {
    const normalized = (status || "").toLowerCase().replace(/\s+/g, "-");

    if (
      normalized.includes("complete") ||
      normalized.includes("picked") ||
      normalized.includes("rescue")
    ) {
      return "admin-pickups-status-success";
    }

    if (
      normalized.includes("pending") ||
      normalized.includes("requested") ||
      normalized.includes("accepted")
    ) {
      return "admin-pickups-status-warning";
    }

    if (
      normalized.includes("cancel") ||
      normalized.includes("reject") ||
      normalized.includes("failed")
    ) {
      return "admin-pickups-status-danger";
    }

    return "admin-pickups-status-neutral";
  }

  function getFoodInitials(foodName) {
    if (!foodName) {
      return "FD";
    }

    const words = foodName.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  return (
    <div className="admin-pickups-page">
      <div className="admin-pickups-header">
        <div>
          <div className="admin-pickups-eyebrow">PICKUP OPERATIONS</div>

          <PageTitle
            title="All Pickup Requests"
            subtitle="Track food rescue requests between donors and NGO partners."
          />
        </div>

        <div className="admin-pickups-total">
          <span>Total Requests</span>

          <strong>{loading ? "..." : requests.length}</strong>
        </div>
      </div>

      <ErrorBox message={error} />

      {!loading && requests.length > 0 && (
        <>
          <section className="admin-pickups-summary">
            <div className="admin-pickup-summary-card summary-total">
              <div className="admin-pickup-summary-icon">◉</div>

              <div>
                <span>TOTAL REQUESTS</span>
                <strong>{requests.length}</strong>
              </div>
            </div>

            <div className="admin-pickup-summary-card summary-pending">
              <div className="admin-pickup-summary-icon">!</div>

              <div>
                <span>PENDING / ACTIVE</span>
                <strong>
                  {(statusCounts.Pending || 0) +
                    (statusCounts.Requested || 0) +
                    (statusCounts.Accepted || 0)}
                </strong>
              </div>
            </div>

            <div className="admin-pickup-summary-card summary-completed">
              <div className="admin-pickup-summary-icon">✓</div>

              <div>
                <span>COMPLETED</span>
                <strong>{statusCounts.Completed || 0}</strong>
              </div>
            </div>

            <div className="admin-pickup-summary-card summary-cancelled">
              <div className="admin-pickup-summary-icon">×</div>

              <div>
                <span>CANCELLED</span>
                <strong>{statusCounts.Cancelled || 0}</strong>
              </div>
            </div>
          </section>

          <section className="admin-pickups-toolbar">
            <div className="admin-pickups-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search food, donor, NGO, request ID or location..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="admin-pickups-filter">
              <label htmlFor="pickup-status">Status</label>

              <select
                id="pickup-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All Statuses</option>

                {statuses.map((status) => (
                  <option value={status} key={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <div className="admin-pickups-results">
            Showing <strong>{filteredRequests.length}</strong> of{" "}
            <strong>{requests.length}</strong> pickup requests
          </div>
        </>
      )}

      {loading ? (
        <div className="admin-pickups-loading">
          <div className="admin-pickups-spinner"></div>

          <strong>Loading pickup requests...</strong>

          <p>Fetching the latest rescue operations.</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="admin-pickups-empty">
          <div className="admin-pickups-empty-icon">◉</div>

          <h2>No pickup requests yet</h2>

          <p>
            Pickup activity will appear here when NGOs request available
            donations.
          </p>

          <Empty text="No pickup requests found." />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="admin-pickups-no-results">
          <div className="admin-pickups-no-results-icon">⌕</div>

          <h2>No matching pickup requests</h2>

          <p>Try changing your search or status filter.</p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="admin-pickups-table-wrap">
          <table className="admin-pickups-table">
            <thead>
              <tr>
                <th>REQUEST / FOOD</th>
                <th>DONOR</th>
                <th>NGO</th>
                <th>QUANTITY</th>
                <th>STATUS</th>
                <th>REQUESTED</th>
                <th>LOCATION</th>
              </tr>
            </thead>

            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.request_id} className="admin-pickup-row">
                  <td>
                    <div className="admin-pickup-identity">
                      <div className="admin-pickup-avatar">
                        {getFoodInitials(request.donation?.food_name)}
                      </div>

                      <div className="admin-pickup-main">
                        <strong>
                          {request.donation?.food_name || "Unknown Food"}
                        </strong>

                        <span>{request.request_id}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="admin-pickup-party">
                      <strong>
                        {request.donor?.organization_name || "Unknown Donor"}
                      </strong>

                      <span>Donor</span>
                    </div>
                  </td>

                  <td>
                    <div className="admin-pickup-party">
                      <strong>
                        {request.ngo?.organization_name || "Unknown NGO"}
                      </strong>

                      <span>NGO Partner</span>
                    </div>
                  </td>

                  <td>
                    <span className="admin-pickup-quantity">
                      {request.donation?.quantity ?? "-"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        "admin-pickup-status " +
                        getStatusClass(request.request_status)
                      }
                    >
                      <span className="admin-pickup-status-dot"></span>

                      {request.request_status || "Unknown"}
                    </span>
                  </td>

                  <td>
                    <div className="admin-pickup-date">
                      {formatDate(request.request_date)}
                    </div>
                  </td>

                  <td>
                    {request.donation?.pickup_address ? (
                      <a
                        className="admin-pickup-map-button"
                        href={mapsUrl(request.donation.pickup_address)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>↗</span>
                        Open Map
                      </a>
                    ) : (
                      <span className="admin-pickup-no-location">
                        Not provided
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
