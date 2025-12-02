require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, initializeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize database on startup
initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});

// ==================== ROOMS API ====================

// Get all rooms
app.get('/api/rooms', async (req, res) => {
    try {
        const [rooms] = await pool.query('SELECT * FROM rooms ORDER BY id');
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add or update room
app.post('/api/rooms', async (req, res) => {
    try {
        const { id, name, description, price, capacity, size, image, hueRotate } = req.body;

        if (id) {
            // Update existing room
            await pool.query(
                'UPDATE rooms SET name=?, description=?, price=?, capacity=?, size=?, image=?, hue_rotate=? WHERE id=?',
                [name, description, price, capacity, size, image, hueRotate || 0, id]
            );
            res.json({ id, name, description, price, capacity, size, image, hueRotate });
        } else {
            // Insert new room
            const [result] = await pool.query(
                'INSERT INTO rooms (name, description, price, capacity, size, image, hue_rotate) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [name, description, price, capacity, size, image, hueRotate || 0]
            );
            res.json({ id: result.insertId, name, description, price, capacity, size, image, hueRotate });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete room
app.delete('/api/rooms/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM rooms WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== BOOKINGS API ====================

// Get all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const [bookings] = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { firstName, lastName, email, roomName, checkIn, checkOut, guests, requests } = req.body;

        const [result] = await pool.query(
            'INSERT INTO bookings (first_name, last_name, email, room_name, check_in, check_out, guests, requests, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, roomName, checkIn, checkOut, guests, requests, 'Confirmed']
        );

        res.json({
            id: result.insertId,
            firstName,
            lastName,
            email,
            roomName,
            checkIn,
            checkOut,
            guests,
            requests,
            status: 'Confirmed'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update booking status
app.patch('/api/bookings/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE bookings SET status=? WHERE id=?', [status, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SETTINGS API ====================

// Get settings
app.get('/api/settings', async (req, res) => {
    try {
        const [settings] = await pool.query('SELECT * FROM settings WHERE id=1');
        res.json(settings[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update settings
app.put('/api/settings', async (req, res) => {
    try {
        const { heroTitle, heroSubtitle, contactEmail, contactPhone, contactAddress, footerTagline } = req.body;

        await pool.query(
            'UPDATE settings SET hero_title=?, hero_subtitle=?, contact_email=?, contact_phone=?, contact_address=?, footer_tagline=? WHERE id=1',
            [heroTitle, heroSubtitle, contactEmail, contactPhone, contactAddress, footerTagline]
        );

        res.json({ heroTitle, heroSubtitle, contactEmail, contactPhone, contactAddress, footerTagline });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== AMENITIES API ====================

// Get all amenities
app.get('/api/amenities', async (req, res) => {
    try {
        const [amenities] = await pool.query('SELECT * FROM amenities ORDER BY id');
        res.json(amenities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add or update amenity
app.post('/api/amenities', async (req, res) => {
    try {
        const { id, name, description, icon } = req.body;

        if (id) {
            // Update existing amenity
            await pool.query(
                'UPDATE amenities SET name=?, description=?, icon=? WHERE id=?',
                [name, description, icon, id]
            );
            res.json({ id, name, description, icon });
        } else {
            // Insert new amenity
            const [result] = await pool.query(
                'INSERT INTO amenities (name, description, icon) VALUES (?, ?, ?)',
                [name, description, icon]
            );
            res.json({ id: result.insertId, name, description, icon });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete amenity
app.delete('/api/amenities/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM amenities WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Hotel Management API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api/`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  GET    /api/rooms`);
    console.log(`  POST   /api/rooms`);
    console.log(`  DELETE /api/rooms/:id`);
    console.log(`  GET    /api/bookings`);
    console.log(`  POST   /api/bookings`);
    console.log(`  PATCH  /api/bookings/:id`);
    console.log(`  GET    /api/settings`);
    console.log(`  PUT    /api/settings`);
    console.log(`  GET    /api/amenities`);
    console.log(`  POST   /api/amenities`);
    console.log(`  DELETE /api/amenities/:id\n`);
});
