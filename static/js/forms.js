/**
 * Forms JavaScript
 * Form validation and submission handling
 */

document.addEventListener('DOMContentLoaded', function() {
    initSongOrderForm();
    initContactForm();
    initPhoneMask();
});

/**
 * Initialize song order form
 */
function initSongOrderForm() {
    const form = document.getElementById('songOrderForm');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Clear previous errors
        clearFormErrors(form);
        
        // Validate form
        const errors = validateSongOrderForm(form);
        
        if (errors.length > 0) {
            showFormErrors(form, errors);
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Отправка...';
        
        try {
            const formData = new FormData(form);
            
            const response = await fetch('/submit-song-order', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast(data.message, 'success');
                form.reset();
            } else {
                if (data.errors && data.errors.length > 0) {
                    showFormErrors(form, data.errors);
                } else {
                    showToast('Произошла ошибка. Пожалуйста, попробуйте позже.', 'error');
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showToast('Произошла ошибка при отправке. Проверьте подключение к интернету.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

/**
 * Initialize contact form
 */
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Clear previous errors
        clearFormErrors(form);
        
        // Validate form
        const errors = validateContactForm(form);
        
        if (errors.length > 0) {
            showFormErrors(form, errors);
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Отправка...';
        
        try {
            const formData = new FormData(form);
            
            const response = await fetch('/submit-contact', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast(data.message, 'success');
                form.reset();
            } else {
                if (data.errors && data.errors.length > 0) {
                    showFormErrors(form, data.errors);
                } else {
                    showToast('Произошла ошибка. Пожалуйста, попробуйте позже.', 'error');
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showToast('Произошла ошибка при отправке. Проверьте подключение к интернету.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

/**
 * Validate song order form
 * @param {HTMLFormElement} form - Form element
 * @returns {string[]} Array of error messages
 */
function validateSongOrderForm(form) {
    const errors = [];
    const formData = new FormData(form);
    
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const phone = formData.get('phone')?.trim();
    const songType = formData.get('song_type');
    const description = formData.get('description')?.trim();
    
    if (!name) {
        errors.push('Пожалуйста, укажите ваше имя');
    }
    
    if (!email) {
        errors.push('Пожалуйста, укажите email');
    } else if (!isValidEmail(email)) {
        errors.push('Неверный формат email');
    }
    
    if (phone && !isValidPhone(phone)) {
        errors.push('Неверный формат телефона (используйте формат +7XXXXXXXXXX)');
    }
    
    if (!songType) {
        errors.push('Пожалуйста, выберите тип песни');
    }
    
    if (!description) {
        errors.push('Пожалуйста, опишите вашу идею');
    } else if (description.length < 20) {
        errors.push('Описание должно быть не менее 20 символов');
    }
    
    return errors;
}

/**
 * Validate contact form
 * @param {HTMLFormElement} form - Form element
 * @returns {string[]} Array of error messages
 */
function validateContactForm(form) {
    const errors = [];
    const formData = new FormData(form);
    
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const message = formData.get('message')?.trim();
    
    if (!name) {
        errors.push('Пожалуйста, укажите ваше имя');
    }
    
    if (!email) {
        errors.push('Пожалуйста, укажите email');
    } else if (!isValidEmail(email)) {
        errors.push('Неверный формат email');
    }
    
    if (!message) {
        errors.push('Пожалуйста, введите сообщение');
    } else if (message.length < 10) {
        errors.push('Сообщение должно быть не менее 10 символов');
    }
    
    return errors;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
    const regex = /^[\w\.-]+@[\w\.-]+\.\w+$/;
    return regex.test(email);
}

/**
 * Validate Russian phone format
 * @param {string} phone - Phone to validate
 * @returns {boolean}
 */
function isValidPhone(phone) {
    // Remove spaces, dashes, parentheses
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const regex = /^(\+7|8)\d{10}$/;
    return regex.test(cleaned);
}

/**
 * Show form errors
 * @param {HTMLFormElement} form - Form element
 * @param {string[]} errors - Array of error messages
 */
function showFormErrors(form, errors) {
    // Create or get error container
    let errorContainer = form.querySelector('.form-errors');
    
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'form-errors';
        form.insertBefore(errorContainer, form.firstChild);
    }
    
    errorContainer.innerHTML = `
        <ul>
            ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
    `;
    
    errorContainer.style.cssText = `
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid #EF4444;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        color: #EF4444;
    `;
    
    errorContainer.querySelector('ul').style.cssText = `
        margin: 0;
        padding-left: 1.25rem;
    `;
    
    // Scroll to errors
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Shake animation
    form.classList.add('shake');
    setTimeout(() => form.classList.remove('shake'), 500);
}

/**
 * Clear form errors
 * @param {HTMLFormElement} form - Form element
 */
function clearFormErrors(form) {
    const errorContainer = form.querySelector('.form-errors');
    if (errorContainer) {
        errorContainer.remove();
    }
}

/**
 * Initialize phone mask
 */
function initPhoneMask() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            
            // Handle different starting formats
            if (value.startsWith('8')) {
                value = '7' + value.substring(1);
            }
            
            if (value.startsWith('7')) {
                // Format as +7 (XXX) XXX-XX-XX
                let formatted = '+7';
                
                if (value.length > 1) {
                    formatted += ' (' + value.substring(1, 4);
                }
                if (value.length >= 4) {
                    formatted += ') ' + value.substring(4, 7);
                }
                if (value.length >= 7) {
                    formatted += '-' + value.substring(7, 9);
                }
                if (value.length >= 9) {
                    formatted += '-' + value.substring(9, 11);
                }
                
                this.value = formatted;
            } else if (value.length > 0) {
                // If doesn't start with 7 or 8, prepend +7
                this.value = '+7 (' + value.substring(0, 3);
            }
        });
        
        // Handle paste
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const cleaned = paste.replace(/\D/g, '');
            
            // Trigger input event with cleaned value
            this.value = cleaned;
            this.dispatchEvent(new Event('input'));
        });
    });
}

/**
 * Create form field with validation
 * @param {Object} options - Field options
 * @returns {HTMLElement}
 */
function createFormField(options) {
    const {
        type = 'text',
        name,
        label,
        placeholder,
        required = false,
        validate
    } = options;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'form-group';
    
    if (label) {
        const labelEl = document.createElement('label');
        labelEl.textContent = label + (required ? ' *' : '');
        labelEl.setAttribute('for', name);
        wrapper.appendChild(labelEl);
    }
    
    let input;
    
    if (type === 'textarea') {
        input = document.createElement('textarea');
    } else if (type === 'select') {
        input = document.createElement('select');
    } else {
        input = document.createElement('input');
        input.type = type;
    }
    
    input.name = name;
    input.id = name;
    if (placeholder) input.placeholder = placeholder;
    if (required) input.required = true;
    
    // Real-time validation
    if (validate) {
        input.addEventListener('blur', function() {
            const error = validate(this.value);
            const existingError = wrapper.querySelector('.field-error');
            
            if (error) {
                if (existingError) {
                    existingError.textContent = error;
                } else {
                    const errorEl = document.createElement('span');
                    errorEl.className = 'field-error';
                    errorEl.textContent = error;
                    errorEl.style.cssText = 'color: #EF4444; font-size: 0.875rem; margin-top: 0.25rem; display: block;';
                    wrapper.appendChild(errorEl);
                }
                input.style.borderColor = '#EF4444';
            } else {
                if (existingError) existingError.remove();
                input.style.borderColor = '';
            }
        });
    }
    
    wrapper.appendChild(input);
    
    return wrapper;
}

// Export functions
window.isValidEmail = isValidEmail;
window.isValidPhone = isValidPhone;
window.showFormErrors = showFormErrors;
window.clearFormErrors = clearFormErrors;
