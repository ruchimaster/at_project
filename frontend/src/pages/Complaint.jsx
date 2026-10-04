import { useState } from "react";

import api from "../api/api";

import { ErrorBox, PageTitle, SuccessBox } from "../components/UI";

import { getErrorMessage } from "../utils/format";

export default function Complaint() {
  const [form, setForm] = useState({
    complaint_type: "",
    description: "",
  });

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [submitting, setSubmitting] = useState(false);

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
      setSubmitting(true);

      await api.post("/complaints", form);

      setSuccess("Complaint submitted successfully.");

      setForm({
        complaint_type: "",
        description: "",
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="complaint-page">
      <PageTitle
        title="Submit Complaint"
        subtitle="Report an issue related to your FoodRescue activity."
      />

      <section className="complaint-form-card">
        <div className="complaint-form-header">
          <span className="complaint-eyebrow">REPORT AN ISSUE</span>

          <h2>Complaint Details</h2>

          <p>
            Please provide clear details about the issue so it can be reviewed
            properly.
          </p>
        </div>

        <ErrorBox message={error} />

        <SuccessBox message={success} />

        <form className="complaint-form" onSubmit={submit}>
          <label>
            <span>Complaint Type</span>

            <input
              name="complaint_type"
              value={form.complaint_type}
              onChange={change}
              placeholder="e.g. Pickup issue"
              required
            />
          </label>

          <label>
            <span>Description</span>

            <textarea
              name="description"
              value={form.description}
              onChange={change}
              placeholder="Describe the issue in detail..."
              rows="7"
              required
            />
          </label>

          <div className="complaint-form-footer">
            <span>Please provide accurate information.</span>

            <button
              className="primary complaint-submit-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
