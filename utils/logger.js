/**
 * =============================================================
 *  utils/logger.js — Logger mit EventEmitter
 * =============================================================
 *
 *  Diese Datei nutzt das EventEmitter-Pattern aus Node.js,
 *  eine Anforderung vom Professor.
 *
 *  EventEmitter funktioniert so:
 *    - Man kann Events "auslösen" (emit)
 *    - Andere Stellen im Code können auf Events "hören" (on)
 *    - Wenn ein Event ausgelöst wird, werden alle Listener aufgerufen
 *
 *  Beispiel: Wenn eine neue Bewerbung erstellt wird, lösen wir
 *  das Event 'applicationCreated' aus. Der Logger hört darauf
 *  und schreibt eine Nachricht in die Konsole.
 *
 *  Wird in server.js und den Service-Dateien benutzt.
 * =============================================================
 */

// --- EventEmitter aus Node.js laden ---
const EventEmitter = require('events');


/**
 * AppLogger-Klasse: Erbt von EventEmitter (extends-Keyword).
 * Das ist eine Anforderung vom Professor: Klassen mit extends nutzen.
 */
class AppLogger extends EventEmitter {

    /**
     * Konstruktor: Wird aufgerufen wenn ein neuer Logger erstellt wird.
     * Wir registrieren hier alle Event-Listener.
     */
    constructor() {
        // super() ruft den Konstruktor der Elternklasse (EventEmitter) auf.
        // Das ist Pflicht wenn man extends benutzt.
        super();

        // --- Event-Listener registrieren ---

        // Wenn der Server gestartet wird
        this.on('serverStarted', function (data) {
            const timestamp = new Date().toLocaleString('de-DE');
            console.log('[' + timestamp + '] SERVER: Gestartet auf Port ' + data.port);
        });

        // Wenn ein neuer User sich registriert
        this.on('userRegistered', function (data) {
            const timestamp = new Date().toLocaleString('de-DE');
            console.log('[' + timestamp + '] AUTH: Neuer User registriert — ' + data.username);
        });

        // Wenn sich ein User einloggt
        this.on('userLoggedIn', function (data) {
            const timestamp = new Date().toLocaleString('de-DE');
            console.log('[' + timestamp + '] AUTH: User eingeloggt — ' + data.username);
        });

        // Wenn sich ein User ausloggt
        this.on('userLoggedOut', function (data) {
            const timestamp = new Date().toLocaleString('de-DE');
            console.log('[' + timestamp + '] AUTH: User ausgeloggt — ' + data.username);
        });

        // Wenn eine neue Bewerbung erstellt wird
        this.on('applicationCreated', function (data) {
            const timestamp = new Date().toLocaleString('de-DE');
            console.log('[' + timestamp + '] APP: Neue Bewerbung erstellt — ' + data.company + ' (' + data.position + ')');
        });

        // Wenn eine Bewerbung aktualisiert wird
        this.on('applicationUpdated', function (data) {
            const timestamp = new Date().toLocaleString('de-DE');
            console.log('[' + timestamp + '] APP: Bewerbung aktualisiert — ' + data.company);
        });

        // Wenn eine Bewerbung gelöscht wird
        this.on('applicationDeleted', function (data) {
            const timestamp = new Date().toLocaleString('de-DE');
            console.log('[' + timestamp + '] APP: Bewerbung gelöscht — ' + data.company);
        });

        // Wenn ein neuer Zeitraum erstellt wird
        this.on('periodCreated', function (data) {
            const timestamp = new Date().toLocaleString('de-DE');
            console.log('[' + timestamp + '] PERIOD: Neuer Zeitraum erstellt — ' + data.name);
        });

        // Wenn ein Zeitraum gelöscht wird
        this.on('periodDeleted', function (data) {
            const timestamp = new Date().toLocaleString('de-DE');
            console.log('[' + timestamp + '] PERIOD: Zeitraum gelöscht — ' + data.name);
        });
    }
}


// --- Eine einzige Logger-Instanz erstellen und exportieren ---
// So nutzen alle Dateien denselben Logger (Singleton-Pattern).
const logger = new AppLogger();

module.exports = logger;
