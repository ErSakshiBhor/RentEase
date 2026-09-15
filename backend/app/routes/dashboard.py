from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from datetime import datetime


dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/api/dashboard"
)


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

    # ==========================================
    # Properties
    # ==========================================

    properties_count = db.properties.count_documents({
        "owner_id": current_user_id
    })

    owner_properties = db.properties.find(
        {"owner_id": current_user_id},
        {"_id": 1}
    )

    property_ids = [
        str(property["_id"])
        for property in owner_properties
    ]

    # ==========================================
    # Units
    # ==========================================

    units_count = db.units.count_documents({
        "property_id": {"$in": property_ids}
    })

    occupied_units = db.units.count_documents({
        "property_id": {"$in": property_ids},
        "status": "occupied"
    })

    # ==========================================
    # Tenants
    # ==========================================

    tenants_count = db.users.count_documents({
        "role": "tenant"
    })

    # ==========================================
    # Active Agreements
    # ==========================================

    active_agreements = db.rental_agreements.count_documents({
        "owner_id": current_user_id,
        "status": "active"
    })

    # ==========================================
    # Monthly Rent
    # ==========================================

    agreements = db.rental_agreements.find({
        "owner_id": current_user_id,
        "status": "active"
    })

    monthly_rent = sum(
        agreement.get("monthly_rent", 0)
        for agreement in agreements
    )

    # ==========================================
    # Payment Statistics
    # ==========================================

    # Total collected from all paid payments
    paid_payments = db.payments.find({
        "owner_id": current_user_id,
        "status": "paid"
    })

    total_collected = sum(
        payment.get("amount", 0)
        for payment in paid_payments
    )

    # Current month
    current_month = datetime.now().strftime("%Y-%m")

    # ==========================================
    # Payments This Month
    # ==========================================

    current_month_paid_payments = db.payments.find({
        "owner_id": current_user_id,
        "status": "paid",
        "payment_date": {
            "$regex": f"^{current_month}"
        }
    })

    current_month_collected = sum(
        payment.get("amount", 0)
        for payment in current_month_paid_payments
    )

    payments_this_month = db.payments.count_documents({
        "owner_id": current_user_id,
        "status": "paid",
        "payment_date": {
            "$regex": f"^{current_month}"
        }
    })

    # ==========================================
    # Pending Payments
    # ==========================================

    pending_payments_data = db.payments.find({
        "owner_id": current_user_id,
        "status": "pending"
    })

    pending_payments = sum(
        payment.get("amount", 0)
        for payment in pending_payments_data
    )

    # ==========================================
    # Payment Overview - Last 6 Months
    # ==========================================

    payment_overview = []

    current_date = datetime.now()

    for i in range(5, -1, -1):

        month = current_date.month - i
        year = current_date.year

        while month <= 0:
            month += 12
            year -= 1

        month_string = f"{year:04d}-{month:02d}"

        monthly_collected_data = db.payments.find({
            "owner_id": current_user_id,
            "status": "paid",
            "payment_date": {
                "$regex": f"^{month_string}"
            }
        })

        monthly_collected = sum(
            payment.get("amount", 0)
            for payment in monthly_collected_data
        )

        month_name = datetime(
            year,
            month,
            1
        ).strftime("%b")

        payment_overview.append({
            "month": month_name,
            "collected": monthly_collected
        })

    # ==========================================
    # Unit Occupancy
    # ==========================================

    vacant_units = units_count - occupied_units

    occupancy = {
        "occupied": occupied_units,
        "vacant": vacant_units
    }

    # ==========================================
    # Rent vs Collection - Current Month
    # ==========================================

    current_month_name = current_date.strftime("%b")

    rent_vs_collection = [
        {
            "type": "Monthly Rent",
            "amount": monthly_rent
        },
        {
            "type": "Collected",
            "amount": current_month_collected
        }
    ]


        # ==========================================
    # Recent Payments
    # ==========================================

    recent_payments_data = db.payments.find({
        "owner_id": current_user_id
    }).sort(
        "payment_date", -1
    ).limit(5)

    recent_payments = []

    for payment in recent_payments_data:

        tenant = db.users.find_one({
            "_id": __import__("bson").ObjectId(payment["tenant_id"])
        })

        recent_payments.append({
            "tenant_name": tenant.get("name", "Unknown") if tenant else "Unknown",
            "payment_date": payment.get("payment_date"),
            "amount": payment.get("amount", 0),
            "payment_method": payment.get("payment_method", "N/A"),
            "status": payment.get("status", "pending")
        })

    # ==========================================
    # Dashboard Response
    # ==========================================

    return jsonify({
        "properties": properties_count,
        "units": units_count,
        "tenants": tenants_count,
        "occupied_units": occupied_units,
        "monthly_rent": monthly_rent,
        "active_agreements": active_agreements,

        "total_collected": total_collected,
        "payments_this_month": payments_this_month,
        "pending_payments": pending_payments,

        "payment_overview": payment_overview,
        "occupancy": occupancy,
        "rent_vs_collection": rent_vs_collection,

        "current_month": current_month_name,
        "recent_payments": recent_payments
    }), 200