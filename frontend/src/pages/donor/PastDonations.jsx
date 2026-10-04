import { useEffect, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle } from "../../components/UI";

import { formatDate, getErrorMessage } from "../../utils/format";

export default function PastDonations() {
  const [donations, setDonations] = useState([]);

  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/donations")
      .then((response) => {
        const past = response.data.filter((donation) =>
          ["Completed", "Expired", "Cancelled"].includes(donation.status),
        );

        setDonations(past);
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      });
  }, []);

  function getStatusClass(status) {
    if (status === "Completed") {
      return "past-donation-status completed";
    }

    if (status === "Expired") {
      return "past-donation-status expired";
    }

    return "past-donation-status cancelled";
  }

  return (
    <>
      <div className="past-donations-page">
        <div className="past-donations-header">
          <div>
            <h2>Your donation history</h2>

            <p>
              View the food donations you have completed, expired, or cancelled.
            </p>
          </div>

          <div className="past-donations-count">
            <strong>{donations.length}</strong>

            <span>Total donations</span>
          </div>
        </div>

        <ErrorBox message={error} />

        {donations.length === 0 ? (
          <div className="past-donations-empty">
            <Empty text="No past donations yet." />
          </div>
        ) : (
          <div className="past-donations-list">
            {donations.map((donation) => (
              <div className="past-donation-item" key={donation.donation_id}>
                <div className="past-donation-main">
                  <div className="past-donation-icon">
                    {donation.food_name?.charAt(0)?.toUpperCase() || "F"}
                  </div>

                  <div className="past-donation-info">
                    <div className="past-donation-title-row">
                      <h3>{donation.food_name}</h3>

                      <span className={getStatusClass(donation.status)}>
                        {donation.status}
                      </span>
                    </div>

                    <div className="past-donation-details">
                      <div>
                        <span>Quantity</span>

                        <strong>{donation.quantity}</strong>
                      </div>

                      <div>
                        <span>Created</span>

                        <strong>{formatDate(donation.created_at)}</strong>
                      </div>
                    </div>

                    <div className="past-donation-address">
                      <span>Pickup Address</span>

                      <p>{donation.pickup_address}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
