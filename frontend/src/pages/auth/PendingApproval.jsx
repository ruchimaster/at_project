import {
  useLocation,
  useNavigate,
} from "react-router-dom";

export default function PendingApproval() {

  const { state } = useLocation();

  const navigate = useNavigate();

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="pending-icon">
          ⏳
        </div>

        <h1>
          Pending Approval
        </h1>

        <p>
          {state?.message ||
            "Your NGO account is waiting for administrator approval."}
        </p>

        <p>
          You can login after an administrator
          approves your NGO account.
        </p>

        <button
          className="primary"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>

      </div>

    </div>
  );
}