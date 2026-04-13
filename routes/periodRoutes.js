/**
 * =============================================================
 *  routes/periodRoutes.js — API-Routen für Zeiträume (Periods)
 * =============================================================
 *
 *  Ein Zeitraum ist z.B. "Summer Internship 2026" oder "WS 25/26".
 *  Bewerbungen können Zeiträumen zugeordnet werden.
 *
 *  Endpunkte:
 *    GET    /api/periods      → Alle Zeiträume laden
 *    POST   /api/periods      → Neuen Zeitraum erstellen
 *    PUT    /api/periods/:id  → Zeitraum aktualisieren
 *    DELETE /api/periods/:id  → Zeitraum löschen
 *
 *  Wird in server.js eingebunden mit:
 *    app.use('/api/periods', periodRoutes)
 * =============================================================
 */

const express = require('express');
const router = express.Router();

const dataService = require('../services/dataService');
const { Period } = require('../models/Period');
const { requireLogin } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');


// Alle Routen brauchen Login
router.use(requireLogin);


// =============================================================
//  GET /api/periods — Alle Zeiträume des Users laden
// =============================================================
router.get('/', async function (req, res) {
    try {
        const userId = req.session.user.id;

        // Alle Zeiträume aus der Datei lesen
        const allPeriods = await dataService.readPeriods();

        // Nur die Zeiträume des aktuellen Users filtern
        const userPeriods = [];
        for (let i = 0; i < allPeriods.length; i++) {
            if (allPeriods[i].userId === userId) {
                userPeriods.push(allPeriods[i]);
            }
        }

        res.status(200).json({
            success: true,
            periods: userPeriods
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error loading periods: ' + error.message
        });
    }
});


// =============================================================
//  POST /api/periods — Neuen Zeitraum erstellen
// =============================================================
router.post('/', async function (req, res) {
    try {
        const userId = req.session.user.id;
        const periodName = req.body.name;
        const periodColor = req.body.color || '#3b82f6';

        // Name prüfen
        if (!periodName || periodName.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Period name is required.'
            });
            return;
        }

        // Alle Zeiträume lesen
        const allPeriods = await dataService.readPeriods();

        // Prüfen ob der Name schon existiert (für diesen User)
        let nameExists = false;
        for (let i = 0; i < allPeriods.length; i++) {
            const existingPeriod = allPeriods[i];
            if (existingPeriod.userId === userId) {
                if (existingPeriod.name.toLowerCase() === periodName.trim().toLowerCase()) {
                    nameExists = true;
                    break;
                }
            }
        }

        if (nameExists) {
            res.status(400).json({
                success: false,
                message: 'A period with this name already exists.'
            });
            return;
        }

        // Neuen Zeitraum erstellen (mit der Period-Klasse)
        const newPeriod = new Period({
            name: periodName.trim(),
            color: periodColor,
            userId: userId
        });

        // Zur Liste hinzufügen und speichern
        allPeriods.push(newPeriod.toJSON());
        await dataService.writePeriods(allPeriods);

        // Event loggen
        logger.emit('periodCreated', { name: newPeriod.name });

        res.status(201).json({
            success: true,
            message: 'Period created successfully!',
            period: newPeriod.toJSON()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating period: ' + error.message
        });
    }
});


// =============================================================
//  PUT /api/periods/:id — Zeitraum aktualisieren
// =============================================================
router.put('/:id', async function (req, res) {
    try {
        const periodId = req.params.id;
        const userId = req.session.user.id;
        const newName = req.body.name;
        const newColor = req.body.color;

        // Alle Zeiträume lesen
        const allPeriods = await dataService.readPeriods();

        // Den richtigen Zeitraum finden
        let foundIndex = -1;
        for (let i = 0; i < allPeriods.length; i++) {
            if (allPeriods[i].id === periodId && allPeriods[i].userId === userId) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex === -1) {
            res.status(404).json({
                success: false,
                message: 'Period not found.'
            });
            return;
        }

        // Felder aktualisieren
        if (newName !== undefined) {
            allPeriods[foundIndex].name = newName.trim();
        }
        if (newColor !== undefined) {
            allPeriods[foundIndex].color = newColor;
        }

        // Speichern
        await dataService.writePeriods(allPeriods);

        res.status(200).json({
            success: true,
            message: 'Period updated successfully!',
            period: allPeriods[foundIndex]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating period: ' + error.message
        });
    }
});


// =============================================================
//  DELETE /api/periods/:id — Zeitraum löschen
// =============================================================
router.delete('/:id', async function (req, res) {
    try {
        const periodId = req.params.id;
        const userId = req.session.user.id;

        // Alle Zeiträume lesen
        const allPeriods = await dataService.readPeriods();

        // Den Zeitraum finden
        let foundPeriod = null;
        let foundIndex = -1;
        for (let i = 0; i < allPeriods.length; i++) {
            if (allPeriods[i].id === periodId && allPeriods[i].userId === userId) {
                foundPeriod = allPeriods[i];
                foundIndex = i;
                break;
            }
        }

        if (foundIndex === -1) {
            res.status(404).json({
                success: false,
                message: 'Period not found.'
            });
            return;
        }

        // Zeitraum aus der Liste entfernen
        allPeriods.splice(foundIndex, 1);
        await dataService.writePeriods(allPeriods);

        // Auch aus allen Bewerbungen die Zuordnung entfernen
        const allApplications = await dataService.readApplications();
        let applicationsChanged = false;

        for (let i = 0; i < allApplications.length; i++) {
            const currentApp = allApplications[i];
            if (currentApp.periodIds && currentApp.periodIds.includes(periodId)) {
                // Die Period-ID aus dem Array entfernen
                const newPeriodIds = [];
                for (let j = 0; j < currentApp.periodIds.length; j++) {
                    if (currentApp.periodIds[j] !== periodId) {
                        newPeriodIds.push(currentApp.periodIds[j]);
                    }
                }
                currentApp.periodIds = newPeriodIds;
                applicationsChanged = true;
            }
        }

        // Wenn sich Bewerbungen geändert haben, diese auch speichern
        if (applicationsChanged) {
            await dataService.writeApplications(allApplications);
        }

        // Event loggen
        logger.emit('periodDeleted', { name: foundPeriod.name });

        res.status(200).json({
            success: true,
            message: 'Period deleted successfully!',
            period: foundPeriod
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting period: ' + error.message
        });
    }
});


// --- Router exportieren ---
module.exports = router;
