"""Course purchase model."""

import time
from database.db import get_db_connection


class CoursePurchase:
    """Model for course purchases."""
    
    def __init__(self, id=None, name=None, email=None, phone=None,
                 amount=None, payment_id=None, payment_system=None,
                 status='pending', access_granted=0, created_at=None, updated_at=None):
        self.id = id
        self.name = name
        self.email = email
        self.phone = phone
        self.amount = amount
        self.payment_id = payment_id
        self.payment_system = payment_system
        self.status = status
        self.access_granted = access_granted
        self.created_at = created_at or int(time.time() * 1000)
        self.updated_at = updated_at or int(time.time() * 1000)
    
    def save(self):
        """Save the purchase to the database."""
        db = get_db_connection()
        
        if self.id is None:
            cursor = db.execute('''
                INSERT INTO course_purchases 
                (name, email, phone, amount, payment_id, payment_system, status, access_granted, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                self.name, self.email, self.phone, self.amount,
                self.payment_id, self.payment_system, self.status,
                self.access_granted, self.created_at, self.updated_at
            ))
            self.id = cursor.lastrowid
        else:
            self.updated_at = int(time.time() * 1000)
            db.execute('''
                UPDATE course_purchases 
                SET name=?, email=?, phone=?, amount=?, payment_id=?, 
                    payment_system=?, status=?, access_granted=?, updated_at=?
                WHERE id=?
            ''', (
                self.name, self.email, self.phone, self.amount,
                self.payment_id, self.payment_system, self.status,
                self.access_granted, self.updated_at, self.id
            ))
        
        db.commit()
        return self
    
    @classmethod
    def get_by_payment_id(cls, payment_id):
        """Get a purchase by payment ID."""
        db = get_db_connection()
        row = db.execute(
            'SELECT * FROM course_purchases WHERE payment_id = ?', 
            (payment_id,)
        ).fetchone()
        if row:
            return cls(**dict(row))
        return None
    
    @classmethod
    def get_by_email(cls, email):
        """Get all purchases for an email."""
        db = get_db_connection()
        rows = db.execute(
            'SELECT * FROM course_purchases WHERE email = ? ORDER BY created_at DESC',
            (email,)
        ).fetchall()
        return [cls(**dict(row)) for row in rows]
    
    def grant_access(self):
        """Grant course access after successful payment."""
        self.access_granted = 1
        self.status = 'completed'
        self.save()
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'amount': self.amount,
            'payment_id': self.payment_id,
            'payment_system': self.payment_system,
            'status': self.status,
            'access_granted': bool(self.access_granted),
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
