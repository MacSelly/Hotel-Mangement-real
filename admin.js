/**
 * admin.js
 * Logic for the Admin Dashboard with async API calls and enhanced features.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching
    const tabs = document.querySelectorAll('.admin-nav li');
    const sections = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');

            // Refresh data when switching tabs
            renderDashboard();
        });
    });

    // Initial Render
    renderDashboard();
    setupForms();
    setupImageUpload();
});

async function renderDashboard() {
    await renderStats();
    await renderRooms();
    await renderBookings();
    await loadSettings();
    await renderAmenities();
}

// --- STATS ---
async function renderStats() {
    const bookings = await StorageManager.getBookings();
    const rooms = await StorageManager.getRooms();

    document.getElementById('total-bookings').textContent = bookings.length;
    document.getElementById('active-rooms').textContent = rooms.length;

    // Calculate Revenue
    const revenue = bookings.reduce((total, booking) => {
        if (booking.status !== 'Cancelled') {
            const room = rooms.find(r => r.name === booking.room_name || r.name === booking.roomName);
            const price = room ? room.price : 0;
            return total + parseFloat(price);
        }
        return total;
    }, 0);

    document.getElementById('total-revenue').textContent = `$${revenue.toLocaleString()}`;

    // Recent Bookings Table
    const recentTable = document.getElementById('recent-bookings-table');
    recentTable.innerHTML = '';
    const recentBookings = [...bookings].slice(0, 5);

    recentBookings.forEach(booking => {
        const row = document.createElement('tr');
        const bookingId = booking.id || Math.random().toString(36).substr(2, 9);
        const firstName = booking.first_name || booking.firstName || '';
        const lastName = booking.last_name || booking.lastName || '';
        const roomName = booking.room_name || booking.roomName || '';
        const date = booking.created_at || booking.date || new Date().toISOString();

        row.innerHTML = `
            <td>#${bookingId.toString().slice(-4)}</td>
            <td>${firstName} ${lastName}</td>
            <td>${roomName}</td>
            <td>${new Date(date).toLocaleDateString()}</td>
            <td><span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
        `;
        recentTable.appendChild(row);
    });
}

// --- ROOMS ---
async function renderRooms() {
    const roomsList = document.getElementById('rooms-list');
    roomsList.innerHTML = '';
    const rooms = await StorageManager.getRooms();

    rooms.forEach(room => {
        const card = document.createElement('div');
        card.className = 'admin-room-card';
        const hueRotate = room.hue_rotate !== undefined ? room.hue_rotate : (room.hueRotate || 0);

        card.innerHTML = `
            <div class="admin-room-img">
                <img src="${room.image}" style="filter: hue-rotate(${hueRotate}deg)">
            </div>
            <div class="admin-room-info">
                <div class="admin-room-header">
                    <h3>${room.name}</h3>
                    <span style="color: var(--primary-color)">$${room.price}</span>
                </div>
                <p style="font-size: 0.8rem; color: #aaa; margin-bottom: 10px;">${room.description.substring(0, 60)}...</p>
                <div class="admin-room-actions">
                    <button class="btn-primary btn-sm" onclick="editRoom(${room.id})">Edit</button>
                    <button class="btn-danger btn-sm" onclick="deleteRoom(${room.id})">Delete</button>
                </div>
            </div>
        `;
        roomsList.appendChild(card);
    });
}

// --- BOOKINGS ---
async function renderBookings() {
    const table = document.getElementById('all-bookings-table');
    table.innerHTML = '';
    const bookings = await StorageManager.getBookings();

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        const firstName = booking.first_name || booking.firstName || '';
        const lastName = booking.last_name || booking.lastName || '';
        const roomName = booking.room_name || booking.roomName || '';
        const checkIn = booking.check_in || booking.checkIn || '';
        const checkOut = booking.check_out || booking.checkOut || '';
        const date = booking.created_at || booking.date || new Date().toISOString();

        row.innerHTML = `
            <td>${new Date(date).toLocaleDateString()}</td>
            <td>${firstName} ${lastName}</td>
            <td>${booking.email}</td>
            <td>${roomName}</td>
            <td>${checkIn} - ${checkOut}</td>
            <td><span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
            <td>
                ${booking.status !== 'Cancelled' ?
                `<button class="btn-danger btn-sm" onclick="cancelBooking(${booking.id})">Cancel</button>` :
                '-'}
            </td>
        `;
        table.appendChild(row);
    });
}

// --- AMENITIES ---
async function renderAmenities() {
    const amenitiesList = document.getElementById('amenities-list');
    if (!amenitiesList) return;

    amenitiesList.innerHTML = '';
    const amenities = await StorageManager.getAmenities();

    amenities.forEach(amenity => {
        const card = document.createElement('div');
        card.className = 'admin-room-card';

        card.innerHTML = `
            <div class="admin-room-info">
                <div class="admin-room-header">
                    <h3>${amenity.icon} ${amenity.name}</h3>
                </div>
                <p style="font-size: 0.9rem; color: #aaa; margin-bottom: 15px;">${amenity.description}</p>
                <div class="admin-room-actions">
                    <button class="btn-primary btn-sm" onclick="editAmenity(${amenity.id})">Edit</button>
                    <button class="btn-danger btn-sm" onclick="deleteAmenity(${amenity.id})">Delete</button>
                </div>
            </div>
        `;
        amenitiesList.appendChild(card);
    });
}

// --- SETTINGS ---
async function loadSettings() {
    const settings = await StorageManager.getSettings();
    document.getElementById('setting-hero-title').value = settings.hero_title || settings.heroTitle || '';
    document.getElementById('setting-hero-subtitle').value = settings.hero_subtitle || settings.heroSubtitle || '';
    document.getElementById('setting-email').value = settings.contact_email || settings.contactEmail || '';
    document.getElementById('setting-phone').value = settings.contact_phone || settings.contactPhone || '';
    document.getElementById('setting-address').value = settings.contact_address || settings.contactAddress || '';
    document.getElementById('setting-footer-tagline').value = settings.footer_tagline || settings.footerTagline || '';
}

// --- IMAGE UPLOAD ---
function setupImageUpload() {
    const fileInput = document.getElementById('room-image-file');
    const imagePreview = document.getElementById('image-preview');
    const imageUrlInput = document.getElementById('room-image');

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    imagePreview.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; border-radius: 4px;">`;
                    imageUrlInput.value = event.target.result; // Store base64
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// --- ACTIONS & FORMS ---
function setupForms() {
    // Room Form
    document.getElementById('room-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const room = {
            id: document.getElementById('room-id').value || null,
            name: document.getElementById('room-name').value,
            description: document.getElementById('room-desc').value,
            price: Number(document.getElementById('room-price').value),
            capacity: Number(document.getElementById('room-capacity').value),
            size: document.getElementById('room-size').value,
            image: document.getElementById('room-image').value,
            hueRotate: 0
        };

        await StorageManager.saveRoom(room);
        closeRoomModal();
        await renderDashboard();
    });

    // Settings Form
    document.getElementById('settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const settings = {
            heroTitle: document.getElementById('setting-hero-title').value,
            heroSubtitle: document.getElementById('setting-hero-subtitle').value,
            contactEmail: document.getElementById('setting-email').value,
            contactPhone: document.getElementById('setting-phone').value,
            contactAddress: document.getElementById('setting-address').value,
            footerTagline: document.getElementById('setting-footer-tagline').value
        };
        await StorageManager.saveSettings(settings);
        alert('Settings Saved!');
    });

    // Amenity Form
    document.getElementById('amenity-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const amenity = {
            id: document.getElementById('amenity-id').value || null,
            name: document.getElementById('amenity-name').value,
            description: document.getElementById('amenity-desc').value,
            icon: document.getElementById('amenity-icon').value
        };

        await StorageManager.saveAmenity(amenity);
        closeAmenityModal();
        await renderDashboard();
    });
}

// Global functions for onclick handlers
window.openRoomModal = () => {
    document.getElementById('room-form').reset();
    document.getElementById('room-id').value = '';
    document.getElementById('image-preview').innerHTML = '';
    document.getElementById('room-modal-title').textContent = 'Add Room';
    document.getElementById('room-modal').classList.add('active');
};

window.closeRoomModal = () => {
    document.getElementById('room-modal').classList.remove('active');
};

window.editRoom = async (id) => {
    const rooms = await StorageManager.getRooms();
    const room = rooms.find(r => r.id == id);
    if (room) {
        document.getElementById('room-id').value = room.id;
        document.getElementById('room-name').value = room.name;
        document.getElementById('room-desc').value = room.description;
        document.getElementById('room-price').value = room.price;
        document.getElementById('room-capacity').value = room.capacity;
        document.getElementById('room-size').value = room.size;
        document.getElementById('room-image').value = room.image;

        // Show image preview
        document.getElementById('image-preview').innerHTML = `<img src="${room.image}" style="max-width: 100%; border-radius: 4px;">`;

        document.getElementById('room-modal-title').textContent = 'Edit Room';
        document.getElementById('room-modal').classList.add('active');
    }
};

window.deleteRoom = async (id) => {
    if (confirm('Are you sure you want to delete this room?')) {
        await StorageManager.deleteRoom(id);
        await renderDashboard();
    }
};

window.cancelBooking = async (id) => {
    if (confirm('Cancel this booking?')) {
        await StorageManager.updateBookingStatus(id, 'Cancelled');
        await renderDashboard();
    }
};

// Amenity functions
window.openAmenityModal = () => {
    document.getElementById('amenity-form').reset();
    document.getElementById('amenity-id').value = '';
    document.getElementById('amenity-modal-title').textContent = 'Add Amenity';
    document.getElementById('amenity-modal').classList.add('active');
};

window.closeAmenityModal = () => {
    document.getElementById('amenity-modal').classList.remove('active');
};

window.editAmenity = async (id) => {
    const amenities = await StorageManager.getAmenities();
    const amenity = amenities.find(a => a.id == id);
    if (amenity) {
        document.getElementById('amenity-id').value = amenity.id;
        document.getElementById('amenity-name').value = amenity.name;
        document.getElementById('amenity-desc').value = amenity.description;
        document.getElementById('amenity-icon').value = amenity.icon;

        document.getElementById('amenity-modal-title').textContent = 'Edit Amenity';
        document.getElementById('amenity-modal').classList.add('active');
    }
};

window.deleteAmenity = async (id) => {
    if (confirm('Are you sure you want to delete this amenity?')) {
        await StorageManager.deleteAmenity(id);
        await renderDashboard();
    }
};
