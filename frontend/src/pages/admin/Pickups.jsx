import { useEffect, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle } from "../../components/UI";

import { formatDate, getErrorMessage, mapsUrl } from "../../utils/format";

export default function Pickups() {
  const [requests, setRequests] = useState([]);

  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/pickup-requests")

      .then((response) => {
        setRequests(response.data);
      })

      .catch((err) => {
        setError(getErrorMessage(err));
      });
  }, []);

  return (
    <>
      <PageTitle title="All Pickup Requests" />

      <ErrorBox message={error} />

      {requests.length === 0 ? (
        <Empty text="No pickup requests found." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Food</th>
                <th>Donor</th>
                <th>NGO</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Location</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr key={request.request_id}>
                  <td>{request.donation?.food_name}</td>

                  <td>{request.donor?.organization_name}</td>

                  <td>{request.ngo?.organization_name}</td>

                  <td>{request.donation?.quantity}</td>

                  <td>{request.request_status}</td>

                  <td>{formatDate(request.request_date)}</td>

                  <td>
                    <a
                      href={mapsUrl(request.donation?.pickup_address)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open map
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
