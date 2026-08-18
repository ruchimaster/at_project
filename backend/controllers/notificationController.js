const Notification = require("../models/notifications");

// ==========================================
// CREATE NOTIFICATION
// ==========================================
const createNotification = async (req, res) => {
    try {
        const {
            user_id,
            message,
            type
        } = req.body;

        if (!user_id || !message || !type) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        // Generate readable Notification ID
        const lastNotification = await Notification.findOne().sort({
            notification_id: -1
        });

        let notification_id = "NOT001";

        if (lastNotification && lastNotification.notification_id) {
            const lastNumber = parseInt(
                lastNotification.notification_id.replace("NOT", "")
            );

            notification_id = `NOT${String(lastNumber + 1).padStart(3, "0")}`;
        }

        const notification = await Notification.create({
            notification_id,
            user_id,
            message,
            type
        });

        res.status(201).json({
            message: "Notification created successfully",
            notification
        });

    } catch (error) {
        console.error("Create notification error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// GET ALL NOTIFICATIONS
// ==========================================
const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find();

        res.status(200).json(notifications);

    } catch (error) {
        console.error("Get notifications error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// GET NOTIFICATION BY ID
// ==========================================
const getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            notification_id: req.params.notification_id
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.status(200).json(notification);

    } catch (error) {
        console.error("Get notification error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE NOTIFICATION
// ==========================================
const updateNotification = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            notification_id: req.params.notification_id
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        const {
            message,
            type,
            is_read
        } = req.body;

        if (message !== undefined) {
            notification.message = message;
        }

        if (type !== undefined) {
            notification.type = type;
        }

        if (is_read !== undefined) {
            notification.is_read = is_read;
        }

        await notification.save();

        res.status(200).json({
            message: "Notification updated successfully",
            notification
        });

    } catch (error) {
        console.error("Update notification error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// DELETE NOTIFICATION
// ==========================================
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            notification_id: req.params.notification_id
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.status(200).json({
            message: "Notification deleted successfully"
        });

    } catch (error) {
        console.error("Delete notification error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
    createNotification,
    getAllNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification
};