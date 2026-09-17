import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./MyAgreement.css";

const MyAgreement = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        const response = await api.get("/agreements/my-agreements");
        setData(response.data);
      } catch (err) {
        console.error("My Agreement Error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load agreement details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAgreements();
  }, []);

  if (loading) {
    return (
      <div className="my-agreement-page">
        <div className="agreement-message">
          Loading agreement details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-agreement-page">
        <div className="agreement-message error">
          {error}
        </div>
      </div>
    );
  }

  const agreements = data?.agreements || [];
  const tenant = data?.tenant || {};

  if (agreements.length === 0) {
    return (
      <div className="my-agreement-page">

        <div className="agreement-page-header">
          <h1>My Agreement</h1>
          <p>
            View your rental agreement details.
          </p>
        </div>

        <div className="empty-agreement">
          <div className="empty-agreement-icon">
            📄
          </div>

          <h2>No Agreement Found</h2>

          <p>
            You don't have any rental agreement yet.
          </p>
        </div>

      </div>
    );
  }

  return (
    <div className="my-agreement-page">

      {/* Header */}
      <div className="agreement-page-header">
        <h1>My Agreement</h1>

        <p>
          View your rental agreement details.
        </p>
      </div>

      {/* Agreement Cards */}
      <div className="agreements-list">

        {agreements.map((agreement) => (

          <div
            className="agreement-card"
            key={agreement.id}
          >

            {/* Card Header */}
            <div className="agreement-card-header">

              <div className="agreement-title">

                <div className="agreement-icon">
                  📄
                </div>

                <div>
                  <span>
                    Rental Agreement
                  </span>

                  <h2>
                    {agreement.property?.name || "Property"}
                  </h2>
                </div>

              </div>

              <span
                className={`agreement-status ${
                  agreement.status?.toLowerCase()
                }`}
              >
                {agreement.status}
              </span>

            </div>

            {/* Agreement Dates */}
            <div className="agreement-section">

              <h3>Agreement Period</h3>

              <div className="agreement-info-grid">

                <div className="info-box">
                  <span>Start Date</span>

                  <strong>
                    {agreement.start_date}
                  </strong>
                </div>

                <div className="info-box">
                  <span>End Date</span>

                  <strong>
                    {agreement.end_date}
                  </strong>
                </div>

              </div>

            </div>

            {/* Financial Details */}
            <div className="agreement-section">

              <h3>Financial Details</h3>

              <div className="agreement-info-grid">

                <div className="info-box">
                  <span>Monthly Rent</span>

                  <strong>
                    ₹
                    {Number(
                      agreement.monthly_rent || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="info-box">
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

            {/* Property & Unit */}
            <div className="agreement-section">

              <h3>Property & Unit</h3>

              <div className="property-unit-grid">

                <div className="property-summary">

                  <div className="summary-icon">
                    🏢
                  </div>

                  <div>
                    <span>Property</span>

                    <strong>
                      {agreement.property?.name || "N/A"}
                    </strong>

                    <p>
                      {agreement.property?.address}
                    </p>

                    <p>
                      {agreement.property?.city}
                      {agreement.property?.state
                        ? `, ${agreement.property.state}`
                        : ""}
                    </p>

                    <p>
                      Pincode:{" "}
                      {agreement.property?.pincode}
                    </p>
                  </div>

                </div>

                <div className="unit-summary">

                  <div className="summary-icon unit">
                    🏠
                  </div>

                  <div>
                    <span>Assigned Unit</span>

                    <strong>
                      Unit{" "}
                      {agreement.unit?.unit_number}
                    </strong>

                    <p>
                      {agreement.unit?.unit_type}
                    </p>

                    <p>
                      Monthly Rent: ₹
                      {Number(
                        agreement.unit?.monthly_rent || 0
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* Tenant */}
            <div className="tenant-agreement-info">

              <div>
                <span>Tenant</span>

                <strong>
                  {tenant.name}
                </strong>
              </div>

              <div>
                <span>Email</span>

                <strong>
                  {tenant.email}
                </strong>
              </div>

              <div>
                <span>Agreement ID</span>

                <strong>
                  #{agreement.id.slice(-8)}
                </strong>
              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default MyAgreement;