"""Main Flask application for Ilshat Galimov Music Site."""

import os
from flask import Flask
from flask_mail import Mail
from config import config
from database.db import init_db, init_app as init_db_app


def create_app(config_name=None):
    """Application factory."""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config['default']))
    
    # Initialize extensions
    mail = Mail(app)
    
    # Initialize database
    init_db_app(app)
    
    # Register blueprints
    from routes.main import main_bp
    from routes.forms import forms_bp
    from routes.payment import payment_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(forms_bp)
    app.register_blueprint(payment_bp)
    
    # Initialize database on first request
    with app.app_context():
        if not os.path.exists(app.config['DATABASE_PATH']):
            init_db()
    
    return app


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
