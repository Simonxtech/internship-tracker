/**
 * =============================================================
 *  public/js/quiz.js — Career Assessment Quiz Logik
 * =============================================================
 *
 *  Diese Datei enthält die gesamte Quiz-Logik:
 *    - Fragen laden und darstellen
 *    - Quiz-Navigation
 *    - Score-Berechnung
 *    - Ergebnis speichern und anzeigen
 *    - Charts
 *
 * =============================================================
 */

// --- Globale Variablen ---
let currentQuestion = 0;
let questions = [];
let careers = {};
let profiles = {};
let scores = {};
let history = [];
let chartBar = null, chartRadar = null;

// --- Beim Laden: Login prüfen und Seite initialisieren ---
async function initPage() {
    const user = await checkLogin();
    if (!user) return;

    // Navigation aufbauen
    buildNavigation(user, 'page7');

    // Quiz-Daten vom Server laden
    await loadQuizData();
}

// --- Fragen und Karrieren vom Server laden ---
async function loadQuizData() {
    try {
        // Fragen laden
        const qRes = await fetch('/api/quiz/questions');
        const qData = await qRes.json();
        questions = qData.questions || [];

        // Karrieren laden
        const cRes = await fetch('/api/quiz/careers');
        const cData = await cRes.json();
        careers = cData.careers || {};
        profiles = cData.profiles || {};

        // Letztes Ergebnis laden
        const rRes = await fetch('/api/quiz/results');
        const rData = await rRes.json();
        if (rData.result) {
            showStoredResults(rData.result);
        }

    } catch (error) {
        console.log('Fehler beim Laden der Quiz-Daten:', error);
    }
}

// --- Gespeicherte Ergebnisse anzeigen ---
function showStoredResults(result) {
    scores = result.scores || {};
    
    // Zu den Ergebnissen springen
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('quiz').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    
    renderResults(result);
}

// --- Quiz starten ---
function startQuiz() {
    currentQuestion = 0;
    scores = {};
    history = [];
    
    // Alle Karrieren mit 0 initialisieren
    for (let careerName in careers) {
        scores[careerName] = 0;
    }
    
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('quiz').classList.remove('hidden');
    
    showQuestion();
}

// --- Aktuelle Frage anzeigen ---
function showQuestion() {
    if (!questions || questions.length === 0) {
        console.log('Fehler: Fragen nicht geladen');
        return;
    }
    
    const q = questions[currentQuestion];
    const progress = Math.round((currentQuestion / questions.length) * 100);
    
    // Progress aktualisieren
    document.getElementById('progBar').style.width = progress + '%';
    document.getElementById('progPct').textContent = progress + '%';
    document.getElementById('qNum').textContent = currentQuestion + 1;
    
    // Frage anzeigen
    document.getElementById('qText').textContent = q.text;
    
    // Optionen anzeigen
    const optsDiv = document.getElementById('qOpts');
    optsDiv.innerHTML = '';
    
    const optKeys = Object.keys(q.options);
    for (let i = 0; i < optKeys.length; i++) {
        const key = optKeys[i];
        const text = q.options[key];
        
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = key + ')  ' + text;
        btn.onclick = function() { selectOption(key); };
        
        optsDiv.appendChild(btn);
    }
    
    // Back-Button Status
    const backBtn = document.getElementById('backBtn');
    backBtn.disabled = (currentQuestion === 0);
    backBtn.style.opacity = (currentQuestion === 0) ? '0.5' : '1';
}

// --- Option auswählen und Score aktualisieren ---
function selectOption(optionKey) {
    const q = questions[currentQuestion];
    const optionScoring = q.scoring[optionKey];
    
    // Scores für diese Option hinzufügen
    if (optionScoring) {
        for (let careerName in optionScoring) {
            scores[careerName] = (scores[careerName] || 0) + optionScoring[careerName];
        }
    }
    
    // Antwort speichern
    history[currentQuestion] = { key: optionKey, text: q.options[optionKey] };
    
    // Nächste Frage or Ergebnisse
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        finishQuiz();
    }
}

// --- Zur vorherigen Frage ---
function goBack() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}

// --- Nächste Frage (für Navigation) ---
function nextQuestion() {
    // Diese Funktion wird bei "Next Button" aufgerufen wenn keine Option gewählt wurde
    // Für diese Version simplify wir das — der Nutzer muss eine Option klicken
}

// --- Quiz beenden und Ergebnisse anzeigen ---
async function finishQuiz() {
    document.getElementById('quiz').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    
    // Ergebnisse aktualisieren
    const topCareers = getTopCareers(5);
    
    try {
        // Ergebnisse speichern
        const profile = calculateProfile();
        await fetch('/api/quiz/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scores: scores,
                topCareers: topCareers.map(c => c[0]),
                profile: profile
            })
        });
    } catch (error) {
        console.log('Fehler beim Speichern:', error);
    }
    
    renderResults({ scores, topCareers });
}

// --- Ergebnisse rendern ---
function renderResults(result) {
    // Profile anzeigen
    const profile = calculateProfile();
    document.getElementById('profEmoji').textContent = profiles[profile].emoji;
    document.getElementById('profType').textContent = profiles[profile].type;
    document.getElementById('profDesc').textContent = profiles[profile].desc;
    
    // Top 3 Karrieren anzeigen
    const sorted = getSortedCareers();
    const top3Div = document.getElementById('topCards');
    top3Div.innerHTML = '';
    
    for (let i = 0; i < Math.min(3, sorted.length); i++) {
        const careerName = sorted[i][0];
        const score = sorted[i][1];
        
        const card = document.createElement('div');
        card.className = 'top-career-card';
        card.innerHTML = '<h3>#' + (i + 1) + ': ' + careerName + '</h3>'
            + '<p>Score: ' + score + '</p>'
            + '<button class="btn btn-small" onclick="viewCareerDetails(\'' + careerName.replace(/'/g, "\\'") + '\')">Details</button>';
        
        top3Div.appendChild(card);
    }
    
    // Score-Tabelle
    const tableBody = document.getElementById('scoreTable');
    tableBody.innerHTML = '';
    
    for (let i = 0; i < sorted.length; i++) {
        const careerName = sorted[i][0];
        const score = sorted[i][1];
        
        const row = document.createElement('tr');
        row.innerHTML = '<td onclick="viewCareerDetails(\'' + careerName.replace(/'/g, "\\'") + '\')" style="cursor:pointer;">'
            + careerName + '</td>'
            + '<td style="text-align:center;">' + score + '</td>';
        
        tableBody.appendChild(row);
    }
    
    // Charts
    renderCharts();
}

// --- Sortierte Karrieren ---
function getSortedCareers() {
    const sorted = [];
    for (let name in scores) {
        if (scores[name] > 0) {
            sorted.push([name, scores[name]]);
        }
    }
    sorted.sort((a, b) => b[1] - a[1]);
    return sorted;
}

// --- Top N Karrieren ---
function getTopCareers(n) {
    return getSortedCareers().slice(0, n);
}

// --- Profile berechnen (A-E basierend auf Antworten) ---
function calculateProfile() {
    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    
    for (let i = 0; i < history.length; i++) {
        if (history[i]) {
            const key = history[i].key;
            if (counts[key] !== undefined) {
                counts[key]++;
            }
        }
    }
    
    let maxProfile = 'A';
    let maxCount = 0;
    
    for (let p in counts) {
        if (counts[p] > maxCount) {
            maxCount = counts[p];
            maxProfile = p;
        }
    }
    
    return maxProfile;
}

// --- Charts zeichnen ---
function renderCharts() {
    const sorted = getSortedCareers();
    const top10 = sorted.slice(0, 10);
    
    // Bar Chart
    const barCanvas = document.getElementById('chartBar');
    if (barCanvas && chartBar) chartBar.destroy();
    
    if (barCanvas) {
        const labels = top10.map(c => c[0]);
        const data = top10.map(c => c[1]);
        
        chartBar = new Chart(barCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Score',
                    data: data,
                    backgroundColor: '#0066cc'
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    }
    
    // Radar Chart
    const radarCanvas = document.getElementById('chartRadar');
    if (radarCanvas && chartRadar) chartRadar.destroy();
    
    if (radarCanvas) {
        const category_scores = {
            'Consulting': 0,
            'Finance': 0,
            'Marketing': 0,
            'HR': 0,
            'Product': 0
        };
        
        // Simple Kategorisierung
        for (let c of sorted) {
            const name = c[0];
            if (name.includes('Consulting')) category_scores['Consulting'] += c[1];
            if (name.includes('Finance') || name.includes('Banking')) category_scores['Finance'] += c[1];
            if (name.includes('Marketing') || name.includes('Brand')) category_scores['Marketing'] += c[1];
            if (name.includes('HR') || name.includes('Talent')) category_scores['HR'] += c[1];
            if (name.includes('Product') || name.includes('Founder')) category_scores['Product'] += c[1];
        }
        
        chartRadar = new Chart(radarCanvas.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['Consulting', 'Finance', 'Marketing', 'HR', 'Product'],
                datasets: [{
                    label: 'Interest',
                    data: [
                        category_scores['Consulting'],
                        category_scores['Finance'],
                        category_scores['Marketing'],
                        category_scores['HR'],
                        category_scores['Product']
                    ],
                    borderColor: '#0066cc',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)'
                }]
            },
            options: { responsive: true }
        });
    }
}

// --- Karriere-Details anzeigen ---
function viewCareerDetails(careerName) {
    alert(careerName + '\n\n' + careers[careerName] || 'No description available.');
}

// --- Zu Applications-Seite navigieren ---
function jumpToApplications() {
    window.location.href = '/applications.html';
}

// --- Beim Laden initialisieren ---
initPage();
