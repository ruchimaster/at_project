import { useEffect, useMemo, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle, SuccessBox } from "../../components/UI";

import { formatDate, getErrorMessage } from "../../utils/format";

import "./Warnings.css";

export default function Warnings() {
  const [warnings, setWarnings] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);

  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("All");

  const [form, setForm] = useState({
    user_id: "",
    complaint_id: "",
    action_taken: "Warning Issued",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError("");

      const [warningResponse, userResponse, complaintResponse] =
        await Promise.all([
          api.get("/warnings"),
          api.get("/users"),
          api.get("/complaints"),
        ]);

      setWarnings(warningResponse.data);
      setUsers(userResponse.data);
      setComplaints(complaintResponse.data);
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
    return (
      users.find((user) => user.user_id === userId)?.organization_name ||
      "Unknown Organization"
    );
  }

  function organizationRole(userId) {
    return users.find((user) => user.user_id === userId)?.role || "User";
  }

  function complaintForWarning(complaintId) {
    return complaints.find((item) => item.complaint_id === complaintId);
  }

  function change(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function submit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await api.post("/warnings", form);

      setSuccess("Warning created and notification sent successfully.");

      setForm({
        user_id: "",
        complaint_id: "",
        action_taken: "Warning Issued",
      });

      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const nonAdminUsers = useMemo(() => {
    return users.filter((user) => user.role !== "Admin");
  }, [users]);

  const filteredWarnings = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return warnings.filter((warning) => {
      const organization = organizationName(warning.user_id);
      const complaint = complaintForWarning(warning.complaint_id);

      const complaintType = complaint?.complaint_type || "";

      const matchesSearch =
        !searchText ||
        (warning.warning_id || "").toLowerCase().includes(searchText) ||
        (warning.user_id || "").toLowerCase().includes(searchText) ||
        organization.toLowerCase().includes(searchText) ||
        complaintType.toLowerCase().includes(searchText) ||
        (warning.action_taken || "").toLowerCase().includes(searchText) ||
        (warning.complaint_id || "").toLowerCase().includes(searchText);

      const matchesUser =
        userFilter === "All" || warning.user_id === userFilter;

      return matchesSearch && matchesUser;
    });
  }, [warnings, users, complaints, search, userFilter]);

  function getInitials(name) {
    if (!name) return "OR";

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  return (
    <div className="admin-warnings-page">
      <div className="admin-warnings-header">
        <div>
          <div className="admin-warnings-eyebrow">
            COMPLIANCE & ACCOUNTABILITY
          </div>

          <PageTitle
            title="Warnings"
            subtitle="Issue formal warnings to organizations and maintain a clear record of administrative actions."
          />
        </div>

        <div className="admin-warnings-total">
          <span>Total Warnings</span>
          <strong>{loading ? "..." : warnings.length}</strong>
        </div>
      </div>

      <ErrorBox message={error} />

      <SuccessBox message={success} />

      {!loading && (
        <section className="admin-warnings-summary">
          <div className="admin-warning-summary-card summary-total">
            <div className="admin-warning-summary-icon">!</div>

            <div>
              <span>TOTAL WARNINGS</span>
              <strong>{warnings.length}</strong>
            </div>
          </div>

          <div className="admin-warning-summary-card summary-users">
            <div className="admin-warning-summary-icon">◉</div>

            <div>
              <span>ORGANIZATIONS WARNED</span>
              <strong>
                {new Set(warnings.map((warning) => warning.user_id)).size}
              </strong>
            </div>
          </div>

          <div className="admin-warning-summary-card summary-complaints">
            <div className="admin-warning-summary-icon">#</div>

            <div>
              <span>LINKED COMPLAINTS</span>
              <strong>
                {
                  new Set(
                    warnings
                      .map((warning) => warning.complaint_id)
                      .filter(Boolean),
                  ).size
                }
              </strong>
            </div>
          </div>
        </section>
      )}

      <section className="admin-warning-create">
        <div className="admin-warning-create-header">
          <div className="admin-warning-create-icon">!</div>

          <div>
            <div className="admin-warning-create-eyebrow">ADMIN ACTION</div>

            <h2>Create Warning</h2>

            <p>
              Record an official warning against an organization based on a
              complaint.
            </p>
          </div>
        </div>

        <form className="admin-warning-form" onSubmit={submit}>
          <div className="admin-warning-form-grid">
            <label>
              Organization
              <select
                name="user_id"
                value={form.user_id}
                onChange={change}
                required
                disabled={submitting}
              >
                <option value="">Select organization</option>

                {nonAdminUsers.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.organization_name} ({user.role})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Related Complaint
              <select
                name="complaint_id"
                value={form.complaint_id}
                onChange={change}
                required
                disabled={submitting}
              >
                <option value="">Select complaint</option>

                {complaints.map((complaint) => (
                  <option
                    key={complaint.complaint_id}
                    value={complaint.complaint_id}
                  >
                    {organizationName(complaint.user_id)} —{" "}
                    {complaint.complaint_type}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-warning-full-field">
              Action Taken
              <input
                name="action_taken"
                value={form.action_taken}
                onChange={change}
                placeholder="Enter administrative action..."
                disabled={submitting}
              />
            </label>
          </div>

          <div className="admin-warning-form-footer">
            <p>
              A notification will be sent automatically when the warning is
              created.
            </p>

            <button
              className="admin-create-warning-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="admin-warning-button-spinner"></span>
                  Creating Warning...
                </>
              ) : (
                <>
                  <span>!</span>
                  Create Warning
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="admin-existing-warnings">
        <div className="admin-existing-warnings-header">
          <div>
            <div className="admin-existing-warnings-eyebrow">
              WARNING HISTORY
            </div>

            <h2>Existing Warnings</h2>

            <p>
              Review previously issued warnings and the complaints associated
              with them.
            </p>
          </div>

          {!loading && warnings.length > 0 && (
            <div className="admin-warning-history-count">
              {filteredWarnings.length} shown
            </div>
          )}
        </div>

        {!loading && warnings.length > 0 && (
          <div className="admin-warnings-toolbar">
            <div className="admin-warnings-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search warning ID, organization, complaint or action..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="admin-warnings-filter">
              <label htmlFor="warning-user-filter">Organization</label>

              <select
                id="warning-user-filter"
                value={userFilter}
                onChange={(event) => setUserFilter(event.target.value)}
              >
                <option value="All">All Organizations</option>

                {nonAdminUsers.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.organization_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="admin-warnings-loading">
            <div className="admin-warnings-spinner"></div>

            <strong>Loading warning records...</strong>

            <p>Fetching warnings, organizations and complaint information.</p>
          </div>
        ) : warnings.length === 0 ? (
          <div className="admin-warnings-empty">
            <div className="admin-warnings-empty-icon">✓</div>

            <h2>No warnings issued</h2>

            <p>
              Warning records will appear here after an administrator issues a
              warning.
            </p>

            <Empty text="No warnings found." />
          </div>
        ) : filteredWarnings.length === 0 ? (
          <div className="admin-warnings-no-results">
            <div className="admin-warnings-no-results-icon">⌕</div>

            <h2>No matching warnings</h2>

            <p>Try changing your search or organization filter.</p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setUserFilter("All");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="admin-warnings-table-wrap">
            <table className="admin-warnings-table">
              <thead>
                <tr>
                  <th>WARNING</th>
                  <th>ORGANIZATION</th>
                  <th>COMPLAINT</th>
                  <th>ACTION TAKEN</th>
                  <th>DATE ISSUED</th>
                </tr>
              </thead>

              <tbody>
                {filteredWarnings.map((warning) => {
                  const complaint = complaintForWarning(warning.complaint_id);

                  return (
                    <tr key={warning.warning_id} className="admin-warning-row">
                      <td>
                        <div className="admin-warning-identity">
                          <div className="admin-warning-avatar">!</div>

                          <div className="admin-warning-main">
                            <strong>{warning.warning_id}</strong>

                            <span>User ID: {warning.user_id || "-"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="admin-warning-organization">
                          <div className="admin-warning-org-avatar">
                            {getInitials(organizationName(warning.user_id))}
                          </div>

                          <div>
                            <strong>{organizationName(warning.user_id)}</strong>

                            <span>{organizationRole(warning.user_id)}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="admin-warning-complaint">
                          <strong>{warning.complaint_id || "-"}</strong>

                          <span>
                            {complaint?.complaint_type || "Complaint"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="admin-warning-action">
                          {warning.action_taken || "Warning Issued"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-warning-date">
                          {formatDate(warning.warning_date)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
