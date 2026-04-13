/**
 * =============================================================
 *  routes/applicationRoutes.js — API-Routen für Bewerbungen
 * =============================================================
 *
 *  Diese Datei definiert alle CRUD-Endpunkte für Bewerbungen:
 *    GET    /api/applications      → Alle Bewerbungen laden
 *    GET    /api/applications/:id  → Eine bestimmte Bewerbung laden
 *    POST   /api/applications      → Neue Bewerbung erstellen
 *    PUT    /api/applications/:id  → Bewerbung aktualisieren
 *    DELETE /api/applications/:id  → Bewerbung löschen
 *
 *  Alle Routen sind durch die authMiddleware geschützt — 
 *  nur eingeloggte User können auf ihre Bewerbungen zugreifen.
 *
 *  Die eigentliche Logik steckt in services/applicationService.js.
 *
 *  Wird in server.js eingebunden mit:
 *    app.use('/api/applications', applicationRoutes)
 * =============================================================
 */

const express = require('express');
const router = express.Router();

// --- Eigene Module laden ---
const applicationService = require('../services/applicationService');
const { requireLogin } = require('../middleware/authMiddleware');


/**
 * WICHTIG: router.use(requireLogin) bedeutet dass ALLE Routen
 * in dieser Datei die Login-Prüfung durchlaufen müssen.
 * Wenn der User nicht eingeloggt ist, bekommt er einen 401-Fehler.
 */
router.use(requireLogin);


// =============================================================
//  GET /api/applications — Alle Bewerbungen des Users laden
// =============================================================
router.get('/', async function (req, res) {
    try {
        // User-ID aus der Session holen
        const userId = req.session.user.id;

        // Alle Bewerbungen dieses Users laden
        const listOfApplications = await applicationService.getAllApplications(userId);

        // Erfolgs-Antwort mit der Liste senden
        res.status(200).json({
            success: true,
            applications: listOfApplications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error loading applications: ' + error.message
        });
    }
});


// =============================================================
//  GET /api/applications/:id — Eine bestimmte Bewerbung laden
// =============================================================

/**
 * :id ist ein URL-Parameter. Wenn jemand z.B.
 * GET /api/applications/abc123 aufruft, dann ist req.params.id = "abc123"
 */
router.get('/:id', async function (req, res) {
    try {
        const applicationId = req.params.id;
        const userId = req.session.user.id;

        // Bewerbung anhand der ID suchen
        const foundApplication = await applicationService.getApplicationById(applicationId, userId);

        // Prüfen ob die Bewerbung gefunden wurde
        if (!foundApplication) {
            res.status(404).json({
                success: false,
                message: 'Application not found.'
            });
            return;
        }

        res.status(200).json({
            success: true,
            application: foundApplication
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error loading application: ' + error.message
        });
    }
});


// =============================================================
//  POST /api/applications — Neue Bewerbung erstellen
// =============================================================
router.post('/', async function (req, res) {
    try {
        const userId = req.session.user.id;
        const applicationData = req.body;

        // Pflichtfeld prüfen
        if (!applicationData.company) {
            res.status(400).json({
                success: false,
                message: 'Company name is required.'
            });
            return;
        }

        // Neue Bewerbung erstellen
        const newApplication = await applicationService.createApplication(applicationData, userId);

        // 201 = "Created" — Standard-Statuscode für erfolgreiche Erstellung
        res.status(201).json({
            success: true,
            message: 'Application created successfully!',
            application: newApplication
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating application: ' + error.message
        });
    }
});


// =============================================================
//  PUT /api/applications/:id — Bewerbung aktualisieren
// =============================================================
router.put('/:id', async function (req, res) {
    try {
        const applicationId = req.params.id;
        const userId = req.session.user.id;
        const updateData = req.body;

        // Bewerbung aktualisieren
        const updatedApplication = await applicationService.updateApplication(applicationId, updateData, userId);

        // Prüfen ob die Bewerbung gefunden wurde
        if (!updatedApplication) {
            res.status(404).json({
                success: false,
                message: 'Application not found.'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Application updated successfully!',
            application: updatedApplication
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating application: ' + error.message
        });
    }
});


// =============================================================
//  DELETE /api/applications/:id — Bewerbung löschen
// =============================================================
router.delete('/:id', async function (req, res) {
    try {
        const applicationId = req.params.id;
        const userId = req.session.user.id;

        // Bewerbung löschen
        const deletedApplication = await applicationService.deleteApplication(applicationId, userId);

        // Prüfen ob die Bewerbung gefunden wurde
        if (!deletedApplication) {
            res.status(404).json({
                success: false,
                message: 'Application not found.'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Application deleted successfully!',
            application: deletedApplication
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting application: ' + error.message
        });
    }
});


// --- Router exportieren ---
module.exports = router;
