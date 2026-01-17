/**
 * Animations JavaScript
 * Scroll animations using Intersection Observer API
 */

document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initParallaxEffect();
    initCounterAnimation();
});

/**
 * Initialize scroll-based animations using Intersection Observer
 */
function initScrollAnimations() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Show all elements immediately if user prefers reduced motion
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.classList.add('animate-in');
        });
        return;
    }
    
    // Create the observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Optionally unobserve after animation (for one-time animations)
                // observer.unobserve(entry.target);
            }
        });
    }, {
        root: null, // viewport
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before element is fully visible
        threshold: 0.1 // Trigger when 10% of element is visible
    });
    
    // Observe all elements with the animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Initialize parallax effect for hero section
 */
function initParallaxEffect() {
    const heroBg = document.querySelector('.hero-bg');
    
    if (!heroBg) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) return;
    
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const scrolled = window.pageYOffset;
                const rate = scrolled * 0.3;
                
                // Only apply parallax in hero section
                if (scrolled < window.innerHeight) {
                    heroBg.style.transform = `translateY(${rate}px)`;
                }
                
                ticking = false;
            });
            
            ticking = true;
        }
    });
}

/**
 * Initialize counter animation for stats
 */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    
    if (counters.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

/**
 * Animate a counter element
 * @param {HTMLElement} element - Counter element to animate
 */
function animateCounter(element) {
    const text = element.textContent;
    const match = text.match(/(\d+)/);
    
    if (!match) return;
    
    const target = parseInt(match[0]);
    const suffix = text.replace(/\d+/, '');
    const duration = 2000; // 2 seconds
    const start = 0;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);
        
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = text; // Ensure final value is exact
        }
    }
    
    requestAnimationFrame(updateCounter);
}

/**
 * Add staggered animation delay to children
 * @param {HTMLElement} parent - Parent element
 * @param {string} childSelector - Selector for child elements
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} increment - Delay increment per child
 */
function staggerChildren(parent, childSelector, baseDelay = 100, increment = 100) {
    const children = parent.querySelectorAll(childSelector);
    
    children.forEach((child, index) => {
        child.style.transitionDelay = `${baseDelay + (index * increment)}ms`;
    });
}

/**
 * Reveal text character by character
 * @param {HTMLElement} element - Element containing text
 * @param {number} speed - Speed in milliseconds per character
 */
function revealText(element, speed = 50) {
    const text = element.textContent;
    element.textContent = '';
    element.style.visibility = 'visible';
    
    let index = 0;
    
    function addCharacter() {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
            setTimeout(addCharacter, speed);
        }
    }
    
    addCharacter();
}

/**
 * Create typing effect
 * @param {HTMLElement} element - Element to apply effect
 * @param {string[]} texts - Array of texts to type
 * @param {number} typeSpeed - Typing speed in ms
 * @param {number} deleteSpeed - Delete speed in ms
 * @param {number} pauseTime - Pause time between texts in ms
 */
function typeWriter(element, texts, typeSpeed = 100, deleteSpeed = 50, pauseTime = 2000) {
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            element.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            element.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let delay = isDeleting ? deleteSpeed : typeSpeed;
        
        if (!isDeleting && charIndex === currentText.length) {
            delay = pauseTime;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            delay = typeSpeed;
        }
        
        setTimeout(type, delay);
    }
    
    type();
}

/**
 * Animate element on hover with custom properties
 * @param {HTMLElement} element - Element to animate
 * @param {Object} options - Animation options
 */
function hoverAnimation(element, options = {}) {
    const {
        scale = 1.05,
        rotate = 0,
        translateY = -5,
        duration = 300
    } = options;
    
    element.style.transition = `transform ${duration}ms ease`;
    
    element.addEventListener('mouseenter', () => {
        element.style.transform = `scale(${scale}) rotate(${rotate}deg) translateY(${translateY}px)`;
    });
    
    element.addEventListener('mouseleave', () => {
        element.style.transform = '';
    });
}

/**
 * Create ripple effect on click
 * @param {HTMLElement} element - Element to add ripple effect
 */
function addRippleEffect(element) {
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    
    element.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            left: ${x}px;
            top: ${y}px;
            width: 10px;
            height: 10px;
            margin-left: -5px;
            margin-top: -5px;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
}

// Export functions
window.initScrollAnimations = initScrollAnimations;
window.staggerChildren = staggerChildren;
window.revealText = revealText;
window.typeWriter = typeWriter;
window.hoverAnimation = hoverAnimation;
window.addRippleEffect = addRippleEffect;
