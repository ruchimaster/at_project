import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/api";

import { ErrorBox, PageTitle, SuccessBox } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

const emptyForm = {
  food_name: "",
  description: "",
  quantity: "",
  pickup_address: "",
  contact_number: "",
  available_until: "",
};

export default function DonationForm() {
  const { donation_id } = useParams();

  const editing = Boolean(donation_id);

  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!editing) return;

    async function loadDonation() {
      try {
        const response = await api.get(`/donations/${donation_id}`);

        const donation = response.data;

        setForm({
          food_name: donation.food_name || "",

          description: donation.description || "",

          quantity: donation.quantity || "",

          pickup_address: donation.pickup_address || "",

          contact_number: donation.contact_number || "",

          available_until: donation.available_until
            ? new Date(donation.available_until).toISOString().slice(0, 16)
            : "",
        });
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    loadDonation();
  }, [donation_id, editing]);

  function change(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function submit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      if (editing) {
        await api.put(`/donations/${donation_id}`, form);

        setSuccess("Donation updated successfully.");
      } else {
        await api.post("/donations", form);

        setSuccess("Donation created successfully.");
      }

      setTimeout(() => {
        navigate("/donor/dashboard");
      }, 700);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <div className="donation-form-container">
        <div className="donation-form-header">
          <div>
            <h2>{editing ? "Edit your donation" : "Create a new donation"}</h2>

            <p>
              Provide the details below so an NGO can request and collect your
              food.
            </p>
          </div>
        </div>

        <div className="donation-form-card">
          <ErrorBox message={error} />

          <SuccessBox message={success} />

          <form onSubmit={submit}>
            <div className="donation-form-section">
              <div className="donation-section-title">
                <h3>Food Details</h3>
                <p>Tell us about the food you want to donate.</p>
              </div>

              <div className="donation-form-grid">
                <div className="donation-field">
                  <label htmlFor="food_name">Food Name</label>

                  <input
                    id="food_name"
                    name="food_name"
                    type="text"
                    value={form.food_name}
                    onChange={change}
                    placeholder="Enter food name"
                    required
                  />
                </div>

                <div className="donation-field">
                  <label htmlFor="quantity">Quantity</label>

                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    name="quantity"
                    value={form.quantity}
                    onChange={change}
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div className="donation-field donation-field-full">
                  <label htmlFor="description">Description</label>

                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={change}
                    placeholder="Describe the food, packaging, serving size or any other useful information"
                  />
                </div>
              </div>
            </div>

            <div className="donation-form-section">
              <div className="donation-section-title">
                <h3>Pickup Details</h3>
                <p>Provide accurate information for collection.</p>
              </div>

              <div className="donation-form-grid">
                <div className="donation-field donation-field-full">
                  <label htmlFor="pickup_address">Pickup Address</label>

                  <textarea
                    id="pickup_address"
                    name="pickup_address"
                    value={form.pickup_address}
                    onChange={change}
                    placeholder="Enter the complete pickup address"
                    required
                  />
                </div>

                <div className="donation-field">
                  <label htmlFor="contact_number">Contact Number</label>

                  <input
                    id="contact_number"
                    name="contact_number"
                    type="tel"
                    value={form.contact_number}
                    onChange={change}
                    maxLength="10"
                    placeholder="Enter 10-digit number"
                    required
                  />
                </div>

                <div className="donation-field">
                  <label htmlFor="available_until">Available Until</label>

                  <input
                    id="available_until"
                    type="datetime-local"
                    name="available_until"
                    value={form.available_until}
                    onChange={change}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="donation-form-actions">
              <button
                type="button"
                className="donation-button-cancel"
                onClick={() => navigate("/donor/dashboard")}
              >
                Cancel
              </button>

              <button type="submit" className="donation-button-submit">
                {editing ? "Save Changes" : "Create Donation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
