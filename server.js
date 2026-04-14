/**
 * =============================================================
 *  server.js — Hauptserver der Internship-Tracker App
 * =============================================================
 *
 *  Diese Datei ist der Einstiegspunkt unserer App.
 *  Sie macht folgendes:
 *    1. Startet einen Express-Webserver auf Port 8080
 *    2. Richtet Middleware ein (JSON-Parsing, Sessions, statische Dateien)
 *    3. Bindet alle Routen-Dateien ein (Auth, Applications, Periods, Stats)
 *    4. Stellt sicher, dass die JSON-Datendateien existieren
 *
 *  Starten mit: node server.js
 *  Dann im Browser öffnen: http://localhost:8080
 * =============================================================
 */

// --- Benötigte Module laden ---
const express = require('express');
const session = require('express-session');
const path = require('path');
const dataService = require('./services/dataService');
const logger = require('./utils/logger');
const FileSessionStore = require('./utils/fileSessionStore');

// --- Routen-Dateien laden ---
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const periodRoutes = require('./routes/periodRoutes');
const statsRoutes = require('./routes/statsRoutes');
const quizRoutes = require('./routes/quizRoutes');

// --- Express-App erstellen ---
const app = express();

// --- Port festlegen (Anforderung vom Professor: Port 8080) ---
const PORT = 8080;


// =============================================================
//  MIDDLEWARE EINRICHTEN
// =============================================================

/**
 * JSON-Body-Parser: Erlaubt dem Server, JSON-Daten aus
 * fetch()-Anfragen vom Frontend zu lesen
 */
app.use(express.json());

/**
 * Session-Middleware: Hält den Login-Status des Users fest.
 * Jeder Browser bekommt eine eindeutige Session-ID als Cookie.
 * So weiß der Server bei jeder Anfrage, wer eingeloggt ist.
 */
app.use(session({
    secret: 'internship-tracker-geheim-2026',
    resave: false,
    saveUninitialized: false,
    store: new FileSessionStore(),   // Sessions in JSON-Datei speichern statt RAM
    cookie: {
        maxAge: 1000 * 60 * 60 * 24  // Session läuft nach 24 Stunden ab
    }
}));

/**
 * Statische Dateien: Alles im Ordner "public/" wird direkt
 * an den Browser ausgeliefert (HTML, CSS, JS-Dateien).
 */
app.use(express.static(path.join(__dirname, 'public')));


// =============================================================
//  API-ROUTEN EINBINDEN
// =============================================================

/**
 * Jede Routen-Gruppe hat ihren eigenen Pfad-Prefix:
 *   /api/auth/...         → Login, Register, Logout
 *   /api/applications/... → CRUD für Bewerbungen
 *   /api/periods/...      → CRUD für Zeiträume
 *   /api/stats            → Statistiken
 */
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/periods', periodRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/quiz', quizRoutes);


// =============================================================
//  SERVER STARTEN
// =============================================================

/**
 * initializeAndStart: Stellt sicher, dass die Datendateien existieren
 * und startet dann den Server.
 * Wir benutzen async/await weil das Dateisystem-Zugriffe sind.
 */
async function initializeAndStart() {
    try {
        // Datendateien initialisieren (erstellt sie falls sie nicht existieren)
        await dataService.initializeDataFiles();

        // Server auf Port 8080 starten
        app.listen(PORT, function () {
            console.log('===========================================');
            console.log('  Internship Tracker Server gestartet!');
            console.log('  URL: http://localhost:' + PORT);
            console.log('===========================================');

            // Event loggen dass der Server gestartet wurde
            logger.emit('serverStarted', { port: PORT });
        });

    } catch (error) {
        console.error('Fehler beim Starten des Servers:', error);
    }
}

// Server starten
initializeAndStart();
