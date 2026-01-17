"""Payment integration handlers."""

import time
from markupsafe import escape
from flask import Blueprint, request, jsonify, current_app, url_for
from models.course_purchase import CoursePurchase

payment_bp = Blueprint('payment', __name__)


def get_yookassa_configuration():
    """Configure YooKassa SDK."""
    try:
        from yookassa import Configuration
        Configuration.account_id = current_app.config.get('YOOKASSA_SHOP_ID')
        Configuration.secret_key = current_app.config.get('YOOKASSA_SECRET_KEY')
        return True
    except ImportError:
        current_app.logger.warning("YooKassa SDK not installed")
        return False


@payment_bp.route('/create-payment', methods=['POST'])
def create_payment():
    """Create a payment for course purchase."""
    try:
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        
        # Validation
        if not name or not email:
            return jsonify({
                'success': False,
                'error': 'Пожалуйста, заполните имя и email'
            }), 400
        
        course_price = current_app.config.get('COURSE_PRICE', 4990.00)
        
        # Try YooKassa integration
        if get_yookassa_configuration():
            try:
                from yookassa import Payment
                
                payment = Payment.create({
                    "amount": {
                        "value": f"{course_price:.2f}",
                        "currency": "RUB"
                    },
                    "confirmation": {
                        "type": "redirect",
                        "return_url": request.host_url.rstrip('/') + "/payment-success"
                    },
                    "capture": True,
                    "description": "Курс 'Создай и Опубликуй Свою Музыку'",
                    "metadata": {
                        "email": email,
                        "name": name,
                        "phone": phone
                    }
                })
                
                # Save to database
                purchase = CoursePurchase(
                    name=name,
                    email=email,
                    phone=phone,
                    amount=course_price,
                    payment_id=payment.id,
                    payment_system='yookassa'
                )
                purchase.save()
                
                return jsonify({
                    'success': True,
                    'confirmation_url': payment.confirmation.confirmation_url
                })
                
            except Exception as e:
                current_app.logger.error(f"YooKassa error: {e}")
                # Fall through to demo mode
        
        # Demo mode - save order without real payment
        purchase = CoursePurchase(
            name=name,
            email=email,
            phone=phone,
            amount=course_price,
            payment_id=f"demo_{int(time.time() * 1000)}",
            payment_system='demo'
        )
        purchase.save()
        
        return jsonify({
            'success': True,
            'demo_mode': True,
            'message': 'Демо-режим: платежная система не настроена. Ваша заявка сохранена.',
            'confirmation_url': url_for('main.payment_success')
        })
        
    except Exception as e:
        current_app.logger.error(f"Error creating payment: {e}")
        return jsonify({
            'success': False,
            'error': 'Произошла ошибка при создании платежа. Пожалуйста, попробуйте позже.'
        }), 500


@payment_bp.route('/webhook/yookassa', methods=['POST'])
def yookassa_webhook():
    """Handle YooKassa payment webhooks."""
    try:
        # Get the webhook data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        event_type = data.get('event')
        payment_object = data.get('object', {})
        payment_id = payment_object.get('id')
        
        if not payment_id:
            return jsonify({'error': 'No payment ID'}), 400
        
        # Find the purchase
        purchase = CoursePurchase.get_by_payment_id(payment_id)
        
        if not purchase:
            current_app.logger.warning(f"Purchase not found for payment ID: {payment_id}")
            return jsonify({'status': 'ok'})  # Don't fail, just acknowledge
        
        # Handle different event types
        if event_type == 'payment.succeeded':
            purchase.grant_access()
            current_app.logger.info(f"Course access granted for payment: {payment_id}")
            
            # Send confirmation email
            try:
                send_purchase_confirmation(purchase)
            except Exception as e:
                current_app.logger.warning(f"Failed to send confirmation email: {e}")
        
        elif event_type == 'payment.canceled':
            purchase.status = 'cancelled'
            purchase.save()
            current_app.logger.info(f"Payment cancelled: {payment_id}")
        
        elif event_type == 'refund.succeeded':
            purchase.status = 'refunded'
            purchase.access_granted = 0
            purchase.save()
            current_app.logger.info(f"Payment refunded: {payment_id}")
        
        return jsonify({'status': 'ok'})
        
    except Exception as e:
        current_app.logger.error(f"Webhook error: {e}")
        return jsonify({'error': str(e)}), 500


def send_purchase_confirmation(purchase):
    """Send purchase confirmation email."""
    from flask_mail import Mail, Message
    mail = Mail(current_app)
    
    # Escape user input to prevent XSS
    safe_name = escape(purchase.name)
    safe_amount = escape(str(purchase.amount))
    
    msg = Message(
        subject='Спасибо за покупку курса!',
        recipients=[purchase.email],
        html=f'''
        <h2>Спасибо за покупку курса "Создай и Опубликуй Свою Музыку"!</h2>
        <p>Здравствуйте, {safe_name}!</p>
        <p>Ваш платеж успешно обработан.</p>
        <p><strong>Сумма:</strong> {safe_amount}₽</p>
        <p>Доступ к курсу будет отправлен вам в течение 24 часов.</p>
        <p>С уважением,<br>Ильшат Галимов</p>
        '''
    )
    mail.send(msg)
