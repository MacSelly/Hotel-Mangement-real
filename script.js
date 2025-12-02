document.addEventListener('DOMContentLoaded', async () => {
    // --- INITIALIZATION ---
    await renderSiteContent();
    await renderRooms();
    await populateRoomSelect();

    // --- UI INTERACTION ---

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when nav buttons are clicked
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(18, 18, 18, 0.98)';
            header.style.padding = '15px 0';
        } else {
            header.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
            header.style.padding = '20px 0';
        }
    });

    // Scroll Animation Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select elements to animate
    const animatedElements = document.querySelectorAll('.room-card, .amenity-item, .section-title, .section-subtitle, .hero-title, .hero-subtitle');

    animatedElements.forEach(el => {
        if (getComputedStyle(el).opacity !== '1') {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(el);
        }
    });

    // --- MODAL LOGIC ---
    const modal = document.getElementById('booking-modal');
    const signupModal = document.getElementById('signup-modal');
    const closeModal = document.querySelector('.close-modal');

    window.openModal = () => {
        modal.classList.add('active');
    };

    window.openSignupModal = () => {
        signupModal.classList.add('active');
    };

    window.closeSignupModal = () => {
        signupModal.classList.remove('active');
    };

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.classList.remove('active');
        }
        if (event.target == signupModal) {
            signupModal.classList.remove('active');
        }
    };

    // --- BOOKING SUBMISSION ---
    const bookingForm = document.getElementById('final-booking-form');
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const booking = {
            firstName: document.getElementById('booking-fname').value,
            lastName: document.getElementById('booking-lname').value,
            email: document.getElementById('booking-email').value,
            roomName: document.getElementById('modal-room-type').value,
            checkIn: document.getElementById('check-in').value,
            checkOut: document.getElementById('check-out').value,
            guests: document.getElementById('guests').value,
            requests: document.getElementById('booking-requests').value
        };

        if (!booking.checkIn || !booking.checkOut) {
            alert('Please select Check-In and Check-Out dates in the main form first.');
            modal.classList.remove('active');
            document.getElementById('check-in').focus();
            return;
        }

        try {
            await StorageManager.addBooking(booking);
            alert('Booking Confirmed! Thank you for choosing Luxe Haven.');
            modal.classList.remove('active');
            bookingForm.reset();
        } catch (error) {
            alert('Error creating booking. Please try again.');
            console.error(error);
        }
    });

    // --- SIGNUP SUBMISSION ---
    const signupForm = document.getElementById('signup-form');
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = {
            firstName: document.getElementById('signup-fname').value,
            lastName: document.getElementById('signup-lname').value,
            email: document.getElementById('signup-email').value,
            password: document.getElementById('signup-password').value,
            phone: document.getElementById('signup-phone').value
        };

        try {
            // Here you would typically send to your backend
            console.log('New user signup:', user);
            alert('Account created successfully! Welcome to Luxe Haven.');
            signupModal.classList.remove('active');
            signupForm.reset();
        } catch (error) {
            alert('Error creating account. Please try again.');
            console.error(error);
        }
    });
});

// --- DYNAMIC RENDERING FUNCTIONS ---

async function renderSiteContent() {
    const settings = await StorageManager.getSettings();

    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const contactPhone = document.getElementById('contact-phone');
    const contactEmail = document.getElementById('contact-email');

    const title = settings.hero_title || settings.heroTitle;
    const subtitle = settings.hero_subtitle || settings.heroSubtitle;
    const phone = settings.contact_phone || settings.contactPhone;
    const email = settings.contact_email || settings.contactEmail;

    if (heroTitle && title) heroTitle.innerHTML = title;
    if (heroSubtitle && subtitle) heroSubtitle.textContent = subtitle;
    if (contactPhone && phone) contactPhone.textContent = phone;
    if (contactEmail && email) contactEmail.textContent = email;
}

async function renderRooms() {
    const roomsGrid = document.getElementById('rooms-grid');
    if (!roomsGrid) return;

    roomsGrid.innerHTML = '';
    const rooms = await StorageManager.getRooms();

    rooms.forEach((room, index) => {
        const delayClass = index > 0 ? `delay-${index}` : '';
        const card = document.createElement('article');
        card.className = `room-card fade-in ${delayClass}`;

        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

        const hueRotate = room.hue_rotate !== undefined ? room.hue_rotate : (room.hueRotate || 0);

        card.innerHTML = `
            <div class="room-image">
                <img src="${room.image}" alt="${room.name}" style="filter: hue-rotate(${hueRotate}deg);">
            </div>
            <div class="room-details">
                <h3 class="room-title">${room.name}</h3>
                <p class="room-desc">${room.description}</p>
                <div class="room-meta">
                    <span><i class="icon"></i> ${room.size}</span>
                    <span><i class="icon"></i> ${room.capacity} Guests</span>
                </div>
                <div class="room-footer">
                    <span class="price">$${room.price} <small>/ night</small></span>
                    <button class="btn btn-outline" onclick="openModalWithRoom('${room.name}')">Book Now</button>
                </div>
            </div>
        `;
        roomsGrid.appendChild(card);
    });
}

async function populateRoomSelect() {
    const select = document.getElementById('modal-room-type');
    if (!select) return;

    select.innerHTML = '';
    const rooms = await StorageManager.getRooms();

    rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.name;
        option.textContent = `${room.name} - $${room.price}/night`;
        select.appendChild(option);
    });
}

window.openModalWithRoom = (roomName) => {
    const select = document.getElementById('modal-room-type');
    if (select) {
        select.value = roomName;
    }
    window.openModal();
};
