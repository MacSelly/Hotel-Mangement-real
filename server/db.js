const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize database tables
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();

        // Create rooms table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS rooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                capacity INT NOT NULL,
                size VARCHAR(50),
                image VARCHAR(255),
                hue_rotate INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create bookings table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                room_name VARCHAR(255) NOT NULL,
                check_in DATE NOT NULL,
                check_out DATE NOT NULL,
                guests VARCHAR(50),
                requests TEXT,
                status VARCHAR(50) DEFAULT 'Confirmed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create settings table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT PRIMARY KEY DEFAULT 1,
                hero_title TEXT,
                hero_subtitle TEXT,
                contact_email VARCHAR(255),
                contact_phone VARCHAR(50),
                contact_address TEXT,
                footer_tagline TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create amenities table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS amenities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                icon VARCHAR(10),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if we need to seed data
        const [rooms] = await connection.query('SELECT COUNT(*) as count FROM rooms');
        if (rooms[0].count === 0) {
            // Seed default rooms
            await connection.query(`
                INSERT INTO rooms (name, description, price, capacity, size, image, hue_rotate) VALUES
                ('Presidential Suite', 'Panoramic city views, king-sized bed, and a private lounge area.', 450, 2, '85m²', 'room.png', 0),
                ('Deluxe Room', 'Elegant design with modern amenities and a spacious bathroom.', 280, 2, '45m²', 'room.png', 15),
                ('Executive Suite', 'Perfect for business travelers, featuring a dedicated workspace.', 350, 3, '60m²', 'room.png', -15)
            `);
            console.log('✓ Seeded default rooms');
        }

        const [settings] = await connection.query('SELECT COUNT(*) as count FROM settings');
        if (settings[0].count === 0) {
            // Seed default settings
            await connection.query(`
                INSERT INTO settings (id, hero_title, hero_subtitle, contact_email, contact_phone, contact_address, footer_tagline) VALUES
                (1, 'Experience <span class="accent">Unmatched</span> Luxury', 'Where elegance meets comfort in the heart of the city.', 'reservations@luxehaven.com', '+1 (555) 123-4567', '123 Luxury Blvd, Metropolis, NY 10001', 'Redefining luxury hospitality since 2024.')
            `);
            console.log('✓ Seeded default settings');
        }

        const [amenities] = await connection.query('SELECT COUNT(*) as count FROM amenities');
        if (amenities[0].count === 0) {
            // Seed default amenities
            await connection.query(`
                INSERT INTO amenities (name, description, icon) VALUES
                ('Infinity Pool', 'Relax in our temperature-controlled rooftop pool with stunning views.', '🏊'),
                ('Fine Dining', 'Savor exquisite culinary creations at our award-winning restaurant.', '🍽️'),
                ('Luxury Spa', 'Rejuvenate your body and mind with our signature spa treatments.', '💆'),
                ('Fitness Center', 'State-of-the-art equipment available 24/7 for your workout routine.', '🏋️')
            `);
            console.log('✓ Seeded default amenities');
        }

        connection.release();
        console.log('✓ Database initialized successfully');
    } catch (error) {
        console.error('✗ Database initialization error:', error.message);
        throw error;
    }
}

module.exports = { pool, initializeDatabase };
