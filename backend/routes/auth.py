import firebase_admin
from flask import Blueprint, request, jsonify, redirect, url_for
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from firebase_admin import auth as firebase_auth, credentials, initialize_app
from models.schemas import Erabiltzaile
from datetime import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-service-account.json")
    initialize_app(cred)

# POST /api/auth/register
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    id_token = data.get('id_token')  # Firebase ID token sent from the frontend

    if not username or not email or not id_token:
        return jsonify({"error": "Datu guztiak beharrezkoak dira"}), 400

    try:
        # Verify Firebase ID token
        decoded_token = firebase_auth.verify_id_token(id_token)
        firebase_email = decoded_token.get('email')

        # Ensure the email in the token matches the provided email
        if firebase_email != email:
            return jsonify({"error": "Emailak ez datoz bat"}), 400

        # Check if the user already exists in the database
        if Erabiltzaile.objects(email=email).first():
            return jsonify({"error": "Erabiltzailea dagoeneko existitzen da"}), 400

        # Create a new user in the database
        user = Erabiltzaile(username=username, email=email, created_at=datetime.utcnow())
        user.save()

        return jsonify({"message": "Erabiltzailea arrakastaz erregistratu da", "user_id": str(user.id)}), 201
    except firebase_auth.InvalidIdTokenError:
        return jsonify({"error": "ID token baliogabea da"}), 401
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

# POST /api/auth/login
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    id_token = data.get('id_token')

    if not id_token:
        return jsonify({"error": "ID token beharrezkoa da"}), 400

    try:
        # Verify Firebase ID token
        decoded_token = firebase_auth.verify_id_token(id_token)
        email = decoded_token.get('email')

        # Check if user exists in the database
        user = Erabiltzaile.objects(email=email).first()
        if not user:
            return jsonify({"error": "Erabiltzailea ez da aurkitu"}), 404

        # Generate JWT for session management
        token = create_access_token(identity=str(user.id))
        return jsonify({"token": token, "user_id": str(user.id)}), 200
    except firebase_auth.InvalidIdTokenError:
        return jsonify({"error": "ID token baliogabea da"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# GET /api/auth/profile
@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = Erabiltzaile.objects(id=user_id).first()

    if not user:
        return jsonify({"error": "Erabiltzailea ez da aurkitu"}), 404

    return jsonify({
        "user_id": str(user.id),
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat()
    })

# PUT /api/auth/profile
@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')

    user = Erabiltzaile.objects(id=user_id).first()
    if not user:
        return jsonify({"error": "Erabiltzailea ez da aurkitu"}), 404

    user.update(username=username, email=email)
    return jsonify({"message": "Profila arrakastaz eguneratu da"})
