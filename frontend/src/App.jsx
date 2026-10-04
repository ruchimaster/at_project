import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// AUTH
import Login from "./pages/auth/login";
import Register from "./pages/auth/Register";
import PendingApproval from "./pages/auth/PendingApproval";

// DONOR
import DonorDashboard from "./pages/donor/Dashboard";
import DonationForm from "./pages/donor/DonationForm";
import PastDonations from "./pages/donor/PastDonations";
import DonorPickupRequests from "./pages/donor/PickupRequests";
import DonorNotifications from "./pages/donor/Notifications";

// NGO
import NgoDashboard from "./pages/ngo/Dashboard";
import NgoPickups from "./pages/ngo/Pickups";
import NgoNotifications from "./pages/ngo/Notifications";
import NgoRequestDonation from "./pages/ngo/RequestDonation";
import NgoComplaints from "./pages/ngo/Complaints";
import PickupMap from "./pages/ngo/PickupMap";

// ADMIN
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import PendingNGOs from "./pages/admin/PendingNGOs.jsx";
import AdminDonations from "./pages/admin/Donations.jsx";
import AdminPickups from "./pages/admin/Pickups.jsx";
import AdminComplaints from "./pages/admin/Complaints.jsx";
import AdminWarnings from "./pages/admin/Warnings.jsx";
import AdminSendNotification from "./pages/admin/SendNotification.jsx";
import AdminNotifications from "./pages/admin/Notifications.jsx";

// COMMON
import Complaint from "./pages/Complaint";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      {/* AUTH */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pending-approval" element={<PendingApproval />} />

      {/* DONOR */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["Donor"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/donor/dashboard" element={<DonorDashboard />} />

        {/* Create Donation */}
        <Route path="/donor/donation-form" element={<DonationForm />} />

        {/* Edit Donation */}
        <Route
          path="/donor/donations/:donation_id/edit"
          element={<DonationForm />}
        />

        <Route path="/donor/past-donations" element={<PastDonations />} />

        <Route
          path="/donor/pickup-requests"
          element={<DonorPickupRequests />}
        />

        <Route
          path="/donor/ongoing-pickup"
          element={<DonorPickupRequests ongoing />}
        />

        <Route path="/donor/notifications" element={<DonorNotifications />} />

        <Route path="/donor/complaint" element={<Complaint />} />

        <Route path="/donor/profile" element={<Profile />} />
      </Route>

      {/* NGO */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["NGO"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/ngo/dashboard" element={<NgoDashboard />} />

        <Route path="/ngo/request-donation" element={<NgoRequestDonation />} />

        <Route path="/ngo/current-pickups" element={<NgoPickups />} />

        <Route
          path="/ngo/completed-pickups"
          element={<NgoPickups completed />}
        />

        <Route path="/ngo/pickup-map/:request_id" element={<PickupMap />} />

        <Route path="/ngo/notifications" element={<NgoNotifications />} />

        <Route path="/ngo/complaint" element={<NgoComplaints />} />

        <Route path="/ngo/profile" element={<Profile />} />
      </Route>

      {/* ADMIN */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/admin/users" element={<AdminUsers />} />

        <Route path="/admin/pending-ngos" element={<PendingNGOs />} />

        <Route path="/admin/donations" element={<AdminDonations />} />

        <Route path="/admin/pickups" element={<AdminPickups />} />

        <Route path="/admin/complaints" element={<AdminComplaints />} />

        <Route path="/admin/warnings" element={<AdminWarnings />} />

        <Route
          path="/admin/send-notification"
          element={<AdminSendNotification />}
        />

        <Route path="/admin/notifications" element={<AdminNotifications />} />

        <Route path="/admin/profile" element={<Profile />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
