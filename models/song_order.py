"""Song order model for commission requests."""

import time
from database.db import get_db_connection


class SongOrder:
    """Model for song commission orders."""
    
    def __init__(self, id=None, name=None, email=None, phone=None,
                 song_type=None, description=None, budget=None,
                 deadline=None, status='pending', created_at=None, updated_at=None):
        self.id = id
        self.name = name
        self.email = email
        self.phone = phone
        self.song_type = song_type
        self.description = description
        self.budget = budget
        self.deadline = deadline
        self.status = status
        self.created_at = created_at or int(time.time() * 1000)
        self.updated_at = updated_at or int(time.time() * 1000)
    
    def save(self):
        """Save the order to the database."""
        db = get_db_connection()
        
        if self.id is None:
            # Insert new record
            cursor = db.execute('''
                INSERT INTO song_orders 
                (name, email, phone, song_type, description, budget, deadline, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                self.name, self.email, self.phone, self.song_type,
                self.description, self.budget, self.deadline, self.status,
                self.created_at, self.updated_at
            ))
            self.id = cursor.lastrowid
        else:
            # Update existing record
            self.updated_at = int(time.time() * 1000)
            db.execute('''
                UPDATE song_orders 
                SET name=?, email=?, phone=?, song_type=?, description=?, 
                    budget=?, deadline=?, status=?, updated_at=?
                WHERE id=?
            ''', (
                self.name, self.email, self.phone, self.song_type,
                self.description, self.budget, self.deadline, self.status,
                self.updated_at, self.id
            ))
        
        db.commit()
        return self
    
    @classmethod
    def get_by_id(cls, order_id):
        """Get an order by ID."""
        db = get_db_connection()
        row = db.execute('SELECT * FROM song_orders WHERE id = ?', (order_id,)).fetchone()
        if row:
            return cls(**dict(row))
        return None
    
    @classmethod
    def get_all(cls, status=None):
        """Get all orders, optionally filtered by status."""
        db = get_db_connection()
        if status:
            rows = db.execute(
                'SELECT * FROM song_orders WHERE status = ? ORDER BY created_at DESC',
                (status,)
            ).fetchall()
        else:
            rows = db.execute(
                'SELECT * FROM song_orders ORDER BY created_at DESC'
            ).fetchall()
        return [cls(**dict(row)) for row in rows]
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'song_type': self.song_type,
            'description': self.description,
            'budget': self.budget,
            'deadline': self.deadline,
            'status': self.status,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
