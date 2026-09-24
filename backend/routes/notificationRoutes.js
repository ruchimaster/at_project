const express = require("express");

const router = express.Router();

const {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  updateNotificationStatus
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("Admin"), createNotification);

router.get("/", protect, getAllNotifications);

router.get("/:notification_id", protect, getNotificationById);

router.put(
  "/:notification_id",
  protect,
  authorizeRoles("Admin"),
  updateNotification
);

router.delete(
  "/:notification_id",
  protect,
  authorizeRoles("Admin"),
  deleteNotification
);

router.patch(
  "/:notification_id/status",
  protect,
  updateNotificationStatus
);

module.exports = router;
