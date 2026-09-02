from flask import Flask
from pymongo import MongoClient
from app.routes.auth import auth_bp
from flask_jwt_extended import JWTManager
from app.routes.property import property_bp
from app.routes.unit import unit_bp
from app.routes.tenant import tenant_bp
from app.routes.agreement import agreement_bp

app = Flask(__name__)

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")


# Select database
db = client["rentease"]

# Make database available to auth routes
auth_bp.db = db
property_bp.db = db
unit_bp.db = db
tenant_bp.db = db
agreement_bp.db = db

# JWT configuration
app.config["JWT_SECRET_KEY"] = "rentease-secret-key"

# Initialize JWT
jwt = JWTManager(app)

# Register authentication routes
app.register_blueprint(auth_bp)
app.register_blueprint(property_bp)
app.register_blueprint(unit_bp)
app.register_blueprint(tenant_bp)
app.register_blueprint(agreement_bp)

@app.route("/")
def home():
    return "RentEase Backend is Running!"


@app.route("/api/test-db")
def test_db():
    try:
        client.admin.command("ping")
        return {
            "message": "MongoDB connected successfully!"
        }
    except Exception as e:
        return {
            "message": "MongoDB connection failed",
            "error": str(e)
        }, 500


if __name__ == "__main__":
    app.run(debug=False)