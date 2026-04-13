/**
 * =============================================================
 *  utils/helpers.js — Hilfsfunktionen für die gesamte App
 * =============================================================
 *
 *  Diese Datei enthält kleine Hilfsfunktionen die von vielen
 *  anderen Dateien benutzt werden, z.B.:
 *    - Eindeutige IDs erzeugen
 *    - Datum formatieren
 *    - Tage bis zu einem Datum berechnen
 *
 *  Wird z.B. in services/applicationService.js und
 *  services/authService.js benutzt.
 * =============================================================
 */

/**
 * Erzeugt eine eindeutige ID aus der aktuellen Zeit und Zufallszeichen.
 * Beispiel-Ergebnis: "m1abc23x" — jede ID ist einzigartig.
 * Wir brauchen das damit jede Bewerbung, jeder User und jeder
 * Zeitraum seine eigene ID hat.
 */
function generateUniqueId() {
    // Aktuellen Zeitstempel als Basis-36-String (Buchstaben + Zahlen)
    const timePart = Date.now().toString(36);

    // Zufällige Zeichen für extra Eindeutigkeit
    const randomPart = Math.random().toString(36).slice(2, 8);

    // Beides zusammenfügen
    const uniqueId = timePart + randomPart;

    return uniqueId;
}


/**
 * Formatiert ein Datum von "2026-04-15" zu "15.04.2026" (deutsches Format).
 * Gibt "–" zurück wenn kein Datum vorhanden ist.
 */
function formatDateGerman(dateString) {
    if (!dateString) {
        return '–';
    }

    // Datum an den Bindestrichen auftrennen
    const parts = dateString.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    // Im deutschen Format zusammensetzen
    const formatted = day + '.' + month + '.' + year;

    return formatted;
}


/**
 * Gibt das heutige Datum als String zurück im Format "2026-04-13"
 */
function getTodayString() {
    const today = new Date();
    const todayString = today.toISOString().slice(0, 10);
    return todayString;
}


/**
 * Berechnet wie viele Tage zwischen heute und einem Datum liegen.
 * Positiv = Datum liegt in der Zukunft, Negativ = Datum ist vorbei.
 * Gibt null zurück wenn kein Datum übergeben wird.
 */
function daysUntilDate(dateString) {
    if (!dateString) {
        return null;
    }

    const targetDate = new Date(dateString);
    const today = new Date(getTodayString());

    // Differenz in Millisekunden berechnen
    const differenceInMilliseconds = targetDate - today;

    // In Tage umrechnen (1 Tag = 86400000 Millisekunden)
    const differenceInDays = Math.ceil(differenceInMilliseconds / 86400000);

    return differenceInDays;
}


// --- Alle Funktionen exportieren damit andere Dateien sie nutzen können ---
module.exports = {
    generateUniqueId,
    formatDateGerman,
    getTodayString,
    daysUntilDate
};
