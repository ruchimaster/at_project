import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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

import { ErrorBox, PageTitle } from "../../components/UI";

import { getErrorMessage } from "../../utils/format";

import "./Dashboard.css";

export default function NGODashboard() {
  const [accountNotification, setAccountNotification] = useState(null);

  const [stats, setStats] = useState({});

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    Promise.all([api.get("/notifications"), api.get("/analytics")])
      .then(([notifications, analytics]) => {
        const notification = notifications.data.find(
          (item) => !item.is_read && item.type === "Account",
        );

        setAccountNotification(notification || null);

        const data = analytics.data;

        setStats({
          totalRequests: data.summary?.totalRequests ?? 0,

          pendingRequests: data.summary?.pendingRequests ?? 0,

          acceptedRequests: data.summary?.acceptedRequests ?? 0,

          completedRequests: data.summary?.completedRequests ?? 0,

          cancelledRequests: data.summary?.cancelledRequests ?? 0,

          rejectedRequests: data.summary?.rejectedRequests ?? 0,

          rescuedQuantity: data.summary?.rescuedQuantity ?? 0,

          monthlyCompletedPickups: data.monthlyCompletedPickups || [],
        });

        setError("");
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /* =====================================================
     REQUEST STATUS DATA
     ===================================================== */

  const requestStatusData = useMemo(
    () => [
      {
        name: "Pending",
        value: stats.pendingRequests || 0,
      },
      {
        name: "Accepted",
        value: stats.acceptedRequests || 0,
      },
      {
        name: "Completed",
        value: stats.completedRequests || 0,
      },
      {
        name: "Cancelled",
        value: stats.cancelledRequests || 0,
      },
      {
        name: "Rejected",
        value: stats.rejectedRequests || 0,
      },
    ],
    [stats],
  );

  const hasRequestStatusData = requestStatusData.some((item) => item.value > 0);

  /* =====================================================
     MONTHLY DATA
     ===================================================== */

  const monthlyData = stats.monthlyCompletedPickups || [];

  /* =====================================================
     SUCCESS RATE
     ===================================================== */

  const successRate =
    stats.totalRequests > 0
      ? Math.round((stats.completedRequests / stats.totalRequests) * 100)
      : 0;

  return (
    <div className="ngo-dashboard-page">
      {/* =================================================
          PAGE HEADER
          ================================================= */}

      <div className="ngo-dashboard-hero">
        <Link
          to="/ngo/request-donation"
          className="ngo-dashboard-request-button"
        >
          <span className="ngo-request-plus">+</span>

          <span>Request Donation</span>
        </Link>
      </div>

      {/* =================================================
          ERROR
          ================================================= */}

      <ErrorBox message={error} />

      {/* =================================================
          ACCOUNT NOTICE
          ================================================= */}

      {accountNotification && (
        <div className="ngo-dashboard-notice">
          <div className="ngo-notice-symbol">!</div>

          <div>
            <strong>Account update</strong>

            <p>{accountNotification.message}</p>
          </div>
        </div>
      )}

      {/* =================================================
          STATISTICS
          ================================================= */}

      <section className="ngo-dashboard-section">
        <div className="ngo-section-header">
          <div>
            <span>PERFORMANCE OVERVIEW</span>

            <h2>Rescue Activity</h2>
          </div>

          <p>Your current donation pickup performance</p>
        </div>

        <div className="ngo-statistics-grid">
          {/* TOTAL */}

          <div className="ngo-stat-box ngo-stat-green">
            <div className="ngo-stat-icon">⇄</div>

            <div className="ngo-stat-label">Total Pickup Requests</div>

            <div className="ngo-stat-number">
              {loading ? "..." : (stats.totalRequests ?? 0)}
            </div>

            <div className="ngo-stat-description">All requests submitted</div>
          </div>

          {/* PENDING */}

          <div className="ngo-stat-box ngo-stat-orange">
            <div className="ngo-stat-icon">◷</div>

            <div className="ngo-stat-label">Pending Requests</div>

            <div className="ngo-stat-number">
              {loading ? "..." : (stats.pendingRequests ?? 0)}
            </div>

            <div className="ngo-stat-description">Awaiting action</div>
          </div>

          {/* ACCEPTED */}

          <div className="ngo-stat-box ngo-stat-blue">
            <div className="ngo-stat-icon">✓</div>

            <div className="ngo-stat-label">Accepted Requests</div>

            <div className="ngo-stat-number">
              {loading ? "..." : (stats.acceptedRequests ?? 0)}
            </div>

            <div className="ngo-stat-description">Confirmed pickups</div>
          </div>

          {/* COMPLETED */}

          <div className="ngo-stat-box ngo-stat-completed">
            <div className="ngo-stat-icon">✓</div>

            <div className="ngo-stat-label">Completed Pickups</div>

            <div className="ngo-stat-number">
              {loading ? "..." : (stats.completedRequests ?? 0)}
            </div>

            <div className="ngo-stat-description">Successfully rescued</div>
          </div>

          {/* CANCELLED */}

          <div className="ngo-stat-box ngo-stat-red">
            <div className="ngo-stat-icon">×</div>

            <div className="ngo-stat-label">Cancelled Requests</div>

            <div className="ngo-stat-number">
              {loading ? "..." : (stats.cancelledRequests ?? 0)}
            </div>

            <div className="ngo-stat-description">Cancelled pickups</div>
          </div>

          {/* REJECTED */}

          <div className="ngo-stat-box ngo-stat-purple">
            <div className="ngo-stat-icon">!</div>

            <div className="ngo-stat-label">Rejected Requests</div>

            <div className="ngo-stat-number">
              {loading ? "..." : (stats.rejectedRequests ?? 0)}
            </div>

            <div className="ngo-stat-description">Requests declined</div>
          </div>

          {/* RESCUED */}

          <div className="ngo-stat-box ngo-stat-impact">
            <div className="ngo-stat-icon">♻</div>

            <div className="ngo-stat-label">Food Rescued</div>

            <div className="ngo-stat-number">
              {loading ? "..." : (stats.rescuedQuantity ?? 0)}
            </div>

            <div className="ngo-stat-description">Total rescued quantity</div>
          </div>
        </div>
      </section>

      {/* =================================================
          CHARTS
          ================================================= */}

      <section className="ngo-dashboard-section">
        <div className="ngo-section-header">
          <div>
            <span>ANALYTICS</span>

            <h2>Pickup Insights</h2>
          </div>

          <p>Visual summary of your rescue operations</p>
        </div>

        <div className="ngo-chart-grid">
          {/* =================================================
              MONTHLY BAR CHART
              ================================================= */}

          <div className="ngo-chart-card ngo-chart-wide">
            <div className="ngo-chart-header">
              <div>
                <h3>Completed Pickups</h3>

                <p>Monthly completed pickup activity</p>
              </div>

              <div className="ngo-chart-badge">Monthly</div>
            </div>

            <div className="ngo-chart-area">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 10,
                      right: 15,
                      left: -15,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e7eee9"
                    />

                    <XAxis
                      dataKey="_id"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#60746a",
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#60746a",
                        fontSize: 12,
                      }}
                    />

                    <Tooltip
                      cursor={{
                        fill: "#edf5ef",
                      }}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #dce8df",
                        boxShadow: "0 8px 25px rgba(16,61,46,0.10)",
                      }}
                    />

                    <Bar
                      dataKey="count"
                      name="Completed Pickups"
                      fill="#258761"
                      radius={[7, 7, 0, 0]}
                      barSize={34}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="ngo-chart-empty">
                  <div>◷</div>

                  <strong>No monthly pickup data</strong>

                  <p>Your completed pickup activity will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              DONUT CHART
              ================================================= */}

          <div className="ngo-chart-card">
            <div className="ngo-chart-header">
              <div>
                <h3>Request Status</h3>

                <p>Distribution of your requests</p>
              </div>
            </div>

            <div className="ngo-donut-wrapper">
              {hasRequestStatusData ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={requestStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={68}
                        outerRadius={100}
                        paddingAngle={3}
                      >
                        {requestStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              [
                                "#e6a23c",
                                "#258761",
                                "#15563e",
                                "#d65c5c",
                                "#8b6db0",
                              ][index]
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          borderRadius: "10px",
                          border: "1px solid #dce8df",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="ngo-donut-center">
                    <strong>{stats.totalRequests ?? 0}</strong>

                    <span>Requests</span>
                  </div>
                </>
              ) : (
                <div className="ngo-chart-empty">
                  <div>◉</div>

                  <strong>No request data</strong>

                  <p>Request status will appear after you submit pickups.</p>
                </div>
              )}
            </div>

            {hasRequestStatusData && (
              <div className="ngo-chart-legend">
                {requestStatusData.map((item, index) => (
                  <div className="ngo-legend-item" key={item.name}>
                    <span
                      className="ngo-legend-dot"
                      style={{
                        background: [
                          "#e6a23c",
                          "#258761",
                          "#15563e",
                          "#d65c5c",
                          "#8b6db0",
                        ][index],
                      }}
                    />

                    <span>{item.name}</span>

                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =================================================
          IMPACT + ACTIONS
          ================================================= */}

      <section className="ngo-bottom-grid">
        {/* IMPACT */}

        <div className="ngo-impact-card">
          <div className="ngo-impact-content">
            <span className="ngo-impact-label">COMMUNITY IMPACT</span>

            <h2>Your rescue contribution</h2>

            <p>
              Every completed pickup helps move surplus food toward people who
              need it instead of letting it go to waste.
            </p>

            <div className="ngo-impact-number">
              <strong>{stats.rescuedQuantity ?? 0}</strong>

              <span>food rescued</span>
            </div>
          </div>

          <div className="ngo-impact-circle">♻</div>
        </div>

        {/* SUCCESS RATE */}

        <div className="ngo-performance-card">
          <div className="ngo-performance-heading">
            <div>
              <span>COMPLETION RATE</span>

              <h3>Pickup Success</h3>
            </div>

            <strong>{successRate}%</strong>
          </div>

          <div className="ngo-performance-bar">
            <div
              style={{
                width: `${successRate}%`,
              }}
            />
          </div>

          <p>
            {stats.completedRequests ?? 0} of {stats.totalRequests ?? 0} pickup
            requests completed successfully.
          </p>
        </div>
      </section>

      {/* =================================================
          QUICK ACTIONS
          ================================================= */}

      <section className="ngo-dashboard-section">
        <div className="ngo-section-header">
          <div>
            <span>OPERATIONS</span>

            <h2>Quick Actions</h2>
          </div>
        </div>

        <div className="ngo-actions-grid">
          <Link to="/ngo/request-donation" className="ngo-action-card">
            <div className="ngo-action-icon">+</div>

            <div>
              <h3>Request Donation</h3>

              <p>Find available food donations and request a pickup.</p>
            </div>

            <span className="ngo-action-arrow">→</span>
          </Link>

          <Link to="/ngo/current-pickups" className="ngo-action-card">
            <div className="ngo-action-icon">⇄</div>

            <div>
              <h3>Current Pickups</h3>

              <p>Manage your active pickup requests and operations.</p>
            </div>

            <span className="ngo-action-arrow">→</span>
          </Link>

          <Link to="/ngo/completed-pickups" className="ngo-action-card">
            <div className="ngo-action-icon">✓</div>

            <div>
              <h3>Completed Pickups</h3>

              <p>Review previously completed food rescue operations.</p>
            </div>

            <span className="ngo-action-arrow">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
