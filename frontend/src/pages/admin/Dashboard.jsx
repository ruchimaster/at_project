import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../../api/api";

import { PageTitle, ErrorBox } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

import "./Dashboard.css";

const STATUS_COLORS = {
  Available: "#258761",
  Requested: "#32658c",
  Reserved: "#6c4e91",
  Expired: "#d65c5c",
  Completed: "#15563e",
  Pending: "#d8901f",
  Accepted: "#258761",
  Cancelled: "#d65c5c",
  Rejected: "#8b6db0",
};

function getStatusColor(status, index = 0) {
  return (
    STATUS_COLORS[status] ||
    ["#258761", "#32658c", "#d8901f", "#6c4e91", "#d65c5c"][index % 5]
  );
}

function formatStatus(status) {
  if (!status) return "Unknown";

  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMonth(value) {
  if (!value) return "";

  const text = String(value);

  if (text.includes("-")) {
    const [year, month] = text.split("-");

    const date = new Date(Number(year), Number(month) - 1);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }
  }

  return text;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [analytics, complaints] = await Promise.all([
          api.get("/analytics"),
          api.get("/complaints"),
        ]);

        const data = analytics.data;

        setStats({
          users: data.summary?.totalUsers ?? 0,
          donors: data.summary?.totalDonors ?? 0,
          ngos: data.summary?.totalNGOs ?? 0,
          pendingNGOs: data.summary?.pendingNGOs ?? 0,
          donations: data.summary?.totalDonations ?? 0,
          pickups: data.summary?.totalPickupRequests ?? 0,
          donatedQuantity: data.summary?.totalDonatedQuantity ?? 0,
          rescuedQuantity: data.summary?.totalRescuedQuantity ?? 0,
          complaints: complaints.data.length,

          donationStatusCounts: data.donationStatusCounts || [],

          pickupStatusCounts: data.pickupStatusCounts || [],

          monthlyDonations: data.monthlyDonations || [],

          monthlyCompletedPickups: data.monthlyCompletedPickups || [],
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const donationChartData = useMemo(() => {
    return (stats.donationStatusCounts || []).map((item) => ({
      name: formatStatus(item._id),
      value: Number(item.count || 0),
    }));
  }, [stats.donationStatusCounts]);

  const pickupChartData = useMemo(() => {
    return (stats.pickupStatusCounts || []).map((item) => ({
      name: formatStatus(item._id),
      value: Number(item.count || 0),
    }));
  }, [stats.pickupStatusCounts]);

  const monthlyDonationData = useMemo(() => {
    return (stats.monthlyDonations || []).map((item) => ({
      month: formatMonth(item._id),
      donations: Number(item.count || 0),
      quantity: Number(item.quantity || 0),
    }));
  }, [stats.monthlyDonations]);

  const monthlyPickupData = useMemo(() => {
    return (stats.monthlyCompletedPickups || []).map((item) => ({
      month: formatMonth(item._id),
      completed: Number(item.count || 0),
    }));
  }, [stats.monthlyCompletedPickups]);

  const rescuePercentage = useMemo(() => {
    const donated = Number(stats.donatedQuantity || 0);
    const rescued = Number(stats.rescuedQuantity || 0);

    if (!donated || donated <= 0) return 0;

    return Math.min(100, Math.round((rescued / donated) * 100));
  }, [stats.donatedQuantity, stats.rescuedQuantity]);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <div className="admin-eyebrow">FOODRESCUE ADMINISTRATION</div>

          <PageTitle
            title="Operations Control Center"
            subtitle="Monitor food donations, rescue operations, users and platform activity."
          />
        </div>

        <div className="admin-live-indicator">
          <span className="admin-live-dot"></span>
          <span>System Overview</span>
        </div>
      </div>

      <ErrorBox message={error} />

      {loading ? (
        <div className="admin-dashboard-loading">
          <div className="admin-loading-spinner"></div>

          <strong>Loading admin analytics...</strong>

          <p>Collecting the latest FoodRescue platform statistics.</p>
        </div>
      ) : (
        <>
          {/* =====================================================
              KPI SECTION
              ===================================================== */}

          <section className="admin-kpi-grid">
            <div className="admin-kpi-card admin-kpi-users">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">TOTAL USERS</span>

                <div className="admin-kpi-icon">◉</div>
              </div>

              <strong>{stats.users}</strong>

              <p>Registered platform users</p>
            </div>

            <div className="admin-kpi-card admin-kpi-donors">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">DONORS</span>

                <div className="admin-kpi-icon">D</div>
              </div>

              <strong>{stats.donors}</strong>

              <p>Active food contributors</p>
            </div>

            <div className="admin-kpi-card admin-kpi-ngos">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">APPROVED NGOS</span>

                <div className="admin-kpi-icon">N</div>
              </div>

              <strong>{stats.ngos}</strong>

              <p>Rescue organizations</p>
            </div>

            <div className="admin-kpi-card admin-kpi-pending">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">PENDING NGOS</span>

                <div className="admin-kpi-icon">!</div>
              </div>

              <strong>{stats.pendingNGOs}</strong>

              <p>Applications awaiting review</p>
            </div>

            <div className="admin-kpi-card admin-kpi-donations">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">DONATIONS</span>

                <div className="admin-kpi-icon">♻</div>
              </div>

              <strong>{stats.donations}</strong>

              <p>Total food donations</p>
            </div>

            <div className="admin-kpi-card admin-kpi-pickups">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">PICKUP REQUESTS</span>

                <div className="admin-kpi-icon">→</div>
              </div>

              <strong>{stats.pickups}</strong>

              <p>Rescue requests created</p>
            </div>

            <div className="admin-kpi-card admin-kpi-quantity">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">FOOD DONATED</span>

                <div className="admin-kpi-icon">+</div>
              </div>

              <strong>{stats.donatedQuantity}</strong>

              <p>Total quantity contributed</p>
            </div>

            <div className="admin-kpi-card admin-kpi-rescued">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">FOOD RESCUED</span>

                <div className="admin-kpi-icon">✓</div>
              </div>

              <strong>{stats.rescuedQuantity}</strong>

              <p>Successfully recovered</p>
            </div>

            <div className="admin-kpi-card admin-kpi-complaints">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">COMPLAINTS</span>

                <div className="admin-kpi-icon">⚠</div>
              </div>

              <strong>{stats.complaints}</strong>

              <p>Reported platform issues</p>
            </div>
          </section>

          {/* =====================================================
              ATTENTION + IMPACT
              ===================================================== */}

          <section className="admin-overview-grid">
            <div className="admin-attention-card">
              <div className="admin-section-heading">
                <div>
                  <span>ADMIN ATTENTION</span>
                  <h2>Items requiring review</h2>
                </div>

                <div className="admin-heading-icon">!</div>
              </div>

              <div className="admin-attention-list">
                <div className="admin-attention-row">
                  <div className="admin-attention-symbol admin-symbol-amber">
                    N
                  </div>

                  <div>
                    <strong>Pending NGO applications</strong>
                    <p>Organizations waiting for administrator approval.</p>
                  </div>

                  <span className="admin-attention-count admin-count-amber">
                    {stats.pendingNGOs}
                  </span>
                </div>

                <div className="admin-attention-row">
                  <div className="admin-attention-symbol admin-symbol-red">
                    !
                  </div>

                  <div>
                    <strong>Open complaints</strong>
                    <p>User-reported issues that may need attention.</p>
                  </div>

                  <span className="admin-attention-count admin-count-red">
                    {stats.complaints}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-impact-card">
              <div className="admin-section-heading">
                <div>
                  <span>COMMUNITY IMPACT</span>
                  <h2>Food recovery performance</h2>
                </div>

                <div className="admin-heading-icon admin-impact-icon">♻</div>
              </div>

              <div className="admin-impact-content">
                <div className="admin-impact-number">
                  <strong>{rescuePercentage}%</strong>
                  <span>Rescue Rate</span>
                </div>

                <div className="admin-impact-progress">
                  <div className="admin-progress-track">
                    <div
                      className="admin-progress-fill"
                      style={{
                        width: `${rescuePercentage}%`,
                      }}
                    ></div>
                  </div>

                  <p>
                    {stats.rescuedQuantity} rescued out of{" "}
                    {stats.donatedQuantity} donated quantity.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              STATUS CHARTS
              ===================================================== */}

          <section className="admin-charts-grid">
            <div className="admin-chart-card">
              <div className="admin-chart-header">
                <div>
                  <span>DONATIONS</span>
                  <h2>Donation Status</h2>
                </div>

                <div className="admin-chart-icon admin-chart-green">♻</div>
              </div>

              {donationChartData.length ? (
                <div className="admin-donut-layout">
                  <div className="admin-donut">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donationChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius="58%"
                          outerRadius="82%"
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {donationChartData.map((item, index) => (
                            <Cell
                              key={`${item.name}-${index}`}
                              fill={getStatusColor(item.name, index)}
                            />
                          ))}
                        </Pie>

                        <Tooltip formatter={(value) => [value, "Donations"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="admin-chart-legend">
                    {donationChartData.map((item, index) => (
                      <div className="admin-legend-row" key={item.name}>
                        <span
                          className="admin-legend-dot"
                          style={{
                            background: getStatusColor(item.name, index),
                          }}
                        ></span>

                        <span className="admin-legend-name">{item.name}</span>

                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="admin-chart-empty">
                  No donation status data available.
                </div>
              )}
            </div>

            <div className="admin-chart-card">
              <div className="admin-chart-header">
                <div>
                  <span>PICKUPS</span>
                  <h2>Pickup Status</h2>
                </div>

                <div className="admin-chart-icon admin-chart-blue">→</div>
              </div>

              {pickupChartData.length ? (
                <div className="admin-donut-layout">
                  <div className="admin-donut">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pickupChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius="58%"
                          outerRadius="82%"
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {pickupChartData.map((item, index) => (
                            <Cell
                              key={`${item.name}-${index}`}
                              fill={getStatusColor(item.name, index)}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value) => [value, "Pickup Requests"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="admin-chart-legend">
                    {pickupChartData.map((item, index) => (
                      <div className="admin-legend-row" key={item.name}>
                        <span
                          className="admin-legend-dot"
                          style={{
                            background: getStatusColor(item.name, index),
                          }}
                        ></span>

                        <span className="admin-legend-name">{item.name}</span>

                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="admin-chart-empty">
                  No pickup status data available.
                </div>
              )}
            </div>
          </section>

          {/* =====================================================
              MONTHLY DONATIONS
              ===================================================== */}

          <section className="admin-wide-chart">
            <div className="admin-chart-header">
              <div>
                <span>PLATFORM ACTIVITY</span>
                <h2>Monthly Donations</h2>
                <p>
                  Donation activity and contributed food quantity over time.
                </p>
              </div>

              <div className="admin-chart-icon admin-chart-green">↗</div>
            </div>

            {monthlyDonationData.length ? (
              <div className="admin-bar-chart">
                <ResponsiveContainer width="100%" height={330}>
                  <BarChart
                    data={monthlyDonationData}
                    margin={{
                      top: 10,
                      right: 15,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="4 4" vertical={false} />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 12,
                        fill: "#52655b",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 12,
                        fill: "#52655b",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #d8e3dc",
                        boxShadow: "0 8px 25px rgba(16,61,46,.10)",
                      }}
                    />

                    <Bar
                      dataKey="donations"
                      name="Donations"
                      fill="#258761"
                      radius={[7, 7, 0, 0]}
                      maxBarSize={55}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="admin-chart-empty admin-wide-empty">
                No monthly donation data available.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
