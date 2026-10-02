import { useEffect, useState } from "react";

import api from "../../api/api";

import { Empty, ErrorBox, PageTitle, SuccessBox } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);

  const [users, setUsers] = useState([]);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  async function load() {
    try {
      const [complaintsResponse, usersResponse] = await Promise.all([
        api.get("/complaints"),
        api.get("/users"),
      ]);

      setComplaints(complaintsResponse.data);

      setUsers(usersResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function organizationName(userId) {
    const user = users.find((item) => item.user_id === userId);

    return user?.organization_name || "Unknown Organization";
  }

  async function updateStatus(complaintId, status) {
    try {
      await api.put(`/complaints/${complaintId}`, {
        status,
      });

      setSuccess("Complaint status updated.");

      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageTitle title="Complaints" />

      <ErrorBox message={error} />

      <SuccessBox message={success} />

      {complaints.length === 0 ? (
        <Empty text="No complaints found." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Type</th>
                <th>Description</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>

            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint.complaint_id}>
                  <td>{organizationName(complaint.user_id)}</td>

                  <td>{complaint.complaint_type}</td>

                  <td>{complaint.description}</td>

                  <td>{complaint.status}</td>

                  <td>
                    <select
                      value={complaint.status}
                      onChange={(e) =>
                        updateStatus(complaint.complaint_id, e.target.value)
                      }
                    >
                      <option>Pending</option>

                      <option>Under Review</option>

                      <option>Resolved</option>

                      <option>Rejected</option>
                    </select>
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
