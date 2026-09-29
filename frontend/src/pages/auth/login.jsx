import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  ErrorBox,
} from "../../components/UI";

import {
  getErrorMessage,
} from "../../utils/format";

export default function Login() {

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const { login } = useAuth();

  const navigate = useNavigate();

  async function submit(e) {

    e.preventDefault();

    setError("");

    try {

      const user = await login(
        form.email,
        form.password
      );

      navigate(
        `/${user.role.toLowerCase()}/dashboard`,
        {
          replace: true,
        }
      );

    } catch (err) {

      // ================================
      // PENDING NGO
      // ================================

      if (
        err.response?.status === 403 &&
        /pending/i.test(
          err.response?.data?.message || ""
        )
      ) {

        navigate("/pending-approval", {
          state: {
            message:
              err.response.data.message,
          },
        });

        return;
      }

      setError(
        getErrorMessage(err)
      );
    }
  }

  return (
    <div className="auth-page">

      <form
        className="auth-card"
        onSubmit={submit}
      >

        <h1>FoodRescue Login</h1>

        <p>
          Login to continue.
        </p>

        <ErrorBox message={error} />

        <label>
          Email

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
          />
        </label>

        <label>
          Password

          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            required
          />
        </label>

        <button
          className="primary"
          type="submit"
        >
          Login
        </button>

        <button
          className="link-button"
          type="button"
          onClick={() =>
            navigate("/register")
          }
        >
          New here? Register
        </button>

      </form>

    </div>
  );
}