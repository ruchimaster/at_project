import {
  useEffect,
  useState,
} from "react";

import api from "../../api/api";

import {
  Empty,
  ErrorBox,
  PageTitle,
} from "../../components/UI";

import {
  formatDate,
  getErrorMessage,
} from "../../utils/format";

export default function Notifications() {

  const [notifications, setNotifications] =
    useState([]);

  const [error, setError] =
    useState("");

  async function load() {

    try {

      const response =
        await api.get(
          "/notifications"
        );

      setNotifications(
        response.data
      );

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markAsRead(id) {

    try {

      await api.patch(
        `/notifications/${id}/status`,
        {
          is_read: true,
        }
      );

      load();

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    }
  }

  return (
    <>
      <PageTitle
        title="Notifications"
      />

      <ErrorBox message={error} />

      {notifications.length === 0 ? (

        <Empty
          text="No notifications."
        />

      ) : (

        <div>

          {notifications.map(
            (notification) => (

              <div
                key={
                  notification.notification_id
                }
                className={
                  `notification ${
                    notification.is_read
                      ? "read"
                      : "unread"
                  }`
                }
              >

                <div>

                  <strong>
                    {notification.type}
                  </strong>

                  <p>
                    {notification.message}
                  </p>

                  <small>
                    {formatDate(
                      notification.created_at
                    )}
                  </small>

                </div>

                {!notification.is_read && (

                  <button
                    onClick={() =>
                      markAsRead(
                        notification.notification_id
                      )
                    }
                  >
                    Mark as read
                  </button>

                )}

              </div>

            )
          )}

        </div>

      )}
    </>
  );
}