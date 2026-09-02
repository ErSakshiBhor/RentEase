from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from bson import ObjectId


unit_bp = Blueprint(
    "unit",
    __name__,
    url_prefix="/api/properties"
)


@unit_bp.route("/<property_id>/units", methods=["POST"])
@jwt_required()
def add_unit(property_id):

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Only owner can add units
    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can add units"
        }), 403

    # Validate property ID
    if not ObjectId.is_valid(property_id):
        return jsonify({
            "message": "Invalid property ID"
        }), 400

    db = unit_bp.db

    # Check property belongs to logged-in owner
    property_data = db.properties.find_one({
        "_id": ObjectId(property_id),
        "owner_id": current_user_id
    })

    if not property_data:
        return jsonify({
            "message": "Property not found"
        }), 404

    data = request.get_json()

    unit_number = data.get("unit_number")
    unit_type = data.get("unit_type")
    monthly_rent = data.get("monthly_rent")

    if not unit_number or not unit_type or monthly_rent is None:
        return jsonify({
            "message": "All fields are required"
        }), 400

    # Create unit
    unit_data = {
        "property_id": property_id,
        "unit_number": unit_number,
        "unit_type": unit_type,
        "monthly_rent": monthly_rent,
        "status": "vacant"
    }

    result = db.units.insert_one(unit_data)

    return jsonify({
        "message": "Unit added successfully",
        "unit_id": str(result.inserted_id)
    }), 201 




@unit_bp.route("/<property_id>/units", methods=["GET"])
@jwt_required()
def get_units(property_id):

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Only owner can view units
    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can view units"
        }), 403

    # Validate property ID
    if not ObjectId.is_valid(property_id):
        return jsonify({
            "message": "Invalid property ID"
        }), 400

    db = unit_bp.db

    # Check property belongs to logged-in owner
    property_data = db.properties.find_one({
        "_id": ObjectId(property_id),
        "owner_id": current_user_id
    })

    if not property_data:
        return jsonify({
            "message": "Property not found"
        }), 404

    units = list(db.units.find({
    "property_id": property_id
    }))

    print("PROPERTY ID FROM URL:", property_id)
    print("UNITS FOUND:", units)

    unit_list = []

    for unit in units:
        unit_list.append({
            "id": str(unit["_id"]),
            "unit_number": unit["unit_number"],
            "unit_type": unit["unit_type"],
            "monthly_rent": unit["monthly_rent"],
            "status": unit["status"]
        })

    return jsonify({
        "units": unit_list
    }), 200




@unit_bp.route("/units/<unit_id>", methods=["PUT"])
@jwt_required()
def update_unit(unit_id):

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Only owner can update a unit
    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can update units"
        }), 403

    # Validate unit ID
    if not ObjectId.is_valid(unit_id):
        return jsonify({
            "message": "Invalid unit ID"
        }), 400

    db = unit_bp.db

    # Find the unit
    unit = db.units.find_one({
        "_id": ObjectId(unit_id)
    })

    if not unit:
        return jsonify({
            "message": "Unit not found"
        }), 404

    # Check that this unit belongs to the logged-in owner's property
    property_data = db.properties.find_one({
        "_id": ObjectId(unit["property_id"]),
        "owner_id": current_user_id
    })

    if not property_data:
        return jsonify({
            "message": "You are not allowed to update this unit"
        }), 403

    data = request.get_json()

    update_data = {}

    if "unit_number" in data:
        update_data["unit_number"] = data["unit_number"]

    if "unit_type" in data:
        update_data["unit_type"] = data["unit_type"]

    if "monthly_rent" in data:
        update_data["monthly_rent"] = data["monthly_rent"]

    if not update_data:
        return jsonify({
            "message": "No fields provided for update"
        }), 400

    db.units.update_one(
        {
            "_id": ObjectId(unit_id)
        },
        {
            "$set": update_data
        }
    )

    return jsonify({
        "message": "Unit updated successfully"
    }), 200




@unit_bp.route("/units/<unit_id>", methods=["DELETE"])
@jwt_required()
def delete_unit(unit_id):

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Only owner can delete a unit
    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can delete units"
        }), 403

    # Validate unit ID
    if not ObjectId.is_valid(unit_id):
        return jsonify({
            "message": "Invalid unit ID"
        }), 400

    db = unit_bp.db

    # Find the unit
    unit = db.units.find_one({
        "_id": ObjectId(unit_id)
    })

    if not unit:
        return jsonify({
            "message": "Unit not found"
        }), 404

    # Check that unit belongs to logged-in owner's property
    property_data = db.properties.find_one({
        "_id": ObjectId(unit["property_id"]),
        "owner_id": current_user_id
    })

    if not property_data:
        return jsonify({
            "message": "You are not allowed to delete this unit"
        }), 403

    db.units.delete_one({
        "_id": ObjectId(unit_id)
    })

    return jsonify({
        "message": "Unit deleted successfully"
    }), 200