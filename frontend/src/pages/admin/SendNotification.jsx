import { useEffect, useMemo, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle, SuccessBox } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

import "./SendNotification.css";

export default function SendNotification() {
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    user_id: "",
    message: "",
    type: "Admin",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [recipientSearch, setRecipientSearch] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users");

        setUsers(response.data.filter((user) => user.role !== "Admin"));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  function change(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  }

  const filteredUsers = useMemo(() => {
    const search = recipientSearch.trim().toLowerCase();

    if (!search) {
      return users;
    }

    return users.filter((user) => {
      const organization = user.organization_name?.toLowerCase() || "";

      const userId = user.user_id?.toLowerCase() || "";

      const role = user.role?.toLowerCase() || "";

      const email = user.email?.toLowerCase() || "";

      return (
        organization.includes(search) ||
        userId.includes(search) ||
        role.includes(search) ||
        email.includes(search)
      );
    });
  }, [users, recipientSearch]);

  const selectedUser = useMemo(() => {
    return users.find((user) => user.user_id === form.user_id);
  }, [users, form.user_id]);

  async function submit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSending(true);

    try {
      await api.post("/notifications", form);

      const recipientName = selectedUser?.organization_name || form.user_id;

      setSuccess(
        `${form.type} notification sent successfully to ${recipientName} (${form.user_id}).`,
      );

      setForm({
        user_id: "",
        message: "",
        type: "Admin",
      });

      setRecipientSearch("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  function clearForm() {
    setForm({
      user_id: "",
      message: "",
      type: "Admin",
    });

    setRecipientSearch("");
    setError("");
    setSuccess("");
  }

  return (
    <div className="send-notification-page">
      <PageTitle
        title="Send Manual Notification"
        description="Send an important message directly to a donor or NGO."
      />

      <ErrorBox message={error} />
      <SuccessBox message={success} />

      <section className="notification-form-card">
        <div className="notification-card-header">
          <div className="notification-icon">🔔</div>

          <div>
            <h2>Compose Notification</h2>

            <p>
              Create and send a notification to a registered FoodRescue user.
            </p>
          </div>
        </div>

        <form onSubmit={submit}>
          {/* RECIPIENT */}
          <div className="notification-field">
            <label htmlFor="recipient-search">Recipient</label>

            <div className="recipient-search-wrap">
              <span className="search-icon">⌕</span>

              <input
                id="recipient-search"
                type="text"
                placeholder="Search organization, user ID or email..."
                value={recipientSearch}
                onChange={(e) => setRecipientSearch(e.target.value)}
                disabled={loading || sending}
              />
            </div>

            <div className="recipient-select-wrap">
              {loading ? (
                <div className="field-loading">
                  <span className="mini-spinner"></span>
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <Empty text="No matching users found." />
              ) : (
                <select
                  name="user_id"
                  value={form.user_id}
                  onChange={change}
                  required
                  disabled={sending}
                >
                  <option value="">Select organization</option>

                  {filteredUsers.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.organization_name || "Unnamed Organization"} (
                      {user.role}) — {user.user_id}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedUser && (
              <div className="selected-recipient">
                <div className="recipient-avatar">
                  {(
                    selectedUser.organization_name ||
                    selectedUser.user_id ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {selectedUser.organization_name || "Unnamed Organization"}
                  </strong>

                  <span>
                    {selectedUser.user_id} • {selectedUser.role}
                  </span>
                </div>

                <span className="recipient-check">✓</span>
              </div>
            )}
          </div>

          {/* TYPE */}
          <div className="notification-field">
            <label htmlFor="notification-type">Notification Type</label>

            <select
              id="notification-type"
              name="type"
              value={form.type}
              onChange={change}
              disabled={sending}
            >
              <option>Admin</option>
              <option>Account</option>
              <option>Complaint</option>
              <option>Warning</option>
              <option>Pickup Request</option>
            </select>

            <div className="type-hint">
              <span
                className={`type-dot ${form.type
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              ></span>

              <span>
                {form.type === "Admin" &&
                  "General administrative communication."}

                {form.type === "Account" &&
                  "Account-related information or updates."}

                {form.type === "Complaint" &&
                  "Communication related to a complaint."}

                {form.type === "Warning" &&
                  "Important warning or policy communication."}

                {form.type === "Pickup Request" &&
                  "Information related to a pickup request."}
              </span>
            </div>
          </div>

          {/* MESSAGE */}
          <div className="notification-field">
            <div className="message-label-row">
              <label htmlFor="notification-message">Message</label>

              <span
                className={
                  form.message.length > 450
                    ? "character-count warning"
                    : "character-count"
                }
              >
                {form.message.length}/500
              </span>
            </div>

            <textarea
              id="notification-message"
              name="message"
              value={form.message}
              onChange={change}
              placeholder="Write the notification message..."
              maxLength={500}
              rows={8}
              required
              disabled={sending}
            />
          </div>

          {/* ACTIONS */}
          <div className="notification-actions">
            <button
              className="send-notification-button"
              type="submit"
              disabled={sending || loading}
            >
              {sending ? (
                <>
                  <span className="button-spinner"></span>
                  Sending...
                </>
              ) : (
                <>
                  <span>✈</span>
                  Send Notification
                </>
              )}
            </button>

            <button
              className="clear-notification-button"
              type="button"
              disabled={sending}
              onClick={clearForm}
            >
              Clear
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
