import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./Payments.css";

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [agreements, setAgreements] = useState([]);

    const [selectedTenant, setSelectedTenant] = useState("");
    const [selectedAgreement, setSelectedAgreement] = useState("");
    const [amount, setAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    // Edit states
    const [editingId, setEditingId] = useState(null);
    const [editAmount, setEditAmount] = useState("");
    const [editPaymentDate, setEditPaymentDate] = useState("");
    const [editPaymentMethod, setEditPaymentMethod] = useState("");
    const [editStatus, setEditStatus] = useState("");

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

    // Fetch payments
    const fetchPayments = async () => {
        try {
            const token = getToken();

            const response = await api.get("/payments/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("PAYMENTS:", response.data);

            setPayments(response.data.payments || []);
        } catch (error) {
            console.log(error);

            showMessage(
                error.response?.data?.message ||
                "Failed to load payments",
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

    // Fetch agreements
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

    // Initial data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            await Promise.all([
                fetchPayments(),
                fetchTenants(),
                fetchAgreements(),
            ]);

            setLoading(false);
        };

        loadData();
    }, []);

    // Automatically fill tenant and rent when agreement is selected
    useEffect(() => {
        if (selectedAgreement) {
            const agreement = agreements.find(
                (item) => item.id === selectedAgreement
            );

            if (agreement) {
                setSelectedTenant(agreement.tenant_id);
                setAmount(agreement.monthly_rent);
            }
        }
    }, [selectedAgreement, agreements]);

    // Record payment
    const handleRecordPayment = async (e) => {
        e.preventDefault();

        if (
            !selectedAgreement ||
            !amount ||
            !paymentDate ||
            !paymentMethod
        ) {
            showMessage(
                "Please fill all payment details",
                "error"
            );
            return;
        }

        try {
            setSaving(true);

            const token = getToken();

            const response = await api.post(
                "/payments/",
                {
                    agreement_id: selectedAgreement,
                    amount: Number(amount),
                    payment_date: paymentDate,
                    payment_method: paymentMethod,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("CREATE PAYMENT:", response.data);

            showMessage(
                response.data.message ||
                "Payment recorded successfully!",
                "success"
            );

            // Reset form
            setSelectedTenant("");
            setSelectedAgreement("");
            setAmount("");
            setPaymentDate("");
            setPaymentMethod("");

            // Refresh payments
            fetchPayments();

        } catch (error) {
            console.log(error);

            showMessage(
                error.response?.data?.message ||
                "Failed to record payment",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    // Edit payment
    const handleEdit = (payment) => {
        setEditingId(payment.id);
        setEditAmount(payment.amount);
        setEditPaymentDate(payment.payment_date);
        setEditPaymentMethod(payment.payment_method);
        setEditStatus(payment.status);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Update payment
    const handleUpdatePayment = async (e) => {
        e.preventDefault();

        if (
            !editAmount ||
            !editPaymentDate ||
            !editPaymentMethod ||
            !editStatus
        ) {
            showMessage(
                "Please fill all payment details",
                "error"
            );
            return;
        }

        try {
            const token = getToken();

            const response = await api.put(
                `/payments/${editingId}`,
                {
                    amount: Number(editAmount),
                    payment_date: editPaymentDate,
                    payment_method: editPaymentMethod,
                    status: editStatus,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("UPDATE PAYMENT:", response.data);

            showMessage(
                response.data.message ||
                "Payment updated successfully!",
                "success"
            );

            // Reset edit form
            setEditingId(null);
            setEditAmount("");
            setEditPaymentDate("");
            setEditPaymentMethod("");
            setEditStatus("");

            fetchPayments();

        } catch (error) {
            console.log(error);

            showMessage(
                error.response?.data?.message ||
                "Failed to update payment",
                "error"
            );
        }
    };

    // Delete payment
    const handleDelete = async (paymentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this payment?"
        );

        if (!confirmed) return;

        try {
            const token = getToken();

            const response = await api.delete(
                `/payments/${paymentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("DELETE PAYMENT:", response.data);

            showMessage(
                response.data.message ||
                "Payment deleted successfully!",
                "success"
            );

            fetchPayments();

        } catch (error) {
            console.log(error);

            showMessage(
                error.response?.data?.message ||
                "Failed to delete payment",
                "error"
            );
        }
    };

    // Find tenant name
    const getTenantName = (tenantId) => {
        const tenant = tenants.find(
            (item) => item.id === tenantId
        );

        if (!tenant) {
            return "Unknown Tenant";
        }

        return `${tenant.name} - ${tenant.email}`;
    };

    if (loading) {
        return (
            <div className="payments-page">
                <div className="loading-message">
                    Loading payments...
                </div>
            </div>
        );
    }

    return (
        <div className="payments-page">

            {/* Header */}
            <div className="payments-header">
                <div>
                    <h1>Payments</h1>
                    <p>
                        Record and manage rental payments.
                    </p>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`payment-message ${messageType}`}
                >
                    <span>
                        {messageType === "success" ? "✓" : "!"}
                    </span>

                    {message}
                </div>
            )}

            {/* Edit Payment */}
            {editingId && (
                <div className="edit-payment-section">

                    <div className="section-heading">
                        <h2>Edit Payment</h2>
                        <p>
                            Update the selected payment details.
                        </p>
                    </div>

                    <form
                        className="payment-form"
                        onSubmit={handleUpdatePayment}
                    >

                        {/* Amount */}
                        <div className="form-group">
                            <label>Amount</label>

                            <input
                                type="number"
                                value={editAmount}
                                onChange={(e) =>
                                    setEditAmount(e.target.value)
                                }
                            />
                        </div>

                        {/* Payment Date */}
                        <div className="form-group">
                            <label>Payment Date</label>

                            <input
                                type="date"
                                value={editPaymentDate}
                                onChange={(e) =>
                                    setEditPaymentDate(e.target.value)
                                }
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="form-group">
                            <label>Payment Method</label>

                            <select
                                value={editPaymentMethod}
                                onChange={(e) =>
                                    setEditPaymentMethod(e.target.value)
                                }
                            >
                                <option value="">
                                    Select payment method
                                </option>

                                <option value="UPI">
                                    UPI
                                </option>

                                <option value="Cash">
                                    Cash
                                </option>

                                <option value="Bank Transfer">
                                    Bank Transfer
                                </option>

                                <option value="Card">
                                    Card
                                </option>
                            </select>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>

                            <select
                                value={editStatus}
                                onChange={(e) =>
                                    setEditStatus(e.target.value)
                                }
                            >
                                <option value="paid">
                                    Paid
                                </option>

                                <option value="pending">
                                    Pending
                                </option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="edit-form-actions">

                            <button
                                type="submit"
                                className="update-payment-button"
                            >
                                Update Payment
                            </button>

                            <button
                                type="button"
                                className="cancel-payment-button"
                                onClick={() => {
                                    setEditingId(null);
                                    setEditAmount("");
                                    setEditPaymentDate("");
                                    setEditPaymentMethod("");
                                    setEditStatus("");
                                }}
                            >
                                Cancel
                            </button>

                        </div>

                    </form>
                </div>
            )}

            {/* Record Payment */}
            <div className="record-payment-section">

                <div className="section-heading">
                    <h2>Record Payment</h2>
                    <p>
                        Record a rent payment received from a tenant.
                    </p>
                </div>

                <form
                    className="payment-form"
                    onSubmit={handleRecordPayment}
                >

                    {/* Agreement */}
                    <div className="form-group">
                        <label>Select Agreement</label>

                        <select
                            value={selectedAgreement}
                            onChange={(e) =>
                                setSelectedAgreement(e.target.value)
                            }
                        >
                            <option value="">
                                Select an agreement
                            </option>

                            {agreements
                                .filter(
                                    (agreement) =>
                                        agreement.status === "active"
                                )
                                .map((agreement) => (
                                    <option
                                        key={agreement.id}
                                        value={agreement.id}
                                    >
                                        Agreement #
                                        {agreement.id.slice(-6)}
                                        {" - ₹"}
                                        {agreement.monthly_rent}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Tenant */}
                    <div className="form-group">
                        <label>Tenant</label>

                        <input
                            type="text"
                            value={
                                selectedTenant
                                    ? getTenantName(selectedTenant)
                                    : ""
                            }
                            placeholder="Tenant will appear here"
                            readOnly
                        />
                    </div>

                    {/* Amount */}
                    <div className="form-group">
                        <label>Amount</label>

                        <input
                            type="number"
                            placeholder="Enter payment amount"
                            value={amount}
                            onChange={(e) =>
                                setAmount(e.target.value)
                            }
                        />
                    </div>

                    {/* Payment Date */}
                    <div className="form-group">
                        <label>Payment Date</label>

                        <input
                            type="date"
                            value={paymentDate}
                            onChange={(e) =>
                                setPaymentDate(e.target.value)
                            }
                        />
                    </div>

                    {/* Payment Method */}
                    <div className="form-group">
                        <label>Payment Method</label>

                        <select
                            value={paymentMethod}
                            onChange={(e) =>
                                setPaymentMethod(e.target.value)
                            }
                        >
                            <option value="">
                                Select payment method
                            </option>

                            <option value="UPI">
                                UPI
                            </option>

                            <option value="Cash">
                                Cash
                            </option>

                            <option value="Bank Transfer">
                                Bank Transfer
                            </option>

                            <option value="Card">
                                Card
                            </option>
                        </select>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="record-payment-button"
                        disabled={saving}
                    >
                        {saving
                            ? "Recording..."
                            : "Record Payment"}
                    </button>

                </form>
            </div>

            {/* Payment History */}
            <div className="payment-history-section">

                <div className="section-heading">
                    <h2>Payment History</h2>

                    <p>
                        {payments.length} payment
                        {payments.length !== 1 ? "s" : ""} found.
                    </p>
                </div>

                {payments.length === 0 ? (
                    <div className="empty-state">
                        <h2>No payments found</h2>

                        <p>
                            Record a payment to see it here.
                        </p>
                    </div>
                ) : (
                    <div className="payments-grid">

                        {payments.map((payment) => (
                            <div
                                className="payment-card"
                                key={payment.id}
                            >

                                <div className="payment-top">

                                    <h2>
                                        Payment #
                                        {payment.id.slice(-6)}
                                    </h2>

                                    <span
                                        className={`payment-status ${payment.status}`}
                                    >
                                        {payment.status}
                                    </span>

                                </div>

                                <div className="payment-details">

                                    <div>
                                        <span>Tenant</span>

                                        <strong>
                                            {getTenantName(
                                                payment.tenant_id
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Amount</span>

                                        <strong>
                                            ₹{payment.amount}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Payment Date</span>

                                        <strong>
                                            {payment.payment_date}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Payment Method</span>

                                        <strong>
                                            {payment.payment_method}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Agreement</span>

                                        <strong>
                                            #
                                            {payment.agreement_id.slice(-6)}
                                        </strong>
                                    </div>

                                </div>

                                {/* Actions */}
                                <div className="payment-actions">

                                    <button
                                        className="edit-payment-button"
                                        onClick={() =>
                                            handleEdit(payment)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="delete-payment-button"
                                        onClick={() =>
                                            handleDelete(payment.id)
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
};

export default Payments;