from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("/", methods=["GET"])
@jwt_required()
def get_dashboard():
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can view dashboard"
        }), 403

    db = dashboard_bp.db

    # Count owner's properties
    properties_count = db.properties.count_documents({
        "owner_id": current_user_id
    })

    # Get owner's properties
    owner_properties = db.properties.find(
        {"owner_id": current_user_id},
        {"_id": 1}
    )

    property_ids = [str(property["_id"]) for property in owner_properties]

    # Count owner's units
    units_count = db.units.count_documents({
        "property_id": {"$in": property_ids}
    })

    # Count occupied units
    occupied_units = db.units.count_documents({
        "property_id": {"$in": property_ids},
        "status": "occupied"
    })

    # Count tenants
    tenants_count = db.users.count_documents({
        "role": "tenant"
    })

    # Active agreements
    active_agreements = db.rental_agreements.count_documents({
        "owner_id": current_user_id,
        "status": "active"
    })

    # Calculate monthly rent
    agreements = db.rental_agreements.find({
        "owner_id": current_user_id,
        "status": "active"
    })

    monthly_rent = sum(
        agreement.get("monthly_rent", 0)
        for agreement in agreements
    )

    return jsonify({
        "properties": properties_count,
        "units": units_count,
        "tenants": tenants_count,
        "occupied_units": occupied_units,
        "monthly_rent": monthly_rent,
        "active_agreements": active_agreements
    }), 200