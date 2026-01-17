# Ilshat Galimov Music Site

A modern, high-converting one-page landing website for music artist Ilshat Galimov built with Flask.

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)
![SQLite](https://img.shields.io/badge/SQLite-3-lightgrey.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

[🇷🇺 Русская версия](README_RUS.md)

## Features

- 🎵 **Music Platform Integration** - VK Music & Yandex Music links
- 💰 **Donation System** - Boosty, DonationAlerts, VK Donut, crypto wallets
- 📝 **Song Commission Form** - Custom order form with pricing tiers
- 🎓 **Course Sales** - Music production course with YooKassa payment
- 📱 **Responsive Design** - Mobile-first approach
- ✨ **Modern Animations** - Smooth scroll and fade-in effects
- 📧 **Email Notifications** - Flask-Mail integration
- 🔒 **Security** - Rate limiting, XSS protection, security headers

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Flask 3.0+ (Python) |
| Database | SQLite |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Payment | YooKassa (Russian market) |
| Email | Flask-Mail |
| Fonts | Google Fonts (Montserrat, Open Sans) |

## Quick Start

### Prerequisites

- Python 3.10+
- pip (Python package manager)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ilshat-galimov-landing

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Run the application
python app.py
```

Open http://localhost:5000 in your browser.

## Project Structure

```
├── app.py                  # Flask application factory
├── config.py               # Configuration settings
├── requirements.txt        # Python dependencies
├── .env.example            # Environment template
├── database/
│   ├── __init__.py
│   ├── db.py               # Database connection
│   └── schema.sql          # SQL schema
├── routes/
│   ├── __init__.py
│   ├── main.py             # Main routes
│   ├── forms.py            # Form handlers (with rate limiting)
│   └── payment.py          # Payment integration
├── models/
│   ├── __init__.py
│   ├── song_order.py       # Song order model
│   ├── course_purchase.py  # Course purchase model
│   └── contact.py          # Contact model
├── static/
│   ├── css/
│   │   ├── style.css       # Main styles (~1500 lines)
│   │   ├── animations.css  # Animation styles
│   │   └── responsive.css  # Media queries
│   ├── js/
│   │   ├── main.js         # Core JavaScript
│   │   ├── animations.js   # Scroll animations
│   │   ├── forms.js        # Form validation
│   │   └── payment.js      # Payment handling
│   └── images/
│       ├── favicon.svg
│       └── og-image.svg
└── templates/
    ├── base.html           # Base template
    ├── index.html          # Landing page
    └── email/              # Email templates
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Flask secret key (generate with `python -c "import secrets; print(secrets.token_hex(32))"`) |
| `YOOKASSA_SHOP_ID` | No | YooKassa shop ID |
| `YOOKASSA_SECRET_KEY` | No | YooKassa secret key |
| `MAIL_SERVER` | No | SMTP server (default: smtp.yandex.ru) |
| `MAIL_PORT` | No | SMTP port (default: 587) |
| `MAIL_USERNAME` | No | Email address |
| `MAIL_PASSWORD` | No | Email app password |
| `ADMIN_EMAIL` | No | Admin notification email |

### YooKassa Payment Setup

1. Register at [yookassa.ru](https://yookassa.ru/)
2. Create a shop and get credentials
3. Add to `.env`:
   ```
   YOOKASSA_SHOP_ID=your_shop_id
   YOOKASSA_SECRET_KEY=your_secret_key
   ```
4. Configure webhook: `https://your-domain.com/webhook/yookassa`
5. Test in sandbox mode before going live

## API Endpoints

| Method | Endpoint | Description | Rate Limited |
|--------|----------|-------------|--------------|
| GET | `/` | Landing page | No |
| POST | `/submit-song-order` | Song order | Yes (5/min) |
| POST | `/submit-contact` | Contact form | Yes (5/min) |
| POST | `/subscribe-newsletter` | Newsletter | Yes (5/min) |
| POST | `/create-payment` | Course payment | No |
| GET | `/payment-success` | Success page | No |
| GET | `/payment-failure` | Failure page | No |
| POST | `/webhook/yookassa` | Payment webhook | No |

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `song_orders` | Song commission requests |
| `course_purchases` | Course purchase records |
| `contact_submissions` | Contact form messages |
| `newsletter_subscribers` | Email subscribers |

### Initialize Database

```bash
# Using Flask CLI
flask init-db

# Or programmatically
python -c "from app import app; from database.db import init_db; app.app_context().push(); init_db()"
```

## Customization

### Color Scheme

Edit CSS variables in `static/css/style.css`:

```css
:root {
    --color-primary: #0077FF;      /* VK Blue */
    --color-secondary: #FFCC00;    /* Yandex Yellow */
    --color-accent: #FF3347;       /* CTA Red */
    --color-bg-dark: #0A0A0F;      /* Background */
    --color-text-primary: #FFFFFF; /* Text */
}
```

### Content

Edit Russian content in `templates/index.html`:
- Hero section (lines 3-30)
- About section (lines 35-75)
- Course details (lines 100-180)
- Pricing tiers (lines 220-280)

### Adding Images

Replace placeholders in `static/images/`:
- `hero/` - Hero background
- `about/` - Artist photos
- `course/` - Course previews

## Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

```bash
docker build -t ilshat-music .
docker run -p 5000:5000 --env-file .env ilshat-music
```

### Gunicorn (Production)

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### PythonAnywhere

1. Upload files via Web interface or Git
2. Create virtual environment
3. Install dependencies: `pip install -r requirements.txt`
4. Configure WSGI file to import `app` from `app.py`
5. Set environment variables in Web tab
6. Reload web app

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name ilshatgalimov.ru;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /static {
        alias /path/to/app/static;
        expires 30d;
    }
}
```

## Security Features

- **Rate Limiting** - 5 requests per minute per IP on forms
- **XSS Protection** - All user input escaped in emails
- **Security Headers** - X-Content-Type-Options, X-Frame-Options, etc.
- **SQL Injection Prevention** - Parameterized queries
- **CSRF Ready** - Can add Flask-WTF for forms

## Performance

| Metric | Target |
|--------|--------|
| Lighthouse Score | 90+ |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Total Bundle Size | < 100KB (CSS+JS) |

### Optimization Tips

1. Enable gzip compression in Nginx
2. Use CDN for static assets
3. Add `loading="lazy"` to images below fold
4. Minify CSS/JS in production

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Yandex Browser | Latest |

## Troubleshooting

### Database Issues

```bash
# Reset database
rm music_site.db
python -c "from app import app; from database.db import init_db; app.app_context().push(); init_db()"
```

### Email Not Sending

1. Check MAIL_* environment variables
2. For Yandex Mail, create app password
3. Check spam folder
4. Verify SMTP port (587 for TLS)

### Payment Not Working

1. Verify YooKassa credentials
2. Check webhook URL is accessible
3. Test in sandbox mode first
4. Check Flask logs for errors

## Development

### Running Tests

```bash
python -m pytest tests/
```

### Code Style

```bash
# Install linters
pip install flake8 black

# Check code
flake8 .
black --check .
```

### Adding New Features

1. Create feature branch
2. Add tests if applicable
3. Update documentation
4. Submit pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contact

- **Telegram**: [@ilshatgalimov](https://t.me/ilshator)
- **VK**: [vk.com/ilshatgalimov](https://vk.com/ilshatgalimov)
- **Email**: ilshat.music@example.com

---

Built with ❤️ for Ilshat Galimov | © 2026
