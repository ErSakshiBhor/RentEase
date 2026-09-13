from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from bson import ObjectId
from datetime import datetime


payment_bp = Blueprint(
    "payment",
    __name__,
    url_prefix="/api/payments"
)


# ============================================================
# CREATE / RECORD PAYMENT
# ============================================================

@payment_bp.route("/", methods=["POST"])
@jwt_required()
def create_payment():

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Only owner can record payments
    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can record payments"
        }), 403

    data = request.get_json()

    agreement_id = data.get("agreement_id")
    amount = data.get("amount")
    payment_date = data.get("payment_date")
    payment_method = data.get("payment_method")

    # Validate required fields
    if not all([
        agreement_id,
        amount is not None,
        payment_date,
        payment_method
    ]):
        return jsonify({
            "message": "All payment fields are required"
        }), 400

    # Validate agreement ID
    if not ObjectId.is_valid(agreement_id):
        return jsonify({
            "message": "Invalid agreement ID"
        }), 400

    # Validate amount
    try:
        amount = float(amount)
    except (ValueError, TypeError):
        return jsonify({
            "message": "Amount must be a valid number"
        }), 400

    if amount <= 0:
        return jsonify({
            "message": "Amount must be greater than 0"
        }), 400

    # Validate payment date
    try:
        datetime.strptime(payment_date, "%Y-%m-%d")
    except ValueError:
        return jsonify({
            "message": "Payment date format must be YYYY-MM-DD"
        }), 400

    db = payment_bp.db

    # Find agreement belonging to current owner
    agreement = db.rental_agreements.find_one({
        "_id": ObjectId(agreement_id),
        "owner_id": current_user_id
    })

    if not agreement:
        return jsonify({
            "message": "Agreement not found"
        }), 404

    # Payment can only be recorded for active agreement
    if agreement.get("status") != "active":
        return jsonify({
            "message": "Payment can only be recorded for an active agreement"
        }), 400

    # Create payment record
    payment = {
        "agreement_id": agreement_id,
        "tenant_id": agreement["tenant_id"],
        "unit_id": agreement["unit_id"],
        "owner_id": current_user_id,
        "amount": amount,
        "payment_date": payment_date,
        "payment_method": payment_method,
        "status": "paid",
        "created_at": datetime.utcnow()
    }

    result = db.payments.insert_one(payment)

    return jsonify({
        "message": "Payment recorded successfully",
        "payment_id": str(result.inserted_id)
    }), 201


# ============================================================
# GET ALL PAYMENTS
# ============================================================

@payment_bp.route("/", methods=["GET"])
@jwt_required()
def get_payments():

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Only owner can view payments
    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can view payments"
        }), 403

    db = payment_bp.db

    payments = db.payments.find({
        "owner_id": current_user_id
    }).sort("payment_date", -1)

    result = []

    for payment in payments:

        result.append({
            "id": str(payment["_id"]),
            "agreement_id": payment["agreement_id"],
            "tenant_id": payment["tenant_id"],
            "unit_id": payment["unit_id"],
            "amount": payment["amount"],
            "payment_date": payment["payment_date"],
            "payment_method": payment["payment_method"],
            "status": payment["status"]
        })

    return jsonify({
        "payments": result
    }), 200


# ============================================================
# UPDATE PAYMENT
# ============================================================

@payment_bp.route("/<payment_id>", methods=["PUT"])
@jwt_required()
def update_payment(payment_id):

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Only owner can update payments
    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can update payments"
        }), 403

    # Validate payment ID
    if not ObjectId.is_valid(payment_id):
        return jsonify({
            "message": "Invalid payment ID"
        }), 400

    data = request.get_json()
    db = payment_bp.db

    # Find payment belonging to current owner
    payment = db.payments.find_one({
        "_id": ObjectId(payment_id),
        "owner_id": current_user_id
    })

    if not payment:
        return jsonify({
            "message": "Payment not found"
        }), 404

    update_data = {}

    # Update amount
    if "amount" in data:

        try:
            amount = float(data["amount"])
        except (ValueError, TypeError):
            return jsonify({
                "message": "Amount must be a valid number"
            }), 400

        if amount <= 0:
            return jsonify({
                "message": "Amount must be greater than 0"
            }), 400

        update_data["amount"] = amount

    # Update payment date
    if "payment_date" in data:

        try:
            datetime.strptime(
                data["payment_date"],
                "%Y-%m-%d"
            )
        except ValueError:
            return jsonify({
                "message": "Payment date format must be YYYY-MM-DD"
            }), 400

        update_data["payment_date"] = data["payment_date"]

    # Update payment method
    if "payment_method" in data:

        if not data["payment_method"]:
            return jsonify({
                "message": "Payment method cannot be empty"
            }), 400

        update_data["payment_method"] = data["payment_method"]

    # Update status
    if "status" in data:

        allowed_statuses = [
            "paid",
            "pending"
        ]

        if data["status"] not in allowed_statuses:
            return jsonify({
                "message": "Invalid payment status"
            }), 400

        update_data["status"] = data["status"]

    if not update_data:
        return jsonify({
            "message": "No fields to update"
        }), 400

    db.payments.update_one(
        {
            "_id": ObjectId(payment_id),
            "owner_id": current_user_id
        },
        {
            "$set": update_data
        }
    )

    return jsonify({
        "message": "Payment updated successfully"
    }), 200


# ============================================================
# DELETE PAYMENT
# ============================================================

@payment_bp.route("/<payment_id>", methods=["DELETE"])
@jwt_required()
def delete_payment(payment_id):

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Only owner can delete payments
    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can delete payments"
        }), 403

    # Validate payment ID
    if not ObjectId.is_valid(payment_id):
        return jsonify({
            "message": "Invalid payment ID"
        }), 400

    db = payment_bp.db

    result = db.payments.delete_one({
        "_id": ObjectId(payment_id),
        "owner_id": current_user_id
    })

    if result.deleted_count == 0:
        return jsonify({
            "message": "Payment not found"
        }), 404

    return jsonify({
        "message": "Payment deleted successfully"
    }), 200 