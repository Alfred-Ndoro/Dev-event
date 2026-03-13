from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from models import db, Event, Booking, User, EventSchema, BookingCreateSchema

# Main Blueprint 
main_bp = Blueprint("main", __name__)

#  EVENT ROUTES

# GET /events — list every event
@main_bp.route("/events", methods=["GET"])
def get_all_events():
    events = db.session.query(Event).all()
    return jsonify([e.to_dict() for e in events])


# GET /events/<slug> — single event by its slug
@main_bp.route("/events/<slug>", methods=["GET"])
def get_one_event(slug):
    event = db.session.query(Event).filter_by(slug=slug).first()

    if event is None:
        return jsonify({"detail": "Event not found"}), 404

    return jsonify(event.to_dict())


# POST /events — create a new event
@main_bp.route("/events", methods=["POST"])
def create_event():
    # validate incoming JSON against the Pydantic schema
    try:
        event_data = EventSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 422

    # persist to the database
    db_event = Event(**event_data.model_dump())
    db.session.add(db_event)
    db.session.commit()
    db.session.refresh(db_event)

    return jsonify(db_event.to_dict()), 201


# PUT /events/<slug> — update an existing event
@main_bp.route("/events/<slug>", methods=["PUT"])
def update_event(slug):
    db_event = db.session.query(Event).filter_by(slug=slug).first()

    if db_event is None:
        return jsonify({"detail": "Event not found"}), 404

    # validate the update payload
    try:
        event_data = EventSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 422

    # apply every field from the validated data
    # the FK constraint has ON UPDATE CASCADE, so changing the slug
    # automatically propagates to related bookings at the DB level
    for key, value in event_data.model_dump().items():
        setattr(db_event, key, value)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"detail": "Slug already exists or constraint violation"}), 409

    db.session.refresh(db_event)
    return jsonify(db_event.to_dict())


# DELETE /events/<slug> — remove an event
@main_bp.route("/events/<slug>", methods=["DELETE"])
def delete_event(slug):
    db_event = db.session.query(Event).filter_by(slug=slug).first()

    if db_event is None:
        return jsonify({"detail": "Event not found"}), 404

    db.session.delete(db_event)
    db.session.commit()

    return "", 204


#  BOOKING ROUTES

# GET /bookings/<user_id> — all bookings for a given user
@main_bp.route("/bookings/<int:user_id>", methods=["GET"])
def get_user_bookings(user_id):
    bookings = db.session.query(Booking).filter_by(user_id=user_id).all()
    return jsonify([b.to_dict() for b in bookings])


# GET /booking/detail/<booking_id> — single booking by id
@main_bp.route("/booking/detail/<int:booking_id>", methods=["GET"])
def get_booking(booking_id):
    booking = db.session.query(Booking).filter_by(id=booking_id).first()

    if booking is None:
        return jsonify({"detail": "Booking not found"}), 404

    return jsonify(booking.to_dict())


# POST /bookings — create a new booking
@main_bp.route("/bookings", methods=["POST"])
def create_booking():
    # validate incoming JSON
    try:
        booking_data = BookingCreateSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 422

    # ensure the user exists
    user = db.session.query(User).filter_by(id=booking_data.user_id).first()
    if user is None:
        return jsonify({"detail": "User not found"}), 404

    # ensure the event exists
    event = db.session.query(Event).filter_by(slug=booking_data.event_slug).first()
    if event is None:
        return jsonify({"detail": "Event not found"}), 404

    # prevent duplicate bookings for the same user + event
    existing = db.session.query(Booking).filter_by(
        user_id=booking_data.user_id,
        event_slug=booking_data.event_slug,
    ).first()
    if existing:
        return jsonify({"detail": "User already booked this event"}), 400

    # create the booking and bump the event's booked_spots in one transaction
    db_booking = Booking(**booking_data.model_dump(by_alias=False))
    db.session.add(db_booking)
    event.booked_spots += 1

    db.session.commit()
    db.session.refresh(db_booking)

    return jsonify(db_booking.to_dict()), 201


# DELETE /bookings/<booking_id> — cancel a booking
@main_bp.route("/bookings/<int:booking_id>", methods=["DELETE"])
def delete_booking(booking_id):
    booking = db.session.query(Booking).filter_by(id=booking_id).first()

    if booking is None:
        return jsonify({"detail": "Booking not found"}), 404

    # decrement booked_spots on the linked event
    event = db.session.query(Event).filter_by(slug=booking.event_slug).first()
    if event and event.booked_spots > 0:
        event.booked_spots -= 1

    db.session.delete(booking)
    db.session.commit()

    return "", 204


# GET /bookings/check/<user_id>/<event_slug> — has the user booked this event?
@main_bp.route("/bookings/check/<int:user_id>/<event_slug>", methods=["GET"])
def check_booking(user_id, event_slug):
    booking = db.session.query(Booking).filter_by(
        user_id=user_id, event_slug=event_slug
    ).first()

    return jsonify({
        "booked": booking is not None,
        "booking_id": booking.id if booking else None,
    })
