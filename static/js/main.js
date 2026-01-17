/**
 * Main JavaScript file for Ilshat Galimov Music Site
 */

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initSmoothScroll();
    initBackToTop();
    initNavbarScroll();
});

/**
 * Navigation toggle for mobile
 */
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!navToggle || !navMenu) return;
    
    navToggle.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking on a link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/**
 * Smooth scroll to sections
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's just "#" or empty
            if (targetId === '#' || targetId === '') return;
            
            const target = document.querySelector(targetId);
            
            if (target) {
                e.preventDefault();
                
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without scrolling
                history.pushState(null, null, targetId);
            }
        });
    });
}

/**
 * Back to top button
 */
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    if (!backToTop) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    // Scroll to top on click
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Navbar scroll effect
 */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    
    if (!navbar) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class when scrolled down
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'success', duration = 5000) {
    const container = document.getElementById('toastContainer');
    
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<p class="toast-message">${message}</p>`;
    
    container.appendChild(toast);
    
    // Remove toast after duration
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

/**
 * Show donation modal with specific content
 * @param {string} type - 'yoomoney', 'sber', or 'crypto'
 */
function showDonationModal(type) {
    const modal = document.getElementById('donationModal');
    const content = document.getElementById('donationModalContent');
    
    if (!modal || !content) return;
    
    let modalHTML = '';
    
    switch (type) {
        case 'yoomoney':
            modalHTML = `
                <h3>ЮMoney</h3>
                <p>Переведите любую сумму на кошелёк:</p>
                <div class="modal-code">
                    <code>410011234567890</code>
                    <button onclick="copyToClipboard('410011234567890')" class="btn btn-secondary">Копировать</button>
                </div>
                <p class="mt-md">Или перейдите по ссылке:</p>
                <a href="https://yoomoney.ru/to/410011234567890" target="_blank" class="btn btn-primary">Открыть ЮMoney</a>
            `;
            break;
            
        case 'sber':
            modalHTML = `
                <h3>СберБанк</h3>
                <p>Номер карты для перевода:</p>
                <div class="modal-code">
                    <code>2202 2000 1234 5678</code>
                    <button onclick="copyToClipboard('2202200012345678')" class="btn btn-secondary">Копировать</button>
                </div>
                <p class="mt-md">Получатель: Ильшат Г.</p>
            `;
            break;
            
        case 'crypto':
            modalHTML = `
                <h3>Криптовалюта</h3>
                <div class="crypto-wallets">
                    <div class="crypto-wallet">
                        <strong>Bitcoin (BTC)</strong>
                        <div class="modal-code">
                            <code>bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</code>
                            <button onclick="copyToClipboard('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')" class="btn btn-secondary btn-sm">Копировать</button>
                        </div>
                    </div>
                    <div class="crypto-wallet">
                        <strong>Ethereum (ETH)</strong>
                        <div class="modal-code">
                            <code>0x71C7656EC7ab88b098defB751B7401B5f6d8976F</code>
                            <button onclick="copyToClipboard('0x71C7656EC7ab88b098defB751B7401B5f6d8976F')" class="btn btn-secondary btn-sm">Копировать</button>
                        </div>
                    </div>
                    <div class="crypto-wallet">
                        <strong>USDT (TRC20)</strong>
                        <div class="modal-code">
                            <code>TN2fQZ2GXZDK1xBfL7kWLXeVJ8WpHSgLrb</code>
                            <button onclick="copyToClipboard('TN2fQZ2GXZDK1xBfL7kWLXeVJ8WpHSgLrb')" class="btn btn-secondary btn-sm">Копировать</button>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
    
    content.innerHTML = modalHTML;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus trap
    const focusableElements = modal.querySelectorAll('button, a, input');
    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    }
}

/**
 * Close donation modal
 */
function closeDonationModal() {
    const modal = document.getElementById('donationModal');
    
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Скопировано в буфер обмена', 'success', 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Не удалось скопировать', 'error', 2000);
    });
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in milliseconds
 * @returns {Function}
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDonationModal();
    }
});

// Export functions for global access
window.showToast = showToast;
window.showDonationModal = showDonationModal;
window.closeDonationModal = closeDonationModal;
window.copyToClipboard = copyToClipboard;
