/**
 * =============================================================
 *  services/applicationService.js — Business-Logik für Bewerbungen
 * =============================================================
 *
 *  Diese Datei enthält die gesamte CRUD-Logik für Bewerbungen:
 *    C = Create (erstellen)
 *    R = Read (lesen)
 *    U = Update (aktualisieren)
 *    D = Delete (löschen)
 *
 *  Jede Funktion hier:
 *    1. Liest die aktuelle JSON-Datei
 *    2. Macht die gewünschte Änderung
 *    3. Speichert die geänderte Datei zurück
 *
 *  Wird von routes/applicationRoutes.js benutzt.
 * =============================================================
 */

const dataService = require('./dataService');
const Application = require('../models/Application');
const logger = require('../utils/logger');


/**
 * READ: Alle Bewerbungen eines bestimmten Users laden.
 * Filtert nach der userId, damit jeder User nur seine eigenen sieht.
 *
 * @param {string} userId - ID des eingeloggten Users
 * @returns {Array} - Liste aller Bewerbungen des Users
 */
async function getAllApplications(userId) {
    // Alle Bewerbungen aus der JSON-Datei lesen
    const allApplications = await dataService.readApplications();

    // Nur die Bewerbungen des aktuellen Users herausfiltern
    const userApplications = [];
    for (let i = 0; i < allApplications.length; i++) {
        if (allApplications[i].userId === userId) {
            userApplications.push(allApplications[i]);
        }
    }

    return userApplications;
}


/**
 * READ: Eine einzelne Bewerbung anhand ihrer ID laden.
 * Prüft auch ob die Bewerbung dem User gehört.
 *
 * @param {string} applicationId - ID der Bewerbung
 * @param {string} userId - ID des eingeloggten Users
 * @returns {object|null} - Die Bewerbung oder null wenn nicht gefunden
 */
async function getApplicationById(applicationId, userId) {
    const allApplications = await dataService.readApplications();

    // Bewerbung mit passender ID und userId suchen
    let foundApplication = null;
    for (let i = 0; i < allApplications.length; i++) {
        const currentApp = allApplications[i];
        if (currentApp.id === applicationId && currentApp.userId === userId) {
            foundApplication = currentApp;
            break;
        }
    }

    return foundApplication;
}


/**
 * CREATE: Eine neue Bewerbung erstellen und speichern.
 *
 * @param {object} applicationData - Die Daten der neuen Bewerbung
 * @param {string} userId - ID des eingeloggten Users
 * @returns {object} - Die erstellte Bewerbung
 */
async function createApplication(applicationData, userId) {
    // Alle bestehenden Bewerbungen lesen
    const allApplications = await dataService.readApplications();

    // Neue Bewerbung mit der Application-Klasse erstellen
    const newApplication = new Application({
        company: applicationData.company,
        roleType: applicationData.roleType,
        position: applicationData.position,
        location: applicationData.location,
        status: applicationData.status,
        deadline: applicationData.deadline,
        appliedDate: applicationData.appliedDate,
        salary: applicationData.salary,
        url: applicationData.url,
        notes: applicationData.notes,
        periodIds: applicationData.periodIds || [],
        userId: userId
    });

    // Zur Liste hinzufügen
    allApplications.push(newApplication.toJSON());

    // Gesamte Liste zurück in die Datei speichern
    await dataService.writeApplications(allApplications);

    // Event loggen (EventEmitter — Anforderung vom Professor!)
    logger.emit('applicationCreated', {
        company: newApplication.company,
        position: newApplication.position
    });

    return newApplication.toJSON();
}


/**
 * UPDATE: Eine bestehende Bewerbung aktualisieren.
 *
 * @param {string} applicationId - ID der zu ändernden Bewerbung
 * @param {object} updateData - Die neuen Daten
 * @param {string} userId - ID des eingeloggten Users
 * @returns {object|null} - Die aktualisierte Bewerbung oder null
 */
async function updateApplication(applicationId, updateData, userId) {
    const allApplications = await dataService.readApplications();

    // Die richtige Bewerbung finden
    let foundIndex = -1;
    for (let i = 0; i < allApplications.length; i++) {
        if (allApplications[i].id === applicationId && allApplications[i].userId === userId) {
            foundIndex = i;
            break;
        }
    }

    // Wenn die Bewerbung nicht gefunden wurde
    if (foundIndex === -1) {
        return null;
    }

    // Bestehende Daten mit neuen Daten zusammenführen
    const existingApplication = allApplications[foundIndex];

    // Jedes Feld einzeln aktualisieren (nur wenn im Update vorhanden)
    if (updateData.company !== undefined) {
        existingApplication.company = updateData.company;
    }
    if (updateData.roleType !== undefined) {
        existingApplication.roleType = updateData.roleType;
    }
    if (updateData.position !== undefined) {
        existingApplication.position = updateData.position;
    }
    if (updateData.location !== undefined) {
        existingApplication.location = updateData.location;
    }
    if (updateData.status !== undefined) {
        existingApplication.status = updateData.status;
    }
    if (updateData.deadline !== undefined) {
        existingApplication.deadline = updateData.deadline;
    }
    if (updateData.appliedDate !== undefined) {
        existingApplication.appliedDate = updateData.appliedDate;
    }
    if (updateData.salary !== undefined) {
        existingApplication.salary = updateData.salary;
    }
    if (updateData.url !== undefined) {
        existingApplication.url = updateData.url;
    }
    if (updateData.notes !== undefined) {
        existingApplication.notes = updateData.notes;
    }
    if (updateData.periodIds !== undefined) {
        existingApplication.periodIds = updateData.periodIds;
    }

    // Aktualisierte Bewerbung zurück in die Liste setzen
    allApplications[foundIndex] = existingApplication;

    // Gesamte Liste speichern
    await dataService.writeApplications(allApplications);

    // Event loggen
    logger.emit('applicationUpdated', { company: existingApplication.company });

    return existingApplication;
}


/**
 * DELETE: Eine Bewerbung löschen.
 *
 * @param {string} applicationId - ID der zu löschenden Bewerbung
 * @param {string} userId - ID des eingeloggten Users
 * @returns {object|null} - Die gelöschte Bewerbung oder null
 */
async function deleteApplication(applicationId, userId) {
    const allApplications = await dataService.readApplications();

    // Die Bewerbung finden
    let foundApplication = null;
    let foundIndex = -1;
    for (let i = 0; i < allApplications.length; i++) {
        if (allApplications[i].id === applicationId && allApplications[i].userId === userId) {
            foundApplication = allApplications[i];
            foundIndex = i;
            break;
        }
    }

    if (foundIndex === -1) {
        return null;
    }

    // Bewerbung aus der Liste entfernen
    allApplications.splice(foundIndex, 1);

    // Gesamte Liste speichern
    await dataService.writeApplications(allApplications);

    // Event loggen
    logger.emit('applicationDeleted', { company: foundApplication.company });

    return foundApplication;
}


// --- Alle Funktionen exportieren ---
module.exports = {
    getAllApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication
};
