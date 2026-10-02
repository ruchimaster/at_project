import { useEffect, useMemo, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle, SuccessBox } from "../../components/UI";

import { formatDate, getErrorMessage } from "../../utils/format";

export default function RequestDonation() {
  const [donations, setDonations] = useState([]);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  async function load() {
    try {
      const response = await api.get("/donations");

      const available = response.data
        .filter((donation) => donation.status === "Available")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setDonations(available);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const searchText = search.toLowerCase();

    return donations.filter((donation) => {
      const address = (donation.pickup_address || "").toLowerCase();

      const food = (donation.food_name || "").toLowerCase();

      return address.includes(searchText) || food.includes(searchText);
    });
  }, [donations, search]);

  async function requestDonation(donationId) {
    setError("");
    setSuccess("");

    try {
      await api.post("/pickup-requests", {
        donation_id: donationId,
      });

      setSuccess("Pickup request sent successfully.");

      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageTitle
        title="Request Donation"
        subtitle="Available donations are shown newest first."
      />

      <div className="search-row">
        <input
          placeholder="Search by location or food name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ErrorBox message={error} />

      <SuccessBox message={success} />

      {filtered.length === 0 ? (
        <Empty text="No matching available donations." />
      ) : (
        <div className="cards-grid">
          {filtered.map((donation) => (
            <div className="card" key={donation.donation_id}>
              <h3>{donation.food_name}</h3>

              <p>
                <strong>Donor:</strong>{" "}
                {donation.donor?.organization_name || "Unknown Organization"}
              </p>

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

              <button
                className="primary"
                onClick={() => requestDonation(donation.donation_id)}
              >
                Request Donation
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
