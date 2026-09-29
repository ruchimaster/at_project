import {
  useEffect,
  useState,
} from "react";

import api from "../../api/api";

import {
  ErrorBox,
  Empty,
  PageTitle,
} from "../../components/UI";

import {
  formatDate,
  getErrorMessage,
} from "../../utils/format";

export default function PickupRequests({
  ongoing = false,
}) {

  const [requests, setRequests] =
    useState([]);

  const [error, setError] =
    useState("");

  async function load() {

    try {

      const response =
        await api.get(
          "/pickup-requests"
        );

      const filtered =
        response.data.filter(
          (request) => {

            if (ongoing) {
              return (
                request.request_status ===
                "Accepted"
              );
            }

            return (
              request.request_status ===
              "Pending"
            );
          }
        );

      setRequests(filtered);

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    }
  }

  useEffect(() => {
    load();
  }, [ongoing]);

  async function updateRequest(
    id,
    status
  ) {

    try {

      await api.put(
        `/pickup-requests/${id}`,
        {
          request_status: status,
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
        title={
          ongoing
            ? "Ongoing Pickup Requests"
            : "Pickup Requests"
        }
        subtitle={
          ongoing
            ? "Accepted requests currently in progress."
            : "Pending requests for your donations."
        }
      />

      <ErrorBox message={error} />

      {requests.length === 0 ? (

        <Empty
          text={
            ongoing
              ? "No ongoing pickup requests."
              : "No pending pickup requests."
          }
        />

      ) : (

        <div className="table-wrap">

          <table>

            <thead>

              <tr>
                <th>Food</th>
                <th>NGO</th>
                <th>Quantity</th>
                <th>Pickup Address</th>
                <th>Requested</th>
                <th>Status</th>

                {!ongoing && (
                  <th>Action</th>
                )}
              </tr>

            </thead>

            <tbody>

              {requests.map((request) => (

                <tr
                  key={request.request_id}
                >

                  <td>
                    {request.donation?.food_name}
                  </td>

                  <td>
                    {request.ngo?.organization_name}
                  </td>

                  <td>
                    {request.donation?.quantity}
                  </td>

                  <td>
                    {request.donation?.pickup_address}
                  </td>

                  <td>
                    {formatDate(
                      request.request_date
                    )}
                  </td>

                  <td>
                    {request.request_status}
                  </td>

                  {!ongoing && (
                    <td>

                      <button
                        onClick={() =>
                          updateRequest(
                            request.request_id,
                            "Accepted"
                          )
                        }
                      >
                        Accept
                      </button>

                      <button
                        onClick={() =>
                          updateRequest(
                            request.request_id,
                            "Rejected"
                          )
                        }
                      >
                        Reject
                      </button>

                    </td>
                  )}

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}
    </>
  );
}