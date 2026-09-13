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

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

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
          <h1>Good morning, {userName} 👋</h1>
          <p>Here's an overview of your rental business.</p>
        </div>


        {/* Main Stats */}
        <div className="stats-grid">

          <div className="stat-card">
            <h3>Properties</h3>
            <p>{dashboardData.properties}</p>
          </div>

          <div className="stat-card">
            <h3>Units</h3>
            <p>{dashboardData.units}</p>
          </div>

          <div className="stat-card">
            <h3>Tenants</h3>
            <p>{dashboardData.tenants}</p>
          </div>

          <div className="stat-card">
            <h3>Occupied</h3>
            <p>{dashboardData.occupied_units}</p>
          </div>

        </div>


        {/* Rent & Agreement */}
        <div className="dashboard-bottom">

          <div className="info-card">
            <h3>Monthly Rent</h3>
            <p>
              ₹{dashboardData.monthly_rent.toLocaleString()}
            </p>
          </div>

          <div className="info-card">
            <h3>Active Agreements</h3>
            <p>{dashboardData.active_agreements}</p>
          </div>

        </div>


        {/* Payment Stats */}
        <div className="dashboard-bottom">

          <div className="info-card">
            <h3>Total Collected</h3>
            <p>
              ₹{dashboardData.total_collected.toLocaleString()}
            </p>
          </div>

          <div className="info-card">
            <h3>Payments This Month</h3>
            <p>{dashboardData.payments_this_month}</p>
          </div>

          <div className="info-card">
            <h3>Pending Payments</h3>
            <p>
              ₹{dashboardData.pending_payments.toLocaleString()}
            </p>
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


        </div>

      </main>

    </div>
  );
};

export default Dashboard;