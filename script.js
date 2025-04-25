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

            // Calculate current EST time accurately
            const nowUtc = new Date(now.toUTCString());
            const utcTimestamp = nowUtc.getTime();
            // Approximate EST offset in milliseconds (EST is UTC-4)
            const estOffsetMs = -4 * 60 * 60 * 1000;
            const nowEstTimestamp = utcTimestamp + estOffsetMs;
            const nowEst = new Date(nowEstTimestamp);

            // Mostrar hora EST (servidor)
            elements.estTime.textContent = nowEst.toLocaleTimeString(lang, { // Use nowEst for displaying EST time
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                 timeZone: "America/New_York" // Explicitly set timezone for display consistency
            });


            // Calcular tiempo hasta el próximo reset
            const timeUntilResetMs = nextResetTime.getTime() - nowEstTimestamp; // Subtract the current precise EST timestamp from the next reset's precise EST timestamp.

            if (timeUntilResetMs <= 0) {
                nextResetTime = calculateNextReset(); // calculateNextReset now returns a UTC-based EST moment.
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
           const nowUtc = new Date(now.toUTCString()); // Get current time in UTC
           const utcTimestamp = nowUtc.getTime();

           // Approximate EST offset in milliseconds (EST is UTC-4)
           const estOffsetMs = -4 * 60 * 60 * 1000;

           // Calculate current timestamp in EST
           const nowEstTimestamp = utcTimestamp + estOffsetMs;
           const nowEst = new Date(nowEstTimestamp);

           // Get current EST hour
           const currentEstHours = nowEst.getUTCHours(); // Use getUTCHours with a UTC-based Date object representing EST

           // Calculate the next EST reset hour (0, 4, 8, 12, 16, 20)
           const currentIntervalStartHourEst = Math.floor(currentEstHours / 4) * 4;
           let nextResetHourEst = currentIntervalStartHourEst + 4;

           // Create a Date object for the next reset in EST, starting with the current day in EST
           let nextResetEst = new Date(nowEst);
           nextResetEst.setUTCHours(nextResetHourEst, 0, 0, 0); // Set the hours using setUTCHours

            // If the calculated next reset time is in the past relative to the current EST time, add 4 hours (the reset cycle)
           if (nextResetEst.getTime() <= nowEstTimestamp) {
               nextResetEst = new Date(nextResetEst.getTime() + 4 * 60 * 60 * 1000);
           }

           return nextResetEst; // Return a UTC-based Date object representing the next reset time in EST.
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
            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const nowLocal = new Date();
        
            let upcomingResets = [];
        
            for (let i = 0; i < 8; i++) { // calcula más de 4 por si hay que filtrar
                const resetTimeEST = new Date(nextReset.getTime() + i * resetCycle);
                const resetTimeLocalStr = resetTimeEST.toLocaleString("en-US", { timeZone: userTimeZone });
                const resetTimeLocal = new Date(resetTimeLocalStr);
        
                if (resetTimeLocal > nowLocal) {
                    upcomingResets.push(resetTimeLocal);
                }
        
                if (upcomingResets.length === 4) break;
            }
        
            elements.nextResets.innerHTML = upcomingResets.map((time, index) => {
                return `
                    <div>
                        ${index + 1}. ${time.toLocaleTimeString(lang, { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false
                        })} 
                        (${time.toLocaleDateString(lang, {
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