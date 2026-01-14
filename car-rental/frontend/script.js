// ============================================
// 🚗 CAR RENTAL SYSTEM - FRONTEND JAVASCRIPT
// ============================================

const API_URL = 'http://localhost:3000/api';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    loadCars();
    setupBookingForm();
    setupDatePickers();
}

// ===== NAVIGATION =====
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Scroll to section
            const sectionId = this.getAttribute('href').substring(1);
            scrollToSection(sectionId);
        });
    });
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===== CARS FUNCTIONS =====
async function loadCars() {
    try {
        showLoading('carsContainer', 'Loading cars...');
        
        const response = await fetch(`${API_URL}/cars`);
        if (!response.ok) throw new Error('Failed to fetch cars');
        
        const cars = await response.json();
        displayCars(cars);
        populateCarSelect(cars);
        
    } catch (error) {
        showError('carsContainer', `Error loading cars: ${error.message}`);
        console.error('Car loading error:', error);
    }
}

function displayCars(cars) {
    const container = document.getElementById('carsContainer');
    
    if (!cars || cars.length === 0) {
        container.innerHTML = '<p class="no-cars">No cars available at the moment.</p>';
        return;
    }
    
    container.innerHTML = cars.map(car => `
        <div class="car-card">
            <div class="car-header">
                <i class="fas fa-car"></i>
                <h3 class="car-title">${car.name}</h3>
                <span class="car-category">${car.category || 'Standard'}</span>
            </div>
            <div class="car-body">
                <div class="car-details">
                    <div class="detail">
                        <i class="fas fa-users"></i>
                        <div>${car.seats || 4} Seats</div>
                    </div>
                    <div class="detail">
                        <i class="fas fa-suitcase"></i>
                        <div>${car.bags || 2} Bags</div>
                    </div>
                    <div class="detail">
                        <i class="fas fa-cog"></i>
                        <div>${car.transmission || 'Auto'}</div>
                    </div>
                </div>
                <div class="car-price">$${car.price}<small>/day</small></div>
                <button class="book-car-btn" onclick="selectCarForBooking(${car.id})">
                    <i class="fas fa-calendar-check"></i> Book This Car
                </button>
            </div>
        </div>
    `).join('');
}

function loadAllCars() {
    alert('In a real application, this would load more cars from the server.');
    // For now, just reload the current cars
    loadCars();
}

// ===== BOOKING FUNCTIONS =====
function populateCarSelect(cars) {
    const select = document.getElementById('carSelect');
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    cars.forEach(car => {
        const option = document.createElement('option');
        option.value = car.id;
        option.textContent = `${car.name} - $${car.price}/day`;
        select.appendChild(option);
    });
}

function selectCarForBooking(carId) {
    scrollToSection('booking');
    document.getElementById('carSelect').value = carId;
    calculateTotalPrice();
}

function setupBookingForm() {
    const form = document.getElementById('bookingForm');
    
    // Setup form submission
    form.addEventListener('submit', handleBookingSubmit);
    
    // Setup real-time price calculation
    const priceInputs = ['carSelect', 'days', 'pickupDate', 'returnDate'];
    priceInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('change', calculateTotalPrice);
        }
    });
}

function setupDatePickers() {
    const today = new Date().toISOString().split('T')[0];
    
    const pickupDate = document.getElementById('pickupDate');
    const returnDate = document.getElementById('returnDate');
    
    if (pickupDate) {
        pickupDate.min = today;
        pickupDate.addEventListener('change', function() {
            if (returnDate) {
                returnDate.min = this.value;
            }
        });
    }
    
    if (returnDate) {
        returnDate.min = today;
    }
}

function calculateTotalPrice() {
    const carSelect = document.getElementById('carSelect');
    const daysInput = document.getElementById('days');
    const totalPriceElement = document.getElementById('totalPrice');
    
    if (!carSelect || !daysInput || !totalPriceElement) return;
    
    const selectedCarId = carSelect.value;
    const days = parseInt(daysInput.value) || 1;
    
    if (selectedCarId) {
        // In a real app, we would fetch the car price from the cars array
        // For now, use a simple calculation based on car ID
        const basePrice = selectedCarId === '1' ? 29 : selectedCarId === '2' ? 49 : 89;
        const total = basePrice * days;
        
        totalPriceElement.textContent = `$${total}`;
        totalPriceElement.style.color = '#4CAF50';
    } else {
        totalPriceElement.textContent = '$0';
        totalPriceElement.style.color = '#666';
    }
}

async function handleBookingSubmit(event) {
    event.preventDefault();
    
    // Collect form data
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        carId: document.getElementById('carSelect').value,
        days: document.getElementById('days').value,
        pickupDate: document.getElementById('pickupDate').value,
        returnDate: document.getElementById('returnDate').value,
        totalPrice: document.getElementById('totalPrice').textContent
    };
    
    // Validate form
    if (!validateBookingForm(formData)) {
        return;
    }
    
    try {
        showLoading('bookingForm', 'Processing your booking...');
        
        // Send booking to server
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Booking failed');
        
        const result = await response.json();
        
        // Show success message
        showBookingSuccess(result);
        
        // Save to local storage (for demo purposes)
        saveBookingToLocalStorage(formData);
        
    } catch (error) {
        showError('bookingForm', `Booking error: ${error.message}`);
        console.error('Booking error:', error);
    }
}

function validateBookingForm(data) {
    // Simple validation
    const errors = [];
    
    if (!data.firstName.trim()) errors.push('First name is required');
    if (!data.lastName.trim()) errors.push('Last name is required');
    if (!data.email.trim()) errors.push('Email is required');
    if (!data.phone.trim()) errors.push('Phone number is required');
    if (!data.carId) errors.push('Please select a car');
    if (!data.pickupDate) errors.push('Pick-up date is required');
    if (!data.returnDate) errors.push('Return date is required');
    if (parseInt(data.days) < 1) errors.push('Number of days must be at least 1');
    
    if (errors.length > 0) {
        alert('Please fix the following errors:\n\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}

function showBookingSuccess(result) {
    // Hide form
    document.getElementById('bookingForm').classList.add('hidden');
    
    // Show success message
    const successCard = document.getElementById('bookingSuccess');
    const bookingId = document.getElementById('bookingId');
    
    // Generate a booking ID
    const generatedId = 'BK' + Date.now().toString().slice(-6);
    bookingId.textContent = generatedId;
    
    successCard.classList.remove('hidden');
}

function resetForm() {
    // Hide success message
    document.getElementById('bookingSuccess').classList.add('hidden');
    
    // Show form
    document.getElementById('bookingForm').classList.remove('hidden');
    
    // Reset form
    document.getElementById('bookingForm').reset();
    document.getElementById('totalPrice').textContent = '$0';
}

// ===== UTILITY FUNCTIONS =====
function showLoading(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

function saveBookingToLocalStorage(bookingData) {
    try {
        const bookings = JSON.parse(localStorage.getItem('carRentalBookings') || '[]');
        bookingData.id = 'LOCAL_' + Date.now();
        bookingData.savedAt = new Date().toISOString();
        bookings.push(bookingData);
        localStorage.setItem('carRentalBookings', JSON.stringify(bookings));
        
        console.log('Booking saved to localStorage:', bookingData);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// ===== INITIALIZE PRICE CALCULATION =====
// Calculate initial price on page load
setTimeout(calculateTotalPrice, 500);