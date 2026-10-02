import { useEffect, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

export default function Users() {
  const [users, setUsers] = useState([]);

  const [error, setError] = useState("");

  async function load() {
    try {
      const response = await api.get("/users");

      setUsers(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(user, action) {
    try {
      await api.put(`/users/admin/users/${user.user_id}/${action}`);

      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageTitle title="All Users" />

      <ErrorBox message={error} />

      {users.length === 0 ? (
        <Empty text="No users found." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Type</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.organization_name}</td>

                  <td>{user.organization_type}</td>

                  <td>{user.role}</td>

                  <td>{user.email}</td>

                  <td>{user.account_status}</td>

                  <td>
                    {user.role !== "Admin" &&
                      user.account_status !== "Suspended" && (
                        <button onClick={() => changeStatus(user, "suspend")}>
                          Suspend
                        </button>
                      )}

                    {user.role !== "Admin" &&
                      user.account_status === "Suspended" && (
                        <button
                          onClick={() => changeStatus(user, "reactivate")}
                        >
                          Reactivate
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
