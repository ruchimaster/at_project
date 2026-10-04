import { useEffect, useMemo, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

import "./Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      setUsers(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(user, action) {
    const actionText = action === "suspend" ? "suspend" : "reactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${user.organization_name || "this user"}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setUpdatingId(`${user.user_id}-${action}`);

      await api.put(`/users/admin/users/${user.user_id}/${action}`);

      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId("");
    }
  }

  const filteredUsers = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !searchText ||
        (user.organization_name || "").toLowerCase().includes(searchText) ||
        (user.email || "").toLowerCase().includes(searchText) ||
        (user.user_id || "").toLowerCase().includes(searchText) ||
        (user.organization_type || "").toLowerCase().includes(searchText);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || user.account_status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const roleCounts = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((user) => user.role === "Admin").length,
      donors: users.filter((user) => user.role === "Donor").length,
      ngos: users.filter((user) => user.role === "NGO").length,
      suspended: users.filter((user) => user.account_status === "Suspended")
        .length,
    };
  }, [users]);

  function getRoleClass(role) {
    if (role === "Admin") return "admin-users-role-admin";
    if (role === "Donor") return "admin-users-role-donor";
    if (role === "NGO") return "admin-users-role-ngo";

    return "admin-users-role-default";
  }

  function getStatusClass(status) {
    if (status === "Active") {
      return "admin-users-status-active";
    }

    if (status === "Suspended") {
      return "admin-users-status-suspended";
    }

    return "admin-users-status-default";
  }

  function getInitials(name) {
    if (!name) return "U";

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <div>
          <div className="admin-users-eyebrow">USER MANAGEMENT</div>

          <PageTitle
            title="All Users"
            subtitle="Monitor registered organizations, roles and account access across FoodRescue."
          />
        </div>

        <div className="admin-users-total">
          <span>Total Users</span>
          <strong>{loading ? "..." : roleCounts.total}</strong>
        </div>
      </div>

      <ErrorBox message={error} />

      {!loading && (
        <>
          {/* =====================================================
              SUMMARY
              ===================================================== */}

          <section className="admin-users-summary">
            <div className="admin-users-summary-card admin-summary-all">
              <div className="admin-summary-icon">◉</div>

              <div>
                <span>ALL USERS</span>
                <strong>{roleCounts.total}</strong>
              </div>
            </div>

            <div className="admin-users-summary-card admin-summary-donor">
              <div className="admin-summary-icon">D</div>

              <div>
                <span>DONORS</span>
                <strong>{roleCounts.donors}</strong>
              </div>
            </div>

            <div className="admin-users-summary-card admin-summary-ngo">
              <div className="admin-summary-icon">N</div>

              <div>
                <span>NGOs</span>
                <strong>{roleCounts.ngos}</strong>
              </div>
            </div>

            <div className="admin-users-summary-card admin-summary-admin">
              <div className="admin-summary-icon">A</div>

              <div>
                <span>ADMINS</span>
                <strong>{roleCounts.admins}</strong>
              </div>
            </div>

            <div className="admin-users-summary-card admin-summary-suspended">
              <div className="admin-summary-icon">!</div>

              <div>
                <span>SUSPENDED</span>
                <strong>{roleCounts.suspended}</strong>
              </div>
            </div>
          </section>

          {/* =====================================================
              FILTER BAR
              ===================================================== */}

          <section className="admin-users-toolbar">
            <div className="admin-users-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search by organization, email, ID or type..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="admin-users-filter">
              <label htmlFor="admin-user-role">Role</label>

              <select
                id="admin-user-role"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Donor">Donor</option>
                <option value="NGO">NGO</option>
              </select>
            </div>

            <div className="admin-users-filter">
              <label htmlFor="admin-user-status">Status</label>

              <select
                id="admin-user-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </section>

          <div className="admin-users-results">
            Showing <strong>{filteredUsers.length}</strong> of{" "}
            <strong>{users.length}</strong> users
          </div>
        </>
      )}

      {/* =====================================================
          CONTENT
          ===================================================== */}

      {loading ? (
        <div className="admin-users-loading">
          <div className="admin-users-spinner"></div>

          <strong>Loading users...</strong>

          <p>Fetching the latest FoodRescue user accounts.</p>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-users-empty">
          <div className="admin-users-empty-icon">◉</div>

          <Empty text="No users found." />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-users-no-results">
          <div className="admin-users-no-results-icon">⌕</div>

          <h3>No matching users</h3>

          <p>Try changing your search or filter criteria.</p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setRoleFilter("All");
              setStatusFilter("All");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="admin-users-table-wrap">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>USER / ORGANIZATION</th>
                <th>TYPE</th>
                <th>ROLE</th>
                <th>EMAIL</th>
                <th>ACCOUNT STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const suspendKey = `${user.user_id}-suspend`;

                const reactivateKey = `${user.user_id}-reactivate`;

                const isSuspending = updatingId === suspendKey;

                const isReactivating = updatingId === reactivateKey;

                return (
                  <tr key={user.user_id} className="admin-user-row">
                    <td>
                      <div className="admin-user-identity">
                        <div className="admin-user-avatar">
                          {getInitials(user.organization_name)}
                        </div>

                        <div className="admin-user-main">
                          <strong>
                            {user.organization_name || "Unnamed Organization"}
                          </strong>

                          <span>{user.user_id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="admin-user-type">
                        {user.organization_type || "Not specified"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={"admin-user-role " + getRoleClass(user.role)}
                      >
                        {user.role || "Unknown"}
                      </span>
                    </td>

                    <td>
                      <span className="admin-user-email">
                        {user.email || "-"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          "admin-user-status " +
                          getStatusClass(user.account_status)
                        }
                      >
                        <span className="admin-user-status-dot"></span>

                        {user.account_status || "Unknown"}
                      </span>
                    </td>

                    <td>
                      {user.role === "Admin" ? (
                        <span className="admin-protected-label">Protected</span>
                      ) : user.account_status !== "Suspended" ? (
                        <button
                          type="button"
                          className="admin-suspend-button"
                          onClick={() => changeStatus(user, "suspend")}
                          disabled={updatingId !== ""}
                        >
                          {isSuspending ? (
                            <>
                              <span className="admin-button-spinner"></span>
                              Suspending...
                            </>
                          ) : (
                            <>
                              Suspend
                              <span>!</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-reactivate-button"
                          onClick={() => changeStatus(user, "reactivate")}
                          disabled={updatingId !== ""}
                        >
                          {isReactivating ? (
                            <>
                              <span className="admin-button-spinner admin-spinner-dark"></span>
                              Reactivating...
                            </>
                          ) : (
                            <>
                              Reactivate
                              <span>✓</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
