"""Routes package for the music site."""

from .main import main_bp
from .forms import forms_bp
from .payment import payment_bp

__all__ = ['main_bp', 'forms_bp', 'payment_bp']
