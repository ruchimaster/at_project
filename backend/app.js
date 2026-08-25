const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { startDonationExpiryJob } = require("./jobs/donationExpiry");
const { errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Food Waste Reduction API is working",
  });
});

const userRoutes = require("./routes/userRoutes");
const donationRoutes = require("./routes/donationRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const pickupRequestRoutes = require("./routes/pickupRequestRoutes");
const warningRoutes = require("./routes/warningRoutes");

app.use("/api/users", userRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/pickup-requests", pickupRequestRoutes);
app.use("/api/warnings", warningRoutes);

app.use(errorHandler);

startDonationExpiryJob();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
