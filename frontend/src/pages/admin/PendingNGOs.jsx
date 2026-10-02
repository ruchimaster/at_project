import { useEffect, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

export default function PendingNGOs() {
  const [ngos, setNGOs] = useState([]);

  const [error, setError] = useState("");

  async function load() {
    try {
      const response = await api.get("/users/admin/pending-ngos");

      setNGOs(response.data.ngos || []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function action(userId, actionName) {
    try {
      await api.put(`/users/admin/ngos/${userId}/${actionName}`);

      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageTitle title="Pending NGOs" />

      <ErrorBox message={error} />

      {ngos.length === 0 ? (
        <Empty text="No pending NGO applications." />
      ) : (
        <div className="cards-grid">
          {ngos.map((ngo) => (
            <div className="card" key={ngo.user_id}>
              <h3>{ngo.organization_name}</h3>

              <p>{ngo.organization_type}</p>

              <p>Contact: {ngo.contact_person}</p>

              <p>{ngo.email}</p>

              <p>{ngo.phone}</p>

              <p>{ngo.address}</p>

              <div className="button-row">
                <button
                  className="primary"
                  onClick={() => action(ngo.user_id, "approve")}
                >
                  Approve
                </button>

                <button onClick={() => action(ngo.user_id, "reject")}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
