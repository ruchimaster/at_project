import { useEffect, useMemo, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

import "./PendingNGOs.css";

export default function PendingNGOs() {
  const [ngos, setNGOs] = useState([]);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  const [updatingId, setUpdatingId] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users/admin/pending-ngos");

      setNGOs(response.data.ngos || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function action(userId, actionName, organizationName) {
    const actionText = actionName === "approve" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${
        organizationName || "this NGO application"
      }?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setUpdatingId(`${userId}-${actionName}`);

      await api.put(`/users/admin/ngos/${userId}/${actionName}`);

      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId("");
    }
  }

  const filteredNGOs = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return ngos;
    }

    return ngos.filter((ngo) => {
      return (
        (ngo.organization_name || "").toLowerCase().includes(searchText) ||
        (ngo.organization_type || "").toLowerCase().includes(searchText) ||
        (ngo.contact_person || "").toLowerCase().includes(searchText) ||
        (ngo.email || "").toLowerCase().includes(searchText) ||
        (ngo.phone || "").toLowerCase().includes(searchText) ||
        (ngo.address || "").toLowerCase().includes(searchText) ||
        (ngo.user_id || "").toLowerCase().includes(searchText)
      );
    });
  }, [ngos, search]);

  function getInitials(name) {
    if (!name) {
      return "NG";
    }

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  return (
    <div className="pending-ngos-page">
      <div className="pending-ngos-header">
        <div>
          <div className="pending-ngos-eyebrow">NGO APPROVAL CENTER</div>

          <PageTitle
            title="Pending NGOs"
            subtitle="Review and manage organizations waiting for FoodRescue approval."
          />
        </div>

        <div className="pending-ngos-count">
          <span>Pending Applications</span>

          <strong>{loading ? "..." : ngos.length}</strong>
        </div>
      </div>

      <ErrorBox message={error} />

      {!loading && ngos.length > 0 && (
        <>
          <section className="pending-ngos-overview">
            <div className="pending-ngos-overview-icon">!</div>

            <div className="pending-ngos-overview-content">
              <strong>
                {ngos.length} application
                {ngos.length !== 1 ? "s" : ""} awaiting review
              </strong>

              <p>
                Verify organization details before approving access to the
                FoodRescue platform.
              </p>
            </div>

            <div className="pending-ngos-overview-status">
              <span className="pending-status-dot"></span>
              Needs Review
            </div>
          </section>

          <section className="pending-ngos-toolbar">
            <div className="pending-ngos-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search organization, email, contact, phone or ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="pending-ngos-results">
              Showing <strong>{filteredNGOs.length}</strong> of{" "}
              <strong>{ngos.length}</strong>
            </div>
          </section>
        </>
      )}

      {loading ? (
        <div className="pending-ngos-loading">
          <div className="pending-ngos-spinner"></div>

          <strong>Loading NGO applications...</strong>

          <p>Fetching organizations waiting for approval.</p>
        </div>
      ) : ngos.length === 0 ? (
        <div className="pending-ngos-empty">
          <div className="pending-ngos-empty-icon">✓</div>

          <h2>All caught up</h2>

          <p>There are currently no pending NGO applications.</p>

          <Empty text="No pending NGO applications." />
        </div>
      ) : filteredNGOs.length === 0 ? (
        <div className="pending-ngos-no-results">
          <div className="pending-ngos-no-results-icon">⌕</div>

          <h2>No matching applications</h2>

          <p>
            Try searching with a different organization, email, contact person
            or NGO ID.
          </p>

          <button type="button" onClick={() => setSearch("")}>
            Clear Search
          </button>
        </div>
      ) : (
        <section className="pending-ngos-grid">
          {filteredNGOs.map((ngo) => {
            const approveKey = `${ngo.user_id}-approve`;

            const rejectKey = `${ngo.user_id}-reject`;

            const isApproving = updatingId === approveKey;

            const isRejecting = updatingId === rejectKey;

            return (
              <article className="pending-ngo-card" key={ngo.user_id}>
                <div className="pending-ngo-card-top">
                  <div className="pending-ngo-identity">
                    <div className="pending-ngo-avatar">
                      {getInitials(ngo.organization_name)}
                    </div>

                    <div>
                      <h2>{ngo.organization_name || "Unnamed Organization"}</h2>

                      <span className="pending-ngo-id">{ngo.user_id}</span>
                    </div>
                  </div>

                  <span className="pending-ngo-badge">PENDING</span>
                </div>

                <div className="pending-ngo-type">
                  <span className="pending-detail-label">
                    ORGANIZATION TYPE
                  </span>

                  <strong>{ngo.organization_type || "Not specified"}</strong>
                </div>

                <div className="pending-ngo-details">
                  <div className="pending-detail">
                    <span className="pending-detail-icon">👤</span>

                    <div>
                      <span className="pending-detail-label">
                        CONTACT PERSON
                      </span>

                      <strong>{ngo.contact_person || "Not provided"}</strong>
                    </div>
                  </div>

                  <div className="pending-detail">
                    <span className="pending-detail-icon">✉</span>

                    <div>
                      <span className="pending-detail-label">EMAIL</span>

                      <strong>{ngo.email || "Not provided"}</strong>
                    </div>
                  </div>

                  <div className="pending-detail">
                    <span className="pending-detail-icon">☎</span>

                    <div>
                      <span className="pending-detail-label">PHONE</span>

                      <strong>{ngo.phone || "Not provided"}</strong>
                    </div>
                  </div>

                  <div className="pending-detail pending-detail-address">
                    <span className="pending-detail-icon">📍</span>

                    <div>
                      <span className="pending-detail-label">ADDRESS</span>

                      <strong>{ngo.address || "Not provided"}</strong>
                    </div>
                  </div>
                </div>

                <div className="pending-ngo-actions">
                  <button
                    type="button"
                    className="pending-reject-button"
                    onClick={() =>
                      action(ngo.user_id, "reject", ngo.organization_name)
                    }
                    disabled={updatingId !== ""}
                  >
                    {isRejecting ? (
                      <>
                        <span className="pending-button-spinner"></span>
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <span>×</span>
                        Reject
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="pending-approve-button"
                    onClick={() =>
                      action(ngo.user_id, "approve", ngo.organization_name)
                    }
                    disabled={updatingId !== ""}
                  >
                    {isApproving ? (
                      <>
                        <span className="pending-button-spinner pending-spinner-light"></span>
                        Approving...
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        Approve NGO
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
