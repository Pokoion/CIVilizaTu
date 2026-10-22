import firebase_admin
from flask import Blueprint, request, jsonify, redirect, url_for
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from firebase_admin import auth as firebase_auth, credentials, initialize_app
from models.schemas import Erabiltzaile
from datetime import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Initialize Firebase Admin SDK
import os
from dotenv import load_dotenv
load_dotenv()

FIREBASE_REQUIRED_VARS = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_PRIVATE_KEY",
    "FIREBASE_CLIENT_EMAIL",
]
FIREBASE_ERROR = None

if not firebase_admin._apps:
    missing = [name for name in FIREBASE_REQUIRED_VARS if not os.environ.get(name)]
    if missing:
        FIREBASE_ERROR = "Firebase Admin no configurado; faltan: " + ", ".join(missing)
        print(f"[auth] AVISO: {FIREBASE_ERROR}", flush=True)
    else:
        try:
            cred_dict = {
                "type": os.environ.get("FIREBASE_TYPE", "service_account"),
                "project_id": os.environ.get("FIREBASE_PROJECT_ID"),
                "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID"),
                "private_key": os.environ.get("FIREBASE_PRIVATE_KEY").replace('\\n', '\n'),
                "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL"),
                "client_id": os.environ.get("FIREBASE_CLIENT_ID"),
                "auth_uri": os.environ.get("FIREBASE_AUTH_URI"),
                "token_uri": os.environ.get("FIREBASE_TOKEN_URI"),
                "auth_provider_x509_cert_url": os.environ.get("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
                "client_x509_cert_url": os.environ.get("FIREBASE_CLIENT_X509_CERT_URL"),
                "universe_domain": os.environ.get("FIREBASE_UNIVERSE_DOMAIN", "googleapis.com"),
            }
            cred = credentials.Certificate(cred_dict)
            initialize_app(cred)
            print("[auth] Firebase Admin inicializado correctamente", flush=True)
        except Exception as e:
            FIREBASE_ERROR = f"No se pudo inicializar Firebase Admin: {e}"
            print(f"[auth] ERROR: {FIREBASE_ERROR}", flush=True)

# POST /api/auth/register
@auth_bp.route('/register', methods=['POST'])
def register():
    if FIREBASE_ERROR:
        return jsonify({"error": "Firebase ez dago konfiguratuta; falta dira backendeko kredentzialak"}), 503

    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    id_token = data.get('id_token')  # Firebase ID token sent from the frontend

    if not username or not email or not id_token:
        return jsonify({"error": "Datu guztiak beharrezkoak dira"}), 400

    try:
        # Verify Firebase ID token
        decoded_token = firebase_auth.verify_id_token(id_token, clock_skew_seconds=10)
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
        import traceback
        traceback.print_exc()
        return jsonify({"error": "ID token baliogabea da"}), 401
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

# POST /api/auth/login
@auth_bp.route('/login', methods=['POST'])
def login():
    if FIREBASE_ERROR:
        return jsonify({"error": "Firebase ez dago konfiguratuta; falta dira backendeko kredentzialak"}), 503

    data = request.get_json()
    id_token = data.get('id_token')

    if not id_token:
        return jsonify({"error": "ID token beharrezkoa da"}), 400

    try:
        # Verify Firebase ID token
        decoded_token = firebase_auth.verify_id_token(id_token, clock_skew_seconds=10)
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
