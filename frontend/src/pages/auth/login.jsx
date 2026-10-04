import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { ErrorBox } from "../../components/UI";
import AuthHeader from "../../components/AuthHeader";
import AuthFooter from "../../components/AuthFooter";
import { getErrorMessage } from "../../utils/format";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function change(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function submit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(form.email, form.password);

      navigate(`/${user.role.toLowerCase()}/dashboard`, {
        replace: true,
      });
    } catch (err) {
      if (
        err.response?.status === 403 &&
        /pending/i.test(err.response?.data?.message || "")
      ) {
        navigate("/pending-approval", {
          state: {
            message: err.response.data.message,
          },
        });

        return;
      }

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <AuthHeader />

      <main className="auth-main">
        <section className="auth-visual auth-login-visual">
          <div className="auth-visual-image" />

          <div className="auth-visual-overlay" />

          <div className="auth-visual-content">
            <span className="auth-eyebrow">WELCOME BACK</span>

            <h1>
              Continue making
              <span> food count.</span>
            </h1>

            <p>
              Sign in to manage your donations, requests, pickups, and
              FoodRescue activity.
            </p>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-container login-form-container">
            <div className="auth-heading">
              <span className="auth-card-label">ACCOUNT ACCESS</span>

              <h2>Sign in</h2>

              <p>Enter your email and password to access your account.</p>
            </div>

            <ErrorBox message={error} />

            {location.state?.registered && (
              <div className="auth-info-message">
                Your account was created successfully. Please sign in to
                continue.
              </div>
            )}

            <form className="auth-form login-form" onSubmit={submit}>
              <label className="auth-field">
                <span>Email address</span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={change}
                  placeholder="you@organization.com"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </label>

              <label className="auth-field">
                <span>Password</span>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={change}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </label>

              <button
                className="auth-primary-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
                <span>→</span>
              </button>
            </form>

            <div className="auth-switch">
              <span>Don't have an account?</span>

              <Link to="/register">Create an account</Link>
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
