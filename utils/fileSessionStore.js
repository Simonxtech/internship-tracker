/**
 * =============================================================
 *  utils/fileSessionStore.js — Einfacher Datei-basierter Session-Store
 * =============================================================
 *
 *  Dieser Store speichert Express-Sessions in einer JSON-Datei
 *  statt im RAM. So bleiben Sessions auch nach Server-Restart erhalten.
 *
 *  Wird in server.js verwendet um Sessions persistent zu machen.
 * =============================================================
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class FileSessionStore extends EventEmitter {
    constructor(filePath) {
        super();
        this.filePath = filePath || path.join(__dirname, '../data/sessions.json');
        this.sessions = {};
        this.loadSessions();
    }

    // Alle Sessions aus der Datei laden
    loadSessions() {
        try {
            if (fs.existsSync(this.filePath)) {
                const data = fs.readFileSync(this.filePath, 'utf8');
                this.sessions = JSON.parse(data);
            } else {
                this.sessions = {};
            }
        } catch (error) {
            console.log('Fehler beim Laden der Sessions:', error.message);
            this.sessions = {};
        }
    }

    // Sessions in Datei speichern
    saveSessions() {
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.filePath, JSON.stringify(this.sessions, null, 2), 'utf8');
        } catch (error) {
            console.log('Fehler beim Speichern der Sessions:', error.message);
        }
    }

    // Erforderlich von express-session: get(sid, callback)
    get(sid, callback) {
        const session = this.sessions[sid];
        if (session) {
            // Prüfe ob Session abgelaufen ist
            if (session.expires && new Date(session.expires) < new Date()) {
                delete this.sessions[sid];
                this.saveSessions();
                callback(null, null);
            } else {
                callback(null, session);
            }
        } else {
            callback(null, null);
        }
    }

    // Erforderlich von express-session: set(sid, session, callback)
    set(sid, session, callback) {
        this.sessions[sid] = session;
        this.saveSessions();
        if (callback) {
            callback(null);
        }
    }

    // Erforderlich von express-session: destroy(sid, callback)
    destroy(sid, callback) {
        delete this.sessions[sid];
        this.saveSessions();
        if (callback) {
            callback(null);
        }
    }

    // Optional: clear() - Alle Sessions löschen
    clear(callback) {
        this.sessions = {};
        this.saveSessions();
        if (callback) {
            callback(null);
        }
    }

    // Optional: length - Anzahl der Sessions
    length(callback) {
        const count = Object.keys(this.sessions).length;
        if (callback) {
            callback(null, count);
        } else {
            return count;
        }
    }
}

module.exports = FileSessionStore;
