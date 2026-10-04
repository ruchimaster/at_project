import { useEffect, useMemo, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle, SuccessBox } from "../../components/UI";

import { formatDate, getErrorMessage } from "../../utils/format";

import "./RequestDonation.css";

export default function RequestDonation() {
  const [donations, setDonations] = useState([]);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(true);

  const [requestingId, setRequestingId] = useState("");

  async function load() {
    try {
      setLoading(true);

      const response = await api.get("/donations/recommended");

      setDonations(response.data);

      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return donations;
    }

    return donations.filter((donation) => {
      const address = (donation.pickup_address || "").toLowerCase();

      const food = (donation.food_name || "").toLowerCase();

      const organization = (
        donation.donor?.organization_name || ""
      ).toLowerCase();

      const priority = (donation.priority_level || "").toLowerCase();

      return (
        address.includes(searchText) ||
        food.includes(searchText) ||
        organization.includes(searchText) ||
        priority.includes(searchText)
      );
    });
  }, [donations, search]);

  async function requestDonation(donationId) {
    setError("");
    setSuccess("");
    setRequestingId(donationId);

    try {
      await api.post("/pickup-requests", {
        donation_id: donationId,
      });

      setSuccess(
        "Pickup request sent successfully. The donor will be notified.",
      );

      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRequestingId("");
    }
  }

  function getPriorityClass(level) {
    const value = (level || "").toLowerCase();

    if (value.includes("critical") || value.includes("urgent")) {
      return "priority-critical";
    }

    if (value.includes("high")) {
      return "priority-high";
    }

    if (value.includes("medium")) {
      return "priority-medium";
    }

    return "priority-normal";
  }

  function getPriorityLabel(level) {
    if (!level) {
      return "Normal";
    }

    return level;
  }

  return (
    <div className="ngo-request-page">
      <div className="ngo-request-header">
        <div>
          <div className="ngo-request-eyebrow">FOOD RESCUE NETWORK</div>

          <PageTitle
            title="Request Donation"
            subtitle="Discover available food donations ranked by the Rescue Priority Score."
          />
        </div>

        <div className="ngo-request-summary">
          <span>Available Donations</span>

          <strong>{loading ? "..." : filtered.length}</strong>
        </div>
      </div>

      <ErrorBox message={error} />

      <SuccessBox message={success} />

      <div className="ngo-request-toolbar">
        <div className="ngo-request-search">
          <span className="ngo-search-icon">⌕</span>

          <input
            placeholder="Search food, donor, location or priority..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              className="ngo-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="ngo-request-count">
          {search
            ? `${filtered.length} matching donation${
                filtered.length === 1 ? "" : "s"
              }`
            : `${donations.length} donation${
                donations.length === 1 ? "" : "s"
              } available`}
        </div>
      </div>

      {loading ? (
        <div className="ngo-request-loading">
          <div className="ngo-loading-spinner" />

          <strong>Finding available donations...</strong>

          <p>We're checking the latest recommended food donations.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ngo-request-empty">
          <Empty
            text={
              search
                ? "No donations match your search."
                : "No matching available donations."
            }
          />
        </div>
      ) : (
        <div className="ngo-donation-grid">
          {filtered.map((donation) => {
            const priorityClass = getPriorityClass(donation.priority_level);

            const isRequesting = requestingId === donation.donation_id;

            return (
              <article className="ngo-donation-card" key={donation.donation_id}>
                <div className="ngo-donation-top">
                  <div className="ngo-donation-food">
                    <div className="ngo-food-icon">♻</div>

                    <div>
                      <span className="ngo-donation-id">
                        {donation.donation_id}
                      </span>

                      <h2>{donation.food_name}</h2>
                    </div>
                  </div>

                  <div className={`ngo-priority-badge ${priorityClass}`}>
                    {getPriorityLabel(donation.priority_level)}
                  </div>
                </div>

                <div className="ngo-priority-panel">
                  <div>
                    <span>RESCUE PRIORITY SCORE</span>

                    <strong>
                      {donation.priority_score ?? 0}
                      <small>/100</small>
                    </strong>
                  </div>

                  <div className="ngo-priority-meter">
                    <div
                      style={{
                        width: `${Math.min(
                          Math.max(Number(donation.priority_score || 0), 0),
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="ngo-donation-details">
                  <div className="ngo-detail-item">
                    <span className="ngo-detail-icon">◉</span>

                    <div>
                      <small>DONOR</small>

                      <strong>
                        {donation.donor?.organization_name ||
                          "Unknown Organization"}
                      </strong>
                    </div>
                  </div>

                  <div className="ngo-detail-item">
                    <span className="ngo-detail-icon">≋</span>

                    <div>
                      <small>QUANTITY</small>

                      <strong>{donation.quantity}</strong>
                    </div>
                  </div>

                  <div className="ngo-detail-item ngo-detail-wide">
                    <span className="ngo-detail-icon">⌖</span>

                    <div>
                      <small>PICKUP LOCATION</small>

                      <strong>{donation.pickup_address}</strong>
                    </div>
                  </div>

                  <div className="ngo-detail-item">
                    <span className="ngo-detail-icon">◷</span>

                    <div>
                      <small>AVAILABLE UNTIL</small>

                      <strong>{formatDate(donation.available_until)}</strong>
                    </div>
                  </div>
                </div>

                <div className="ngo-donation-footer">
                  <div className="ngo-time-remaining">
                    <span className="ngo-time-icon">⏱</span>

                    <div>
                      <small>TIME REMAINING</small>

                      <strong>{donation.hours_remaining ?? 0} hours</strong>
                    </div>
                  </div>

                  <button
                    className="ngo-request-button"
                    onClick={() => requestDonation(donation.donation_id)}
                    disabled={isRequesting}
                  >
                    {isRequesting ? (
                      <>
                        <span className="ngo-button-spinner" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Request Pickup
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
