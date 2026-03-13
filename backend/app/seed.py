import json
from pathlib import Path
from models import db, Event


def init_db():
    """Seed events from data/db.json when the table is empty."""
    count = db.session.query(Event).count()

    if count > 0:
        # events already exist — nothing to do
        return

    # resolve the JSON seed file relative to this file
    json_path = Path(__file__).parent.parent.parent / "data" / "db.json"

    if not json_path.exists():
        print(f"Warning: {json_path} not found, no events seeded")
        return

    try:
        with open(json_path, "r") as f:
            data = json.load(f)

        events = data.get("events", [])

        for event_data in events:
            # drop 'id' — the DB auto-generates it
            event_data.pop("id", None)
            db.session.add(Event(**event_data))

        db.session.commit()
        print(f"Seeded {len(events)} events from db.json")

    except json.JSONDecodeError as e:
        print(f"Error: Failed to parse {json_path}: {e}")
    except Exception as e:
        db.session.rollback()
        print(f"Error: Failed to seed events: {e}")
