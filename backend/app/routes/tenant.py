from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from bson import ObjectId


tenant_bp = Blueprint(
    "tenant",
    __name__,
    url_prefix="/api/tenants"
)


# ==========================================
# Get All Tenants
# ==========================================

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


# ==========================================
# Assign Tenant to Unit
# ==========================================

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

    if (
        not ObjectId.is_valid(property_id)
        or not ObjectId.is_valid(unit_id)
        or not ObjectId.is_valid(tenant_id)
    ):
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

    # Check unit belongs to selected property
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

    # Check tenant exists
    tenant = db.users.find_one({
        "_id": ObjectId(tenant_id),
        "role": "tenant"
    })

    if not tenant:
        return jsonify({
            "message": "Tenant not found"
        }), 404

    # Assign tenant to unit
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


# ==========================================
# Tenant Dashboard
# ==========================================

@tenant_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def tenant_dashboard():

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Only tenants can access tenant dashboard
    if claims.get("role") != "tenant":
        return jsonify({
            "message": "Only tenants can view this dashboard"
        }), 403

    db = tenant_bp.db

    # ==========================================
    # Find Tenant
    # ==========================================

    tenant = db.users.find_one({
        "_id": ObjectId(current_user_id),
        "role": "tenant"
    })

    if not tenant:
        return jsonify({
            "message": "Tenant not found"
        }), 404

    # ==========================================
    # Find One Assigned Unit
    # ==========================================

    unit = db.units.find_one({
        "tenant_id": current_user_id
    })

    if not unit:
        return jsonify({
            "tenant": {
                "name": tenant.get("name", ""),
                "email": tenant.get("email", "")
            },
            "message": "No unit assigned yet"
        }), 200

    # ==========================================
    # Find Property
    # ==========================================

    property_data = db.properties.find_one({
        "_id": ObjectId(unit["property_id"])
    })

    # ==========================================
    # Find Active Agreement
    # ==========================================

    agreement = db.rental_agreements.find_one({
        "tenant_id": current_user_id,
        "unit_id": str(unit["_id"]),
        "status": "active"
    })

    # ==========================================
    # Find Recent Payments
    # ==========================================

    payments_data = db.payments.find({
        "tenant_id": current_user_id
    }).sort(
        "payment_date",
        -1
    ).limit(5)

    recent_payments = []

    for payment in payments_data:

        recent_payments.append({
            "amount": payment.get(
                "amount",
                0
            ),
            "payment_date": payment.get(
                "payment_date"
            ),
            "payment_method": payment.get(
                "payment_method",
                "N/A"
            ),
            "status": payment.get(
                "status",
                "pending"
            )
        })

    # ==========================================
    # Dashboard Response
    # ==========================================

    return jsonify({

        "tenant": {
            "name": tenant.get(
                "name",
                ""
            ),
            "email": tenant.get(
                "email",
                ""
            )
        },

        "property": {
            "name": (
                property_data.get(
                    "name",
                    ""
                )
                if property_data
                else ""
            ),
            "address": (
                property_data.get(
                    "address",
                    ""
                )
                if property_data
                else ""
            ),
            "city": (
                property_data.get(
                    "city",
                    ""
                )
                if property_data
                else ""
            ),
            "state": (
                property_data.get(
                    "state",
                    ""
                )
                if property_data
                else ""
            ),
            "pincode": (
                property_data.get(
                    "pincode",
                    ""
                )
                if property_data
                else ""
            )
        },

        "unit": {
            "unit_number": unit.get(
                "unit_number",
                ""
            ),
            "unit_type": unit.get(
                "unit_type",
                ""
            ),
            "monthly_rent": unit.get(
                "monthly_rent",
                0
            ),
            "status": unit.get(
                "status",
                ""
            )
        },

        "agreement": {
            "status": (
                agreement.get(
                    "status",
                    ""
                )
                if agreement
                else "No Active Agreement"
            ),
            "start_date": (
                agreement.get(
                    "start_date",
                    ""
                )
                if agreement
                else ""
            ),
            "end_date": (
                agreement.get(
                    "end_date",
                    ""
                )
                if agreement
                else ""
            ),
            "monthly_rent": (
                agreement.get(
                    "monthly_rent",
                    0
                )
                if agreement
                else 0
            ),
            "security_deposit": (
                agreement.get(
                    "security_deposit",
                    0
                )
                if agreement
                else 0
            )
        },

        "recent_payments": recent_payments

    }), 200


# ==========================================
# My Property
# ==========================================

@tenant_bp.route("/my-property", methods=["GET"])
@jwt_required()
def my_property():

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Only tenants can access this page
    if claims.get("role") != "tenant":
        return jsonify({
            "message": "Only tenants can view this page"
        }), 403

    db = tenant_bp.db

    # ==========================================
    # Find Tenant
    # ==========================================

    tenant = db.users.find_one({
        "_id": ObjectId(current_user_id),
        "role": "tenant"
    })

    if not tenant:
        return jsonify({
            "message": "Tenant not found"
        }), 404

    # ==========================================
    # Find ALL Units Assigned to Tenant
    # ==========================================

    units_cursor = db.units.find({
        "tenant_id": current_user_id
    })

    units = list(units_cursor)

    # ==========================================
    # No Units
    # ==========================================

    if not units:
        return jsonify({
            "tenant": {
                "name": tenant.get(
                    "name",
                    ""
                ),
                "email": tenant.get(
                    "email",
                    ""
                )
            },
            "properties": []
        }), 200

    # ==========================================
    # Build Property + Unit Data
    # ==========================================

    properties = []

    for unit in units:

        property_id = unit.get(
            "property_id"
        )

        if not property_id:
            continue

        if not ObjectId.is_valid(property_id):
            continue

        property_data = db.properties.find_one({
            "_id": ObjectId(property_id)
        })

        if property_data:

            properties.append({

                "property": {
                    "id": str(
                        property_data["_id"]
                    ),
                    "name": property_data.get(
                        "name",
                        ""
                    ),
                    "address": property_data.get(
                        "address",
                        ""
                    ),
                    "city": property_data.get(
                        "city",
                        ""
                    ),
                    "state": property_data.get(
                        "state",
                        ""
                    ),
                    "pincode": property_data.get(
                        "pincode",
                        ""
                    )
                },

                "unit": {
                    "id": str(
                        unit["_id"]
                    ),
                    "unit_number": unit.get(
                        "unit_number",
                        ""
                    ),
                    "unit_type": unit.get(
                        "unit_type",
                        ""
                    ),
                    "monthly_rent": unit.get(
                        "monthly_rent",
                        0
                    ),
                    "status": unit.get(
                        "status",
                        ""
                    )
                }

            })

    # ==========================================
    # My Property Response
    # ==========================================

    return jsonify({

        "tenant": {
            "name": tenant.get(
                "name",
                ""
            ),
            "email": tenant.get(
                "email",
                ""
            )
        },

        "properties": properties

    }), 200