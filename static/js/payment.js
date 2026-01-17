/**
 * Payment JavaScript
 * Course purchase and payment handling
 */

document.addEventListener('DOMContentLoaded', function() {
    initCourseForm();
});

/**
 * Initialize course enrollment form
 */
function initCourseForm() {
    const form = document.getElementById('courseForm');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Clear previous errors
        clearFormErrors(form);
        
        // Validate form
        const errors = validateCourseForm(form);
        
        if (errors.length > 0) {
            showFormErrors(form, errors);
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Создание платежа...';
        
        try {
            const formData = new FormData(form);
            
            const response = await fetch('/create-payment', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (data.demo_mode) {
                    // Demo mode - show message and redirect
                    showToast(data.message, 'success', 5000);
                    setTimeout(() => {
                        window.location.href = data.confirmation_url;
                    }, 2000);
                } else if (data.confirmation_url) {
                    // Real payment - redirect to payment page
                    showToast('Перенаправление на страницу оплаты...', 'success');
                    setTimeout(() => {
                        window.location.href = data.confirmation_url;
                    }, 1000);
                }
            } else {
                showToast(data.error || 'Произошла ошибка. Пожалуйста, попробуйте позже.', 'error');
            }
        } catch (error) {
            console.error('Payment error:', error);
            showToast('Произошла ошибка при создании платежа. Проверьте подключение к интернету.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

/**
 * Validate course form
 * @param {HTMLFormElement} form - Form element
 * @returns {string[]} Array of error messages
 */
function validateCourseForm(form) {
    const errors = [];
    const formData = new FormData(form);
    
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const phone = formData.get('phone')?.trim();
    
    if (!name) {
        errors.push('Пожалуйста, укажите ваше имя');
    } else if (name.length < 2) {
        errors.push('Имя должно содержать не менее 2 символов');
    }
    
    if (!email) {
        errors.push('Пожалуйста, укажите email');
    } else if (!isValidEmail(email)) {
        errors.push('Неверный формат email');
    }
    
    if (phone && !isValidPhone(phone)) {
        errors.push('Неверный формат телефона');
    }
    
    return errors;
}

/**
 * Create direct payment link for YooKassa
 * @param {Object} options - Payment options
 * @returns {Promise<string>} Payment URL
 */
async function createPaymentLink(options) {
    const {
        amount,
        description,
        email,
        name
    } = options;
    
    try {
        const response = await fetch('/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount,
                description,
                email,
                name
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.confirmation_url) {
            return data.confirmation_url;
        }
        
        throw new Error(data.error || 'Failed to create payment');
    } catch (error) {
        console.error('Payment link creation error:', error);
        throw error;
    }
}

/**
 * Handle payment success callback
 */
function handlePaymentSuccess() {
    // This function is called when user returns from successful payment
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('payment_id');
    
    if (paymentId) {
        // Payment was successful
        showToast('Оплата прошла успешно! Доступ к курсу будет отправлен на вашу почту.', 'success', 10000);
        
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Scroll to course section
        const courseSection = document.getElementById('course');
        if (courseSection) {
            courseSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

/**
 * Handle payment failure callback
 */
function handlePaymentFailure() {
    // This function is called when payment fails
    showToast('Оплата не прошла. Пожалуйста, попробуйте снова или свяжитесь с нами.', 'error', 10000);
    
    // Scroll to course section
    const courseSection = document.getElementById('course');
    if (courseSection) {
        courseSection.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Format price for display
 * @param {number} amount - Amount in rubles
 * @returns {string} Formatted price
 */
function formatPrice(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Check payment status
 * @param {string} paymentId - Payment ID to check
 * @returns {Promise<Object>} Payment status
 */
async function checkPaymentStatus(paymentId) {
    try {
        const response = await fetch(`/payment-status/${paymentId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Payment status check error:', error);
        throw error;
    }
}

/**
 * Poll for payment status updates
 * @param {string} paymentId - Payment ID to poll
 * @param {number} interval - Poll interval in ms
 * @param {number} timeout - Max polling time in ms
 * @returns {Promise<Object>} Final payment status
 */
async function pollPaymentStatus(paymentId, interval = 3000, timeout = 300000) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
        const poll = async () => {
            if (Date.now() - startTime > timeout) {
                reject(new Error('Payment status poll timeout'));
                return;
            }
            
            try {
                const status = await checkPaymentStatus(paymentId);
                
                if (status.status === 'succeeded') {
                    resolve(status);
                } else if (status.status === 'canceled') {
                    reject(new Error('Payment was canceled'));
                } else {
                    // Still pending, continue polling
                    setTimeout(poll, interval);
                }
            } catch (error) {
                reject(error);
            }
        };
        
        poll();
    });
}

/**
 * Initialize checkout widget (if using embedded checkout)
 * @param {string} containerId - Container element ID
 * @param {Object} options - Checkout options
 */
function initCheckoutWidget(containerId, options) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('Checkout container not found');
        return;
    }
    
    // This would be used for embedded checkout if implementing YooKassa widget
    // For now, we use redirect flow
    console.log('Checkout widget initialization - using redirect flow');
}

// Check for payment callbacks on page load
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('payment_success') || window.location.pathname.includes('payment-success')) {
        handlePaymentSuccess();
    }
    
    if (urlParams.has('payment_failure') || window.location.pathname.includes('payment-failure')) {
        handlePaymentFailure();
    }
});

// Export functions
window.createPaymentLink = createPaymentLink;
window.formatPrice = formatPrice;
window.handlePaymentSuccess = handlePaymentSuccess;
window.handlePaymentFailure = handlePaymentFailure;
