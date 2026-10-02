import { useEffect, useState } from "react";

import api from "../../api/api";

import { ErrorBox, PageTitle, SuccessBox } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

export default function SendNotification() {
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    user_id: "",
    message: "",
    type: "Admin",
  });

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  useEffect(() => {
    api
      .get("/users")

      .then((response) => {
        setUsers(response.data.filter((user) => user.role !== "Admin"));
      })

      .catch((err) => {
        setError(getErrorMessage(err));
      });
  }, []);

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
      await api.post("/notifications", form);

      setSuccess("Notification sent successfully.");

      setForm({
        user_id: "",
        message: "",
        type: "Admin",
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageTitle title="Send Manual Notification" />

      <div className="panel">
        <ErrorBox message={error} />

        <SuccessBox message={success} />

        <form onSubmit={submit}>
          <label>
            Recipient
            <select
              name="user_id"
              value={form.user_id}
              onChange={change}
              required
            >
              <option value="">Select organization</option>

              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.organization_name} ({user.role})
                </option>
              ))}
            </select>
          </label>

          <label>
            Type
            <select name="type" value={form.type} onChange={change}>
              <option>Admin</option>

              <option>Account</option>

              <option>Complaint</option>

              <option>Warning</option>

              <option>Pickup Request</option>
            </select>
          </label>

          <label>
            Message
            <textarea
              name="message"
              value={form.message}
              onChange={change}
              required
            />
          </label>

          <button className="primary" type="submit">
            Send Notification
          </button>
        </form>
      </div>
    </>
  );
}
