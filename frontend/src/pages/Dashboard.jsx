import React, { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import api from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");

  const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  } else if (hour < 17) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
};

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        setGreeting(getGreeting());

        // Dashboard data
        const response = await api.get("/dashboard/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(response.data);

        setDashboardData(response.data);

        // Logged-in user profile
        const profileResponse = await api.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserName(profileResponse.data.name);

      } catch (error) {
        console.log(error);
      }
    };

    fetchDashboard();
  }, []);

  if (!dashboardData) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="dashboard-page">

      <main className="dashboard-content">

        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1>{greeting}, {userName} 👋</h1>
          <p>Here's an overview of your rental business.</p>
        </div>


        {/* Main Stats */}
        {/* Main Stats */}
        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon properties-icon">
              🏢
            </div>

            <div className="stat-info">
              <h3>Properties</h3>
              <p>{dashboardData.properties}</p>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon units-icon">
              🏠
            </div>

            <div className="stat-info">
              <h3>Units</h3>
              <p>{dashboardData.units}</p>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon tenants-icon">
              👥
            </div>

            <div className="stat-info">
              <h3>Tenants</h3>
              <p>{dashboardData.tenants}</p>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon occupied-icon">
              ✓
            </div>

            <div className="stat-info">
              <h3>Occupied</h3>
              <p>{dashboardData.occupied_units}</p>
            </div>
          </div>

        </div>


        


        {/* Financial Stats */}
<div className="financial-grid">

  {/* Monthly Rent */}
  <div className="financial-card">
    <div className="financial-icon rent-icon">
      ₹
    </div>

    <div className="financial-info">
      <h3>Monthly Rent</h3>
      <p>
        ₹{dashboardData.monthly_rent.toLocaleString()}
      </p>
    </div>
  </div>


  {/* Active Agreements */}
  <div className="financial-card">
    <div className="financial-icon agreement-icon">
      📄
    </div>

    <div className="financial-info">
      <h3>Active Agreements</h3>
      <p>{dashboardData.active_agreements}</p>
    </div>
  </div>


  {/* Total Collected */}
  <div className="financial-card">
    <div className="financial-icon collected-icon">
      💰
    </div>

    <div className="financial-info">
      <h3>Total Collected</h3>
      <p>
        ₹{dashboardData.total_collected.toLocaleString()}
      </p>
    </div>
  </div>


  {/* Payments This Month */}
  <div className="financial-card">
    <div className="financial-icon month-icon">
      📅
    </div>

    <div className="financial-info">
      <h3>Payments This Month</h3>
      <p>{dashboardData.payments_this_month}</p>
    </div>
  </div>


  {/* Pending Payments */}
  <div className="financial-card">
    <div className="financial-icon pending-icon">
      ⏳
    </div>

    <div className="financial-info">
      <h3>Pending Payments</h3>
      <p>
        ₹{dashboardData.pending_payments.toLocaleString()}
      </p>
    </div>
  </div>

</div>


        {/* Charts Section */}
        <div className="charts-grid">


          {/* Payment Collection Chart */}
          <div className="chart-card">

            <div className="chart-header">
              <h3>Payment Collection</h3>
              <p>Last 6 months</p>
            </div>

            <ResponsiveContainer width="100%" height={300}>

              <BarChart
                data={dashboardData.payment_overview}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 5
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />

                <Tooltip
                  formatter={(value) => [
                    `₹${value}`,
                    "Collected"
                  ]}
                  cursor={{
                    fill: "rgba(108, 156, 235, 0.08)"
                  }}
                />

                <Bar
                  dataKey="collected"
                  name="Collected"
                  fill="#6C9CEB"
                  radius={[8, 8, 0, 0]}
                  barSize={42}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>


          {/* Unit Occupancy Chart */}
          <div className="chart-card">

            <div className="chart-header">
              <h3>Unit Occupancy</h3>
              <p>Current occupancy status</p>
            </div>

            <ResponsiveContainer width="100%" height={300}>

              <PieChart>

                <Pie
                  data={[
                    {
                      name: "Occupied",
                      value: dashboardData.occupancy.occupied
                    },
                    {
                      name: "Vacant",
                      value: dashboardData.occupancy.vacant
                    }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                >

                  <Cell fill="#6C9CEB" />
                  <Cell fill="#E2E8F0" />

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

          {/* Rent vs Collection Chart */}
          <div className="chart-card full-width-chart">

            <div className="chart-header">
              <h3>Rent vs Collection</h3>
              <p>{dashboardData.current_month} month comparison</p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dashboardData.rent_vs_collection}
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 5
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="type"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />

                <Tooltip
                  formatter={(value) => [
                    `₹${value}`,
                    "Amount"
                  ]}
                  cursor={{
                    fill: "rgba(108, 156, 235, 0.08)"
                  }}
                />

                <Bar
                  dataKey="amount"
                  fill="#6C9CEB"
                  radius={[8, 8, 0, 0]}
                  barSize={70}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>


        </div>

        {/* Recent Payments */}
        <div className="recent-payments-card">

          <div className="chart-header">
            <h3>Recent Payments</h3>
            <p>Latest payment activity</p>
          </div>

          {dashboardData.recent_payments.length === 0 ? (

            <div className="no-payments">
              No recent payments found.
            </div>

          ) : (

            <div className="payments-table-wrapper">

              <table className="payments-table">

                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {dashboardData.recent_payments.map((payment, index) => (

                    <tr key={index}>

                      <td>{payment.tenant_name}</td>

                      <td>{payment.payment_date}</td>

                      <td>{payment.payment_method}</td>

                      <td className="payment-amount">
                        ₹{payment.amount.toLocaleString()}
                      </td>

                      <td>
                        <span
                          className={`payment-status ${payment.status}`}
                        >
                          {payment.status}
                        </span>
                      </td>

                    </tr>

                  ))}


                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
};

export default Dashboard;