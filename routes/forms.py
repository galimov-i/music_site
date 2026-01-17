"""Form submission handlers."""

import re
import time
from functools import wraps
from collections import defaultdict
from markupsafe import escape
from flask import Blueprint, request, jsonify, current_app
from flask_mail import Message
from models.song_order import SongOrder
from models.contact import Contact
from database.db import get_db_connection

forms_bp = Blueprint('forms', __name__)

# Simple in-memory rate limiter
_rate_limit_data = defaultdict(list)
RATE_LIMIT_REQUESTS = 5  # Max requests
RATE_LIMIT_WINDOW = 60  # Per 60 seconds


def rate_limit(f):
    """Simple rate limiting decorator."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get client IP
        client_ip = request.remote_addr or 'unknown'
        current_time = time.time()
        
        # Clean old entries
        _rate_limit_data[client_ip] = [
            t for t in _rate_limit_data[client_ip] 
            if current_time - t < RATE_LIMIT_WINDOW
        ]
        
        # Check rate limit
        if len(_rate_limit_data[client_ip]) >= RATE_LIMIT_REQUESTS:
            return jsonify({
                'success': False,
                'errors': ['Слишком много запросов. Пожалуйста, подождите минуту.']
            }), 429
        
        # Add current request
        _rate_limit_data[client_ip].append(current_time)
        
        return f(*args, **kwargs)
    return decorated_function


def validate_email(email):
    """Validate email format."""
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None


def validate_phone(phone):
    """Validate Russian phone format."""
    if not phone:
        return True  # Phone is optional
    # Remove spaces, dashes, parentheses
    cleaned = re.sub(r'[\s\-\(\)]', '', phone)
    pattern = r'^(\+7|8)\d{10}$'
    return re.match(pattern, cleaned) is not None


@forms_bp.route('/submit-song-order', methods=['POST'])
@rate_limit
def submit_song_order():
    """Handle song commission order submission."""
    try:
        # Get form data
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        song_type = request.form.get('song_type', '').strip()
        description = request.form.get('description', '').strip()
        budget = request.form.get('budget', '').strip()
        deadline = request.form.get('deadline', '').strip()
        
        # Validation
        errors = []
        
        if not name:
            errors.append('Пожалуйста, укажите ваше имя')
        
        if not email:
            errors.append('Пожалуйста, укажите email')
        elif not validate_email(email):
            errors.append('Неверный формат email')
        
        if phone and not validate_phone(phone):
            errors.append('Неверный формат телефона (используйте формат +7XXXXXXXXXX или 8XXXXXXXXXX)')
        
        if not song_type:
            errors.append('Пожалуйста, выберите тип песни')
        
        if not description:
            errors.append('Пожалуйста, опишите вашу идею')
        
        if errors:
            return jsonify({'success': False, 'errors': errors}), 400
        
        # Save to database
        order = SongOrder(
            name=name,
            email=email,
            phone=phone,
            song_type=song_type,
            description=description,
            budget=budget,
            deadline=deadline
        )
        order.save()
        
        # Send notification email (optional, will fail silently if not configured)
        try:
            send_song_order_notification(order)
        except Exception as e:
            current_app.logger.warning(f"Failed to send email notification: {e}")
        
        return jsonify({
            'success': True,
            'message': 'Заявка отправлена! Мы свяжемся с вами в ближайшее время.'
        })
        
    except Exception as e:
        current_app.logger.error(f"Error submitting song order: {e}")
        return jsonify({
            'success': False,
            'errors': ['Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.']
        }), 500


@forms_bp.route('/submit-contact', methods=['POST'])
@rate_limit
def submit_contact():
    """Handle contact form submission."""
    try:
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        message = request.form.get('message', '').strip()
        
        # Validation
        errors = []
        
        if not name:
            errors.append('Пожалуйста, укажите ваше имя')
        
        if not email:
            errors.append('Пожалуйста, укажите email')
        elif not validate_email(email):
            errors.append('Неверный формат email')
        
        if not message:
            errors.append('Пожалуйста, введите сообщение')
        
        if errors:
            return jsonify({'success': False, 'errors': errors}), 400
        
        # Save to database
        contact = Contact(
            name=name,
            email=email,
            message=message
        )
        contact.save()
        
        # Send notification email
        try:
            send_contact_notification(contact)
        except Exception as e:
            current_app.logger.warning(f"Failed to send email notification: {e}")
        
        return jsonify({
            'success': True,
            'message': 'Сообщение отправлено! Я отвечу вам в ближайшее время.'
        })
        
    except Exception as e:
        current_app.logger.error(f"Error submitting contact form: {e}")
        return jsonify({
            'success': False,
            'errors': ['Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте позже.']
        }), 500


@forms_bp.route('/subscribe-newsletter', methods=['POST'])
@rate_limit
def subscribe_newsletter():
    """Handle newsletter subscription."""
    try:
        email = request.form.get('email', '').strip()
        
        if not email:
            return jsonify({'success': False, 'errors': ['Пожалуйста, укажите email']}), 400
        
        if not validate_email(email):
            return jsonify({'success': False, 'errors': ['Неверный формат email']}), 400
        
        # Save to database
        db = get_db_connection()
        try:
            db.execute('''
                INSERT INTO newsletter_subscribers (email, subscribed, created_at)
                VALUES (?, 1, ?)
            ''', (email, int(time.time() * 1000)))
            db.commit()
        except Exception:
            # Email already exists
            pass
        
        return jsonify({
            'success': True,
            'message': 'Вы успешно подписались на рассылку!'
        })
        
    except Exception as e:
        current_app.logger.error(f"Error subscribing to newsletter: {e}")
        return jsonify({
            'success': False,
            'errors': ['Произошла ошибка. Пожалуйста, попробуйте позже.']
        }), 500


def send_song_order_notification(order):
    """Send email notification for new song order."""
    from flask_mail import Mail, Message
    mail = Mail(current_app)
    
    # Escape user input to prevent XSS in email clients
    safe_name = escape(order.name)
    safe_email = escape(order.email)
    safe_phone = escape(order.phone or 'Не указан')
    safe_song_type = escape(order.song_type)
    safe_description = escape(order.description)
    safe_budget = escape(order.budget or 'Не указан')
    safe_deadline = escape(order.deadline or 'Не указан')
    
    msg = Message(
        subject=f'Новый заказ песни от {safe_name}',
        recipients=[current_app.config['ADMIN_EMAIL']],
        html=f'''
        <h2>Новый заказ песни</h2>
        <p><strong>Имя:</strong> {safe_name}</p>
        <p><strong>Email:</strong> {safe_email}</p>
        <p><strong>Телефон:</strong> {safe_phone}</p>
        <p><strong>Тип песни:</strong> {safe_song_type}</p>
        <p><strong>Описание:</strong> {safe_description}</p>
        <p><strong>Бюджет:</strong> {safe_budget}</p>
        <p><strong>Срок:</strong> {safe_deadline}</p>
        '''
    )
    mail.send(msg)


def send_contact_notification(contact):
    """Send email notification for contact form."""
    from flask_mail import Mail, Message
    mail = Mail(current_app)
    
    # Escape user input to prevent XSS in email clients
    safe_name = escape(contact.name)
    safe_email = escape(contact.email)
    safe_message = escape(contact.message)
    
    msg = Message(
        subject=f'Новое сообщение от {safe_name}',
        recipients=[current_app.config['ADMIN_EMAIL']],
        html=f'''
        <h2>Новое сообщение</h2>
        <p><strong>Имя:</strong> {safe_name}</p>
        <p><strong>Email:</strong> {safe_email}</p>
        <p><strong>Сообщение:</strong></p>
        <p>{safe_message}</p>
        '''
    )
    mail.send(msg)
