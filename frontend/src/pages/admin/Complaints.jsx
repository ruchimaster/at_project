import { useEffect, useMemo, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle, SuccessBox } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

import "./Complaints.css";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const [complaintsResponse, usersResponse] = await Promise.all([
        api.get("/complaints"),
        api.get("/users"),
      ]);

      setComplaints(complaintsResponse.data);
      setUsers(usersResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function organizationName(userId) {
    const user = users.find((item) => item.user_id === userId);

    return user?.organization_name || "Unknown Organization";
  }

  const complaintTypes = useMemo(() => {
    return [
      ...new Set(
        complaints.map((complaint) => complaint.complaint_type).filter(Boolean),
      ),
    ];
  }, [complaints]);

  const statusCounts = useMemo(() => {
    return complaints.reduce((counts, complaint) => {
      const status = complaint.status || "Unknown";

      counts[status] = (counts[status] || 0) + 1;

      return counts;
    }, {});
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const organization = organizationName(complaint.user_id);

      const matchesSearch =
        !searchText ||
        (complaint.complaint_id || "").toLowerCase().includes(searchText) ||
        organization.toLowerCase().includes(searchText) ||
        (complaint.complaint_type || "").toLowerCase().includes(searchText) ||
        (complaint.description || "").toLowerCase().includes(searchText) ||
        (complaint.user_id || "").toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || complaint.status === statusFilter;

      const matchesType =
        typeFilter === "All" || complaint.complaint_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [complaints, users, search, statusFilter, typeFilter]);

  async function updateStatus(complaintId, status) {
    try {
      setError("");
      setSuccess("");
      setUpdatingId(complaintId);

      await api.put(`/complaints/${complaintId}`, {
        status,
      });

      setSuccess("Complaint status updated successfully.");

      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId("");
    }
  }

  function getStatusClass(status) {
    const normalized = (status || "").toLowerCase().replace(/\s+/g, "-");

    if (normalized.includes("resolved")) {
      return "admin-complaints-status-resolved";
    }

    if (normalized.includes("review")) {
      return "admin-complaints-status-review";
    }

    if (normalized.includes("pending")) {
      return "admin-complaints-status-pending";
    }

    if (normalized.includes("reject")) {
      return "admin-complaints-status-rejected";
    }

    return "admin-complaints-status-neutral";
  }

  function getTypeClass(type) {
    const normalized = (type || "").toLowerCase();

    if (normalized.includes("pickup") || normalized.includes("delivery")) {
      return "admin-complaints-type-pickup";
    }

    if (normalized.includes("food") || normalized.includes("quality")) {
      return "admin-complaints-type-food";
    }

    if (normalized.includes("account") || normalized.includes("user")) {
      return "admin-complaints-type-account";
    }

    return "admin-complaints-type-default";
  }

  function getInitials(name) {
    if (!name) return "OR";

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  return (
    <div className="admin-complaints-page">
      <div className="admin-complaints-header">
        <div>
          <div className="admin-complaints-eyebrow">COMPLAINT MANAGEMENT</div>

          <PageTitle
            title="Complaints"
            subtitle="Review reported issues, monitor resolution progress and manage complaint status."
          />
        </div>

        <div className="admin-complaints-total">
          <span>Total Complaints</span>
          <strong>{loading ? "..." : complaints.length}</strong>
        </div>
      </div>

      <ErrorBox message={error} />

      <SuccessBox message={success} />

      {!loading && complaints.length > 0 && (
        <>
          <section className="admin-complaints-summary">
            <div className="admin-complaint-summary-card summary-total">
              <div className="admin-complaint-summary-icon">◉</div>

              <div>
                <span>TOTAL COMPLAINTS</span>
                <strong>{complaints.length}</strong>
              </div>
            </div>

            <div className="admin-complaint-summary-card summary-pending">
              <div className="admin-complaint-summary-icon">!</div>

              <div>
                <span>PENDING</span>
                <strong>{statusCounts.Pending || 0}</strong>
              </div>
            </div>

            <div className="admin-complaint-summary-card summary-review">
              <div className="admin-complaint-summary-icon">↻</div>

              <div>
                <span>UNDER REVIEW</span>
                <strong>{statusCounts["Under Review"] || 0}</strong>
              </div>
            </div>

            <div className="admin-complaint-summary-card summary-resolved">
              <div className="admin-complaint-summary-icon">✓</div>

              <div>
                <span>RESOLVED</span>
                <strong>{statusCounts.Resolved || 0}</strong>
              </div>
            </div>

            <div className="admin-complaint-summary-card summary-rejected">
              <div className="admin-complaint-summary-icon">×</div>

              <div>
                <span>REJECTED</span>
                <strong>{statusCounts.Rejected || 0}</strong>
              </div>
            </div>
          </section>

          <section className="admin-complaints-toolbar">
            <div className="admin-complaints-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search complaint ID, organization, type or description..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="admin-complaints-filter">
              <label htmlFor="complaint-status">Status</label>

              <select
                id="complaint-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All Statuses</option>

                <option value="Pending">Pending</option>

                <option value="Under Review">Under Review</option>

                <option value="Resolved">Resolved</option>

                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="admin-complaints-filter">
              <label htmlFor="complaint-type">Type</label>

              <select
                id="complaint-type"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="All">All Types</option>

                {complaintTypes.map((type) => (
                  <option value={type} key={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <div className="admin-complaints-results">
            Showing <strong>{filteredComplaints.length}</strong> of{" "}
            <strong>{complaints.length}</strong> complaints
          </div>
        </>
      )}

      {loading ? (
        <div className="admin-complaints-loading">
          <div className="admin-complaints-spinner"></div>

          <strong>Loading complaints...</strong>

          <p>Fetching the latest complaint records.</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="admin-complaints-empty">
          <div className="admin-complaints-empty-icon">✓</div>

          <h2>No complaints yet</h2>

          <p>
            Complaint reports will appear here when users submit issues to
            FoodRescue.
          </p>

          <Empty text="No complaints found." />
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="admin-complaints-no-results">
          <div className="admin-complaints-no-results-icon">⌕</div>

          <h2>No matching complaints</h2>

          <p>Try changing your search, status or complaint type filter.</p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setTypeFilter("All");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="admin-complaints-table-wrap">
          <table className="admin-complaints-table">
            <thead>
              <tr>
                <th>COMPLAINT</th>
                <th>ORGANIZATION</th>
                <th>TYPE</th>
                <th>DESCRIPTION</th>
                <th>STATUS</th>
                <th>UPDATE STATUS</th>
              </tr>
            </thead>

            <tbody>
              {filteredComplaints.map((complaint) => {
                const isUpdating = updatingId === complaint.complaint_id;

                return (
                  <tr
                    key={complaint.complaint_id}
                    className="admin-complaint-row"
                  >
                    <td>
                      <div className="admin-complaint-identity">
                        <div className="admin-complaint-avatar">
                          {getInitials(organizationName(complaint.user_id))}
                        </div>

                        <div className="admin-complaint-main">
                          <strong>{complaint.complaint_id}</strong>

                          <span>User ID: {complaint.user_id || "-"}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="admin-complaint-organization">
                        <strong>{organizationName(complaint.user_id)}</strong>

                        <span>FoodRescue participant</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          "admin-complaint-type " +
                          getTypeClass(complaint.complaint_type)
                        }
                      >
                        {complaint.complaint_type || "General"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-complaint-description">
                        {complaint.description || "No description provided."}
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          "admin-complaint-status " +
                          getStatusClass(complaint.status)
                        }
                      >
                        <span className="admin-complaint-status-dot"></span>

                        {complaint.status || "Unknown"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-complaint-update">
                        <select
                          value={complaint.status}
                          onChange={(event) =>
                            updateStatus(
                              complaint.complaint_id,
                              event.target.value,
                            )
                          }
                          disabled={isUpdating}
                        >
                          <option value="Pending">Pending</option>

                          <option value="Under Review">Under Review</option>

                          <option value="Resolved">Resolved</option>

                          <option value="Rejected">Rejected</option>
                        </select>

                        {isUpdating && (
                          <span className="admin-complaint-update-status">
                            Updating...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
