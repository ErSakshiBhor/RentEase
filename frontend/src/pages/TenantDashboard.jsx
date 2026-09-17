import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  LineChart,
  Line,
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
import "./TenantDashboard.css";

const TenantDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardResponse, paymentsResponse] = await Promise.all([
          api.get("/tenants/dashboard"),
          api.get("/payments/my-payments")
        ]);

        setData({
          ...dashboardResponse.data,
          paymentData: paymentsResponse.data
        });
      } catch (err) {
        console.error("Tenant Dashboard Error:", err);

        setError(
          err.response?.data?.message ||
          "Failed to load tenant dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="tenant-dashboard">
        <div className="tenant-loading">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tenant-dashboard">
        <div className="tenant-error">
          {error}
        </div>
      </div>
    );
  }

  const tenant = data?.tenant || {};
  const property = data?.property || {};
  const unit = data?.unit || {};
  const agreement = data?.agreement || {};
  const payments = data?.recent_payments || [];

  /* Payment Analytics Data */
  const paymentData = data?.paymentData || {};

  const allPayments = paymentData?.payments || [];

  const totalPaid = paymentData?.summary?.total_paid || 0;

  const paidCount = paymentData?.summary?.paid_count || 0;

  const pendingCount = allPayments.filter(
    (payment) => payment.status !== "paid"
  ).length;

  const paymentHistory = [...allPayments]
    .reverse()
    .map((payment) => {
      const date = new Date(payment.payment_date);

      return {
        date: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short"
        }),
        amount: Number(payment.amount || 0)
      };
    });

  const paymentStatusData = [
    {
      name: "Paid",
      value: paidCount
    },
    {
      name: "Pending",
      value: pendingCount
    }
  ].filter((item) => item.value > 0);

  return (
    <div className="tenant-dashboard">

      {/* Header */}
      <div className="tenant-header">
        <div>
          <h1>
            {getGreeting()}, {tenant.name} 👋
          </h1>

          <p>
            Here's an overview of your rental details.
          </p>
        </div>
      </div>


      {/* Summary Cards */}
      <div className="tenant-stat-grid">

        <div className="tenant-stat-card">
          <div className="tenant-stat-icon blue">
            🏠
          </div>

          <div>
            <span>My Unit</span>
            <h2>{unit.unit_number || "N/A"}</h2>
          </div>
        </div>


        <div className="tenant-stat-card">
          <div className="tenant-stat-icon green">
            ₹
          </div>

          <div>
            <span>Monthly Rent</span>
            <h2>
              ₹{Number(unit.monthly_rent || 0).toLocaleString("en-IN")}
            </h2>
          </div>
        </div>


        <div className="tenant-stat-card">
          <div className="tenant-stat-icon purple">
            📄
          </div>

          <div>
            <span>Agreement</span>
            <h2>
              {agreement.status === "active"
                ? "Active"
                : agreement.status || "N/A"}
            </h2>
          </div>
        </div>


        <div className="tenant-stat-card">
          <div className="tenant-stat-icon orange">
            💳
          </div>

          <div>
            <span>Payments</span>
            <h2>{payments.length}</h2>
          </div>
        </div>

      </div>


      {/* Main Information */}
      <div className="tenant-content-grid">

        {/* Property Card */}
        <div className="tenant-card">

          <div className="tenant-card-header">
            <h2>My Property</h2>
          </div>


          <div className="property-info">

            <div className="property-icon">
              🏢
            </div>

            <div>
              <h3>{property.name || "N/A"}</h3>

              <p>
                {property.address || ""}
              </p>

              <p>
                {property.city || ""}
                {property.state
                  ? `, ${property.state}`
                  : ""}
              </p>

              <p>
                Pincode: {property.pincode || "N/A"}
              </p>
            </div>

          </div>


          <div className="unit-details">

            <div>
              <span>Unit</span>

              <strong>
                {unit.unit_number || "N/A"}
              </strong>
            </div>


            <div>
              <span>Type</span>

              <strong>
                {unit.unit_type || "N/A"}
              </strong>
            </div>


            <div>
              <span>Status</span>

              <strong className="occupied-status">
                {unit.status || "N/A"}
              </strong>
            </div>

          </div>

        </div>


        {/* Agreement Card */}
        <div className="tenant-card">

          <div className="tenant-card-header">

            <h2>Agreement Details</h2>

            <span
              className={
                agreement.status === "active"
                  ? "agreement-badge active"
                  : "agreement-badge"
              }
            >
              {agreement.status || "N/A"}
            </span>

          </div>


          <div className="agreement-details">

            <div className="agreement-row">
              <span>Start Date</span>

              <strong>
                {agreement.start_date || "N/A"}
              </strong>
            </div>


            <div className="agreement-row">
              <span>End Date</span>

              <strong>
                {agreement.end_date || "N/A"}
              </strong>
            </div>


            <div className="agreement-row">
              <span>Monthly Rent</span>

              <strong>
                ₹
                {Number(
                  agreement.monthly_rent || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>


            <div className="agreement-row">
              <span>Security Deposit</span>

              <strong>
                ₹
                {Number(
                  agreement.security_deposit || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

          </div>

        </div>

      </div>


      {/* Tenant Analytics */}
<div className="tenant-analytics">

  {/* Rent Payment History */}
  <div className="tenant-card chart-card payment-history-card">

    <div className="tenant-card-header">
      <div>
        <h2>Rent Payment History</h2>
        <p>Your recent rent payments</p>
      </div>
    </div>

    {paymentHistory.length === 0 ? (
      <div className="chart-empty">
        No payment data available
      </div>
    ) : (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={paymentHistory}
            margin={{
              top: 10,
              right: 15,
              left: 5,
              bottom: 5
            }}
          >

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip
              formatter={(value) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                "Amount"
              ]}
            />

            <Line
              type="monotone"
              dataKey="amount"
              stroke="#6C9CEB"
              strokeWidth={3}
              dot={{
                r: 5,
                fill: "#6C9CEB"
              }}
              activeDot={{
                r: 7
              }}
            />

          </LineChart>
        </ResponsiveContainer>
      </div>
    )}

  </div>


  {/* Payment Status */}
  <div className="tenant-card chart-card payment-status-card">

    <div className="tenant-card-header">
      <div>
        <h2>Payment Status</h2>
        <p>Overview of your payments</p>
      </div>
    </div>

    {paymentStatusData.length === 0 ? (
      <div className="chart-empty">
        No payment data available
      </div>
    ) : (
      <div className="chart-container pie-chart-container">

        <ResponsiveContainer width="100%" height={260}>
          <PieChart>

            <Pie
              data={paymentStatusData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
            >

              {paymentStatusData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.name === "Paid"
                      ? "#70C7A1"
                      : "#F2C879"
                  }
                />
              ))}

            </Pie>

            <text
              x="50%"
              y="47%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#243b5a"
              fontSize="25"
              fontWeight="700"
            >
              {paidCount}
            </text>

            <text
              x="50%"
              y="56%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#718096"
              fontSize="11"
            >
              Paid
            </text>

            <Tooltip />

            <Legend />

          </PieChart>
        </ResponsiveContainer>

      </div>
    )}

  </div>

</div>


      {/* Rent Summary */}
      <div className="tenant-summary-grid">

        <div className="tenant-summary-card">
          <span>Total Paid</span>

          <h2>
            ₹{Number(totalPaid).toLocaleString("en-IN")}
          </h2>
        </div>


        <div className="tenant-summary-card">
          <span>Paid Payments</span>

          <h2>
            {paidCount}
          </h2>
        </div>


        <div className="tenant-summary-card">
          <span>Pending Payments</span>

          <h2>
            {pendingCount}
          </h2>
        </div>


        <div className="tenant-summary-card">
          <span>Monthly Rent</span>

          <h2>
            ₹{Number(unit.monthly_rent || 0).toLocaleString("en-IN")}
          </h2>
        </div>

      </div>


      {/* Recent Payments */}
      <div className="tenant-card payments-card">

        <div className="tenant-card-header recent-payments-header">
          <div>
            <h2>Recent Payments</h2>
            <p>Latest payment activity</p>
          </div>
        </div>

        {payments.length === 0 ? (

          <div className="no-payments">

            <div className="no-payment-icon">
              💳
            </div>

            <h3>
              No payments yet
            </h3>

            <p>
              Your recent payment records will appear here.
            </p>

          </div>

        ) : (

          <div className="payment-table-wrapper">

            <table className="payment-table">

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>

              </thead>


              <tbody>

                {payments.map((payment, index) => (

                  <tr key={index}>

                    <td>
                      {payment.payment_date || "N/A"}
                    </td>


                    <td>
                      ₹
                      {Number(
                        payment.amount || 0
                      ).toLocaleString("en-IN")}
                    </td>


                    <td>
                      {payment.payment_method || "N/A"}
                    </td>


                    <td>

                      <span
                        className={`payment-status ${payment.status === "paid"
                          ? "paid"
                          : "pending"
                          }`}
                      >
                        {payment.status || "pending"}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default TenantDashboard;