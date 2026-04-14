/**
 * =============================================================
 *  utils/fileSessionStore.js — Datei-basierter Session-Speicher
 * =============================================================
 *
 *  Standardmäßig speichert express-session die Sessions im RAM.
 *  Wenn der Server neu startet (z.B. auf Render.com nach 15min Sleep),
 *  gehen alle Sessions verloren — der User ist ausgeloggt.
 *
 *  Diese Klasse speichert Sessions in einer JSON-Datei auf der Festplatte.
 *  So bleiben Sessions auch nach einem Neustart erhalten.
 *
 *  WICHTIG: Die Klasse muss session.Store erweitern damit
 *  express-session die createSession()-Methode automatisch erbt.
 * =============================================================
 */

const fs = require('fs');
const path = require('path');
const session = require('express-session');

// Pfad zur JSON-Datei wo die Sessions gespeichert werden
const SESSIONS_FILE = path.join(__dirname, '../data/sessions.json');


/**
 * FileSessionStore — erweiter die offizielle express-session Store-Klasse.
 * Muss get(), set() und destroy() implementieren.
 */
class FileSessionStore extends session.Store {

    constructor() {
        super();

        // Sicherstellen dass die sessions.json existiert
        if (!fs.existsSync(SESSIONS_FILE)) {
            fs.writeFileSync(SESSIONS_FILE, '{}', 'utf8');
        }
    }


    /**
     * Alle Sessions aus der Datei laden.
     * Gibt ein leeres Objekt zurück wenn die Datei leer oder kaputt ist.
     */
    _readSessions() {
        try {
            const content = fs.readFileSync(SESSIONS_FILE, 'utf8');
            if (!content || content.trim() === '') {
                return {};
            }
            return JSON.parse(content);
        } catch (error) {
            // Wenn die Datei kaputt ist: leeres Objekt zurückgeben
            return {};
        }
    }


    /**
     * Alle Sessions in die Datei speichern.
     */
    _writeSessions(sessions) {
        try {
            fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf8');
        } catch (error) {
            console.log('Fehler beim Speichern der Sessions:', error.message);
        }
    }


    /**
     * get: Eine Session anhand der Session-ID laden.
     * Wird bei JEDER Anfrage aufgerufen um die Session zu prüfen.
     *
     * @param {string} sid - Session-ID
     * @param {function} callback - callback(fehler, session)
     */
    get(sid, callback) {
        const sessions = this._readSessions();
        const sessionData = sessions[sid];

        // Session nicht gefunden → null zurückgeben (User muss neu einloggen)
        if (!sessionData) {
            return callback(null, null);
        }

        // Prüfen ob die Session abgelaufen ist
        if (sessionData.cookie && sessionData.cookie.expires) {
            const expiresDate = new Date(sessionData.cookie.expires);
            if (expiresDate < new Date()) {
                // Session abgelaufen → löschen und null zurückgeben
                delete sessions[sid];
                this._writeSessions(sessions);
                return callback(null, null);
            }
        }

        return callback(null, sessionData);
    }


    /**
     * set: Eine Session speichern oder aktualisieren.
     * Wird aufgerufen wenn sich der Session-Inhalt ändert (z.B. nach Login).
     *
     * @param {string} sid - Session-ID
     * @param {object} session - Die Session-Daten
     * @param {function} callback - callback(fehler)
     */
    set(sid, session, callback) {
        const sessions = this._readSessions();
        sessions[sid] = session;
        this._writeSessions(sessions);
        return callback(null);
    }


    /**
     * destroy: Eine Session löschen.
     * Wird beim Logout aufgerufen.
     *
     * @param {string} sid - Session-ID
     * @param {function} callback - callback(fehler)
     */
    destroy(sid, callback) {
        const sessions = this._readSessions();
        delete sessions[sid];
        this._writeSessions(sessions);
        return callback(null);
    }
}


// --- Klasse exportieren ---
module.exports = FileSessionStore;
