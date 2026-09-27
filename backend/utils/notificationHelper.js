const Notification = require("../models/notifications");

const createNotification = async (user_id, message, type) => {
  // Generate readable Notification ID
  const lastNotification = await Notification.findOne().sort({
    notification_id: -1,
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
    type,
  });

  return notification;
};

module.exports = {
  createNotification,
};