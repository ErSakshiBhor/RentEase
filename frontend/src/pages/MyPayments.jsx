import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./MyPayments.css";

const MyPayments = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get("/payments/my-payments");
        setData(response.data);
      } catch (err) {
        console.error("My Payments Error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load payment details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="my-payments-page">
        <div className="payment-message">
          Loading payment details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-payments-page">
        <div className="payment-message error">
          {error}
        </div>
      </div>
    );
  }

  const tenant = data?.tenant || {};
  const summary = data?.summary || {};
  const payments = data?.payments || [];

  return (
    <div className="my-payments-page">

      {/* Header */}
      <div className="payments-page-header">
        <h1>My Payments</h1>

        <p>
          View your payment history and payment details.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="payment-summary-grid">

        <div className="payment-summary-card">

          <div className="payment-summary-icon blue">
            💳
          </div>

          <div>
            <span>Total Paid</span>

            <strong>
              ₹
              {Number(
                summary.total_paid || 0
              ).toLocaleString("en-IN")}
            </strong>
          </div>

        </div>

        <div className="payment-summary-card">

          <div className="payment-summary-icon green">
            ✓
          </div>

          <div>
            <span>Paid Payments</span>

            <strong>
              {summary.paid_count || 0}
            </strong>
          </div>

        </div>

        <div className="payment-summary-card">

          <div className="payment-summary-icon purple">
            📄
          </div>

          <div>
            <span>Payment Records</span>

            <strong>
              {payments.length}
            </strong>
          </div>

        </div>

      </div>

      {/* Payment History */}
      <div className="payments-card">

        <div className="payments-card-header">

          <div>
            <h2>Payment History</h2>

            <p>
              Your recent rental payment records.
            </p>
          </div>

          <span className="payment-count">
            {payments.length}{" "}
            {payments.length === 1
              ? "Payment"
              : "Payments"}
          </span>

        </div>

        {payments.length === 0 ? (

          <div className="no-payments">

            <div className="no-payments-icon">
              💳
            </div>

            <h3>
              No payments yet
            </h3>

            <p>
              Your payment records will appear here
              once a payment is recorded.
            </p>

          </div>

        ) : (

          <div className="payment-table-wrapper">

            <table className="payment-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {payments.map((payment) => (

                  <tr key={payment.id}>

                    <td>
                      {payment.payment_date}
                    </td>

                    <td className="payment-amount">
                      ₹
                      {Number(
                        payment.amount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {payment.payment_method}
                    </td>

                    <td>
                      <span
                        className={`payment-status ${
                          payment.status?.toLowerCase()
                        }`}
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

      {/* Tenant Information */}
      <div className="payment-tenant-card">

        <div className="payment-tenant-icon">
          👤
        </div>

        <div>
          <span>Account Holder</span>

          <strong>
            {tenant.name}
          </strong>

          <p>
            {tenant.email}
          </p>
        </div>

      </div>

    </div>
  );
};

export default MyPayments;