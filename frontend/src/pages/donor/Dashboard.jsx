import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/api";
import { ErrorBox } from "../../components/UI";
import { formatDate, getErrorMessage } from "../../utils/format";

export default function DonorDashboard() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDonations() {
    try {
      const response = await api.get("/donations");

      const current = response.data.filter((donation) =>
        ["Available", "Requested", "Accepted"].includes(donation.status),
      );

      setDonations(current);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function loadAnalytics() {
    try {
      const response = await api.get("/analytics");
      const data = response.data;

      setStats({
        totalDonations: data.summary?.totalDonations ?? 0,
        availableDonations: data.summary?.availableDonations ?? 0,
        requestedDonations: data.summary?.requestedDonations ?? 0,
        acceptedDonations: data.summary?.acceptedDonations ?? 0,
        pickedUpDonations: data.summary?.pickedUpDonations ?? 0,
        completedDonations: data.summary?.completedDonations ?? 0,
        expiredDonations: data.summary?.expiredDonations ?? 0,
        cancelledDonations: data.summary?.cancelledDonations ?? 0,
        totalQuantity: data.summary?.totalQuantity ?? 0,
        completedQuantity: data.summary?.completedQuantity ?? 0,
        monthlyDonations: data.monthlyDonations || [],
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      await Promise.all([loadDonations(), loadAnalytics()]);

      setLoading(false);
    }

    loadDashboard();
  }, []);

  async function deleteDonation(id) {
    const confirmed = window.confirm("Delete this donation?");

    if (!confirmed) return;

    try {
      await api.delete(`/donations/${id}`);

      await Promise.all([loadDonations(), loadAnalytics()]);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const completionRate = useMemo(() => {
    if (!stats.totalDonations) return 0;

    return Math.min(
      100,
      Math.round((stats.completedDonations / stats.totalDonations) * 100),
    );
  }, [stats.completedDonations, stats.totalDonations]);

  function getStatusClass(status) {
    switch (status) {
      case "Available":
        return "donor-status donor-status-available";
      case "Requested":
        return "donor-status donor-status-requested";
      case "Accepted":
        return "donor-status donor-status-accepted";
      default:
        return "donor-status";
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case "Available":
        return "●";
      case "Requested":
        return "◐";
      case "Accepted":
        return "✓";
      default:
        return "•";
    }
  }

  function getHoursRemaining(date) {
    if (!date) return null;

    const difference = new Date(date).getTime() - Date.now();

    return Math.ceil(difference / (1000 * 60 * 60));
  }

  function getAvailabilityClass(date) {
    const hours = getHoursRemaining(date);

    if (hours === null) return "";
    if (hours <= 3) return "urgent";
    if (hours <= 12) return "soon";

    return "normal";
  }

  return (
    <div className="donor-dashboard">
      <ErrorBox message={error} />

      <section className="donor-welcome">
        <div className="donor-welcome-copy">
          <span className="donor-welcome-label">YOUR DONATIONS</span>

          <h1>Manage your donations</h1>

          <p>
            Create donations, review pickup requests, and follow each rescue
            from availability to completion.
          </p>
        </div>

        <div className="donor-welcome-actions">
          <Link to="/donor/past-donations" className="donor-history-button">
            View history
          </Link>

          <Link to="/donor/donation-form" className="donor-create-button">
            <span aria-hidden="true">+</span>
            Create donation
          </Link>
        </div>
      </section>

      <section className="donor-stats-section">
        <div className="donor-section-heading">
          <div>
            <h2>Donation overview</h2>
            <p>Keep track of your contributions and their current status.</p>
          </div>

          <div className="donor-completion-mini">
            <div
              className="donor-mini-ring"
              style={{
                "--completion-angle": `${completionRate * 3.6}deg`,
              }}
            >
              <span>{completionRate}%</span>
            </div>

            <div>
              <strong>Completion rate</strong>
              <span>of all donations</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="donor-stat-grid">
            {[1, 2, 3, 4].map((item) => (
              <div className="donor-stat-skeleton" key={item} />
            ))}
          </div>
        ) : (
          <div className="donor-stat-grid">
            <div className="donor-stat-card donor-stat-primary">
              <span className="donor-stat-label">Total donations</span>
              <strong className="donor-stat-number">
                {stats.totalDonations ?? 0}
              </strong>
              <span className="donor-stat-note">All time</span>
            </div>

            <div className="donor-stat-card">
              <span className="donor-stat-label">Available</span>
              <strong className="donor-stat-number">
                {stats.availableDonations ?? 0}
              </strong>
              <span className="donor-stat-note">Waiting for an NGO</span>
            </div>

            <div className="donor-stat-card">
              <span className="donor-stat-label">Requested</span>
              <strong className="donor-stat-number">
                {stats.requestedDonations ?? 0}
              </strong>
              <span className="donor-stat-note">Request received</span>
            </div>

            <div className="donor-stat-card">
              <span className="donor-stat-label">Accepted</span>
              <strong className="donor-stat-number">
                {stats.acceptedDonations ?? 0}
              </strong>
              <span className="donor-stat-note">Moving toward pickup</span>
            </div>
          </div>
        )}
      </section>

      <section className="donor-secondary-metrics">
        <div className="donor-metric-box">
          <span className="donor-metric-label">PICKED UP</span>
          <strong>{stats.pickedUpDonations ?? 0}</strong>
          <p>Donations collected for rescue.</p>
        </div>

        <div className="donor-metric-box">
          <span className="donor-metric-label">COMPLETED</span>
          <strong>{stats.completedDonations ?? 0}</strong>
          <p>Successfully completed rescues.</p>
        </div>

        <div className="donor-metric-box">
          <span className="donor-metric-label">TOTAL QUANTITY</span>
          <strong>{stats.totalQuantity ?? 0}</strong>
          <p>Quantity contributed through FoodRescue.</p>
        </div>

        <div className="donor-metric-box">
          <span className="donor-metric-label">RESCUED QUANTITY</span>
          <strong>{stats.completedQuantity ?? 0}</strong>
          <p>Quantity in completed donations.</p>
        </div>
      </section>

      <section className="donor-current-section">
        <div className="donor-section-heading donor-current-heading">
          <div>
            <h2>Current donations</h2>
            <p>
              Monitor food that is available or moving through the rescue
              process.
            </p>
          </div>

          <Link to="/donor/donation-form" className="donor-outline-action">
            <span aria-hidden="true">+</span>
            Add donation
          </Link>
        </div>

        {loading ? (
          <div className="donor-donation-loading">
            <div />
            <div />
            <div />
            <div />
          </div>
        ) : donations.length === 0 ? (
          <div className="donor-empty-state">
            <div className="donor-empty-icon">+</div>

            <h3>No active donations yet</h3>

            <p>
              Create your first donation to help an organization make use of
              surplus food.
            </p>

            <Link to="/donor/donation-form" className="donor-create-button">
              Create your first donation
            </Link>
          </div>
        ) : (
          <div className="donor-donation-table-wrap">
            <table className="donor-donation-table">
              <thead>
                <tr>
                  <th>Donation</th>
                  <th>Quantity</th>
                  <th>Pickup location</th>
                  <th>Available until</th>
                  <th>Status</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {donations.map((donation) => {
                  const hoursRemaining = getHoursRemaining(
                    donation.available_until,
                  );

                  const availabilityClass = getAvailabilityClass(
                    donation.available_until,
                  );

                  return (
                    <tr key={donation.donation_id}>
                      <td>
                        <div className="donor-table-donation">
                          <span className="donor-donation-id">
                            {donation.donation_id}
                          </span>

                          <strong>{donation.food_name}</strong>

                          {donation.description && (
                            <span className="donor-table-description">
                              {donation.description}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="donor-table-quantity">
                          {donation.quantity}
                        </span>
                      </td>

                      <td>
                        <span className="donor-table-location">
                          {donation.pickup_address}
                        </span>
                      </td>

                      <td>
                        <span className="donor-table-date">
                          {formatDate(donation.available_until)}
                        </span>
                      </td>

                      <td>
                        <span className={getStatusClass(donation.status)}>
                          <span>{getStatusIcon(donation.status)}</span>
                          {donation.status}
                        </span>
                      </td>

                      <td>
                        {hoursRemaining !== null ? (
                          <div
                            className={`donor-table-availability ${availabilityClass}`}
                          >
                            <span className="donor-availability-dot" />
                            <span>
                              {hoursRemaining <= 0
                                ? "Ended"
                                : `${hoursRemaining} hr${
                                    hoursRemaining === 1 ? "" : "s"
                                  } left`}
                            </span>
                          </div>
                        ) : (
                          <span className="donor-table-not-available">—</span>
                        )}
                      </td>

                      <td>
                        {donation.status === "Available" ? (
                          <div className="donor-table-actions">
                            <Link
                              to={`/donor/donations/${donation.donation_id}/edit`}
                              className="donor-table-edit"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              className="donor-table-delete"
                              onClick={() =>
                                deleteDonation(donation.donation_id)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <Link
                            to="/donor/pickup-requests"
                            className="donor-table-view"
                          >
                            View request →
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="donor-monthly-section">
        <div className="donor-monthly-copy">
          <h2>Your donation activity</h2>

          <p>See how your contributions have developed over time.</p>

          <Link to="/donor/past-donations" className="donor-text-link">
            Explore donation history →
          </Link>
        </div>

        <div className="donor-monthly-list">
          {stats.monthlyDonations?.length ? (
            stats.monthlyDonations.map((item) => (
              <div className="donor-month-row" key={item._id}>
                <div className="donor-month-label">
                  <strong>{item._id}</strong>
                  <span>
                    {item.count} donation{item.count === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="donor-month-bar">
                  <span
                    style={{
                      width: `${Math.min(100, Math.max(8, item.count * 12))}%`,
                    }}
                  />
                </div>

                <strong className="donor-month-value">{item.quantity}</strong>
              </div>
            ))
          ) : (
            <div className="donor-month-empty">
              No monthly donation activity available yet.
            </div>
          )}
        </div>
      </section>

      <section className="donor-impact-strip">
        <div>
          <h2>Good food should reach people, not landfills.</h2>
          <p>Make your next contribution count.</p>
        </div>

        <Link to="/donor/donation-form" className="donor-impact-action">
          Make a donation <span>→</span>
        </Link>
      </section>
    </div>
  );
}
