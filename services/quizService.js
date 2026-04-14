/**
 * =============================================================
 *  services/quizService.js — Speichern und Laden von Quiz-Ergebnissen
 * =============================================================
 *
 *  Jeder User hat maximal ein gespeichertes Ergebnis.
 *  Beim erneuten Abschließen des Quiz wird das alte überschrieben.
 *
 *  Wird von routes/quizRoutes.js benutzt.
 * =============================================================
 */

const dataService = require('./dataService');


/**
 * Lädt das gespeicherte Quiz-Ergebnis eines Users.
 * Gibt null zurück wenn noch kein Ergebnis vorhanden.
 *
 * @param {string} userId - ID des eingeloggten Users
 * @returns {object|null} - Das gespeicherte Ergebnis oder null
 */
async function getResult(userId) {
    const allResults = await dataService.readQuizResults();

    // Ergebnis des Users suchen
    for (var i = 0; i < allResults.length; i++) {
        if (allResults[i].userId === userId) {
            return allResults[i];
        }
    }

    return null;
}


/**
 * Speichert ein Quiz-Ergebnis für einen User.
 * Wenn der User schon ein Ergebnis hat, wird es überschrieben.
 *
 * @param {string} userId - ID des eingeloggten Users
 * @param {object} resultData - Die Ergebnis-Daten (answers, profileType, usw.)
 * @returns {object} - Das gespeicherte Ergebnis
 */
async function saveResult(userId, resultData) {
    const allResults = await dataService.readQuizResults();

    // Bestehendes Ergebnis dieses Users suchen
    let foundIndex = -1;
    for (var i = 0; i < allResults.length; i++) {
        if (allResults[i].userId === userId) {
            foundIndex = i;
            break;
        }
    }

    // Neues Ergebnis-Objekt erstellen
    const newResult = {
        userId: userId,
        answers: resultData.answers || [],
        profileType: resultData.profileType || '',
        profileEmoji: resultData.profileEmoji || '',
        savedAt: new Date().toISOString()
    };

    if (foundIndex >= 0) {
        // Bestehendes Ergebnis überschreiben
        allResults[foundIndex] = newResult;
    } else {
        // Neues Ergebnis hinzufügen
        allResults.push(newResult);
    }

    await dataService.writeQuizResults(allResults);

    return newResult;
}


// --- Exportieren ---
module.exports = {
    getResult,
    saveResult
};
