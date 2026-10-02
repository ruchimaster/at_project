import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// ==================== AUTH ====================

import Login from "./pages/auth/login";
import Register from "./pages/auth/Register";
import PendingApproval from "./pages/auth/PendingApproval";

// ==================== DONOR ====================

import Dashboard from "./pages/donor/Dashboard";
import DonationForm from "./pages/donor/DonationForm";
import PastDonations from "./pages/donor/PastDonations";
import PickupRequests from "./pages/donor/PickupRequests";
import Notifications from "./pages/donor/Notifications";

// ==================== ADMIN ====================

import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import PendingNGOs from "./pages/admin/PendingNGOs.jsx";
import AdminDonations from "./pages/admin/Donations.jsx";
import AdminPickups from "./pages/admin/Pickups.jsx";
import AdminComplaints from "./pages/admin/Complaints.jsx";
import AdminWarnings from "./pages/admin/Warnings.jsx";
import AdminSendNotification from "./pages/admin/SendNotification.jsx";
import AdminNotifications from "./pages/admin/Notifications.jsx";

// ==================== COMMON ====================

import Complaint from "./pages/Complaint";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      {/* =====================================================
          AUTHENTICATION
      ===================================================== */}

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/pending-approval" element={<PendingApproval />} />

      {/* =====================================================
          DONOR ROUTES
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["Donor"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/donor/dashboard" element={<Dashboard />} />

        <Route path="/donor/donation-form" element={<DonationForm />} />

        <Route path="/donor/past-donations" element={<PastDonations />} />

        <Route path="/donor/pickup-requests" element={<PickupRequests />} />

        <Route path="/donor/notifications" element={<Notifications />} />

        <Route path="/donor/complaint" element={<Complaint />} />

        <Route path="/donor/profile" element={<Profile />} />
      </Route>

      {/* =====================================================
          ADMIN ROUTES
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Admin Dashboard */}

        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* All Users */}

        <Route path="/admin/users" element={<AdminUsers />} />

        {/* Pending NGO Approval */}

        <Route path="/admin/pending-ngos" element={<PendingNGOs />} />

        {/* All Donations */}

        <Route path="/admin/donations" element={<AdminDonations />} />

        {/* All Pickup Requests */}

        <Route path="/admin/pickups" element={<AdminPickups />} />

        {/* Complaints */}

        <Route path="/admin/complaints" element={<AdminComplaints />} />

        {/* Warnings */}

        <Route path="/admin/warnings" element={<AdminWarnings />} />

        {/* Send Notification */}

        <Route
          path="/admin/send-notification"
          element={<AdminSendNotification />}
        />

        {/* Admin Notifications */}

        <Route path="/admin/notifications" element={<AdminNotifications />} />

        {/* Admin Profile */}

        <Route path="/admin/profile" element={<Profile />} />
      </Route>

      {/* =====================================================
          INVALID / UNKNOWN URL
      ===================================================== */}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
