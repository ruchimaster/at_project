import { useEffect, useState } from "react";

import api from "../../api/api";

import { PageTitle, ErrorBox } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});

  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/users"),
      api.get("/donations"),
      api.get("/pickup-requests"),
      api.get("/complaints"),
      api.get("/users/admin/pending-ngos"),
    ])

      .then(([users, donations, pickups, complaints, ngos]) => {
        setStats({
          users: users.data.length,

          donations: donations.data.length,

          pickups: pickups.data.length,

          complaints: complaints.data.length,

          pendingNGOs: ngos.data.ngos?.length || 0,
        });
      })

      .catch((err) => {
        setError(getErrorMessage(err));
      });
  }, []);

  return (
    <>
      <PageTitle title="Admin Dashboard" subtitle="Brief statistics." />

      <ErrorBox message={error} />

      <div className="stats-grid">
        <div className="stat-card">
          <span>Users</span>
          <strong>{stats.users ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Donations</span>
          <strong>{stats.donations ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Pickup Requests</span>
          <strong>{stats.pickups ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Complaints</span>
          <strong>{stats.complaints ?? "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Pending NGOs</span>
          <strong>{stats.pendingNGOs ?? "-"}</strong>
        </div>
      </div>
    </>
  );
}
