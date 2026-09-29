import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";

import {
  ErrorBox,
  PageTitle,
  SuccessBox,
} from "../components/UI";

import {
  getErrorMessage,
} from "../utils/format";

export default function Profile() {

  const {
    user,
    refreshProfile,
    updateProfile,
  } = useAuth();

  const [form, setForm] = useState({
    organization_name: "",
    organization_type: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const [editing, setEditing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {

    refreshProfile()
      .then((u) => {

        setForm({
          organization_name:
            u.organization_name || "",

          organization_type:
            u.organization_type || "",

          contact_person:
            u.contact_person || "",

          email:
            u.email || "",

          phone:
            u.phone || "",

          address:
            u.address || "",

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

      await updateProfile(payload);

      setSuccess(
        "Profile updated successfully."
      );

      setEditing(false);

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    }
  }

  return (
    <>
      <PageTitle
        title="My Profile"
        subtitle="View and edit your organization details."
      />

      <div className="panel">

        <ErrorBox message={error} />

        <SuccessBox message={success} />

        <form onSubmit={save}>

          <div className="form-grid">

            <label>
              Organization Name

              <input
                name="organization_name"
                disabled={!editing}
                value={form.organization_name}
                onChange={change}
              />
            </label>

            <label>
              Organization Type

              <input
                name="organization_type"
                disabled={!editing}
                value={form.organization_type}
                onChange={change}
              />
            </label>

            <label>
              Contact Person

              <input
                name="contact_person"
                disabled={!editing}
                value={form.contact_person}
                onChange={change}
              />
            </label>

            <label>
              Email

              <input
                type="email"
                name="email"
                disabled={!editing}
                value={form.email}
                onChange={change}
              />
            </label>

            <label>
              Phone

              <input
                name="phone"
                disabled={!editing}
                value={form.phone}
                onChange={change}
              />
            </label>

            <label>
              Role

              <input
                value={user?.role || ""}
                disabled
              />
            </label>

            <label className="full">
              Address

              <textarea
                name="address"
                disabled={!editing}
                value={form.address}
                onChange={change}
              />
            </label>

            {editing && (
              <label>
                New Password

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

          </div>

          {editing ? (

            <div className="button-row">

              <button
                className="primary"
                type="submit"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>

            </div>

          ) : (

            <button
              className="primary"
              type="button"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>

          )}

        </form>

      </div>
    </>
  );
}