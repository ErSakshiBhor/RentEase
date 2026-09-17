import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./MyProperty.css";

const MyProperty = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get("/tenants/my-property");
        setData(response.data);
      } catch (err) {
        console.error("My Property Error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load property details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, []);

  if (loading) {
    return (
      <div className="my-property-page">
        <div className="property-message">
          Loading property details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-property-page">
        <div className="property-message error">
          {error}
        </div>
      </div>
    );
  }

  const tenant = data?.tenant || {};
  const properties = data?.properties || [];

  const firstProperty = properties[0]?.property || {};

  return (
    <div className="my-property-page">

      {/* Header */}
      <div className="property-page-header">
        <h1>My Property</h1>

        <p>
          View your property and assigned unit details.
        </p>
      </div>

      {/* Property Overview */}
      {firstProperty.name && (
        <div className="property-overview-card">

          <div className="property-main">

            <div className="property-large-icon">
              🏢
            </div>

            <div className="property-main-info">

              <span className="property-label">
                Property
              </span>

              <h2>
                {firstProperty.name}
              </h2>

              <p>
                {firstProperty.address}
              </p>

              <p>
                {firstProperty.city}
                {firstProperty.state
                  ? `, ${firstProperty.state}`
                  : ""}
              </p>

              <p>
                Pincode: {firstProperty.pincode}
              </p>

            </div>

            <div className="property-status">

              <span>Assigned Units</span>

              <strong>
                {properties.length}
              </strong>

            </div>

          </div>

        </div>
      )}

      {/* Units */}
      <div className="units-section">

        <div className="section-header">
          <div>
            <h2>Your Units</h2>
            <p>
              Units currently assigned to you.
            </p>
          </div>

          <span className="unit-count">
            {properties.length}{" "}
            {properties.length === 1 ? "Unit" : "Units"}
          </span>
        </div>

        {properties.length === 0 ? (

          <div className="property-detail-card empty-unit-card">

            <div className="empty-unit-icon">
              🏠
            </div>

            <h3>No unit assigned</h3>

            <p>
              You don't have any unit assigned yet.
            </p>

          </div>

        ) : (

          <div className="units-grid">

            {properties.map((item) => {

              const unit = item.unit;
              const property = item.property;

              return (
                <div
                  className="unit-card"
                  key={unit.id}
                >

                  <div className="unit-card-top">

                    <div className="unit-icon">
                      🏠
                    </div>

                    <span className="unit-status">
                      {unit.status}
                    </span>

                  </div>

                  <div className="unit-card-content">

                    <span className="unit-label">
                      Unit
                    </span>

                    <h3>
                      {unit.unit_number}
                    </h3>

                    <p>
                      {unit.unit_type}
                    </p>

                  </div>

                  <div className="unit-card-footer">

                    <div>
                      <span>
                        Monthly Rent
                      </span>

                      <strong>
                        ₹
                        {Number(
                          unit.monthly_rent || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div className="unit-property-name">

                      <span>Property</span>

                      <strong>
                        {property.name}
                      </strong>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* Tenant Information */}
      <div className="property-detail-card tenant-info-card">

        <div className="detail-card-title">

          <div className="detail-icon green">
            👤
          </div>

          <div>
            <h3>Tenant Information</h3>

            <p>
              Your registered account details
            </p>
          </div>

        </div>

        <div className="tenant-info-grid">

          <div>
            <span>Name</span>

            <strong>
              {tenant.name || "N/A"}
            </strong>
          </div>

          <div>
            <span>Email</span>

            <strong>
              {tenant.email || "N/A"}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
};

export default MyProperty;