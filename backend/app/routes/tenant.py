from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from bson import ObjectId



tenant_bp = Blueprint(
    "tenant",
    __name__,
    url_prefix="/api/tenants"
)


@tenant_bp.route("/", methods=["GET"])
@jwt_required()
def get_tenants():

    claims = get_jwt()

    # Only owners can view tenants
    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can view tenants"
        }), 403

    db = tenant_bp.db

    tenants = db.users.find(
        {"role": "tenant"},
        {
            "name": 1,
            "email": 1
        }
    )

    tenant_list = []

    for tenant in tenants:
        tenant_list.append({
            "id": str(tenant["_id"]),
            "name": tenant["name"],
            "email": tenant["email"]
        })

    return jsonify({
        "tenants": tenant_list
    }), 200



@tenant_bp.route("/assign", methods=["POST"])
@jwt_required()
def assign_tenant():

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Only owner can assign a tenant
    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can assign tenants"
        }), 403

    data = request.get_json()

    property_id = data.get("property_id")
    unit_id = data.get("unit_id")
    tenant_id = data.get("tenant_id")

    if not property_id or not unit_id or not tenant_id:
        return jsonify({
            "message": "property_id, unit_id and tenant_id are required"
        }), 400

    if not ObjectId.is_valid(property_id) or not ObjectId.is_valid(unit_id) or not ObjectId.is_valid(tenant_id):
        return jsonify({
            "message": "Invalid ID"
        }), 400

    db = tenant_bp.db

    # Check property belongs to logged-in owner
    property_data = db.properties.find_one({
        "_id": ObjectId(property_id),
        "owner_id": current_user_id
    })

    if not property_data:
        return jsonify({
            "message": "Property not found"
        }), 404

    # Check unit belongs to this property
    unit = db.units.find_one({
        "_id": ObjectId(unit_id),
        "property_id": property_id
    })

    if not unit:
        return jsonify({
            "message": "Unit not found"
        }), 404

    # Unit must be vacant
    if unit.get("status") != "vacant":
        return jsonify({
            "message": "Unit is not vacant"
        }), 400

    # Check tenant exists and has tenant role
    tenant = db.users.find_one({
        "_id": ObjectId(tenant_id),
        "role": "tenant"
    })

    if not tenant:
        return jsonify({
            "message": "Tenant not found"
        }), 404

    # Assign tenant and change unit status
    db.units.update_one(
        {
            "_id": ObjectId(unit_id)
        },
        {
            "$set": {
                "tenant_id": tenant_id,
                "status": "occupied"
            }
        }
    )

    return jsonify({
        "message": "Tenant assigned successfully"
    }), 200