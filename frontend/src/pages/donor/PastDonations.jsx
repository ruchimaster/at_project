import {
  useEffect,
  useState,
} from "react";

import api from "../../api/api";

import {
  Empty,
  ErrorBox,
  PageTitle,
} from "../../components/UI";

import {
  formatDate,
  getErrorMessage,
} from "../../utils/format";

export default function PastDonations() {

  const [donations, setDonations] =
    useState([]);

  const [error, setError] =
    useState("");

  useEffect(() => {

    api.get("/donations")
      .then((response) => {

        const past =
          response.data.filter(
            (donation) =>
              [
                "Completed",
                "Expired",
                "Cancelled",
              ].includes(donation.status)
          );

        setDonations(past);

      })
      .catch((err) => {

        setError(
          getErrorMessage(err)
        );

      });

  }, []);

  return (
    <>
      <PageTitle
        title="Past Donations"
      />

      <ErrorBox message={error} />

      {donations.length === 0 ? (

        <Empty
          text="No past donations yet."
        />

      ) : (

        <div className="cards-grid">

          {donations.map((donation) => (

            <div
              className="card"
              key={donation.donation_id}
            >

              <h3>
                {donation.food_name}
              </h3>

              <p>
                Quantity: {donation.quantity}
              </p>

              <p>
                Pickup: {donation.pickup_address}
              </p>

              <p>
                Created:{" "}
                {formatDate(
                  donation.created_at
                )}
              </p>

              <span className="status">
                {donation.status}
              </span>

            </div>

          ))}

        </div>

      )}
    </>
  );
}