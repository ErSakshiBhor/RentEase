import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/dashboard/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(response.data);

        setDashboardData(response.data);
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

        <div className="dashboard-header">
          <h1>Good morning, Amit 👋</h1>
          <p>Here's an overview of your rental business.</p>
        </div>

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

        <div className="dashboard-bottom">

          <div className="info-card">
            <h3>Monthly Rent</h3>
            <p>₹{dashboardData.monthly_rent.toLocaleString()}</p>
          </div>

          <div className="info-card">
            <h3>Active Agreements</h3>
            <p>{dashboardData.active_agreements}</p>
          </div>

        </div>

      </main>

    </div>
  );
};

export default Dashboard;