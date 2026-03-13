from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.orm import relationship, declarative_base
import enum

Base = declarative_base()


class EventMode(str, enum.Enum):
    online = "online"
    offline = "offline"
    hybrid = "hybrid"


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    image = Column(String(500))
    location = Column(String(255))
    venue = Column(String(255))
    date = Column(String(50))  # Keeping as string to match frontend format
    time = Column(String(50))
    mode = Column(Enum(EventMode), default=EventMode.offline)
    audience = Column(String(255))
    overview = Column(Text)
    description = Column(Text)
    organizer = Column(String(255))
    tags = Column(JSON, default=list)  # Stores array of strings
    agenda = Column(JSON, default=list)  # Stores array of {time, title, description}
    booked_spots = Column(Integer, default=0)

    # Relationship to bookings
    bookings = relationship("Booking", back_populates="event")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)  # Stores HASHED password 

    # Relationship to bookings
    bookings = relationship("Booking", back_populates="user")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_slug = Column(String(255), ForeignKey("events.slug"), nullable=False)
    event_title = Column(String(255))
    event_date = Column(String(50))
    event_time = Column(String(50))
    event_location = Column(String(255))
    user_name = Column(String(255))
    user_email = Column(String(255))
    booking_date = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="bookings")
    event = relationship("Event", back_populates="bookings")