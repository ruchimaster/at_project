import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  ErrorBox,
  SuccessBox,
} from "../../components/UI";

import {
  getErrorMessage,
} from "../../utils/format";

const initialForm = {
  organization_name: "",
  organization_type: "Restaurant",
  contact_person: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  role: "Donor",
};

export default function Register() {

  const [form, setForm] =
    useState(initialForm);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const { register } = useAuth();

  const navigate = useNavigate();

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

      await register(form);

      if (form.role === "NGO") {

        setSuccess(
          "Registration submitted. Your NGO account is waiting for admin approval."
        );

      } else {

        setSuccess(
          "Registration successful. You can now login."
        );

      }

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    }
  }

  return (
    <div className="auth-page">

      <form
        className="auth-card wide"
        onSubmit={submit}
      >

        <h1>Create Account</h1>

        <p>
          Donors can login immediately.
          NGOs require administrator approval.
        </p>

        <ErrorBox message={error} />

        <SuccessBox message={success} />

        <div className="form-grid">

          <label>
            Organization Name

            <input
              name="organization_name"
              value={form.organization_name}
              onChange={change}
              required
            />
          </label>

          <label>
            Organization Type

            <select
              name="organization_type"
              value={form.organization_type}
              onChange={change}
            >
              <option>Restaurant</option>
              <option>Hotel</option>
              <option>Caterer</option>
              <option>NGO</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Contact Person

            <input
              name="contact_person"
              value={form.contact_person}
              onChange={change}
              required
            />
          </label>

          <label>
            Email

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={change}
              required
            />
          </label>

          <label>
            Phone

            <input
              name="phone"
              value={form.phone}
              onChange={change}
              maxLength="10"
              required
            />
          </label>

          <label>
            Role

            <select
              name="role"
              value={form.role}
              onChange={change}
            >
              <option>Donor</option>
              <option>NGO</option>
            </select>
          </label>

          <label className="full">
            Address

            <textarea
              name="address"
              value={form.address}
              onChange={change}
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={change}
              required
              minLength="6"
            />
          </label>

        </div>

        <button
          className="primary"
          type="submit"
        >
          Register
        </button>

        <button
          className="link-button"
          type="button"
          onClick={() => navigate("/login")}
        >
          Already registered? Login
        </button>

      </form>

    </div>
  );
}