import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./Tenants.css";

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);

  const [selectedTenant, setSelectedTenant] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Fetch tenants
  const fetchTenants = async () => {
    try {
      const token = getToken();

      const response = await api.get("/tenants/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("TENANTS:", response.data);

      setTenants(response.data.tenants || []);
    } catch (error) {
      console.log(error);

      showMessage(
        error.response?.data?.message || "Failed to load tenants",
        "error"
      );
    }
  };

  // Fetch properties
  const fetchProperties = async () => {
    try {
      const token = getToken();

      const response = await api.get("/properties/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("PROPERTIES:", response.data);

      setProperties(response.data.properties || []);
    } catch (error) {
      console.log(error);

      showMessage(
        error.response?.data?.message || "Failed to load properties",
        "error"
      );
    }
  };

  // Fetch units for selected property
  const fetchUnits = async (propertyId) => {
    if (!propertyId) {
      setUnits([]);
      return;
    }

    try {
      setLoadingUnits(true);

      const token = getToken();

      const response = await api.get(
        `/properties/${propertyId}/units`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("UNITS:", response.data);

      setUnits(response.data.units || []);
    } catch (error) {
      console.log(error);

      showMessage(
        error.response?.data?.message || "Failed to load units",
        "error"
      );

      setUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

  // Show message
  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  // Assign tenant
  const handleAssignTenant = async (e) => {
    e.preventDefault();

    if (!selectedTenant || !selectedUnit) {
      showMessage(
        "Please select a tenant and a vacant unit",
        "error"
      );
      return;
    }

    try {
      setAssigning(true);

      const token = getToken();

      const response = await api.post(
        "/tenants/assign",
        {
          property_id: selectedProperty,
          unit_id: selectedUnit,
          tenant_id: selectedTenant,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("ASSIGN TENANT:", response.data);

      showMessage(
        response.data.message || "Tenant assigned successfully!",
        "success"
      );

      // Reset selections
      setSelectedTenant("");
      setSelectedProperty("");
      setSelectedUnit("");
      setUnits([]);

      // Refresh tenants
      fetchTenants();

      // Refresh properties
      fetchProperties();
    } catch (error) {
      console.log(error);

      showMessage(
        error.response?.data?.message ||
          "Failed to assign tenant",
        "error"
      );
    } finally {
      setAssigning(false);
    }
  };

  // Initial loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchTenants(),
        fetchProperties(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // When property changes
  useEffect(() => {
    setSelectedUnit("");

    if (selectedProperty) {
      fetchUnits(selectedProperty);
    } else {
      setUnits([]);
    }
  }, [selectedProperty]);

  if (loading) {
    return (
      <div className="tenants-page">
        <div className="loading-message">
          Loading tenants...
        </div>
      </div>
    );
  }

  return (
    <div className="tenants-page">

      {/* Header */}
      <div className="tenants-header">
        <div>
          <h1>Tenants</h1>
          <p>
            Manage tenants and assign them to rental units.
          </p>
        </div>
      </div>

      {/* Success / Error Message */}
      {message && (
        <div className={`tenant-message ${messageType}`}>
          <span>
            {messageType === "success" ? "✓" : "!"}
          </span>
          {message}
        </div>
      )}

      {/* Assign Tenant Section */}
      <div className="assign-section">

        <div className="section-heading">
          <h2>Assign Tenant</h2>
          <p>
            Assign a tenant to a vacant unit.
          </p>
        </div>

        <form
          className="assign-form"
          onSubmit={handleAssignTenant}
        >

          {/* Tenant */}
          <div className="form-group">
            <label>Select Tenant</label>

            <select
              value={selectedTenant}
              onChange={(e) =>
                setSelectedTenant(e.target.value)
              }
            >
              <option value="">
                Select a tenant
              </option>

              {tenants.map((tenant) => (
                <option
                  key={tenant.id}
                  value={tenant.id}
                >
                  {tenant.name} - {tenant.email}
                </option>
              ))}
            </select>
          </div>

          {/* Property */}
          <div className="form-group">
            <label>Select Property</label>

            <select
              value={selectedProperty}
              onChange={(e) =>
                setSelectedProperty(e.target.value)
              }
            >
              <option value="">
                Select a property
              </option>

              {properties.map((property) => (
                <option
                  key={property.id}
                  value={property.id}
                >
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div className="form-group">
            <label>Select Vacant Unit</label>

            <select
              value={selectedUnit}
              onChange={(e) =>
                setSelectedUnit(e.target.value)
              }
              disabled={!selectedProperty || loadingUnits}
            >
              <option value="">
                {loadingUnits
                  ? "Loading units..."
                  : "Select a vacant unit"}
              </option>

              {units
                .filter((unit) => unit.status === "vacant")
                .map((unit) => (
                  <option
                    key={unit.id}
                    value={unit.id}
                  >
                    Unit {unit.unit_number} -{" "}
                    {unit.unit_type} - ₹
                    {unit.monthly_rent}
                  </option>
                ))}
            </select>
          </div>

          {/* Assign Button */}
          <button
            type="submit"
            className="assign-button"
            disabled={assigning}
          >
            {assigning
              ? "Assigning..."
              : "Assign Tenant"}
          </button>

        </form>
      </div>

      {/* Tenant List */}
      <div className="tenant-list-section">

        <div className="section-heading">
          <h2>All Tenants</h2>
          <p>
            {tenants.length} tenant
            {tenants.length !== 1 ? "s" : ""} registered.
          </p>
        </div>

        {tenants.length === 0 ? (
          <div className="empty-state">
            <h2>No tenants found</h2>
            <p>
              There are currently no tenants registered.
            </p>
          </div>
        ) : (
          <div className="tenants-grid">

            {tenants.map((tenant) => (
              <div
                className="tenant-card"
                key={tenant.id}
              >

                <div className="tenant-avatar">
                  {tenant.name
                    ? tenant.name
                        .charAt(0)
                        .toUpperCase()
                    : "T"}
                </div>

                <div className="tenant-info">
                  <h2>{tenant.name}</h2>
                  <p>{tenant.email}</p>

                  {tenant.phone && (
                    <p>{tenant.phone}</p>
                  )}
                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default Tenants;