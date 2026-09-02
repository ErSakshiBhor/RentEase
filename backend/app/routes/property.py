from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from bson import ObjectId

property_bp = Blueprint(
    "property",
    __name__,
    url_prefix="/api/properties"
)


@property_bp.route("/", methods=["POST"])
@jwt_required()
def add_property():

    # Get logged-in user's information from JWT
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Check user role
    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can add properties"
        }), 403

    # Get data from request
    data = request.get_json()

    name = data.get("name")
    address = data.get("address")
    city = data.get("city")
    state = data.get("state")
    pincode = data.get("pincode")
    property_type = data.get("property_type")

    # Validate required fields
    if not name or not address or not city or not state or not pincode or not property_type:
        return jsonify({
            "message": "All fields are required"
        }), 400

    # Create property document
    property_data = {
        "owner_id": current_user_id,
        "name": name,
        "address": address,
        "city": city,
        "state": state,
        "pincode": pincode,
        "property_type": property_type
    }

    # Insert into MongoDB
    db = property_bp.db

    result = db.properties.insert_one(property_data)

    return jsonify({
        "message": "Property added successfully",
        "property_id": str(result.inserted_id)
    }), 201




@property_bp.route("/", methods=["GET"])
@jwt_required()
def get_properties():

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can view properties"
        }), 403

    db = property_bp.db

    properties = db.properties.find({
        "owner_id": current_user_id
    })

    property_list = []

    for property in properties:
        property_list.append({
            "id": str(property["_id"]),
            "name": property["name"],
            "address": property["address"],
            "city": property["city"],
            "state": property["state"],
            "pincode": property["pincode"],
            "property_type": property["property_type"]
        })

    return jsonify({
        "properties": property_list
    }), 200



@property_bp.route("/<property_id>", methods=["PUT"])
@jwt_required()
def update_property(property_id):

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Only owners can update properties
    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can update properties"
        }), 403

    # Validate property ID
    if not ObjectId.is_valid(property_id):
        return jsonify({
            "message": "Invalid property ID"
        }), 400

    db = property_bp.db

    # Find property owned by logged-in owner
    existing_property = db.properties.find_one({
        "_id": ObjectId(property_id),
        "owner_id": current_user_id
    })

    if not existing_property:
        return jsonify({
            "message": "Property not found"
        }), 404

    data = request.get_json()

    update_data = {}

    fields = [
        "name",
        "address",
        "city",
        "state",
        "pincode",
        "property_type"
    ]

    for field in fields:
        if field in data:
            update_data[field] = data[field]

    if not update_data:
        return jsonify({
            "message": "No fields provided for update"
        }), 400

    db.properties.update_one(
        {
            "_id": ObjectId(property_id),
            "owner_id": current_user_id
        },
        {
            "$set": update_data
        }
    )

    return jsonify({
        "message": "Property updated successfully"
    }), 200



@property_bp.route("/<property_id>", methods=["DELETE"])
@jwt_required()
def delete_property(property_id):

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "owner":
        return jsonify({
            "message": "Only owners can delete properties"
        }), 403

    if not ObjectId.is_valid(property_id):
        return jsonify({
            "message": "Invalid property ID"
        }), 400

    db = property_bp.db

    result = db.properties.delete_one({
        "_id": ObjectId(property_id),
        "owner_id": current_user_id
    })

    if result.deleted_count == 0:
        return jsonify({
            "message": "Property not found"
        }), 404

    return jsonify({
        "message": "Property deleted successfully"
    }), 200