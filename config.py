"""Configuration settings for the Flask application."""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Database
    DATABASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'music_site.db')
    
    # Mail settings
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.yandex.ru')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_USERNAME')
    
    # YooKassa
    YOOKASSA_SHOP_ID = os.environ.get('YOOKASSA_SHOP_ID')
    YOOKASSA_SECRET_KEY = os.environ.get('YOOKASSA_SECRET_KEY')
    
    # Admin
    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
    
    # Social Links
    VK_MUSIC_URL = os.environ.get('VK_MUSIC_URL', 'https://vk.com/artist/ilshatgalimov')
    YANDEX_MUSIC_URL = os.environ.get('YANDEX_MUSIC_URL', 'https://music.yandex.ru/artist/ARTIST_ID')
    TELEGRAM = os.environ.get('TELEGRAM', 'https://t.me/ilshator')
    INSTAGRAM = os.environ.get('INSTAGRAM', 'https://instagram.com/ilshatgalimov')
    VK_PROFILE = os.environ.get('VK_PROFILE', 'https://vk.com/ilshatgalimov')
    
    # Course pricing
    COURSE_PRICE = 4990.00
    COURSE_CURRENCY = 'RUB'


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
