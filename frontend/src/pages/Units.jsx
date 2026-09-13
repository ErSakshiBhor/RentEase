import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./Units.css";

const Units = () => {
    const [properties, setProperties] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState("");
    const [units, setUnits] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    

    const [formData, setFormData] = useState({
        unit_number: "",
        unit_type: "1BHK",
        monthly_rent: "",
        status: "vacant",
    });

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

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // Fetch all properties
    const fetchProperties = async () => {
        try {
            const response = await api.get("/properties/", {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            const propertyList = response.data.properties || [];

            setProperties(propertyList);

            // Select first property automatically
            if (propertyList.length > 0 && !selectedProperty) {
                setSelectedProperty(propertyList[0].id);
            }
        } catch (error) {
            console.log(error);

            showToast(
                error.response?.data?.message ||
                "Failed to fetch properties",
                "error"
            );
        }
    };

    // Fetch units of selected property
    const fetchUnits = async (propertyId) => {
        if (!propertyId) {
            setUnits([]);
            return;
        }

        try {
            const response = await api.get(
                `/properties/${propertyId}/units`,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );

            console.log("UNITS:", response.data);

            setUnits(response.data.units || []);
        } catch (error) {
            console.log(error);

            showToast(
                error.response?.data?.message ||
                "Failed to fetch units",
                "error"
            );
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        if (selectedProperty) {
            fetchUnits(selectedProperty);
        }
    }, [selectedProperty]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const resetForm = () => {
        setFormData({
            unit_number: "",
            unit_type: "1BHK",
            monthly_rent: "",
            status: "vacant",
        });
        
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProperty) {
        showToast("Please select a property", "error");
        return;
    }

    try {
        const token = getToken();

        if (editingId) {
            // UPDATE UNIT
            
            console.log("UPDATE DATA:", {
    unit_number: formData.unit_number,
    unit_type: formData.unit_type,
    monthly_rent: Number(formData.monthly_rent),
    status: formData.status,
});

            const response = await api.put(
                `/properties/units/${editingId}`,
                {
                    unit_number: formData.unit_number,
                    unit_type: formData.unit_type,
                    monthly_rent: Number(formData.monthly_rent),
                    status: formData.status,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("UPDATE UNIT:", response.data);

            showToast("Unit updated successfully!");
        } else {
            // CREATE UNIT
            const response = await api.post(
                `/properties/${selectedProperty}/units`,
                {
                    unit_number: formData.unit_number,
                    unit_type: formData.unit_type,
                    monthly_rent: Number(formData.monthly_rent),
                    status: formData.status,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("CREATE UNIT:", response.data);

            showToast("Unit added successfully!");
        }

        resetForm();

        fetchUnits(selectedProperty);

    } catch (error) {
        console.log(error);

        showToast(
            error.response?.data?.message ||
            "Failed to save unit",
            "error"
        );
    }
};

    const handleEdit = (unit) => {
        console.log("EDIT UNIT:", unit);

        setFormData({
            unit_number: unit.unit_number || "",
            unit_type: unit.unit_type || "1BHK",
            monthly_rent: unit.monthly_rent || "",
            status: unit.status || "vacant",
        });

        setEditingId(unit.id);
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    const handleDelete = async (unitId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this unit?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = getToken();

            const response = await api.delete(
                `/properties/units/${unitId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("DELETE UNIT:", response.data);

            showToast("Unit deleted successfully!");

            fetchUnits(selectedProperty);
        } catch (error) {
            console.log(error);

            showToast(
                error.response?.data?.message ||
                "Failed to delete unit",
                "error"
            );
        }
    };


    return (
        <div className="units-page">

            {toast.show && (
                <div className={`toast-message ${toast.type}`}>
                    <span className="toast-icon">
                        {toast.type === "success" ? "✓" : "!"}
                    </span>

                    <span>{toast.message}</span>
                </div>
            )}

            <main className="units-content">

                <div className="units-header">
                    <div>
                        <h1>Units</h1>
                        <p>
                            Manage units inside your rental properties.
                        </p>
                    </div>

                    <button
                        className="add-unit-button"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? "Cancel" : "+ Add Unit"}
                    </button>
                </div>

                {/* Property Selection */}

                <div className="property-selector-card">
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

                {/* Add Unit Form */}

                {showForm && (
                    <div className="unit-form-card">

                        <h2>
    {editingId ? "Edit Unit" : "Add New Unit"}
</h2>

                        <form onSubmit={handleSubmit}>

                            <div className="form-grid">

                                <div className="input-group">
                                    <label>Unit Number</label>

                                    <input
                                        type="text"
                                        name="unit_number"
                                        placeholder="e.g. 102"
                                        value={formData.unit_number}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Unit Type</label>

                                    <select
                                        name="unit_type"
                                        value={formData.unit_type}
                                        onChange={handleChange}
                                    >
                                        <option value="1BHK">1BHK</option>
                                        <option value="2BHK">2BHK</option>
                                        <option value="3BHK">3BHK</option>
                                        <option value="4BHK">4BHK</option>
                                        <option value="Studio">Studio</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label>Monthly Rent</label>

                                    <input
                                        type="number"
                                        name="monthly_rent"
                                        placeholder="20000"
                                        value={formData.monthly_rent}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Status</label>

                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="vacant">
                                            Vacant
                                        </option>

                                        <option value="occupied">
                                            Occupied
                                        </option>
                                    </select>
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
                                   {editingId ? "Update Unit" : "Save Unit"} 
                                </button>

                            </div>

                        </form>
                    </div>
                )}

                {/* Units List */}

                <div className="units-list">

                    {!selectedProperty ? (
                        <div className="empty-state">
                            <h3>Select a property</h3>
                            <p>
                                Select a property to view its units.
                            </p>
                        </div>
                    ) : units.length === 0 ? (
                        <div className="empty-state">
                            <h3>No units found</h3>
                            <p>
                                Add a unit to this property to get started.
                            </p>
                        </div>
                    ) : (
                        units.map((unit) => (
                            <div
                                className="unit-card"
                                key={unit.id}
                            >

                                <div className="unit-icon">
                                    🏠
                                </div>

                                <div className="unit-info">
                                    <h2>
                                        Unit {unit.unit_number}
                                    </h2>

                                    <p>
                                        {unit.unit_type}
                                    </p>
                                </div>

                                <div className="unit-rent">
                                    <span>Monthly Rent</span>

                                    <strong>
                                        ₹{Number(unit.monthly_rent).toLocaleString()}
                                    </strong>
                                </div>

                                <div
                                    className={`unit-status ${unit.status
                                        }`}
                                >
                                    {unit.status}
                                </div>

                                <div className="unit-actions">

                                    <button
                                        className="edit-button"
                                        onClick={() => handleEdit(unit)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(unit.id)}
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

export default Units;