import { useEffect, useState } from "react";

import api from "../../api/api";

import { PageTitle, ErrorBox } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});

  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/analytics"), api.get("/complaints")])
      .then(([analytics, complaints]) => {
        const data = analytics.data;

        setStats({
          users: data.summary?.totalUsers ?? 0,

          donors: data.summary?.totalDonors ?? 0,

          ngos: data.summary?.totalNGOs ?? 0,

          pendingNGOs: data.summary?.pendingNGOs ?? 0,

          donations: data.summary?.totalDonations ?? 0,

          pickups: data.summary?.totalPickupRequests ?? 0,

          donatedQuantity: data.summary?.totalDonatedQuantity ?? 0,

          rescuedQuantity: data.summary?.totalRescuedQuantity ?? 0,

          complaints: complaints.data.length,

          donationStatusCounts: data.donationStatusCounts || [],

          pickupStatusCounts: data.pickupStatusCounts || [],

          monthlyDonations: data.monthlyDonations || [],

          monthlyCompletedPickups: data.monthlyCompletedPickups || [],
        });
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      });
  }, []);

  return (
    <>
      <PageTitle
        title="Admin Dashboard"
        subtitle="Overview of FoodRescue activity and food recovery."
      />

      <ErrorBox message={error} />

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Users</span>
          <strong>{stats.users ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Donors</span>
          <strong>{stats.donors ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>NGOs</span>
          <strong>{stats.ngos ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Pending NGOs</span>
          <strong>{stats.pendingNGOs ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Total Donations</span>
          <strong>{stats.donations ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Pickup Requests</span>
          <strong>{stats.pickups ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Total Donated Quantity</span>
          <strong>{stats.donatedQuantity ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Rescued Quantity</span>
          <strong>{stats.rescuedQuantity ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Complaints</span>
          <strong>{stats.complaints ?? "-"}</strong>
        </div>
      </div>

      <div className="cards-grid">
        <div className="card">
          <h3>Donation Status</h3>

          {stats.donationStatusCounts?.length ? (
            stats.donationStatusCounts.map((item) => (
              <p key={item._id}>
                <strong>{item._id}:</strong> {item.count}
              </p>
            ))
          ) : (
            <p>No donation data available.</p>
          )}
        </div>

        <div className="card">
          <h3>Pickup Status</h3>

          {stats.pickupStatusCounts?.length ? (
            stats.pickupStatusCounts.map((item) => (
              <p key={item._id}>
                <strong>{item._id}:</strong> {item.count}
              </p>
            ))
          ) : (
            <p>No pickup data available.</p>
          )}
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

        <div className="card">
          <h3>Monthly Completed Pickups</h3>

          {stats.monthlyCompletedPickups?.length ? (
            stats.monthlyCompletedPickups.map((item) => (
              <p key={item._id}>
                <strong>{item._id}:</strong> {item.count} completed
              </p>
            ))
          ) : (
            <p>No completed pickup data available.</p>
          )}
        </div>
      </div>
    </>
  );
}
