import { useEffect, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle } from "../../components/UI";

import { formatDate, getErrorMessage } from "../../utils/format";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState("");

  async function load() {
    try {
      setError("");

      const response = await api.get("/notifications");

      setNotifications(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markAsRead(id) {
    try {
      setUpdatingId(id);
      setError("");

      await api.patch(`/notifications/${id}/status`, {
        is_read: true,
      });

      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId("");
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  return (
    <div className="donor-notifications-page">
      <PageTitle
        title="Notifications"
        subtitle="Stay updated with your donations, pickup requests, and FoodRescue activity."
      />

      <ErrorBox message={error} />

      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <div className="notification-summary">
        <div className="notification-summary-card">
          <span className="notification-summary-label">
            Total Notifications
          </span>

          <strong>{notifications.length}</strong>

          <p>All recent updates related to your account</p>
        </div>

        <div className="notification-summary-card notification-summary-highlight">
          <span className="notification-summary-icon">!</span>

          <div>
            <strong>
              {unreadCount}{" "}
              {unreadCount === 1
                ? "Unread notification"
                : "Unread notifications"}
            </strong>

            <p>
              {unreadCount > 0
                ? "Review your latest updates and requests."
                : "You're all caught up."}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          NOTIFICATIONS
          ===================================================== */}

      {notifications.length === 0 ? (
        <div className="donor-notification-empty">
          <div className="donor-notification-empty-icon">✓</div>

          <Empty text="No notifications." />

          <p>
            New updates about your donations and pickup requests will appear
            here.
          </p>
        </div>
      ) : (
        <section className="donor-notifications-card">
          <div className="donor-notifications-header">
            <div>
              <span className="donor-notifications-eyebrow">
                ACTIVITY CENTER
              </span>

              <h2>Recent Notifications</h2>

              <p>
                Keep track of important updates from your FoodRescue activity.
              </p>
            </div>

            <div className="donor-notification-count">
              {notifications.length}{" "}
              {notifications.length === 1 ? "Notification" : "Notifications"}
            </div>
          </div>

          <div className="donor-notification-list">
            {notifications.map((notification) => {
              const isUpdating = updatingId === notification.notification_id;

              return (
                <div
                  key={notification.notification_id}
                  className={`donor-notification-item ${
                    notification.is_read
                      ? "donor-notification-read"
                      : "donor-notification-unread"
                  }`}
                >
                  {/* Icon */}

                  <div
                    className={`donor-notification-icon ${
                      notification.is_read
                        ? "donor-notification-icon-read"
                        : "donor-notification-icon-unread"
                    }`}
                  >
                    {notification.is_read ? "✓" : "!"}
                  </div>

                  {/* Content */}

                  <div className="donor-notification-content">
                    <div className="donor-notification-top">
                      <span className="donor-notification-type">
                        {notification.type}
                      </span>

                      {!notification.is_read && (
                        <span className="donor-unread-badge">NEW</span>
                      )}
                    </div>

                    <p className="donor-notification-message">
                      {notification.message}
                    </p>

                    <span className="donor-notification-date">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>

                  {/* Action */}

                  {!notification.is_read && (
                    <button
                      type="button"
                      className="donor-mark-read-button"
                      disabled={isUpdating}
                      onClick={() => markAsRead(notification.notification_id)}
                    >
                      {isUpdating ? "Updating..." : "Mark as read"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
