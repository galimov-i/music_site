/**
 * Переключатель темы (темная/светлая)
 * Сохраняет выбор пользователя в localStorage
 */

(function() {
    'use strict';
    
    function initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const sunIcon = themeToggle ? themeToggle.querySelector('.sun-icon') : null;
        const moonIcon = themeToggle ? themeToggle.querySelector('.moon-icon') : null;
        
        // Проверяем сохраненную тему или используем темную по умолчанию
        const savedTheme = localStorage.getItem('theme');
        const html = document.documentElement;
        
        // Применяем сохраненную тему или темную по умолчанию
        if (savedTheme === 'light') {
            html.setAttribute('data-theme', 'light');
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
        } else {
            // По умолчанию темная тема
            html.setAttribute('data-theme', 'dark');
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
        }
        
        // Обработчик клика на кнопку переключения темы
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const currentTheme = html.getAttribute('data-theme') || 'dark';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                // Применяем новую тему
                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                // Обновляем иконки
                if (newTheme === 'light') {
                    if (sunIcon) sunIcon.style.display = 'block';
                    if (moonIcon) moonIcon.style.display = 'none';
                } else {
                    if (sunIcon) sunIcon.style.display = 'none';
                    if (moonIcon) moonIcon.style.display = 'block';
                }
            });
        }
    }
    
    // Инициализация при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();
