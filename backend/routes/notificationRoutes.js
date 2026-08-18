const express = require("express");

const {
    createNotification,
    getAllNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification
} = require("../controllers/notificationController");

const router = express.Router();

// Create notification
router.post("/", createNotification);

// Get all notifications
router.get("/", getAllNotifications);

// Get notification by ID
router.get("/:notification_id", getNotificationById);

// Update notification
router.put("/:notification_id", updateNotification);

// Delete notification
router.delete("/:notification_id", deleteNotification);

module.exports = router;
