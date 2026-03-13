import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy.pool import NullPool
from sqlalchemy import text
from models import db
from main import main_bp
from auth import auth_bp
from seed import init_db


def _fix_cascade_constraint():
    
    try:
        row = db.session.execute(text(
            "SELECT confupdtype, confdeltype FROM pg_constraint "
            "WHERE conname = 'bookings_event_slug_fkey'"
        )).fetchone()

        # 'a' = no action, 'c' = cascade — fix if either is not cascading
        if row and (row[0] != "c" or row[1] != "c"):
            db.session.execute(text(
                "ALTER TABLE bookings DROP CONSTRAINT bookings_event_slug_fkey"
            ))
            db.session.execute(text(
                "ALTER TABLE bookings ADD CONSTRAINT bookings_event_slug_fkey "
                "FOREIGN KEY (event_slug) REFERENCES events(slug) "
                "ON UPDATE CASCADE ON DELETE CASCADE"
            ))
            db.session.commit()
            print("Fixed bookings FK constraint to ON UPDATE/DELETE CASCADE")
    except Exception as e:
        db.session.rollback()
        print(f"Note: Could not fix FK constraint (may not exist yet): {e}")

# load .env from the backend/ directory
load_dotenv()


def create_app():
    """Application factory — builds and returns the Flask app."""
    app = Flask(__name__)

    # Database configuration 
    # Environment variables use lowercase keys to match .env.example
    user = os.getenv("user")
    password = os.getenv("password")
    host = os.getenv("host")
    port = os.getenv("port")
    dbname = os.getenv("dbname")
    sslmode = os.getenv("SSL_MODE", "require")

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}?sslmode={sslmode}"
    )
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"poolclass": NullPool}
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # CORS 
    origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    origins = [o.strip() for o in origins_env.split(",")]
    CORS(app, origins=origins, supports_credentials=True)
    print(f"CORS Allowed Origins: {origins}")

    db.init_app(app)

    # Register blueprints 
    app.register_blueprint(main_bp)   # event + booking routes
    app.register_blueprint(auth_bp)   # auth routes under /auth

    # Health-check home route 
    @app.route("/")
    def health_check():
        return jsonify({
            "status": "online",
            "message": "The Dev-Event application is running",
        })

    # Create tables, fix constraints, and seed data
    with app.app_context():
        db.create_all()
        _fix_cascade_constraint()
        init_db()

    return app


# Module-level app instance 
app = create_app()

# Local development entry point
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
