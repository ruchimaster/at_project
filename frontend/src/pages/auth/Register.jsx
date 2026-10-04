import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { ErrorBox, SuccessBox } from "../../components/UI";
import AuthHeader from "../../components/AuthHeader";
import AuthFooter from "../../components/AuthFooter";
import { getErrorMessage } from "../../utils/format";

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
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  function change(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function submit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await register(form);

      if (form.role === "NGO") {
        setSuccess(
          "Registration submitted. Your NGO account is waiting for administrator approval.",
        );
      } else {
        setSuccess("Registration successful. You can now login.");
      }

      setForm(initialForm);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <AuthHeader />

      <main className="auth-main auth-register-main">
        <section className="auth-visual auth-register-visual">
          <div className="auth-visual-image" />

          <div className="auth-visual-overlay" />

          <div className="auth-visual-content">
            <span className="auth-eyebrow">JOIN FOODRESCUE</span>

            <h1>
              Turn surplus into
              <span> something useful.</span>
            </h1>

            <p>
              Create your account and start connecting surplus food with
              organizations that can put it to good use.
            </p>
          </div>
        </section>

        <section className="auth-form-panel auth-register-panel">
          <div className="auth-form-container register-form-container">
            <div className="auth-heading">
              <span className="auth-card-label">CREATE ACCOUNT</span>

              <h2>Join FoodRescue</h2>

              <p>Enter your organization and contact details to get started.</p>
            </div>

            <ErrorBox message={error} />
            <SuccessBox message={success} />

            <form className="auth-form" onSubmit={submit}>
              <div className="auth-form-row">
                <label className="auth-field">
                  <span>Organization name</span>

                  <input
                    type="text"
                    name="organization_name"
                    value={form.organization_name}
                    onChange={change}
                    placeholder="Organization name"
                    autoComplete="organization"
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Organization type</span>

                  <select
                    name="organization_type"
                    value={form.organization_type}
                    onChange={change}
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Caterer">Caterer</option>
                    <option value="NGO">NGO</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>

              <div className="auth-form-row">
                <label className="auth-field">
                  <span>Contact person</span>

                  <input
                    type="text"
                    name="contact_person"
                    value={form.contact_person}
                    onChange={change}
                    placeholder="Full name"
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Phone number</span>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={change}
                    placeholder="10-digit phone number"
                    inputMode="numeric"
                    maxLength="10"
                    autoComplete="tel"
                    required
                  />
                </label>
              </div>

              <label className="auth-field">
                <span>Email address</span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={change}
                  placeholder="you@organization.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="auth-field">
                <span>Organization address</span>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={change}
                  placeholder="Enter your organization address"
                  rows="3"
                  autoComplete="street-address"
                  required
                />
              </label>

              <div className="auth-form-row">
                <label className="auth-field">
                  <span>Password</span>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={change}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    minLength="6"
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Account role</span>

                  <select name="role" value={form.role} onChange={change}>
                    <option value="Donor">Donor</option>
                    <option value="NGO">NGO</option>
                  </select>
                </label>
              </div>

              <button
                className="auth-primary-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
                <span>→</span>
              </button>
            </form>

            <div className="auth-switch">
              <span>Already have an account?</span>

              <Link to="/login">Sign in</Link>
            </div>

            <Link to="/" className="auth-back-home">
              ← Back to FoodRescue
            </Link>
          </div>
        </section>
      </main>

      <AuthFooter />
    </div>
  );
}
