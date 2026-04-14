/**
 * =============================================================
 *  services/dataService.js — JSON-Dateien lesen und schreiben
 * =============================================================
 *
 *  Diese Datei kümmert sich um die Datenspeicherung.
 *  Unsere App speichert alle Daten in JSON-Dateien im data/-Ordner:
 *    - data/users.json        → Alle Benutzer-Accounts
 *    - data/applications.json → Alle Bewerbungen
 *    - data/periods.json      → Alle Zeiträume
 *
 *  WICHTIG: Wir benutzen das fs-Modul mit Promises (async/await),
 *  NICHT mit Sync-Funktionen! Das ist eine Anforderung vom Professor.
 *
 *  fs.promises.readFile() statt fs.readFileSync()
 *  fs.promises.writeFile() statt fs.writeFileSync()
 *
 *  Wird von allen Service-Dateien benutzt (authService, applicationService, etc.)
 * =============================================================
 */

// --- Node.js Module laden ---
const fs = require('fs');              // Dateisystem-Modul
const path = require('path');          // Pfad-Modul für Dateipfade

// --- Pfade zu den JSON-Dateien ---
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
const PERIODS_FILE = path.join(DATA_DIR, 'periods.json');
const QUIZ_RESULTS_FILE = path.join(DATA_DIR, 'quizResults.json');


/**
 * Stellt sicher, dass der data/-Ordner und alle JSON-Dateien existieren.
 * Erstellt sie mit leeren Arrays wenn sie noch nicht da sind.
 * Wird beim Server-Start aufgerufen.
 */
async function initializeDataFiles() {
    // Prüfen ob der data/-Ordner existiert, wenn nicht erstellen
    try {
        await fs.promises.access(DATA_DIR);
    } catch (error) {
        // Ordner existiert nicht → erstellen
        await fs.promises.mkdir(DATA_DIR, { recursive: true });
        console.log('Data-Ordner erstellt: ' + DATA_DIR);
    }

    // Für jede Datei prüfen ob sie existiert
    const filesToCheck = [USERS_FILE, APPLICATIONS_FILE, PERIODS_FILE, QUIZ_RESULTS_FILE];

    for (let i = 0; i < filesToCheck.length; i++) {
        const filePath = filesToCheck[i];

        try {
            await fs.promises.access(filePath);
        } catch (error) {
            // Datei existiert nicht → mit leerem Array erstellen
            await fs.promises.writeFile(filePath, '[]', 'utf8');
            console.log('Datei erstellt: ' + filePath);
        }
    }

    console.log('Alle Datendateien bereit.');
}


/**
 * Liest eine JSON-Datei und gibt den Inhalt als JavaScript-Array zurück.
 * Benutzt async/await und fs.promises (NICHT readFileSync!).
 *
 * @param {string} filePath - Pfad zur JSON-Datei
 * @returns {Array} - Der Inhalt der Datei als Array
 */
async function readJsonFile(filePath) {
    try {
        // Datei als Text lesen (asynchron!)
        const fileContent = await fs.promises.readFile(filePath, 'utf8');

        // Text in ein JavaScript-Objekt umwandeln
        const parsedData = JSON.parse(fileContent);

        return parsedData;

    } catch (error) {
        // Wenn die Datei nicht existiert oder fehlerhaft ist, leeres Array zurückgeben
        console.log('Fehler beim Lesen von ' + filePath + ': ' + error.message);
        return [];
    }
}


/**
 * Schreibt ein JavaScript-Array als JSON in eine Datei.
 * Benutzt async/await und fs.promises (NICHT writeFileSync!).
 *
 * @param {string} filePath - Pfad zur JSON-Datei
 * @param {Array} data - Die Daten die gespeichert werden sollen
 */
async function writeJsonFile(filePath, data) {
    try {
        // Daten in einen formatierten JSON-String umwandeln
        // Das zweite Argument (null) und dritte (2) machen das JSON schön formatiert
        const jsonString = JSON.stringify(data, null, 2);

        // In die Datei schreiben (asynchron!)
        await fs.promises.writeFile(filePath, jsonString, 'utf8');

    } catch (error) {
        console.log('Fehler beim Schreiben in ' + filePath + ': ' + error.message);
        throw error;  // Fehler weitergeben damit der Aufrufer ihn behandeln kann
    }
}


// =============================================================
//  SPEZIFISCHE LESE- UND SCHREIB-FUNKTIONEN
// =============================================================

/**
 * Alle User lesen
 */
async function readUsers() {
    const users = await readJsonFile(USERS_FILE);
    return users;
}

/**
 * Alle User speichern (überschreibt die gesamte Datei)
 */
async function writeUsers(usersArray) {
    await writeJsonFile(USERS_FILE, usersArray);
}

/**
 * Alle Bewerbungen lesen
 */
async function readApplications() {
    const applications = await readJsonFile(APPLICATIONS_FILE);
    return applications;
}

/**
 * Alle Bewerbungen speichern
 */
async function writeApplications(applicationsArray) {
    await writeJsonFile(APPLICATIONS_FILE, applicationsArray);
}

/**
 * Alle Zeiträume lesen
 */
async function readPeriods() {
    const periods = await readJsonFile(PERIODS_FILE);
    return periods;
}

/**
 * Alle Zeiträume speichern
 */
async function writePeriods(periodsArray) {
    await writeJsonFile(PERIODS_FILE, periodsArray);
}

/**
 * Alle Quiz-Ergebnisse lesen
 */
async function readQuizResults() {
    const quizResults = await readJsonFile(QUIZ_RESULTS_FILE);
    return quizResults;
}

/**
 * Alle Quiz-Ergebnisse speichern
 */
async function writeQuizResults(quizResultsArray) {
    await writeJsonFile(QUIZ_RESULTS_FILE, quizResultsArray);
}


// --- Alle Funktionen exportieren ---
module.exports = {
    initializeDataFiles,
    readJsonFile,
    writeJsonFile,
    readUsers,
    writeUsers,
    readApplications,
    writeApplications,
    readPeriods,
    writePeriods,
    readQuizResults,
    writeQuizResults
};
