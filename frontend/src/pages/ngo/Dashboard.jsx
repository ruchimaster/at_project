import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../../api/api";

import { ErrorBox, PageTitle } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

export default function NGODashboard() {
  const [accountNotification, setAccountNotification] = useState(null);

  const [stats, setStats] = useState({});

  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/notifications"), api.get("/analytics")])
      .then(([notifications, analytics]) => {
        const notification = notifications.data.find(
          (item) => !item.is_read && item.type === "Account",
        );

        setAccountNotification(notification || null);

        const data = analytics.data;

        setStats({
          totalRequests: data.summary?.totalRequests ?? 0,

          pendingRequests: data.summary?.pendingRequests ?? 0,

          acceptedRequests: data.summary?.acceptedRequests ?? 0,

          completedRequests: data.summary?.completedRequests ?? 0,

          cancelledRequests: data.summary?.cancelledRequests ?? 0,

          rejectedRequests: data.summary?.rejectedRequests ?? 0,

          rescuedQuantity: data.summary?.rescuedQuantity ?? 0,

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
        title="NGO Dashboard"
        subtitle="Find available food donations and manage your pickups."
      />

      <ErrorBox message={error} />

      {accountNotification && (
        <div className="notice">
          <strong>Account update:</strong> {accountNotification.message}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Pickup Requests</span>
          <strong>{stats.totalRequests ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Pending Requests</span>
          <strong>{stats.pendingRequests ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Accepted Requests</span>
          <strong>{stats.acceptedRequests ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Completed Pickups</span>
          <strong>{stats.completedRequests ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Cancelled Requests</span>
          <strong>{stats.cancelledRequests ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Rejected Requests</span>
          <strong>{stats.rejectedRequests ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Rescued Quantity</span>
          <strong>{stats.rescuedQuantity ?? "-"}</strong>
        </div>
      </div>

      <div className="cards-grid">
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

      <div className="dashboard-links">
        <Link className="feature-card" to="/ngo/request-donation">
          <h3>Request Donation</h3>

          <p>Search available donations by location.</p>
        </Link>

        <Link className="feature-card" to="/ngo/current-pickups">
          <h3>Current Pickup Requests</h3>

          <p>View your current pickup requests.</p>
        </Link>

        <Link className="feature-card" to="/ngo/completed-pickups">
          <h3>Completed Pickups</h3>

          <p>View completed pickups.</p>
        </Link>
      </div>
    </>
  );
}
