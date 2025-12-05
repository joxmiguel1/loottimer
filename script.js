// ====================
// Configuración de idiomas
// ====================
const translations = {
    en: {
        title: "Once Human Loot Timer",
        localTime: "Your local time:",
        serverTime: "EST Time (Game Server):",
        enableAlarm: "Enable next reset alarm",
        alarmLeadLabel: "Reminder time before reset",
        leadAtReset: "At reset",
        lead1Minute: "1 minute before",
        lead5Minutes: "5 minutes before",
        lead10Minutes: "10 minutes before",
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
        alarmLeadLabel: "Tiempo de aviso antes del reset",
        leadAtReset: "Al momento del reset",
        lead1Minute: "1 minuto antes",
        lead5Minutes: "5 minutos antes",
        lead10Minutes: "10 minutos antes",
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
let alarmLeadMinutes = 0;
const elements = {
    localTime: document.getElementById('local-time'),
    estTime: document.getElementById('est-time'),
    resetTimer: document.getElementById('reset-timer'),
    alarmCheckbox: document.getElementById('alarm-checkbox'),
    alarmLead: document.getElementById('alarm-lead'),
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
            if (element.querySelector('span')) {
                const span = element.querySelector('span');
                const staticText = translations[language][key];
                element.childNodes[0].nodeValue = `${staticText} `;
                if (span) {
                    // Ensure span content remains intact
                    span.textContent = span.textContent;
                }
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
// Funciones auxiliares
// ====================
function getEstDate(baseDate = new Date()) {
    const estString = baseDate.toLocaleString('en-US', { timeZone: 'America/New_York' });
    return new Date(estString);
}

function formatTime(date, options = {}) {
    return date.toLocaleTimeString(lang, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        ...options
    });
}

// ====================
// Funciones principales
// ====================
function updateTimes() {
    const now = new Date();
    const nowEst = getEstDate(now);

    elements.localTime.textContent = formatTime(now);
    elements.estTime.textContent = formatTime(nowEst, { timeZone: 'America/New_York' });

    const timeUntilResetMs = nextResetTime.getTime() - nowEst.getTime();

    if (timeUntilResetMs <= 0) {
        nextResetTime = calculateNextReset();
        alarmTriggered = false;
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
    const nowEst = getEstDate();
    const currentEstHours = nowEst.getHours();
    const currentIntervalStartHourEst = Math.floor(currentEstHours / 4) * 4;
    let nextResetHourEst = currentIntervalStartHourEst + 4;

    const nextResetEst = new Date(nowEst);
    nextResetEst.setHours(nextResetHourEst, 0, 0, 0);

    if (nextResetEst.getTime() <= nowEst.getTime()) {
        nextResetEst.setHours(nextResetEst.getHours() + 4);
    }

    return nextResetEst;
}

function updateTimerDisplay(timeUntilResetMs) {
    const totalSeconds = Math.floor(timeUntilResetMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    elements.resetTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateProgressBar(timeUntilResetMs) {
    const totalCycleTime = 4 * 60 * 60 * 1000;
    const timeSinceLastReset = totalCycleTime - timeUntilResetMs;
    const progressPercentage = (timeSinceLastReset / totalCycleTime) * 100;
    elements.progressBar.style.width = `${progressPercentage}%`;
}

function checkAlarm() {
    const nowEst = getEstDate();
    const timeUntilReset = nextResetTime - nowEst;
    const leadTimeMs = alarmLeadMinutes * 60 * 1000;

    if (
        elements.alarmCheckbox.checked &&
        timeUntilReset <= leadTimeMs &&
        timeUntilReset > 0 &&
        !alarmTriggered
    ) {
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

    const upcomingResets = [];

    for (let i = 0; i < 8; i++) {
        const resetTimeEST = new Date(nextReset.getTime() + i * resetCycle);
        const resetTimeLocalStr = resetTimeEST.toLocaleString('en-US', { timeZone: userTimeZone });
        const resetTimeLocal = new Date(resetTimeLocalStr);

        if (resetTimeLocal > nowLocal) {
            upcomingResets.push(resetTimeLocal);
        }

        if (upcomingResets.length === 4) break;
    }

    elements.nextResets.innerHTML = upcomingResets
        .map((time, index) => {
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
        })
        .join('');
}

// ====================
// Event Listeners
// ====================
elements.testAlarm.addEventListener('click', e => {
    e.preventDefault();
    triggerAlarm();
});

elements.stopAlarmButton.addEventListener('click', () => {
    elements.alarmSound.style.display = 'none';
    elements.alarmAudio.pause();
    elements.alarmAudio.currentTime = 0;
    alarmTriggered = false;
});

elements.alarmLead.addEventListener('change', event => {
    alarmLeadMinutes = Number(event.target.value);
});

// ====================
// Inicialización
// ====================
document.addEventListener('DOMContentLoaded', () => {
    setInterval(updateTimes, 1000);
    setInterval(checkAlarm, 1000);

    updateTextContent(lang);
    updateNextResetTimes();
    updateTimes();
});
