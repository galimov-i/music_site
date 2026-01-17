# Ilshat Galimov Music Site

A modern, high-converting one-page landing website for music artist Ilshat Galimov.

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## Overview

This is a professional music artist landing page featuring:

- 🎵 Music streaming platform links (VK Music, Yandex Music)
- 💰 Donation integration (Boosty, DonationAlerts, VK Donut, crypto)
- 📝 Song commission order form
- 🎓 Music production course sales with payment integration
- 📱 Mobile-first responsive design
- ✨ Modern animations and smooth interactions
- 📧 Email notifications for form submissions

## Tech Stack

- **Backend**: Flask 3.0+ (Python)
- **Database**: SQLite
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Payment**: YooKassa (Russian payment system)
- **Email**: Flask-Mail

## Quick Start

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ilshat-galimov-landing
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

5. **Initialize the database**
   ```bash
   python -c "from app import app; from database.db import init_db; app.app_context().push(); init_db()"
   ```

6. **Run the application**
   ```bash
   python app.py
   ```

7. **Open in browser**
   ```
   http://localhost:5000
   ```

## Project Structure

```
ilshat-galimov-landing/
├── app.py                  # Main Flask application
├── config.py               # Configuration settings
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variables template
├── database/
│   ├── db.py               # Database connection management
│   └── schema.sql          # SQL schema
├── routes/
│   ├── main.py             # Main page routes
│   ├── forms.py            # Form submission handlers
│   └── payment.py          # Payment integration
├── models/
│   ├── song_order.py       # Song commission orders
│   ├── course_purchase.py  # Course purchases
│   └── contact.py          # Contact form submissions
├── static/
│   ├── css/
│   │   ├── style.css       # Main styles
│   │   ├── animations.css  # Animation styles
│   │   └── responsive.css  # Media queries
│   ├── js/
│   │   ├── main.js         # Main JavaScript
│   │   ├── animations.js   # Scroll animations
│   │   ├── forms.js        # Form handling
│   │   └── payment.js      # Payment integration
│   └── images/             # Images and icons
└── templates/
    ├── base.html           # Base template
    ├── index.html          # Main landing page
    └── email/              # Email templates
```

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key | `your-random-secret-key` |
| `YOOKASSA_SHOP_ID` | YooKassa shop ID | `123456` |
| `YOOKASSA_SECRET_KEY` | YooKassa secret key | `test_secret_key` |
| `MAIL_SERVER` | SMTP server | `smtp.yandex.ru` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USERNAME` | Email address | `your@email.com` |
| `MAIL_PASSWORD` | Email password | `app-password` |
| `ADMIN_EMAIL` | Admin notification email | `admin@example.com` |

### Payment Setup (YooKassa)

1. Register at [yookassa.ru](https://yookassa.ru/)
2. Create a shop and get your Shop ID and Secret Key
3. Add credentials to `.env` file
4. Configure webhook URL: `https://your-domain.com/webhook/yookassa`
5. Test in sandbox mode first

## Landing Page Sections

1. **Hero** - Full-screen intro with artist name and CTAs
2. **About** - Artist biography and achievements
3. **Music** - VK Music and Yandex Music links with latest releases
4. **Course** - Music production course with pricing and enrollment
5. **Song Order** - Custom song commission form with pricing tiers
6. **Donation** - Multiple donation platform links
7. **Contact** - Contact form and social links
8. **Footer** - Navigation, legal links, and social icons

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main landing page |
| POST | `/submit-song-order` | Song commission order |
| POST | `/submit-contact` | Contact form |
| POST | `/subscribe-newsletter` | Newsletter subscription |
| POST | `/create-payment` | Create course payment |
| GET | `/payment-success` | Payment success page |
| GET | `/payment-failure` | Payment failure page |
| POST | `/webhook/yookassa` | YooKassa webhook handler |

## Database Schema

### Tables

- `song_orders` - Song commission requests
- `course_purchases` - Course purchase records
- `contact_submissions` - Contact form messages
- `newsletter_subscribers` - Email subscribers

## Customization

### Changing Colors

Edit the CSS variables in `static/css/style.css`:

```css
:root {
    --color-primary: #0077FF;      /* VK Blue */
    --color-secondary: #FFCC00;    /* Yandex Yellow */
    --color-accent: #FF3347;       /* Action Red */
    /* ... */
}
```

### Updating Content

Edit the Russian content in `templates/index.html`. Key sections:
- Hero tagline and CTA buttons
- About biography text
- Course details and pricing
- Song order pricing tiers

### Adding Images

Replace placeholder images in `static/images/`:
- `hero/` - Hero background images
- `about/` - Artist photos
- `course/` - Course preview images

## Deployment

### PythonAnywhere

1. Create a PythonAnywhere account
2. Upload project files
3. Create virtual environment and install dependencies
4. Configure WSGI file
5. Set environment variables
6. Enable HTTPS

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Gunicorn (Production)

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Yandex Browser (latest)

## Performance

- Lighthouse score: 90+ (target)
- First Contentful Paint: < 1.5s
- Fully Interactive: < 3s

## Security

- CSRF protection via Flask
- Form validation (client & server)
- SQL injection prevention (parameterized queries)
- XSS prevention (Jinja2 auto-escaping)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For questions or support:
- Telegram: [@ilshatgalimov](https://t.me/ilshator)
- Email: ilshat.music@example.com

---

Made with ❤️ for Ilshat Galimov
