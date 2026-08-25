const express = require("express");

const router = express.Router();

const {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("Admin"), createNotification);

router.get("/", protect, getAllNotifications);

router.get("/:notification_id", protect, getNotificationById);

router.put("/:notification_id", protect, updateNotification);

router.delete("/:notification_id", protect, deleteNotification);

module.exports = router;
