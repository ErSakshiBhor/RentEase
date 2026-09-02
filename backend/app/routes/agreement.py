from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from bson import ObjectId
from datetime import datetime


agreement_bp = Blueprint(
    "agreement",
    __name__,
    url_prefix="/api/agreements"
)


@agreement_bp.route("/", methods=["POST"])
@jwt_required()
def create_agreement():

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Only owner can create an agreement
    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can create agreements"
        }), 403

    data = request.get_json()

    unit_id = data.get("unit_id")
    tenant_id = data.get("tenant_id")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    monthly_rent = data.get("monthly_rent")
    security_deposit = data.get("security_deposit")

    if not all([
        unit_id,
        tenant_id,
        start_date,
        end_date,
        monthly_rent is not None,
        security_deposit is not None
    ]):
        return jsonify({
            "message": "All fields are required"
        }), 400

    # Validate IDs
    if not ObjectId.is_valid(unit_id) or not ObjectId.is_valid(tenant_id):
        return jsonify({
            "message": "Invalid ID"
        }), 400

    db = agreement_bp.db

    # Find unit
    unit = db.units.find_one({
        "_id": ObjectId(unit_id)
    })

    if not unit:
        return jsonify({
            "message": "Unit not found"
        }), 404

    # Check unit belongs to owner's property
    property_data = db.properties.find_one({
        "_id": ObjectId(unit["property_id"]),
        "owner_id": current_user_id
    })

    if not property_data:
        return jsonify({
            "message": "You are not allowed to create an agreement for this unit"
        }), 403

    # Unit must be occupied
    if unit.get("status") != "occupied":
        return jsonify({
            "message": "Unit is not occupied"
        }), 400

    # Check tenant exists
    tenant = db.users.find_one({
        "_id": ObjectId(tenant_id),
        "role": "tenant"
    })

    if not tenant:
        return jsonify({
            "message": "Tenant not found"
        }), 404

    # Check tenant is assigned to this unit
    if unit.get("tenant_id") != tenant_id:
        return jsonify({
            "message": "Tenant is not assigned to this unit"
        }), 400

    # Validate dates
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        return jsonify({
            "message": "Date format must be YYYY-MM-DD"
        }), 400

    if end <= start:
        return jsonify({
            "message": "End date must be after start date"
        }), 400

    # Create agreement
    agreement = {
        "unit_id": unit_id,
        "tenant_id": tenant_id,
        "owner_id": current_user_id,
        "start_date": start_date,
        "end_date": end_date,
        "monthly_rent": monthly_rent,
        "security_deposit": security_deposit,
        "status": "active"
    }

    result = db.rental_agreements.insert_one(agreement)

    return jsonify({
        "message": "Rental agreement created successfully",
        "agreement_id": str(result.inserted_id)
    }), 201