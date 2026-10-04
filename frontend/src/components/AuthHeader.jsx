import { Link, NavLink } from "react-router-dom";

export default function AuthHeader() {
  return (
    <header className="auth-header">
      <div className="auth-header-inner">
        <Link to="/" className="auth-header-brand">
          <span className="auth-header-mark">FR</span>

          <span className="auth-header-brand-text">
            <strong>FoodRescue</strong>
            <small>Give good food a second chance.</small>
          </span>
        </Link>

        <nav className="auth-header-nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "auth-nav-link active" : "auth-nav-link"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive ? "auth-nav-link active" : "auth-nav-link"
            }
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            className={({ isActive }) =>
              isActive
                ? "auth-nav-link auth-nav-register active"
                : "auth-nav-link auth-nav-register"
            }
          >
            Create account
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
