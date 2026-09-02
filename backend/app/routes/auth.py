from flask import Blueprint, request, jsonify, current_app
import bcrypt
from flask_jwt_extended import create_access_token
from flask_jwt_extended import create_access_token, jwt_required, get_jwt, get_jwt_identity

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not name or not email or not password or not role:
        return jsonify({
            "message": "All fields are required"
        }), 400

    if role not in ["owner", "tenant"]:
        return jsonify({
            "message": "Invalid role"
        }), 400

    db = auth_bp.db

    existing_user = db.users.find_one({
        "email": email
    })

    if existing_user:
        return jsonify({
            "message": "Email already registered"
        }), 409

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    user = {
        "name": name,
        "email": email,
        "password": hashed_password.decode("utf-8"),
        "role": role
    }

    db.users.insert_one(user)

    return jsonify({
        "message": "User registered successfully"
    }), 201     


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "message": "Email and password are required"
        }), 400

    db = auth_bp.db

    user = db.users.find_one({
        "email": email
    })

    if not user:
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    password_match = bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"].encode("utf-8")
    )

    if not password_match:
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    access_token = create_access_token(
        identity=str(user["_id"]),
        additional_claims={
            "role": user["role"]
        }
    )

    return jsonify({
        "message": "Login successful",
        "token": access_token
    }), 200



@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    return jsonify({
        "message": "You are authorized!",
        "user_id": current_user_id,
        "role": claims["role"]
    }), 200