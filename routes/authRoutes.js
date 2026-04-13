/**
 * =============================================================
 *  routes/authRoutes.js — API-Routen für Login, Register, Logout
 * =============================================================
 *
 *  Diese Datei definiert alle Endpunkte für die Authentifizierung:
 *    POST /api/auth/register  → Neuen Account erstellen
 *    POST /api/auth/login     → Einloggen
 *    POST /api/auth/logout    → Ausloggen
 *    GET  /api/auth/me        → Aktuell eingeloggten User abfragen
 *
 *  Die eigentliche Logik (Passwort prüfen etc.) steckt in
 *  services/authService.js. Hier leiten wir nur die Anfragen weiter.
 *
 *  Wird in server.js eingebunden mit: app.use('/api/auth', authRoutes)
 * =============================================================
 */

// --- Express Router laden ---
const express = require('express');
const router = express.Router();

// --- Eigene Module laden ---
const authService = require('../services/authService');
const logger = require('../utils/logger');


// =============================================================
//  POST /api/auth/register — Neuen Account erstellen
// =============================================================
router.post('/register', async function (req, res) {
    try {
        // Username und Passwort aus dem Request-Body lesen
        const username = req.body.username;
        const password = req.body.password;

        // Den authService die Registrierung durchführen lassen
        const newUser = await authService.registerUser(username, password);

        // Session setzen (User ist direkt nach Registrierung eingeloggt)
        req.session.user = newUser;

        // Erfolgs-Antwort senden
        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            user: newUser
        });

    } catch (error) {
        // Fehler-Antwort senden (z.B. Username schon vergeben)
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});


// =============================================================
//  POST /api/auth/login — Einloggen
// =============================================================
router.post('/login', async function (req, res) {
    try {
        const username = req.body.username;
        const password = req.body.password;

        // Den authService das Login durchführen lassen
        const user = await authService.loginUser(username, password);

        // Session setzen (User-Daten in der Session speichern)
        req.session.user = user;

        // Erfolgs-Antwort senden
        res.status(200).json({
            success: true,
            message: 'Login successful!',
            user: user
        });

    } catch (error) {
        // Fehler-Antwort senden (z.B. falsches Passwort)
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
});


// =============================================================
//  POST /api/auth/logout — Ausloggen
// =============================================================
router.post('/logout', function (req, res) {
    // Username für Logging merken bevor die Session gelöscht wird
    const username = req.session.user ? req.session.user.username : 'Unknown';

    // Session zerstören
    req.session.destroy(function (error) {
        if (error) {
            res.status(500).json({
                success: false,
                message: 'Error during logout.'
            });
            return;
        }

        // Event loggen
        logger.emit('userLoggedOut', { username: username });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully.'
        });
    });
});


// =============================================================
//  GET /api/auth/me — Aktuellen User abfragen
// =============================================================

/**
 * Dieser Endpunkt wird vom Frontend benutzt um zu prüfen ob
 * der User noch eingeloggt ist (z.B. nach einem Seiten-Refresh).
 */
router.get('/me', function (req, res) {
    if (req.session && req.session.user) {
        // User ist eingeloggt → User-Daten zurückgeben
        res.status(200).json({
            success: true,
            user: req.session.user
        });
    } else {
        // User ist nicht eingeloggt
        res.status(401).json({
            success: false,
            message: 'Not logged in.'
        });
    }
});


// --- Router exportieren ---
module.exports = router;
