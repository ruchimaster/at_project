import { Link, useLocation, useNavigate } from "react-router-dom";

export default function PendingApproval() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const message =
    state?.message || "Your NGO account is waiting for administrator approval.";

  return (
    <div className="auth-page pending-page">
      <div className="auth-background-shape shape-one" />
      <div className="auth-background-shape shape-two" />

      <div className="pending-shell">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-mark">FR</span>

          <span>
            <strong>FoodRescue</strong>
            <small>Give good food a second chance.</small>
          </span>
        </Link>

        <main className="pending-card">
          <div className="pending-top">
            <span className="auth-card-label">ACCOUNT REVIEW</span>

            <div className="pending-badge">
              <span />
              Pending
            </div>
          </div>

          <div className="pending-icon-wrapper">
            <div className="pending-icon-ring">
              <div className="pending-icon">⌛</div>
            </div>
          </div>

          <span className="pending-eyebrow">NGO REGISTRATION RECEIVED</span>

          <h1>Almost there.</h1>

          <p className="pending-main-text">
            Your registration has been received successfully. An administrator
            needs to review and approve your NGO account before you can access
            the FoodRescue platform.
          </p>

          <div className="pending-status">
            <div className="pending-status-line">
              <span className="status-check">✓</span>

              <div>
                <strong>Registration submitted</strong>
                <small>Your account details were received.</small>
              </div>
            </div>

            <div className="pending-status-line active">
              <span className="status-number">02</span>

              <div>
                <strong>Administrator review</strong>
                <small>
                  Your NGO account is currently waiting for approval.
                </small>
              </div>
            </div>

            <div className="pending-status-line">
              <span className="status-number muted">03</span>

              <div>
                <strong>Access FoodRescue</strong>
                <small>Login becomes available after approval.</small>
              </div>
            </div>
          </div>

          <div className="pending-message">
            <span className="pending-message-icon">i</span>

            <p>{message}</p>
          </div>

          <div className="pending-actions">
            <button
              className="auth-submit-button"
              onClick={() => navigate("/login")}
            >
              <span>Back to login</span>
              <span className="submit-arrow">→</span>
            </button>

            <Link to="/" className="back-home-link">
              ← Return to FoodRescue home
            </Link>
          </div>
        </main>

        <p className="pending-footer">
          FoodRescue · Connecting surplus food with meaningful need.
        </p>
      </div>
    </div>
  );
}
