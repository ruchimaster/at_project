import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../../api/api";

import {
  PageTitle,
  Empty,
  ErrorBox,
} from "../../components/UI";

import {
  formatDate,
  getErrorMessage,
} from "../../utils/format";

export default function DonorDashboard() {

  const [donations, setDonations] =
    useState([]);

  const [error, setError] =
    useState("");

  async function loadDonations() {

    try {

      const response =
        await api.get("/donations");

      const current =
        response.data.filter(
          (donation) =>
            [
              "Available",
              "Requested",
              "Accepted",
            ].includes(donation.status)
        );

      setDonations(current);

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    }
  }

  useEffect(() => {
    loadDonations();
  }, []);

  async function deleteDonation(id) {

    const confirmed =
      window.confirm(
        "Delete this donation?"
      );

    if (!confirmed) return;

    try {

      await api.delete(
        `/donations/${id}`
      );

      loadDonations();

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    }
  }

  return (
    <>
      <PageTitle
        title="Donor Dashboard"
        subtitle="Create donations and manage your current donations."
      />

      <ErrorBox message={error} />

      <div className="toolbar">

        <Link
          className="primary button-link"
          to="/donor/donations/new"
        >
          + Create Donation
        </Link>

      </div>

      {donations.length === 0 ? (

        <Empty
          text="No current donations."
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
                {donation.description ||
                  "No description"}
              </p>

              <p>
                <strong>
                  Quantity:
                </strong>{" "}
                {donation.quantity}
              </p>

              <p>
                <strong>
                  Pickup:
                </strong>{" "}
                {donation.pickup_address}
              </p>

              <p>
                <strong>
                  Available until:
                </strong>{" "}
                {formatDate(
                  donation.available_until
                )}
              </p>

              <span className="status">
                {donation.status}
              </span>

              {/* Only Available donations
                  can be edited/deleted */}

              {donation.status ===
                "Available" && (

                <div className="button-row">

                  <Link
                    to={`/donor/donations/${donation.donation_id}/edit`}
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() =>
                      deleteDonation(
                        donation.donation_id
                      )
                    }
                  >
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