"""Database initialization and connection management."""

import sqlite3
import os
from flask import g, current_app


def get_db_connection():
    """Get a database connection for the current request."""
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE_PATH'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(e=None):
    """Close the database connection."""
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db():
    """Initialize the database with the schema."""
    db = get_db_connection()
    
    # Get the path to schema.sql
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    
    with open(schema_path, 'r', encoding='utf-8') as f:
        db.executescript(f.read())
    
    db.commit()
    print("Database initialized successfully!")


def init_app(app):
    """Register database functions with the Flask app."""
    app.teardown_appcontext(close_db)
