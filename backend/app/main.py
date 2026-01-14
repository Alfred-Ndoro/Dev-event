from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
from pathlib import Path

from models import EventBase
from database import SessionLocal, engine
import database_model
import auth

# initializing the app
app = FastAPI()
app.include_router(auth.router)

# setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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
            with open(json_path, "r") as f:
                data = json.load(f)
            
            for event_data in data.get("events", []):
                # Remove 'id' field as SQLite will auto-generate it
                event_data.pop("id", None)
                
                db_event = database_model.Event(**event_data)
                db.add(db_event)
            
            db.commit()
            print(f"Seeded {len(data.get('events', []))} events from db.json")
        else:
            print(f"Warning: {json_path} not found, no events seeded")
    
    db.close()

init_db()
