import { useEffect, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle } from "../../components/UI";

import { formatDate, getErrorMessage } from "../../utils/format";

export default function Donations() {
  const [donations, setDonations] = useState([]);

  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/donations")

      .then((response) => {
        setDonations(response.data);
      })

      .catch((err) => {
        setError(getErrorMessage(err));
      });
  }, []);

  return (
    <>
      <PageTitle title="All Donations" />

      <ErrorBox message={error} />

      {donations.length === 0 ? (
        <Empty text="No donations found." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Food</th>
                <th>Donor</th>
                <th>Quantity</th>
                <th>Pickup</th>
                <th>Status</th>
                <th>Available Until</th>
              </tr>
            </thead>

            <tbody>
              {donations.map((donation) => (
                <tr key={donation.donation_id}>
                  <td>{donation.food_name}</td>

                  <td>{donation.donor?.organization_name}</td>

                  <td>{donation.quantity}</td>

                  <td>{donation.pickup_address}</td>

                  <td>{donation.status}</td>

                  <td>{formatDate(donation.available_until)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
