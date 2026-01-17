"""Contact form submission model."""

import time
from database.db import get_db_connection


class Contact:
    """Model for contact form submissions."""
    
    def __init__(self, id=None, name=None, email=None, message=None,
                 replied=0, created_at=None):
        self.id = id
        self.name = name
        self.email = email
        self.message = message
        self.replied = replied
        self.created_at = created_at or int(time.time() * 1000)
    
    def save(self):
        """Save the contact submission to the database."""
        db = get_db_connection()
        
        if self.id is None:
            cursor = db.execute('''
                INSERT INTO contact_submissions 
                (name, email, message, replied, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                self.name, self.email, self.message, 
                self.replied, self.created_at
            ))
            self.id = cursor.lastrowid
        else:
            db.execute('''
                UPDATE contact_submissions 
                SET name=?, email=?, message=?, replied=?
                WHERE id=?
            ''', (
                self.name, self.email, self.message, 
                self.replied, self.id
            ))
        
        db.commit()
        return self
    
    @classmethod
    def get_all(cls, replied=None):
        """Get all contact submissions."""
        db = get_db_connection()
        if replied is not None:
            rows = db.execute(
                'SELECT * FROM contact_submissions WHERE replied = ? ORDER BY created_at DESC',
                (replied,)
            ).fetchall()
        else:
            rows = db.execute(
                'SELECT * FROM contact_submissions ORDER BY created_at DESC'
            ).fetchall()
        return [cls(**dict(row)) for row in rows]
    
    def mark_replied(self):
        """Mark the contact as replied."""
        self.replied = 1
        self.save()
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'message': self.message,
            'replied': bool(self.replied),
            'created_at': self.created_at
        }
