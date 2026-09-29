import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const menus = {
  Donor: [
    ["Dashboard", "/donor/dashboard"],
    ["Past Donations", "/donor/past-donations"],
    ["Pickup Requests", "/donor/pickup-requests"],
    ["Ongoing Pickup Request", "/donor/ongoing-pickup"],
    ["Notifications", "/donor/notifications"],
    ["Complaint", "/donor/complaint"],
  ],

  NGO: [
    ["Dashboard", "/ngo/dashboard"],
    ["Request Donation", "/ngo/request-donation"],
    ["Current Pickup Request", "/ngo/current-pickups"],
    ["Completed Pickup Request", "/ngo/completed-pickups"],
    ["Notifications", "/ngo/notifications"],
    ["Complaint", "/ngo/complaint"],
  ],

  Admin: [
    ["Dashboard", "/admin/dashboard"],
    ["All Users", "/admin/users"],
    ["Pending NGOs", "/admin/pending-ngos"],
    ["All Donations", "/admin/donations"],
    ["All Pickup Requests", "/admin/pickups"],
    ["Complaints", "/admin/complaints"],
    ["Warnings", "/admin/warnings"],
    ["Send Notification", "/admin/send-notification"],
    ["Notifications", "/admin/notifications"],
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const menu = menus[user.role] || [];

  const profilePath =
    `/${user.role.toLowerCase()}/profile`;

  function handleLogout() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <div className="app-shell">

      {/* LEFT SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">
          FoodRescue
        </div>

        <nav>
          {menu.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                isActive
                  ? "nav-item active"
                  : "nav-item"
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          className="logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>

      {/* RIGHT SIDE */}

      <div className="main-area">

        <header className="topbar">

          <div>
            <strong>
              {user.organization_name}
            </strong>

            <span className="role-text">
              {user.role}
            </span>
          </div>

          <button
            className="profile-button"
            onClick={() => navigate(profilePath)}
          >
            👤
          </button>

        </header>

        <main className="content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}