import { Link } from "react-router-dom";

export default function AuthFooter() {
  return (
    <footer className="auth-footer">
      <div className="auth-footer-inner">
        <div className="auth-footer-brand">
          <span className="auth-footer-mark">FR</span>

          <div>
            <strong>FoodRescue</strong>
            <p>Connecting surplus food with organizations that can use it.</p>
          </div>
        </div>

        <div className="auth-footer-links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>

        <p className="auth-footer-copy">
          © {new Date().getFullYear()} FoodRescue. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
