/**
 * =============================================================
 *  models/User.js — Klasse für einen Benutzer
 * =============================================================
 *
 *  Diese Datei definiert die Klasse "User".
 *  Jeder Benutzer-Account in unserer App wird aus dieser Klasse erstellt.
 *
 *  Felder eines Users:
 *    - id: Eindeutige ID
 *    - username: Benutzername zum Einloggen
 *    - passwordHash: Gehashtes Passwort (nie das Klartext-Passwort speichern!)
 *    - createdAt: Wann der Account erstellt wurde
 *
 *  Wird in services/authService.js benutzt.
 * =============================================================
 */

const helpers = require('../utils/helpers');


/**
 * Die User-Klasse: Vorlage für jeden Benutzer.
 */
class User {

    /**
     * Konstruktor: Erstellt ein neues User-Objekt.
     */
    constructor(data) {
        this.id = data.id || helpers.generateUniqueId();
        this._username = data.username || '';
        this.passwordHash = data.passwordHash || '';
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    /**
     * Getter für den Username
     */
    get username() {
        return this._username;
    }

    /**
     * Setter für den Username: Prüft ob der Name mindestens 2 Zeichen hat
     */
    set username(newName) {
        if (newName && newName.trim().length >= 2) {
            this._username = newName.trim();
        } else {
            console.log('Warnung: Username muss mindestens 2 Zeichen haben.');
        }
    }

    /**
     * Gibt das User-Objekt als JSON zurück (ohne das Passwort!).
     * Wird benutzt wenn wir User-Daten ans Frontend schicken —
     * dort soll das Passwort nie ankommen.
     */
    toSafeJSON() {
        const safeObject = {
            id: this.id,
            username: this._username,
            createdAt: this.createdAt
        };
        return safeObject;
    }

    /**
     * Gibt das komplette User-Objekt als JSON zurück (mit Passwort-Hash).
     * Wird nur intern zum Speichern in der JSON-Datei benutzt.
     */
    toJSON() {
        const jsonObject = {
            id: this.id,
            username: this._username,
            passwordHash: this.passwordHash,
            createdAt: this.createdAt
        };
        return jsonObject;
    }
}


// --- Klasse exportieren ---
module.exports = User;
