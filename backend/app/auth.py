from datetime import datetime, timedelta, timezone
from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from passlib.context import CryptContext
import jwt
import os

from models import db, User, UserSchema, LoginSchema

# Auth Blueprint
auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# JWT settings 
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
JWT_EXPIRY_MINUTES = 20

# Password hashing context 
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")



def create_access_token(email: str, user_id: int, expires_delta: timedelta) -> str:
    """Build a signed JWT containing the user's email and id."""
    payload = {
        "sub": email,
        "id": user_id,
        "exp": datetime.now(timezone.utc) + expires_delta,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def authenticate_user(email: str, password: str):
    """Return the User if credentials are valid, otherwise None."""
    user = db.session.query(User).filter_by(email=email).first()

    # check existence and password hash
    if not user or not pwd_context.verify(password, user.password):
        return None

    return user


def get_current_user_from_token():
    """Decode the JWT from the Authorization header.

    Returns a dict with 'email' and 'id', or None if the token is
    missing / invalid. Useful as a guard in protected routes.
    """
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.removeprefix("Bearer ").strip()

    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"email": payload.get("sub"), "id": payload.get("id")}
    except jwt.PyJWTError:
        return None



#  ROUTES

# POST /auth/ — register a new user
@auth_bp.route("/", methods=["POST"])
def create_user():
    # validate the signup payload
    try:
        data = UserSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 422

    # reject duplicate emails
    if db.session.query(User).filter_by(email=data.email).first():
        return jsonify({"detail": "Email already registered"}), 400

    # hash the password and persist
    user = User(email=data.email, password=pwd_context.hash(data.password))
    db.session.add(user)
    db.session.commit()
    db.session.refresh(user)

    return jsonify({"id": user.id, "email": user.email}), 201


# POST /auth/login — email + password JSON login
@auth_bp.route("/login", methods=["POST"])
def login():
    # validate the login payload
    try:
        data = LoginSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 422

    # authenticate
    user = authenticate_user(data.email, data.password)
    if not user:
        return jsonify({"detail": "Invalid email or password"}), 401

    # issue a JWT
    token = create_access_token(
        user.email, user.id, timedelta(minutes=JWT_EXPIRY_MINUTES)
    )
    return jsonify({"access_token": token, "token_type": "bearer"})


# POST /auth/token — OAuth2-compatible token endpoint (form data)
@auth_bp.route("/token", methods=["POST"])
def login_for_access_token():
    """Accepts form-encoded username + password (OAuth2 standard)."""
    username = request.form.get("username")
    password = request.form.get("password")

    if not username or not password:
        return jsonify({"detail": "Missing username or password"}), 400

    user = authenticate_user(username, password)
    if not user:
        return jsonify({"detail": "Could not validate user"}), 401

    token = create_access_token(
        user.email, user.id, timedelta(minutes=JWT_EXPIRY_MINUTES)
    )
    return jsonify({"access_token": token, "token_type": "bearer"})
