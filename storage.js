/**
 * storage.js
 * Handles all data persistence using MySQL backend API.
 */

const API_URL = 'http://localhost:3000/api';

const StorageManager = {
    // --- ROOMS ---
    async getRooms() {
        try {
            const response = await fetch(`${API_URL}/rooms`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching rooms:', error);
            return [];
        }
    },

    async saveRoom(room) {
        try {
            const response = await fetch(`${API_URL}/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(room)
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving room:', error);
            throw error;
        }
    },

    async deleteRoom(id) {
        try {
            await fetch(`${API_URL}/rooms/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting room:', error);
            throw error;
        }
    },

    // --- BOOKINGS ---
    async getBookings() {
        try {
            const response = await fetch(`${API_URL}/bookings`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return [];
        }
    },

    async addBooking(booking) {
        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(booking)
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding booking:', error);
            throw error;
        }
    },

    async updateBookingStatus(id, status) {
        try {
            await fetch(`${API_URL}/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    },

    // --- SETTINGS ---
    async getSettings() {
        try {
            const response = await fetch(`${API_URL}/settings`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching settings:', error);
            return {};
        }
    },

    async saveSettings(settings) {
        try {
            const response = await fetch(`${API_URL}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    },

    // --- AMENITIES ---
    async getAmenities() {
        try {
            const response = await fetch(`${API_URL}/amenities`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching amenities:', error);
            return [];
        }
    },

    async saveAmenity(amenity) {
        try {
            const response = await fetch(`${API_URL}/amenities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(amenity)
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving amenity:', error);
            throw error;
        }
    },

    async deleteAmenity(id) {
        try {
            await fetch(`${API_URL}/amenities/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting amenity:', error);
            throw error;
        }
    }
};
