"""Main page routes."""

from flask import Blueprint, render_template, current_app

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    """Render the main landing page."""
    return render_template('index.html',
        vk_music_url=current_app.config.get('VK_MUSIC_URL'),
        yandex_music_url=current_app.config.get('YANDEX_MUSIC_URL'),
        telegram=current_app.config.get('TELEGRAM'),
        instagram=current_app.config.get('INSTAGRAM'),
        vk_profile=current_app.config.get('VK_PROFILE'),
        course_price=current_app.config.get('COURSE_PRICE', 4990)
    )


@main_bp.route('/payment-success')
def payment_success():
    """Payment success page."""
    return render_template('index.html',
        payment_success=True,
        vk_music_url=current_app.config.get('VK_MUSIC_URL'),
        yandex_music_url=current_app.config.get('YANDEX_MUSIC_URL'),
        telegram=current_app.config.get('TELEGRAM'),
        instagram=current_app.config.get('INSTAGRAM'),
        vk_profile=current_app.config.get('VK_PROFILE'),
        course_price=current_app.config.get('COURSE_PRICE', 4990)
    )


@main_bp.route('/payment-failure')
def payment_failure():
    """Payment failure page."""
    return render_template('index.html',
        payment_failure=True,
        vk_music_url=current_app.config.get('VK_MUSIC_URL'),
        yandex_music_url=current_app.config.get('YANDEX_MUSIC_URL'),
        telegram=current_app.config.get('TELEGRAM'),
        instagram=current_app.config.get('INSTAGRAM'),
        vk_profile=current_app.config.get('VK_PROFILE'),
        course_price=current_app.config.get('COURSE_PRICE', 4990)
    )
