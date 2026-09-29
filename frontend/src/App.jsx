import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Authentication
import Login from "./pages/auth/login";
import Register from "./pages/auth/Register";
import PendingApproval from "./pages/auth/PendingApproval";

// Donor
import Dashboard from "./pages/donor/Dashboard";
import DonationForm from "./pages/donor/DonationForm";
import PastDonations from "./pages/donor/PastDonations";
import PickupRequests from "./pages/donor/PickupRequests";
import Notifications from "./pages/donor/Notifications";

// Common
import Complaint from "./pages/Complaint";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================== AUTH ==================== */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/pending-approval"
          element={<PendingApproval />}
        />


        {/* ==================== DONOR ==================== */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["Donor"]}>
              <Layout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/donor/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/donor/donation-form"
            element={<DonationForm />}
          />

          <Route
            path="/donor/past-donations"
            element={<PastDonations />}
          />

          <Route
            path="/donor/pickup-requests"
            element={<PickupRequests />}
          />

          <Route
            path="/donor/notifications"
            element={<Notifications />}
          />

          <Route
            path="/donor/complaint"
            element={<Complaint />}
          />

          <Route
            path="/donor/profile"
            element={<Profile />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;