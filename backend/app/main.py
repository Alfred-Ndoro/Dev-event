from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
from pathlib import Path
from models import EventBase, BookingCreate, BookingResponse
from database import SessionLocal, engine
import database_model
import auth
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# initializing the app
app = FastAPI(
    title="Dev-Event API",
    description="API for managing developer events and bookings",
    version="1.0.0"
)
app.include_router(auth.router)

# Get allowed origins from environment or use defaults
origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allowed_origins = [origin.strip() for origin in origins_env.split(",")]

# Log origins for debugging (visible in Render logs)
print(f"CORS Allowed Origins: {allowed_origins}")

# setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create database tables
database_model.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# health check route
@app.get("/")
def health_check():
    return {"status": "online", "message": "The Dev-Event application is running"}

# get all events
@app.get("/events")
def get_all_events(db: Session = Depends(get_db)):
    events = db.query(database_model.Event).all()
    return events

# get one event by slug
@app.get("/events/{slug}")
def get_one_event(slug: str, db: Session = Depends(get_db)):
    event = db.query(database_model.Event).filter(database_model.Event.slug == slug).first()
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

# add an event
@app.post("/events", status_code=201)
def create_event(event: EventBase, db: Session = Depends(get_db)):
    db_event = database_model.Event(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

# update an event
@app.put("/events/{slug}")
def update_event(slug: str, event: EventBase, db: Session = Depends(get_db)):
    db_event = db.query(database_model.Event).filter(database_model.Event.slug == slug).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    for key, value in event.model_dump().items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event

# delete an event
@app.delete("/events/{slug}", status_code=204)
def delete_event(slug: str, db: Session = Depends(get_db)):
    db_event = db.query(database_model.Event).filter(database_model.Event.slug == slug).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(db_event)
    db.commit()
    return None

def init_db():
    db = SessionLocal()
    
    count = db.query(database_model.Event).count()
    
    if count == 0:
        # Load events from db.json
        json_path = Path(__file__).parent.parent.parent / "data" / "db.json"
        
        if json_path.exists():
            try:
                with open(json_path, "r") as f:
                    data = json.load(f)
                
                events = data.get("events", [])
                for event_data in events:
                    # Remove 'id' field as SQLite will auto-generate it
                    event_data.pop("id", None)
                    
                    db_event = database_model.Event(**event_data)
                    db.add(db_event)
                
                db.commit()
                print(f"Seeded {len(events)} events from db.json")
            except json.JSONDecodeError as e:
                print(f"Error: Failed to parse {json_path}: {e}")
            except Exception as e:
                db.rollback()
                print(f"Error: Failed to seed events: {e}")
        else:
            print(f"Warning: {json_path} not found, no events seeded")
    
    db.close()

init_db()


# booking routes

# get all bookings for a user
@app.get("/bookings/{user_id}", response_model=list[BookingResponse])
def get_user_bookings(user_id: int, db: Session = Depends(get_db)):
    bookings = db.query(database_model.Booking).filter(
        database_model.Booking.user_id == user_id
    ).all()

    return bookings

# get a single booking by id
@app.get("/booking/detail/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(database_model.Booking).filter(
        database_model.Booking.id == booking_id
    ).first()

    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

# create a new booking
@app.post("/bookings", status_code=201, response_model=BookingResponse)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
   # Check if user exists
    user = db.query(database_model.User).filter(
        database_model.User.id == booking.user_id
    ).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if event exists
    event = db.query(database_model.Event).filter(
        database_model.Event.slug == booking.event_slug
    ).first()

    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if user already booked this event
    existing_booking = db.query(database_model.Booking).filter(
        database_model.Booking.user_id == booking.user_id,
        database_model.Booking.event_slug == booking.event_slug
    ).first()

    if existing_booking:
        raise HTTPException(status_code=400, detail="User already booked this event")
    
    # Create booking
    db_booking = database_model.Booking(**booking.model_dump(by_alias=False))
    db.add(db_booking)

    # Increment booked_spots on the event
    event.booked_spots += 1

    db.commit()
    db.refresh(db_booking)
    return db_booking

# delete a booking
@app.delete("/bookings/{booking_id}", status_code=204)
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(database_model.Booking).filter(
        database_model.Booking.id == booking_id
    ).first()
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Decrement booked_spots on the event
    event = db.query(database_model.Event).filter(
        database_model.Event.slug == booking.event_slug
    ).first()
    if event and event.booked_spots > 0:
        event.booked_spots -= 1
    
    db.delete(booking)
    db.commit()
    return None

# check if user has booked an event
@app.get("/bookings/check/{user_id}/{event_slug}")
def check_booking(user_id: int, event_slug: str, db: Session = Depends(get_db)):
    booking = db.query(database_model.Booking).filter(
        database_model.Booking.user_id == user_id,
        database_model.Booking.event_slug == event_slug
    ).first()
    return {"booked": booking is not None, "booking_id": booking.id if booking else None}