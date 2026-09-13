import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./Agreements.css";

const Agreements = () => {
    const [agreements, setAgreements] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [properties, setProperties] = useState([]);
    const [units, setUnits] = useState([]);

    const [selectedTenant, setSelectedTenant] = useState("");
    const [selectedProperty, setSelectedProperty] = useState("");
    const [selectedUnit, setSelectedUnit] = useState("");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [monthlyRent, setMonthlyRent] = useState("");
    const [securityDeposit, setSecurityDeposit] = useState("");

    const [loading, setLoading] = useState(true);
    const [loadingUnits, setLoadingUnits] = useState(false);
    const [creating, setCreating] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    // Edit Agreement states
    const [editingId, setEditingId] = useState(null);

    const [editMonthlyRent, setEditMonthlyRent] = useState("");
    const [editSecurityDeposit, setEditSecurityDeposit] = useState("");
    const [editStartDate, setEditStartDate] = useState("");
    const [editEndDate, setEditEndDate] = useState("");

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // Show success/error message
    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);

        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 3000);
    };

    // Fetch existing agreements
    const fetchAgreements = async () => {
        try {
            const token = getToken();

            const response = await api.get("/agreements/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("AGREEMENTS:", response.data);

            setAgreements(response.data.agreements || []);
        } catch (error) {
            console.log(error);

            showMessage(
                error.response?.data?.message ||
                "Failed to load agreements",
                "error"
            );
        }
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
                error.response?.data?.message ||
                "Failed to load tenants",
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
                error.response?.data?.message ||
                "Failed to load properties",
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
                error.response?.data?.message ||
                "Failed to load units",
                "error"
            );

            setUnits([]);
        } finally {
            setLoadingUnits(false);
        }
    };

    // Create agreement
    const handleCreateAgreement = async (e) => {
        e.preventDefault();

        if (
            !selectedTenant ||
            !selectedProperty ||
            !selectedUnit ||
            !startDate ||
            !endDate ||
            !monthlyRent ||
            !securityDeposit
        ) {
            showMessage(
                "Please fill all agreement details",
                "error"
            );
            return;
        }

        try {
            setCreating(true);

            const token = getToken();

            const response = await api.post(
                "/agreements/",
                {
                    unit_id: selectedUnit,
                    tenant_id: selectedTenant,
                    start_date: startDate,
                    end_date: endDate,
                    monthly_rent: Number(monthlyRent),
                    security_deposit: Number(securityDeposit),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("CREATE AGREEMENT:", response.data);

            showMessage(
                response.data.message ||
                "Agreement created successfully!",
                "success"
            );

            // Reset form
            setSelectedTenant("");
            setSelectedProperty("");
            setSelectedUnit("");
            setStartDate("");
            setEndDate("");
            setMonthlyRent("");
            setSecurityDeposit("");
            setUnits([]);

            // Refresh agreements
            fetchAgreements();

        } catch (error) {
            console.log(error);

            showMessage(
                error.response?.data?.message ||
                "Failed to create agreement",
                "error"
            );
        } finally {
            setCreating(false);
        }
    };

    // When property changes
    useEffect(() => {
        setSelectedUnit("");

        if (selectedProperty) {
            fetchUnits(selectedProperty);
        } else {
            setUnits([]);
        }
    }, [selectedProperty]);

    // Automatically fill rent when unit selected
    useEffect(() => {
        if (selectedUnit) {
            const selectedUnitData = units.find(
                (unit) => unit.id === selectedUnit
            );

            if (selectedUnitData) {
                setMonthlyRent(
                    selectedUnitData.monthly_rent || ""
                );
            }
        }
    }, [selectedUnit, units]);

    // Initial data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            await Promise.all([
                fetchAgreements(),
                fetchTenants(),
                fetchProperties(),
            ]);

            setLoading(false);
        };

        loadData();
    }, []);

    // Edit agreement
    const handleEdit = (agreement) => {
        setEditingId(agreement.id);

        setEditMonthlyRent(agreement.monthly_rent);
        setEditSecurityDeposit(agreement.security_deposit);
        setEditStartDate(agreement.start_date);
        setEditEndDate(agreement.end_date);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Update agreement
    const handleUpdateAgreement = async (e) => {
        e.preventDefault();

        if (
            !editMonthlyRent ||
            !editSecurityDeposit ||
            !editStartDate ||
            !editEndDate
        ) {
            showMessage(
                "Please fill all agreement details",
                "error"
            );
            return;
        }

        try {
            const token = getToken();

            const response = await api.put(
                `/agreements/${editingId}`,
                {
                    monthly_rent: Number(editMonthlyRent),
                    security_deposit: Number(editSecurityDeposit),
                    start_date: editStartDate,
                    end_date: editEndDate,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("UPDATE AGREEMENT:", response.data);

            showMessage(
                response.data.message ||
                "Agreement updated successfully!",
                "success"
            );

            // Reset edit form
            setEditingId(null);
            setEditMonthlyRent("");
            setEditSecurityDeposit("");
            setEditStartDate("");
            setEditEndDate("");

            // Refresh agreements
            fetchAgreements();

        } catch (error) {
            console.log(error);

            showMessage(
                error.response?.data?.message ||
                "Failed to update agreement",
                "error"
            );
        }
    };

    // Terminate agreement
    const handleTerminate = async (agreementId) => {
        const confirmed = window.confirm(
            "Are you sure you want to terminate this agreement?"
        );

        if (!confirmed) return;

        try {
            const token = getToken();

            const response = await api.put(
                `/agreements/${agreementId}/terminate`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("TERMINATE AGREEMENT:", response.data);

            showMessage(
                response.data.message ||
                "Agreement terminated successfully!",
                "success"
            );

            // Refresh agreements
            fetchAgreements();

        } catch (error) {
            console.log(error);

            showMessage(
                error.response?.data?.message ||
                "Failed to terminate agreement",
                "error"
            );
        }
    };

    if (loading) {
        return (
            <div className="agreements-page">
                <div className="loading-message">
                    Loading agreements...
                </div>
            </div>
        );
    }

    return (
        <div className="agreements-page">

            {/* Header */}
            <div className="agreements-header">
                <div>
                    <h1>Rental Agreements</h1>
                    <p>
                        Create and manage rental agreements for your
                        properties.
                    </p>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`agreement-message ${messageType}`}
                >
                    <span>
                        {messageType === "success" ? "✓" : "!"}
                    </span>
                    {message}
                </div>
            )}

            {/* Edit Agreement */}
            {editingId && (
                <div className="edit-agreement-section">

                    <div className="section-heading">
                        <h2>Edit Agreement</h2>
                        <p>
                            Update the selected rental agreement.
                        </p>
                    </div>

                    <form
                        className="agreement-form"
                        onSubmit={handleUpdateAgreement}
                    >

                        {/* Start Date */}
                        <div className="form-group">
                            <label>Start Date</label>

                            <input
                                type="date"
                                value={editStartDate}
                                onChange={(e) =>
                                    setEditStartDate(e.target.value)
                                }
                            />
                        </div>

                        {/* End Date */}
                        <div className="form-group">
                            <label>End Date</label>

                            <input
                                type="date"
                                value={editEndDate}
                                onChange={(e) =>
                                    setEditEndDate(e.target.value)
                                }
                            />
                        </div>

                        {/* Monthly Rent */}
                        <div className="form-group">
                            <label>Monthly Rent</label>

                            <input
                                type="number"
                                value={editMonthlyRent}
                                onChange={(e) =>
                                    setEditMonthlyRent(e.target.value)
                                }
                            />
                        </div>

                        {/* Security Deposit */}
                        <div className="form-group">
                            <label>Security Deposit</label>

                            <input
                                type="number"
                                value={editSecurityDeposit}
                                onChange={(e) =>
                                    setEditSecurityDeposit(e.target.value)
                                }
                            />
                        </div>

                        {/* Edit Buttons */}
                        <div className="edit-form-actions">

                            <button
                                type="submit"
                                className="update-agreement-button"
                            >
                                Update Agreement
                            </button>

                            <button
                                type="button"
                                className="cancel-edit-button"
                                onClick={() => {
                                    setEditingId(null);
                                    setEditMonthlyRent("");
                                    setEditSecurityDeposit("");
                                    setEditStartDate("");
                                    setEditEndDate("");
                                }}
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </div>
            )}

            {/* Create Agreement */}
            <div className="create-agreement-section">

                <div className="section-heading">
                    <h2>Create Agreement</h2>
                    <p>
                        Create a rental agreement for an occupied unit.
                    </p>
                </div>

                <form
                    className="agreement-form"
                    onSubmit={handleCreateAgreement}
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

                    {/* Occupied Unit */}
                    <div className="form-group">
                        <label>Select Occupied Unit</label>

                        <select
                            value={selectedUnit}
                            onChange={(e) =>
                                setSelectedUnit(e.target.value)
                            }
                            disabled={
                                !selectedProperty ||
                                loadingUnits
                            }
                        >
                            <option value="">
                                {loadingUnits
                                    ? "Loading units..."
                                    : "Select an occupied unit"}
                            </option>

                            {units
                                .filter(
                                    (unit) =>
                                        unit.status === "occupied"
                                )
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

                    {/* Start Date */}
                    <div className="form-group">
                        <label>Start Date</label>

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) =>
                                setStartDate(e.target.value)
                            }
                        />
                    </div>

                    {/* End Date */}
                    <div className="form-group">
                        <label>End Date</label>

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) =>
                                setEndDate(e.target.value)
                            }
                        />
                    </div>

                    {/* Monthly Rent */}
                    <div className="form-group">
                        <label>Monthly Rent</label>

                        <input
                            type="number"
                            placeholder="Enter monthly rent"
                            value={monthlyRent}
                            onChange={(e) =>
                                setMonthlyRent(e.target.value)
                            }
                        />
                    </div>

                    {/* Security Deposit */}
                    <div className="form-group">
                        <label>Security Deposit</label>

                        <input
                            type="number"
                            placeholder="Enter security deposit"
                            value={securityDeposit}
                            onChange={(e) =>
                                setSecurityDeposit(e.target.value)
                            }
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="create-agreement-button"
                        disabled={creating}
                    >
                        {creating
                            ? "Creating..."
                            : "Create Agreement"}
                    </button>

                </form>
            </div>

            {/* Existing Agreements */}
            <div className="existing-agreements">

                <div className="section-heading">
                    <h2>All Agreements</h2>
                    <p>
                        {agreements.length} agreement
                        {agreements.length !== 1 ? "s" : ""} found.
                    </p>
                </div>

                {agreements.length === 0 ? (
                    <div className="empty-state">
                        <h2>No agreements found</h2>
                        <p>
                            Create a rental agreement to see it here.
                        </p>
                    </div>
                ) : (
                    <div className="agreements-grid">

                        {agreements.map((agreement) => (
                            <div
                                className="agreement-card"
                                key={agreement.id}
                            >

                                {/* Agreement Header */}
                                <div className="agreement-top">

                                    <h2>
                                        Agreement #
                                        {agreement.id.slice(-6)}
                                    </h2>

                                    <span
                                        className={`status-badge ${agreement.status}`}
                                    >
                                        {agreement.status}
                                    </span>

                                </div>

                                {/* Agreement Details */}
                                <div className="agreement-details">

                                    <div>
                                        <span>Monthly Rent</span>
                                        <strong>
                                            ₹{agreement.monthly_rent}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Security Deposit</span>
                                        <strong>
                                            ₹{agreement.security_deposit}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Start Date</span>
                                        <strong>
                                            {agreement.start_date}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>End Date</span>
                                        <strong>
                                            {agreement.end_date}
                                        </strong>
                                    </div>

                                </div>

                                {/* Agreement Actions */}
                                {agreement.status === "active" && (
                                    <div className="agreement-actions">

                                        <button
                                            className="edit-agreement-button"
                                            onClick={() =>
                                                handleEdit(agreement)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="terminate-agreement-button"
                                            onClick={() =>
                                                handleTerminate(
                                                    agreement.id
                                                )
                                            }
                                        >
                                            Terminate
                                        </button>

                                    </div>
                                )}

                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
};

export default Agreements;