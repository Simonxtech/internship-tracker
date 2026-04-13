/**
 * =============================================================
 *  models/Period.js — Klasse für einen Zeitraum
 * =============================================================
 *
 *  Diese Datei definiert die Klasse "Period" (Zeitraum).
 *  Ein Zeitraum ist z.B. "Summer Internship 2026" oder
 *  "Working Student WS 25/26".
 *
 *  Bewerbungen können einem oder mehreren Zeiträumen zugeordnet werden.
 *
 *  Felder eines Zeitraums:
 *    - id: Eindeutige ID
 *    - userId: Welchem User gehört der Zeitraum
 *    - name: Name des Zeitraums (z.B. "Summer Internship 2026")
 *    - color: Farbe als Hex-Code (z.B. "#3b82f6")
 *
 *  HINWEIS: Wir nutzen hier "extends" als Demonstration für den
 *  Professor. Period erbt von einer Basis-Klasse "BaseModel".
 *
 *  Wird in routes/periodRoutes.js und services/dataService.js benutzt.
 * =============================================================
 */

const helpers = require('../utils/helpers');


/**
 * BaseModel: Basis-Klasse die gemeinsame Eigenschaften definiert.
 * Diese Klasse wird von Period "erweitert" (extends).
 * Das zeigt dem Professor das extends-Konzept.
 */
class BaseModel {

    /**
     * Konstruktor der Basis-Klasse: Gibt jedem Objekt eine ID und ein userId-Feld.
     */
    constructor(data) {
        this.id = data.id || helpers.generateUniqueId();
        this.userId = data.userId || '';
    }

    /**
     * Gibt die ID als String zurück — gemeinsame Methode für alle Models.
     */
    getId() {
        return this.id;
    }
}


/**
 * Period-Klasse: Erbt von BaseModel (extends-Keyword!).
 * Hat zusätzlich einen Namen und eine Farbe.
 */
class Period extends BaseModel {

    /**
     * Konstruktor: Erstellt einen neuen Zeitraum.
     * super(data) ruft den Konstruktor von BaseModel auf.
     */
    constructor(data) {
        // Eltern-Konstruktor aufrufen (setzt id und userId)
        super(data);

        this._name = data.name || '';
        this.color = data.color || '#3b82f6';
    }

    /**
     * Getter für den Namen
     */
    get name() {
        return this._name;
    }

    /**
     * Setter für den Namen: Prüft ob der Name nicht leer ist
     */
    set name(newName) {
        if (newName && newName.trim().length > 0) {
            this._name = newName.trim();
        } else {
            console.log('Warnung: Zeitraum-Name darf nicht leer sein.');
        }
    }

    /**
     * Wandelt den Zeitraum in ein JSON-Objekt um zum Speichern.
     */
    toJSON() {
        const jsonObject = {
            id: this.id,
            userId: this.userId,
            name: this._name,
            color: this.color
        };
        return jsonObject;
    }
}


// --- Beide Klassen exportieren ---
module.exports = {
    BaseModel,
    Period
};
