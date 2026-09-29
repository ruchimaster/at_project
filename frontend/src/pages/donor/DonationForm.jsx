import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../api/api";

import {
  ErrorBox,
  PageTitle,
  SuccessBox,
} from "../../components/UI";

import {
  getErrorMessage,
} from "../../utils/format";

const emptyForm = {
  food_name: "",
  description: "",
  quantity: "",
  pickup_address: "",
  contact_number: "",
  available_until: "",
};

export default function DonationForm() {

  const { donation_id } =
    useParams();

  const editing =
    Boolean(donation_id);

  const navigate =
    useNavigate();

  const [form, setForm] =
    useState(emptyForm);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {

    if (!editing) return;

    async function loadDonation() {

      try {

        const response =
          await api.get(
            `/donations/${donation_id}`
          );

        const donation =
          response.data;

        setForm({
          food_name:
            donation.food_name || "",

          description:
            donation.description || "",

          quantity:
            donation.quantity || "",

          pickup_address:
            donation.pickup_address || "",

          contact_number:
            donation.contact_number || "",

          available_until:
            donation.available_until
              ? new Date(
                  donation.available_until
                )
                  .toISOString()
                  .slice(0, 16)
              : "",
        });

      } catch (err) {

        setError(
          getErrorMessage(err)
        );

      }
    }

    loadDonation();

  }, [donation_id, editing]);

  function change(e) {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });

  }

  async function submit(e) {

    e.preventDefault();

    setError("");
    setSuccess("");

    try {

      if (editing) {

        await api.put(
          `/donations/${donation_id}`,
          form
        );

        setSuccess(
          "Donation updated successfully."
        );

      } else {

        await api.post(
          "/donations",
          form
        );

        setSuccess(
          "Donation created successfully."
        );
      }

      setTimeout(() => {
        navigate("/donor/dashboard");
      }, 500);

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    }
  }

  return (
    <>
      <PageTitle
        title={
          editing
            ? "Edit Donation"
            : "Create Donation"
        }
      />

      <div className="panel">

        <ErrorBox message={error} />

        <SuccessBox message={success} />

        <form onSubmit={submit}>

          <div className="form-grid">

            <label>
              Food Name

              <input
                name="food_name"
                value={form.food_name}
                onChange={change}
                required
              />
            </label>

            <label>
              Quantity

              <input
                type="number"
                min="1"
                name="quantity"
                value={form.quantity}
                onChange={change}
                required
              />
            </label>

            <label>
              Contact Number

              <input
                name="contact_number"
                value={form.contact_number}
                onChange={change}
                maxLength="10"
                required
              />
            </label>

            <label>
              Available Until

              <input
                type="datetime-local"
                name="available_until"
                value={form.available_until}
                onChange={change}
                required
              />
            </label>

            <label className="full">
              Pickup Address

              <textarea
                name="pickup_address"
                value={form.pickup_address}
                onChange={change}
                required
              />
            </label>

            <label className="full">
              Description

              <textarea
                name="description"
                value={form.description}
                onChange={change}
              />
            </label>

          </div>

          <div className="button-row">

            <button
              className="primary"
              type="submit"
            >
              {editing
                ? "Save Changes"
                : "Create Donation"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/donor/dashboard")
              }
            >
              Cancel
            </button>

          </div>

        </form>

      </div>
    </>
  );
}