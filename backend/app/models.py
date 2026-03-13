from datetime import datetime, timezone
from enum import Enum
from flask_sqlalchemy import SQLAlchemy
from pydantic import BaseModel, EmailStr, Field
from typing import List

# Initialised here, bound to the Flask app in wsgi.py via db.init_app(app)
db = SQLAlchemy()

# Enums 

class EventMode(str, Enum):
    """Supported event modes."""
    online = "online"
    offline = "offline"
    hybrid = "hybrid"


# ORM Models 

class Event(db.Model):
    """Events table — looked up by slug, never by numeric id in the API."""
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(255), unique=True, nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    image = db.Column(db.String(500))
    location = db.Column(db.String(255))
    venue = db.Column(db.String(255))
    date = db.Column(db.String(50))          # stored as string to match frontend format
    time = db.Column(db.String(50))
    mode = db.Column(db.Enum(EventMode), default=EventMode.offline)
    audience = db.Column(db.String(255))
    overview = db.Column(db.Text)
    description = db.Column(db.Text)
    organizer = db.Column(db.String(255))
    tags = db.Column(db.JSON, default=list)   # array of strings
    agenda = db.Column(db.JSON, default=list) # array of {time, title, description}
    booked_spots = db.Column(db.Integer, default=0)

    # one-to-many relationship with bookings
    bookings = db.relationship("Booking", back_populates="event")

    def to_dict(self):
        """Serialize to a dict with snake_case keys (frontend reads these directly)."""
        return {
            "id": self.id,
            "slug": self.slug,
            "title": self.title,
            "image": self.image,
            "location": self.location,
            "venue": self.venue,
            "date": self.date,
            "time": self.time,
            "mode": self.mode.value if self.mode else None,
            "audience": self.audience,
            "overview": self.overview,
            "description": self.description,
            "organizer": self.organizer,
            "tags": self.tags or [],
            "agenda": self.agenda or [],
            "booked_spots": self.booked_spots or 0,
        }


class User(db.Model):
    """Users table — email is unique, password is stored hashed."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)  # hashed via passlib

    bookings = db.relationship("Booking", back_populates="user")


class Booking(db.Model):
    """Bookings table — links a user to an event via event_slug FK."""
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    event_slug = db.Column(
        db.String(255),
        db.ForeignKey("events.slug", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )
    event_title = db.Column(db.String(255))
    event_date = db.Column(db.String(50))
    event_time = db.Column(db.String(50))
    event_location = db.Column(db.String(255))
    user_name = db.Column(db.String(255))
    user_email = db.Column(db.String(255))
    booking_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # relationships
    user = db.relationship("User", back_populates="bookings")
    event = db.relationship("Event", back_populates="bookings")

    def to_dict(self):
        """Serialize to a dict with camelCase keys (matches frontend contract)."""
        return {
            "id": self.id,
            "userId": self.user_id,
            "eventSlug": self.event_slug,
            "eventTitle": self.event_title,
            "eventDate": self.event_date,
            "eventTime": self.event_time,
            "eventLocation": self.event_location,
            "userName": self.user_name,
            "userEmail": self.user_email,
            "bookingDate": self.booking_date.isoformat() if self.booking_date else None,
        }


# Pydantic Validation Schemas 
# Used in routes to validate incoming JSON before touching the database.

class EventSchema(BaseModel):
    """Validates event creation / update payloads."""
    slug: str
    title: str
    image: str
    location: str
    venue: str
    date: str
    time: str
    mode: EventMode
    audience: str
    overview: str
    description: str
    organizer: str
    tags: List[str]
    agenda: List[str]

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    booked_spots: int = Field(alias="bookedSpots", default=0)

    class Config:
        from_attributes = True
        populate_by_name = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    password: str

class UserCreate(UserBase):
    password: str  

class BookingCreateSchema(BaseModel):
    """Validates booking creation payloads.

    Frontend sends camelCase JSON; aliases handle the mapping to snake_case.
    """
    user_id: int = Field(alias="userId")
    event_slug: str = Field(alias="eventSlug")
    event_title: str = Field(alias="eventTitle")
    event_date: str = Field(alias="eventDate")
    event_time: str = Field(alias="eventTime")
    event_location: str = Field(alias="eventLocation")
    user_name: str = Field(alias="userName")
    user_email: EmailStr = Field(alias="userEmail")

    # allow population by either alias (camelCase) or field name (snake_case)
    model_config = {"populate_by_name": True}


class UserSchema(BaseModel):
    """Validates signup payloads."""
    email: EmailStr
    password: str


class LoginSchema(BaseModel):
    """Validates login payloads."""
    email: str
    password: str
