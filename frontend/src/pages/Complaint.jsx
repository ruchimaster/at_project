import { useState } from "react";

import api from "../api/api";

import {
  ErrorBox,
  PageTitle,
  SuccessBox,
} from "../components/UI";

import {
  getErrorMessage,
} from "../utils/format";

export default function Complaint() {

  const [form, setForm] = useState({
    complaint_type: "",
    description: "",
  });

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

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

      await api.post(
        "/complaints",
        form
      );

      setSuccess(
        "Complaint submitted successfully."
      );

      setForm({
        complaint_type: "",
        description: "",
      });

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    }
  }

  return (
    <>
      <PageTitle
        title="Submit Complaint"
      />

      <div className="panel">

        <ErrorBox message={error} />

        <SuccessBox message={success} />

        <form onSubmit={submit}>

          <label>
            Complaint Type

            <input
              name="complaint_type"
              value={form.complaint_type}
              onChange={change}
              required
            />
          </label>

          <label>
            Description

            <textarea
              name="description"
              value={form.description}
              onChange={change}
              required
            />
          </label>

          <button
            className="primary"
            type="submit"
          >
            Submit Complaint
          </button>

        </form>

      </div>
    </>
  );
}