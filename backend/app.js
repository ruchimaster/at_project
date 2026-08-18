
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test API
app.get("/api/test", (req, res) => {
  res.json({
    message: "Food Waste Reduction API is working",
  });
});

// Import Routes
const userRoutes = require("./routes/userRoutes");
const donationRoutes = require("./routes/donationRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const pickupRequestRoutes = require("./routes/pickupRequestRoutes");
const warningRoutes = require("./routes/warningRoutes");

// Route Mounting
app.use("/api/users", userRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/pickup-requests", pickupRequestRoutes);
app.use("/api/warnings", warningRoutes);

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

