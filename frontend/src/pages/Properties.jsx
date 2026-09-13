import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./Properties.css";

const Properties = () => {
  const [properties, setProperties] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    property_type: "Apartment",
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [toast, setToast] = useState({
  show: false,
  message: "",
  type: "success",
});

const showToast = (message, type = "success") => {
  setToast({
    show: true,
    message,
    type,
  });

  setTimeout(() => {
    setToast({
      show: false,
      message: "",
      type: "success",
    });
  }, 3000);
};

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/properties/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("PROPERTIES:", response.data);

      setProperties(response.data.properties || []);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to fetch properties");
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      property_type: "Apartment",
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (editingId) {
        const response = await api.put(
          `/properties/${editingId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("UPDATE PROPERTY:", response.data);

        showToast("Property updated successfully!");
      } else {
        const response = await api.post("/properties/", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("CREATE PROPERTY:", response.data);

        //alert("Property added successfully!");
        showToast("Property added successfully!");
      }

      resetForm();
      fetchProperties();
    } catch (error) {
      console.log(error);
      showToast(
  error.response?.data?.message || "Failed to save property",
  "error"
);
    }
  };

  const handleEdit = (property) => {
    setFormData({
      name: property.name || "",
      address: property.address || "",
      city: property.city || "",
      state: property.state || "",
      pincode: property.pincode || "",
      property_type: property.property_type || "Apartment",
    });

    setEditingId(property.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (propertyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await api.delete(
        `/properties/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("DELETE PROPERTY:", response.data);

      showToast("Property deleted successfully!");

      fetchProperties();
    } catch (error) {
      console.log(error);
      showToast(
  error.response?.data?.message || "Failed to fetch properties",
  "error"
);
    }
  };

  return (
    <div className="properties-page">
    {toast.show && (
      <div className={`toast-message ${toast.type}`}>
        <span className="toast-icon">
          {toast.type === "success" ? "✓" : "!"}
        </span>

        <span>{toast.message}</span>
      </div>
    )}

      <main className="properties-content">
        <div className="properties-header">
          <div>
            <h1>Properties</h1>
            <p>Manage all your rental properties.</p>
          </div>

          <button
            className="add-property-button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm ? "Cancel" : "+ Add Property"}
          </button>
        </div>

        {showForm && (
          <div className="property-form-card">
            <h2>
              {editingId
                ? "Edit Property"
                : "Add New Property"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group">
                  <label>Property Name</label>

                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Sunrise Residency"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Property Type</label>

                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                  >
                    <option value="Apartment">
                      Apartment
                    </option>

                    <option value="House">
                      House
                    </option>

                    <option value="Villa">
                      Villa
                    </option>

                    <option value="Commercial">
                      Commercial
                    </option>
                  </select>
                </div>

                <div className="input-group full-width">
                  <label>Address</label>

                  <input
                    type="text"
                    name="address"
                    placeholder="Enter property address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>City</label>

                  <input
                    type="text"
                    name="city"
                    placeholder="Pune"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>State</label>

                  <input
                    type="text"
                    name="state"
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Pincode</label>

                  <input
                    type="text"
                    name="pincode"
                    placeholder="411004"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  {editingId
                    ? "Update Property"
                    : "Save Property"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="property-list">
          {properties.length === 0 ? (
            <div className="empty-state">
              <h3>No properties found</h3>

              <p>
                Add your first property to get started.
              </p>
            </div>
          ) : (
            properties.map((property) => (
              <div
                className="property-card"
                key={property.id}
              >
                <div className="property-icon">
                  🏢
                </div>

                <div className="property-info">
                  <h2>{property.name}</h2>

                  <p>{property.address}</p>

                  <span>
                    {property.city}, {property.state} -{" "}
                    {property.pincode}
                  </span>
                </div>

                <div className="property-type">
                  {property.property_type}
                </div>

                <div className="property-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(property)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      handleDelete(property.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Properties;