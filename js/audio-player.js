/**
 * Оптимизированный аудио-плеер
 * Автоматически определяет количество треков на странице
 */
(function() {
    'use strict';
    
    const audioPlayers = {};
    let currentPlaying = null;
    let rafId = null;
    let totalTracks = 0;

    /**
     * Форматирует время в формат MM:SS
     */
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    /**
     * Обновляет прогресс-бар текущего трека
     */
    function updateProgress() {
        if (currentPlaying) {
            const player = audioPlayers[currentPlaying];
            if (player && !player.audio.paused) {
                const progress = (player.audio.currentTime / player.audio.duration) * 100;
                if (player.progressBar) {
                    player.progressBar.style.width = progress + '%';
                }
                // Обновляем ARIA атрибуты прогресс-бара
                if (player.progressContainer) {
                    const progressValue = Math.round(progress);
                    player.progressContainer.setAttribute('aria-valuenow', progressValue.toString());
                    player.progressContainer.setAttribute('aria-valuetext', formatTime(player.audio.currentTime) + ' из ' + formatTime(player.audio.duration));
                }
                if (player.currentTimeEl) {
                    player.currentTimeEl.textContent = formatTime(player.audio.currentTime);
                }
                rafId = requestAnimationFrame(updateProgress);
            }
        }
    }

    /**
     * Автоматически переключается на следующий трек
     */
    function playNextTrack(currentTrack) {
        const nextTrack = currentTrack + 1;
        if (nextTrack <= totalTracks && audioPlayers[nextTrack]) {
            // Останавливаем текущий трек
            const currentPlayer = audioPlayers[currentTrack];
            if (currentPlayer) {
                currentPlayer.audio.pause();
                currentPlayer.audio.currentTime = 0;
                if (currentPlayer.playIcon) currentPlayer.playIcon.style.display = 'block';
                if (currentPlayer.pauseIcon) currentPlayer.pauseIcon.style.display = 'none';
                if (currentPlayer.progressBar) currentPlayer.progressBar.style.width = '0%';
                if (currentPlayer.currentTimeEl) currentPlayer.currentTimeEl.textContent = '0:00';
            }
            
            // Запускаем следующий трек
            const nextPlayer = audioPlayers[nextTrack];
            if (nextPlayer) {
                nextPlayer.audio.currentTime = 0;
                const playPromise = nextPlayer.audio.play();
                playPromise.catch(function(error) {
                    console.error('Error playing next track:', error);
                });
                if (nextPlayer.playIcon) nextPlayer.playIcon.style.display = 'none';
                if (nextPlayer.pauseIcon) nextPlayer.pauseIcon.style.display = 'block';
                currentPlaying = nextTrack;
                updateProgress();
            }
        } else {
            // Если это последний трек, просто сбрасываем состояние
            if (rafId) cancelAnimationFrame(rafId);
            currentPlaying = null;
        }
    }

    /**
     * Инициализирует плеер для конкретного трека
     */
    function initPlayer(i) {
        const audio = document.getElementById('audio-' + i);
        if (!audio) return;

        const wrapper = audio.closest('.audio-player-wrapper');
        if (!wrapper) return;

        const playButton = wrapper.querySelector('.audio-play-button[data-audio="' + i + '"]');
        const progressBar = wrapper.querySelector('.audio-progress-bar[data-audio="' + i + '"]');
        const progressContainer = wrapper.querySelector('.audio-progress-container[data-audio="' + i + '"]');
        const currentTimeEl = wrapper.querySelector('.current-time');
        const totalTimeEl = wrapper.querySelector('.total-time');
        const playIcon = playButton ? playButton.querySelector('.play-icon') : null;
        const pauseIcon = playButton ? playButton.querySelector('.pause-icon') : null;

        // Добавляем ARIA атрибуты для аудио элемента
        audio.setAttribute('aria-label', 'Аудио трек ' + i);
        audio.setAttribute('preload', 'metadata');
        
        // Добавляем ARIA атрибуты для прогресс-бара
        if (progressContainer) {
            progressContainer.setAttribute('role', 'slider');
            progressContainer.setAttribute('aria-label', 'Прогресс воспроизведения трека ' + i);
            progressContainer.setAttribute('aria-valuemin', '0');
            progressContainer.setAttribute('aria-valuemax', '100');
            progressContainer.setAttribute('aria-valuenow', '0');
            progressContainer.setAttribute('tabindex', '0');
        }

        audioPlayers[i] = {
            audio: audio,
            playButton: playButton,
            progressBar: progressBar,
            progressContainer: progressContainer,
            currentTimeEl: currentTimeEl,
            totalTimeEl: totalTimeEl,
            playIcon: playIcon,
            pauseIcon: pauseIcon
        };

        // Обновляем общее время трека при загрузке метаданных
        audio.addEventListener('loadedmetadata', function() {
            if (totalTimeEl) {
                totalTimeEl.textContent = formatTime(audio.duration);
            }
        }, { once: true });

        // Обработка ошибок загрузки аудио
        audio.addEventListener('error', function(e) {
            console.error('Error loading audio track ' + i + ':', e);
            if (totalTimeEl) {
                totalTimeEl.textContent = 'Ошибка';
            }
            // Показываем визуальную обратную связь пользователю
            if (playButton) {
                playButton.setAttribute('aria-label', 'Ошибка загрузки трека ' + i);
                playButton.disabled = true;
                playButton.style.opacity = '0.5';
                playButton.style.cursor = 'not-allowed';
            }
        });
        
        // Обработка ошибок воспроизведения
        audio.addEventListener('stalled', function() {
            console.warn('Audio track ' + i + ' stalled');
        });
        
        audio.addEventListener('waiting', function() {
            console.warn('Audio track ' + i + ' waiting for data');
        });

        // Обработчик клика на кнопку play/pause
        if (playButton) {
            playButton.addEventListener('click', function() {
                if (currentPlaying && currentPlaying !== i) {
                    const prev = audioPlayers[currentPlaying];
                    if (prev) {
                        prev.audio.pause();
                        prev.audio.currentTime = 0;
                        if (prev.playIcon) prev.playIcon.style.display = 'block';
                        if (prev.pauseIcon) prev.pauseIcon.style.display = 'none';
                        if (rafId) cancelAnimationFrame(rafId);
                    }
                }

                if (audio.paused) {
                    const playPromise = audio.play();
                    playPromise.catch(function(error) {
                        console.error('Error playing audio:', error);
                        // Восстанавливаем состояние кнопки при ошибке
                        if (playIcon) playIcon.style.display = 'block';
                        if (pauseIcon) pauseIcon.style.display = 'none';
                        if (playButton) {
                            playButton.setAttribute('aria-label', 'Ошибка воспроизведения трека ' + i);
                        }
                    });
                    if (playIcon) playIcon.style.display = 'none';
                    if (pauseIcon) pauseIcon.style.display = 'block';
                    if (playButton) {
                        playButton.setAttribute('aria-label', 'Пауза трека ' + i);
                    }
                    currentPlaying = i;
                    updateProgress();
                } else {
                    audio.pause();
                    if (playIcon) playIcon.style.display = 'block';
                    if (pauseIcon) pauseIcon.style.display = 'none';
                    if (playButton) {
                        playButton.setAttribute('aria-label', 'Воспроизвести трек ' + i);
                    }
                    if (rafId) cancelAnimationFrame(rafId);
                    if (currentPlaying === i) currentPlaying = null;
                }
            });
        }

        // Обработчик клика на прогресс-бар
        if (progressContainer) {
            progressContainer.addEventListener('click', function(e) {
                const rect = progressContainer.getBoundingClientRect();
                const percentage = (e.clientX - rect.left) / rect.width;
                if (!isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
                    audio.currentTime = percentage * audio.duration;
                    // Обновляем ARIA атрибуты
                    const progressValue = Math.round(percentage * 100);
                    progressContainer.setAttribute('aria-valuenow', progressValue.toString());
                }
            });
            
            // Добавляем поддержку клавиатуры для прогресс-бара
            progressContainer.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const currentProgress = parseFloat(progressContainer.getAttribute('aria-valuenow') || '0');
                    const step = e.key === 'ArrowLeft' ? -5 : 5;
                    const newProgress = Math.max(0, Math.min(100, currentProgress + step));
                    if (!isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
                        audio.currentTime = (newProgress / 100) * audio.duration;
                        progressContainer.setAttribute('aria-valuenow', newProgress.toString());
                    }
                }
            });
        }

        // Автоматическое переключение на следующий трек при окончании
        audio.addEventListener('ended', function() {
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
            if (progressBar) progressBar.style.width = '0%';
            if (currentTimeEl) currentTimeEl.textContent = '0:00';
            if (rafId) cancelAnimationFrame(rafId);
            
            // Автоматически переключаемся на следующий трек
            playNextTrack(i);
        });
    }

    /**
     * Инициализирует все плееры на странице
     */
    function initAllPlayers() {
        // Автоматически определяем количество треков на странице
        const audioElements = document.querySelectorAll('audio[id^="audio-"]');
        totalTracks = audioElements.length;
        
        // Если не найдено через селектор, пробуем найти через data-атрибут
        if (totalTracks === 0) {
            const trackCountAttr = document.body.getAttribute('data-tracks');
            if (trackCountAttr) {
                totalTracks = parseInt(trackCountAttr, 10);
            }
        }

        // Инициализируем каждый трек
        for (let i = 1; i <= totalTracks; i++) {
            initPlayer(i);
        }
    }

    // Инициализация при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllPlayers);
    } else {
        initAllPlayers();
    }
})();
