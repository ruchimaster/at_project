import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import { ErrorBox, PageTitle, SuccessBox } from "../components/UI";

import { getErrorMessage } from "../utils/format";

export default function Profile() {
  const { user, refreshProfile, updateProfile } = useAuth();

  const [form, setForm] = useState({
    organization_name: "",
    organization_type: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refreshProfile()
      .then((u) => {
        setForm({
          organization_name: u.organization_name || "",

          organization_type: u.organization_type || "",

          contact_person: u.contact_person || "",

          email: u.email || "",

          phone: u.phone || "",

          address: u.address || "",

          password: "",
        });
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

  async function save(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const payload = {
      ...form,
    };

    if (!payload.password) {
      delete payload.password;
    }

    try {
      setSaving(true);

      await updateProfile(payload);

      setSuccess("Profile updated successfully.");

      setForm((current) => ({
        ...current,
        password: "",
      }));

      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditing(false);
    setError("");
    setSuccess("");
  }

  return (
    <div className="profile-page">
      <PageTitle
        title="My Profile"
        subtitle="View and manage your organization details."
      />

      <section className="profile-card">
        <div className="profile-card-header">
          <div>
            <span className="profile-eyebrow">ACCOUNT INFORMATION</span>

            <h2>Organization Profile</h2>

            <p>Keep your contact and organization information up to date.</p>
          </div>

          {!editing && (
            <button
              className="profile-edit-button"
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setEditing(true);
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        <ErrorBox message={error} />

        <SuccessBox message={success} />

        <form className="profile-form" onSubmit={save}>
          <div className="profile-section-title">Organization Details</div>

          <div className="profile-form-grid">
            <label>
              <span>Organization Name</span>

              <input
                name="organization_name"
                disabled={!editing}
                value={form.organization_name}
                onChange={change}
              />
            </label>

            <label>
              <span>Organization Type</span>

              <input
                name="organization_type"
                disabled={!editing}
                value={form.organization_type}
                onChange={change}
              />
            </label>

            <label>
              <span>Contact Person</span>

              <input
                name="contact_person"
                disabled={!editing}
                value={form.contact_person}
                onChange={change}
              />
            </label>

            <label>
              <span>Phone</span>

              <input
                name="phone"
                disabled={!editing}
                value={form.phone}
                onChange={change}
              />
            </label>
          </div>

          <div className="profile-section-title profile-account-title">
            Account Details
          </div>

          <div className="profile-form-grid">
            <label>
              <span>Email</span>

              <input
                type="email"
                name="email"
                disabled={!editing}
                value={form.email}
                onChange={change}
              />
            </label>

            <label>
              <span>Role</span>

              <input value={user?.role || ""} disabled />
            </label>

            {editing && (
              <label>
                <span>New Password</span>

                <input
                  name="password"
                  type="password"
                  minLength="6"
                  value={form.password}
                  onChange={change}
                  placeholder="Leave blank to keep current"
                />
              </label>
            )}

            <label className="profile-full">
              <span>Address</span>

              <textarea
                name="address"
                disabled={!editing}
                value={form.address}
                onChange={change}
                rows="4"
              />
            </label>
          </div>

          {editing && (
            <div className="profile-form-footer">
              <span>Changes will be saved to your account.</span>

              <div className="profile-button-row">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="primary profile-save-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
