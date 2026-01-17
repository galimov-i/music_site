"""Main Flask application for Ilshat Galimov Music Site."""

import os
from flask import Flask, render_template
from flask_mail import Mail
from config import config
from database.db import init_db, init_app as init_db_app

# Initialize Flask-Mail globally
mail = Mail()


def create_app(config_name=None):
    """Application factory."""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config['default']))
    
    # Initialize extensions
    mail.init_app(app)
    
    # Initialize database
    init_db_app(app)
    
    # Register blueprints
    from routes.main import main_bp
    from routes.forms import forms_bp
    from routes.payment import payment_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(forms_bp)
    app.register_blueprint(payment_bp)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Initialize database on first request
    with app.app_context():
        if not os.path.exists(app.config['DATABASE_PATH']):
            init_db()
    
    return app


def register_error_handlers(app):
    """Register custom error handlers."""
    
    @app.errorhandler(404)
    def not_found_error(error):
        return render_template('index.html',
            error_code=404,
            error_message='Страница не найдена',
            vk_music_url=app.config.get('VK_MUSIC_URL'),
            yandex_music_url=app.config.get('YANDEX_MUSIC_URL'),
            telegram=app.config.get('TELEGRAM'),
            instagram=app.config.get('INSTAGRAM'),
            vk_profile=app.config.get('VK_PROFILE'),
            course_price=app.config.get('COURSE_PRICE', 4990)
        ), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return render_template('index.html',
            error_code=500,
            error_message='Внутренняя ошибка сервера',
            vk_music_url=app.config.get('VK_MUSIC_URL'),
            yandex_music_url=app.config.get('YANDEX_MUSIC_URL'),
            telegram=app.config.get('TELEGRAM'),
            instagram=app.config.get('INSTAGRAM'),
            vk_profile=app.config.get('VK_PROFILE'),
            course_price=app.config.get('COURSE_PRICE', 4990)
        ), 500
    
    @app.after_request
    def add_security_headers(response):
        """Add security headers to all responses."""
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        return response


# Create the application instance
app = create_app()


@app.cli.command('init-db')
def init_db_command():
    """Initialize the database."""
    with app.app_context():
        init_db()
    print('Database initialized.')


if __name__ == '__main__':
    # Ensure database is initialized
    with app.app_context():
        init_db()
    
    app.run(debug=True, host='0.0.0.0', port=5000)
