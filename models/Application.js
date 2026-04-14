/**
 * =============================================================
 *  models/Application.js — Klasse für eine Bewerbung
 * =============================================================
 *
 *  Diese Datei definiert die Klasse "Application".
 *  Eine Klasse ist wie eine Bauanleitung/Vorlage für Objekte.
 *  Jede Bewerbung in unserer App wird aus dieser Klasse erstellt.
 *
 *  Felder einer Bewerbung:
 *    - id: Eindeutige ID
 *    - userId: Welchem User gehört die Bewerbung
 *    - company: Firmenname (z.B. "Bosch")
 *    - roleType: "Internship" oder "Working Student"
 *    - position: Jobtitel
 *    - location: Ort
 *    - country: Land (z.B. "Germany", "UK", "Switzerland")
 *    - status: Aktueller Stand der Bewerbung
 *    - deadline: Bewerbungsfrist
 *    - appliedDate: Wann man sich beworben hat
 *    - salary: Vergütung
 *    - url: Link zur Stellenanzeige
 *    - notes: Freitext-Notizen
 *    - periodIds: Welche Zeiträume zugeordnet sind
 *
 *  Wird in services/applicationService.js benutzt.
 * =============================================================
 */

// Hilfsfunktionen laden
const helpers = require('../utils/helpers');


/**
 * Die Application-Klasse: Vorlage für jede Bewerbung.
 * Nutzt class, constructor, get/set — Anforderung vom Professor.
 */
class Application {

    /**
     * Konstruktor: Wird aufgerufen wenn man "new Application(daten)" schreibt.
     * Erstellt ein neues Bewerbungs-Objekt mit allen Feldern.
     *
     * Der Parameter "data" ist ein Objekt mit den Werten.
     * Wenn ein Feld nicht übergeben wird, bekommt es einen Standardwert.
     */
    constructor(data) {
        this.id = data.id || helpers.generateUniqueId();
        this.userId = data.userId || '';
        this.company = data.company || '';
        this.roleType = data.roleType || 'Internship';
        this.position = data.position || '';
        this.location = data.location || '';
        this.country = data.country || 'Germany';
        this._status = data.status || 'Wishlist';  // mit Unterstrich für den Setter
        this.deadline = data.deadline || '';
        this.appliedDate = data.appliedDate || '';
        this.salary = data.salary || '';
        this.url = data.url || '';
        this.notes = data.notes || '';
        this.periodIds = data.periodIds || [];
    }

    /**
     * Getter für den Status: Gibt den aktuellen Status zurück.
     * Man ruft ihn auf wie eine Eigenschaft: bewerbung.status
     * (nicht wie eine Funktion mit Klammern)
     */
    get status() {
        return this._status;
    }

    /**
     * Setter für den Status: Prüft ob der Status gültig ist bevor
     * er gespeichert wird. Ungültige Werte werden ignoriert.
     * Man setzt ihn wie eine Eigenschaft: bewerbung.status = 'Interview'
     */
    set status(newStatus) {
        // Liste aller erlaubten Status-Werte
        const allowedStatuses = [
            'Wishlist',
            'Applied',
            'Online Assessment',
            'Interview',
            'Offer',
            'Rejected'
        ];

        // Prüfen ob der neue Status erlaubt ist
        if (allowedStatuses.includes(newStatus)) {
            this._status = newStatus;
        } else {
            console.log('Warnung: Ungültiger Status "' + newStatus + '" — wird ignoriert.');
        }
    }

    /**
     * Getter für den roleType: Gibt den Typ zurück.
     */
    get type() {
        return this.roleType;
    }

    /**
     * Gibt eine kurze Zusammenfassung der Bewerbung als Text zurück.
     * Nützlich fürs Debugging und Logging.
     */
    getSummary() {
        return this.company + ' — ' + this.position + ' (' + this._status + ')';
    }

    /**
     * Wandelt das Objekt in ein einfaches JSON-Objekt um.
     * Wichtig: Beim Speichern in JSON-Dateien brauchen wir ein
     * normales Objekt, keine Klassen-Instanz.
     */
    toJSON() {
        const jsonObject = {
            id: this.id,
            userId: this.userId,
            company: this.company,
            roleType: this.roleType,
            position: this.position,
            location: this.location,
            country: this.country,
            status: this._status,
            deadline: this.deadline,
            appliedDate: this.appliedDate,
            salary: this.salary,
            url: this.url,
            notes: this.notes,
            periodIds: this.periodIds
        };

        return jsonObject;
    }
}


// --- Klasse exportieren ---
module.exports = Application;
