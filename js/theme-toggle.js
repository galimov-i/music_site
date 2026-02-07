/**
 * Переключатель темы (темная/светлая/черно-белая/зеленая)
 * Сохраняет выбор пользователя в localStorage
 */

(function() {
    'use strict';
    
    function initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const sunIcon = themeToggle ? themeToggle.querySelector('.sun-icon') : null;
        const moonIcon = themeToggle ? themeToggle.querySelector('.moon-icon') : null;
        const monochromeIcon = themeToggle ? themeToggle.querySelector('.monochrome-icon') : null;
        const trainerIcon = themeToggle ? themeToggle.querySelector('.trainer-icon') : null;
        
        // Проверяем сохраненную тему или используем темную по умолчанию
        const savedTheme = localStorage.getItem('theme');
        const html = document.documentElement;
        
        // Применяем сохраненную тему или темную по умолчанию
        // Если сохранена тема trainer, но иконки нет (страница альбома), используем dark
        let themeToApply = savedTheme || 'dark';
        if (themeToApply === 'trainer' && !trainerIcon) {
            themeToApply = 'dark';
        }
        html.setAttribute('data-theme', themeToApply);
        updateIcons(themeToApply, sunIcon, moonIcon, monochromeIcon, trainerIcon);
        
        // Обработчик клика на кнопку переключения темы
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const currentTheme = html.getAttribute('data-theme') || 'dark';
                let newTheme;
                
                // Циклическое переключение: dark -> light -> monochrome -> trainer (если есть) -> dark
                // Если иконка trainer отсутствует, переключаем только между 3 темами
                if (currentTheme === 'dark') {
                    newTheme = 'light';
                } else if (currentTheme === 'light') {
                    newTheme = 'monochrome';
                } else if (currentTheme === 'monochrome') {
                    // Переключаемся на trainer только если иконка существует
                    newTheme = trainerIcon ? 'trainer' : 'dark';
                } else {
                    newTheme = 'dark';
                }
                
                // Применяем новую тему
                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                // Обновляем иконки
                updateIcons(newTheme, sunIcon, moonIcon, monochromeIcon, trainerIcon);
            });
        }
    }
    
    function updateIcons(theme, sunIcon, moonIcon, monochromeIcon, trainerIcon) {
        // Скрываем все иконки
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'none';
        if (monochromeIcon) monochromeIcon.style.display = 'none';
        if (trainerIcon) trainerIcon.style.display = 'none';
        
        // Показываем нужную иконку
        if (theme === 'light' && sunIcon) {
            sunIcon.style.display = 'block';
        } else if (theme === 'monochrome' && monochromeIcon) {
            monochromeIcon.style.display = 'block';
        } else if (theme === 'trainer' && trainerIcon) {
            trainerIcon.style.display = 'block';
        } else if (moonIcon) {
            // По умолчанию показываем луну для темной темы
            moonIcon.style.display = 'block';
        }
    }
    
    // Инициализация при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();
