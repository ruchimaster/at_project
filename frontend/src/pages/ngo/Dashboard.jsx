import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../../api/api";

import { ErrorBox, PageTitle } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

export default function NGODashboard() {
  const [accountNotification, setAccountNotification] = useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/notifications")
      .then((response) => {
        const notification = response.data.find(
          (item) => !item.is_read && item.type === "Account",
        );

        setAccountNotification(notification || null);
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
