const Notification = require("../models/notifications");
const User = require("../models/users");

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

        // Check whether target user exists
        const user = await User.findOne({
            user_id
        });

        if (!user) {
            return res.status(404).json({
                message: "Target user not found"
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
    let notifications;

    if (req.user.role === "Admin") {
      // Admin can see all notifications
      notifications = await Notification.find();
    } else {
      // Normal user can see only their own notifications
      notifications = await Notification.find({
        user_id: req.user.user_id,
      });
    }

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ==========================================
// GET NOTIFICATION BY ID
// ==========================================
const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      notification_id: req.params.notification_id,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // Admin can view any notification
    // Normal user can view only their own notification
    if (
      req.user.role !== "Admin" &&
      notification.user_id !== req.user.user_id
    ) {
      return res.status(403).json({
        message: "You are not authorized to view this notification",
      });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Get notification error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
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

        // Only Admin can update notifications
        if (req.user.role !== "Admin") {
            return res.status(403).json({
                message: "Only Admin can update notifications"
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
        const notification = await Notification.findOne({
            notification_id: req.params.notification_id
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        // Only Admin can delete notifications
        if (req.user.role !== "Admin") {
            return res.status(403).json({
                message: "Only Admin can delete notifications"
            });
        }

        await Notification.deleteOne({
            notification_id: req.params.notification_id
        });

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
// UPDATE NOTIFICATION STATUS
// ==========================================
const updateNotificationStatus = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            notification_id: req.params.notification_id
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        const { is_read } = req.body;

        if (typeof is_read !== "boolean") {
            return res.status(400).json({
                message: "is_read must be true or false"
            });
        }

        // Admin can update any notification
        if (req.user.role === "Admin") {
            notification.is_read = is_read;
        }

        // Normal user can update only their own notification
        else {
            if (notification.user_id !== req.user.user_id) {
                return res.status(403).json({
                    message: "You are not authorized to update this notification"
                });
            }

            notification.is_read = is_read;
        }

        await notification.save();

        res.status(200).json({
            message: "Notification status updated successfully",
            notification
        });

    } catch (error) {
        console.error("Update notification status error:", error);

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
    deleteNotification,
    updateNotificationStatus
};