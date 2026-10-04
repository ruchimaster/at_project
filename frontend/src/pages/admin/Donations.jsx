import { useEffect, useMemo, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle } from "../../components/UI";

import { formatDate, getErrorMessage } from "../../utils/format";

import "./Donations.css";

export default function Donations() {
  const [donations, setDonations] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDonations() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/donations");

        setDonations(response.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadDonations();
  }, []);

  const statuses = useMemo(() => {
    const uniqueStatuses = [
      ...new Set(donations.map((donation) => donation.status).filter(Boolean)),
    ];

    return uniqueStatuses;
  }, [donations]);

  const filteredDonations = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return donations.filter((donation) => {
      const matchesSearch =
        !searchText ||
        (donation.food_name || "").toLowerCase().includes(searchText) ||
        (donation.donation_id || "").toLowerCase().includes(searchText) ||
        (donation.pickup_address || "").toLowerCase().includes(searchText) ||
        (donation.donor?.organization_name || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" || donation.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [donations, search, statusFilter]);

  const totalQuantity = useMemo(() => {
    return donations.reduce((total, donation) => {
      const quantity = Number(donation.quantity);

      return total + (Number.isFinite(quantity) ? quantity : 0);
    }, 0);
  }, [donations]);

  const statusCounts = useMemo(() => {
    return donations.reduce((counts, donation) => {
      const status = donation.status || "Unknown";

      counts[status] = (counts[status] || 0) + 1;

      return counts;
    }, {});
  }, [donations]);

  function getStatusClass(status) {
    const normalized = (status || "").toLowerCase().replace(/\s+/g, "-");

    if (
      normalized.includes("complete") ||
      normalized.includes("rescue") ||
      normalized.includes("picked")
    ) {
      return "admin-donations-status-success";
    }

    if (normalized.includes("available") || normalized.includes("pending")) {
      return "admin-donations-status-warning";
    }

    if (
      normalized.includes("expired") ||
      normalized.includes("cancel") ||
      normalized.includes("reject")
    ) {
      return "admin-donations-status-danger";
    }

    return "admin-donations-status-neutral";
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
    <div className="admin-donations-page">
      <div className="admin-donations-header">
        <div>
          <div className="admin-donations-eyebrow">DONATION MANAGEMENT</div>

          <PageTitle
            title="All Donations"
            subtitle="Monitor every food donation moving through the FoodRescue network."
          />
        </div>

        <div className="admin-donations-total">
          <span>Total Donations</span>

          <strong>{loading ? "..." : donations.length}</strong>
        </div>
      </div>

      <ErrorBox message={error} />

      {!loading && donations.length > 0 && (
        <>
          <section className="admin-donations-summary">
            <div className="admin-donation-summary-card summary-total">
              <div className="admin-donation-summary-icon">◉</div>

              <div>
                <span>TOTAL DONATIONS</span>
                <strong>{donations.length}</strong>
              </div>
            </div>

            <div className="admin-donation-summary-card summary-food">
              <div className="admin-donation-summary-icon">F</div>

              <div>
                <span>FOOD QUANTITY</span>
                <strong>{totalQuantity}</strong>
              </div>
            </div>

            <div className="admin-donation-summary-card summary-active">
              <div className="admin-donation-summary-icon">✓</div>

              <div>
                <span>ACTIVE / PENDING</span>
                <strong>
                  {(statusCounts.Available || 0) + (statusCounts.Pending || 0)}
                </strong>
              </div>
            </div>

            <div className="admin-donation-summary-card summary-rescued">
              <div className="admin-donation-summary-icon">↗</div>

              <div>
                <span>RESCUED / COMPLETED</span>
                <strong>
                  {(statusCounts.Rescued || 0) + (statusCounts.Completed || 0)}
                </strong>
              </div>
            </div>
          </section>

          <section className="admin-donations-toolbar">
            <div className="admin-donations-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search food, donor, donation ID or pickup address..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="admin-donations-filter">
              <label htmlFor="donation-status">Status</label>

              <select
                id="donation-status"
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

          <div className="admin-donations-results">
            Showing <strong>{filteredDonations.length}</strong> of{" "}
            <strong>{donations.length}</strong> donations
          </div>
        </>
      )}

      {loading ? (
        <div className="admin-donations-loading">
          <div className="admin-donations-spinner"></div>

          <strong>Loading donations...</strong>

          <p>Fetching the latest FoodRescue donation records.</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="admin-donations-empty">
          <div className="admin-donations-empty-icon">◉</div>

          <h2>No donations yet</h2>

          <p>
            Food donation records will appear here once donors start creating
            donations.
          </p>

          <Empty text="No donations found." />
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="admin-donations-no-results">
          <div className="admin-donations-no-results-icon">⌕</div>

          <h2>No matching donations</h2>

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
        <div className="admin-donations-table-wrap">
          <table className="admin-donations-table">
            <thead>
              <tr>
                <th>DONATION / FOOD</th>
                <th>DONOR</th>
                <th>QUANTITY</th>
                <th>PICKUP LOCATION</th>
                <th>STATUS</th>
                <th>AVAILABLE UNTIL</th>
              </tr>
            </thead>

            <tbody>
              {filteredDonations.map((donation) => (
                <tr key={donation.donation_id} className="admin-donation-row">
                  <td>
                    <div className="admin-donation-identity">
                      <div className="admin-donation-avatar">
                        {getFoodInitials(donation.food_name)}
                      </div>

                      <div className="admin-donation-main">
                        <strong>{donation.food_name || "Unnamed Food"}</strong>

                        <span>{donation.donation_id}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="admin-donor-cell">
                      <strong>
                        {donation.donor?.organization_name || "Unknown Donor"}
                      </strong>

                      <span>Donor organization</span>
                    </div>
                  </td>

                  <td>
                    <span className="admin-donation-quantity">
                      {donation.quantity}
                    </span>
                  </td>

                  <td>
                    <div className="admin-donation-location">
                      <span className="admin-location-icon">📍</span>

                      <span>{donation.pickup_address || "Not provided"}</span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={
                        "admin-donation-status " +
                        getStatusClass(donation.status)
                      }
                    >
                      <span className="admin-donation-status-dot"></span>

                      {donation.status || "Unknown"}
                    </span>
                  </td>

                  <td>
                    <div className="admin-donation-date">
                      {formatDate(donation.available_until)}
                    </div>
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
