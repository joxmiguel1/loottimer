       // ====================
        // Configuración de idiomas
        // ====================
        const translations = {
            en: {
                title: "Once Human Loot Timer",
                localTime: "Your local time:",
                serverTime: "EST Time (Game Server):",
                enableAlarm: "Enable next reset alarm",
                testAlarm: "Test alarm",
                alarmMessage: "Time to open chests!",
                alarmButton: "Dismiss",
                nextResets: "Next resets in your local time:",
                createdWithLove: "Made with love ❤️ by",
                coffeeInvite: "If you liked it, you can buy me a coffee",
                coffeeLink: "☕"
            },
            es: {
                title: "Temporizador de farmeo Once Human",
                localTime: "Tu hora local:",
                serverTime: "Hora EST (Servidor):",
                enableAlarm: "Activar alarma para el próximo reset",
                testAlarm: "Probar alarma",
                alarmMessage: "¡Es hora de abrir los cofres!",
                alarmButton: "Aceptar",
                nextResets: "Próximos resets en tu hora local:",
                createdWithLove: "Hecho con amor ❤️ por",
                coffeeInvite: "Si te gustó, me puedes invitar un café",
                coffeeLink: "☕"
            }
        };

        // Detectar idioma del navegador
        let lang = navigator.language.startsWith('es') ? 'es' : 'en';

        // ====================
        // Variables globales
        // ====================
        let alarmTriggered = false;
        let nextResetTime = calculateNextReset();
        const elements = {
            localTime: document.getElementById('local-time'),
            estTime: document.getElementById('est-time'),
            resetTimer: document.getElementById('reset-timer'),
            alarmCheckbox: document.getElementById('alarm-checkbox'),
            alarmSound: document.getElementById('alarm-sound'),
            stopAlarmButton: document.getElementById('stop-alarm'),
            nextResets: document.getElementById('next-resets'),
            alarmAudio: document.getElementById('alarm-audio'),
            progressBar: document.getElementById('progress-bar'),
            testAlarm: document.getElementById('test-alarm')
        };

        // ====================
        // Funcionalidad de idiomas
        // ====================
          function updateTextContent(language) {
              document.querySelectorAll('[data-i18n]').forEach(element => {
                  const key = element.getAttribute('data-i18n');
                  if (translations[language]?.[key]) {
                      // Si el elemento contiene spans u otros hijos, solo actualiza el texto fuera de ellos
                      if (element.querySelector('span')) {
                          const span = element.querySelector('span');
                          const staticText = translations[language][key];
                          element.childNodes[0].nodeValue = staticText + ' ';
                      } else {
                          element.textContent = translations[language][key];
                      }
                  }
              });

              document.querySelectorAll('.language-btn').forEach(btn => {
                  btn.classList.toggle('active', btn.dataset.lang === language);
              });

              updateNextResetTimes();
          }

        document.querySelectorAll('.language-btn').forEach(button => {
            button.addEventListener('click', () => {
                lang = button.dataset.lang;
                updateTextContent(lang);
            });
        });

        // ====================
        // Funciones principales
        // ====================
        function updateTimes() {
            const now = new Date();
            
            // Mostrar hora local
            elements.localTime.textContent = now.toLocaleTimeString(lang, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            
            // Mostrar hora EST (servidor)
            elements.estTime.textContent = now.toLocaleTimeString(lang, {
                timeZone: "America/New_York",
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            
            // Calcular tiempo hasta el próximo reset
            const estTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
            const timeUntilResetMs = nextResetTime - estTime;
            
            if (timeUntilResetMs <= 0) {
                nextResetTime = calculateNextReset();
                updateNextResetTimes();
                if (elements.alarmCheckbox.checked) {
                    triggerAlarm();
                }
            } else {
                updateTimerDisplay(timeUntilResetMs);
                updateProgressBar(timeUntilResetMs);
            }
        }

        function calculateNextReset() {
           const now = new Date();
           const estTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
           const currentEstHour = estTime.getHours();
            
           const currentIntervalStartHour = Math.floor(currentEstHour / 4) * 4;
           let nextResetHour = currentIntervalStartHour + 4;
           let nextResetDay = new Date(estTime);
            
           if (nextResetHour >= 24) {
                nextResetHour = 0;
                nextResetDay.setDate(nextResetDay.getDate() + 1);
           }
            
           nextResetDay.setHours(nextResetHour, 0, 0, 0);
           return nextResetDay;
        }

        function updateTimerDisplay(timeUntilResetMs) {
            const totalSeconds = Math.floor(timeUntilResetMs / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            elements.resetTimer.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function updateProgressBar(timeUntilResetMs) {
            const totalCycleTime = 4 * 60 * 60 * 1000;
            const timeSinceLastReset = totalCycleTime - timeUntilResetMs;
            const progressPercentage = (timeSinceLastReset / totalCycleTime) * 100;
            elements.progressBar.style.width = `${progressPercentage}%`;
        }

        function checkAlarm() {
            const now = new Date();
            const estTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
            const timeUntilReset = nextResetTime - estTime;
            
            if (elements.alarmCheckbox.checked && timeUntilReset <= 1000 && timeUntilReset > 0 && !alarmTriggered) {
                triggerAlarm();
            }
        }

        function triggerAlarm() {
            elements.alarmSound.style.display = 'block';
            elements.alarmAudio.play();
            alarmTriggered = true;
        }

        function updateNextResetTimes() {
            const resetCycle = 4 * 60 * 60 * 1000;
            let nextReset = calculateNextReset();
            let nextResets = [];
            
            for (let i = 0; i < 4; i++) {
                const resetTime = new Date(nextReset.getTime() + (i * resetCycle));
                nextResets.push(resetTime);
            }
            
            elements.nextResets.innerHTML = nextResets.map((time, index) => {
                const localTime = new Date(time);
                return `
                    <div>
                        ${index + 1}. ${localTime.toLocaleTimeString(lang, { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false
                        })} 
                        (${localTime.toLocaleDateString(lang, {
                            day: 'numeric',
                            month: 'numeric'
                        })})
                    </div>
                `;
            }).join('');
        }

        // ====================
        // Event Listeners
        // ====================
        elements.testAlarm.addEventListener('click', (e) => {
            e.preventDefault();
            triggerAlarm();
        });

        elements.stopAlarmButton.addEventListener('click', () => {
            elements.alarmSound.style.display = 'none';
            elements.alarmAudio.pause();
            elements.alarmAudio.currentTime = 0;
            alarmTriggered = false;
        });

        // ====================
        // Inicialización
        // ====================
        document.addEventListener('DOMContentLoaded', () => {
            // Configurar intervalos
            setInterval(updateTimes, 1000);
            setInterval(checkAlarm, 1000);
            
            // Inicializar valores
            updateTextContent(lang);
            updateNextResetTimes();
            updateTimes();
        });