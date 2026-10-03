import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../../api/api";

import { PageTitle, Empty, ErrorBox } from "../../components/UI";

import { formatDate, getErrorMessage } from "../../utils/format";

export default function DonorDashboard() {
  const [donations, setDonations] = useState([]);

  const [stats, setStats] = useState({});

  const [error, setError] = useState("");

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
    loadDonations();
    loadAnalytics();
  }, []);

  async function deleteDonation(id) {
    const confirmed = window.confirm("Delete this donation?");

    if (!confirmed) return;

    try {
      await api.delete(`/donations/${id}`);

      loadDonations();
      loadAnalytics();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageTitle
        title="Donor Dashboard"
        subtitle="Create donations and manage your current donations."
      />

      <ErrorBox message={error} />

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Donations</span>

          <strong>{stats.totalDonations ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Available</span>

          <strong>{stats.availableDonations ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Requested</span>

          <strong>{stats.requestedDonations ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Accepted</span>

          <strong>{stats.acceptedDonations ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Picked Up</span>

          <strong>{stats.pickedUpDonations ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Completed</span>

          <strong>{stats.completedDonations ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Expired</span>

          <strong>{stats.expiredDonations ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Cancelled</span>

          <strong>{stats.cancelledDonations ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Total Quantity</span>

          <strong>{stats.totalQuantity ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Completed Quantity</span>

          <strong>{stats.completedQuantity ?? "-"}</strong>
        </div>
      </div>

      <div className="cards-grid">
        <div className="card">
          <h3>Monthly Donations</h3>

          {stats.monthlyDonations?.length ? (
            stats.monthlyDonations.map((item) => (
              <p key={item._id}>
                <strong>{item._id}:</strong> {item.count} donations (
                {item.quantity} quantity)
              </p>
            ))
          ) : (
            <p>No monthly donation data available.</p>
          )}
        </div>
      </div>

      <div className="toolbar">
        <Link className="primary button-link" to="/donor/donations/new">
          + Create Donation
        </Link>
      </div>

      {donations.length === 0 ? (
        <Empty text="No current donations." />
      ) : (
        <div className="cards-grid">
          {donations.map((donation) => (
            <div className="card" key={donation.donation_id}>
              <h3>{donation.food_name}</h3>

              <p>{donation.description || "No description"}</p>

              <p>
                <strong>Quantity:</strong> {donation.quantity}
              </p>

              <p>
                <strong>Pickup:</strong> {donation.pickup_address}
              </p>

              <p>
                <strong>Available until:</strong>{" "}
                {formatDate(donation.available_until)}
              </p>

              <span className="status">{donation.status}</span>

              {donation.status === "Available" && (
                <div className="button-row">
                  <Link to={`/donor/donations/${donation.donation_id}/edit`}>
                    Edit
                  </Link>

                  <button onClick={() => deleteDonation(donation.donation_id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
