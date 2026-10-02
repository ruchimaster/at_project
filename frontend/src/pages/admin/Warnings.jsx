import { useEffect, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle, SuccessBox } from "../../components/UI";

import { formatDate, getErrorMessage } from "../../utils/format";

export default function Warnings() {
  const [warnings, setWarnings] = useState([]);

  const [users, setUsers] = useState([]);

  const [complaints, setComplaints] = useState([]);

  const [form, setForm] = useState({
    user_id: "",
    complaint_id: "",
    action_taken: "Warning Issued",
  });

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  async function load() {
    try {
      const [warningResponse, userResponse, complaintResponse] =
        await Promise.all([
          api.get("/warnings"),
          api.get("/users"),
          api.get("/complaints"),
        ]);

      setWarnings(warningResponse.data);

      setUsers(userResponse.data);

      setComplaints(complaintResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function organizationName(userId) {
    return (
      users.find((user) => user.user_id === userId)?.organization_name ||
      "Unknown Organization"
    );
  }

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
      await api.post("/warnings", form);

      setSuccess("Warning created and notification sent.");

      setForm({
        user_id: "",
        complaint_id: "",
        action_taken: "Warning Issued",
      });

      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageTitle title="Warnings" />

      <div className="panel">
        <h3>Create Warning</h3>

        <ErrorBox message={error} />

        <SuccessBox message={success} />

        <form onSubmit={submit}>
          <div className="form-grid">
            <label>
              User
              <select
                name="user_id"
                value={form.user_id}
                onChange={change}
                required
              >
                <option value="">Select organization</option>

                {users
                  .filter((user) => user.role !== "Admin")
                  .map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.organization_name} ({user.role})
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Complaint
              <select
                name="complaint_id"
                value={form.complaint_id}
                onChange={change}
                required
              >
                <option value="">Select complaint</option>

                {complaints.map((complaint) => (
                  <option
                    key={complaint.complaint_id}
                    value={complaint.complaint_id}
                  >
                    {organizationName(complaint.user_id)}

                    {" — "}

                    {complaint.complaint_type}
                  </option>
                ))}
              </select>
            </label>

            <label className="full">
              Action Taken
              <input
                name="action_taken"
                value={form.action_taken}
                onChange={change}
              />
            </label>
          </div>

          <button className="primary" type="submit">
            Create Warning
          </button>
        </form>
      </div>

      <div className="panel">
        <h3>Existing Warnings</h3>

        {warnings.length === 0 ? (
          <Empty text="No warnings found." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Complaint</th>
                  <th>Action</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {warnings.map((warning) => {
                  const complaint = complaints.find(
                    (item) => item.complaint_id === warning.complaint_id,
                  );

                  return (
                    <tr key={warning.warning_id}>
                      <td>{organizationName(warning.user_id)}</td>

                      <td>{complaint ? complaint.complaint_type : "-"}</td>

                      <td>{warning.action_taken}</td>

                      <td>{formatDate(warning.warning_date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
