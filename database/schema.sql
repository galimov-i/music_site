-- Database schema for Ilshat Galimov Music Site

-- Song commission orders
CREATE TABLE IF NOT EXISTS song_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    song_type TEXT NOT NULL,
    description TEXT NOT NULL,
    budget TEXT,
    deadline TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Course purchases
CREATE TABLE IF NOT EXISTS course_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    amount REAL NOT NULL,
    payment_id TEXT UNIQUE,
    payment_system TEXT CHECK(payment_system IN ('stripe', 'yookassa')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'refunded')),
    access_granted INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    replied INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    subscribed INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_song_orders_status ON song_orders(status);
CREATE INDEX IF NOT EXISTS idx_song_orders_email ON song_orders(email);
CREATE INDEX IF NOT EXISTS idx_course_purchases_email ON course_purchases(email);
CREATE INDEX IF NOT EXISTS idx_course_purchases_payment_id ON course_purchases(payment_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_replied ON contact_submissions(replied);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
