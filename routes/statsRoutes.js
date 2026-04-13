/**
 * =============================================================
 *  routes/statsRoutes.js — API-Route für Statistiken
 * =============================================================
 *
 *  Stellt einen einzigen Endpunkt bereit:
 *    GET /api/stats → Berechnet und liefert alle Statistiken
 *
 *  Die Berechnung passiert in services/statsService.js.
 *
 *  Wird in server.js eingebunden mit:
 *    app.use('/api/stats', statsRoutes)
 * =============================================================
 */

const express = require('express');
const router = express.Router();

const statsService = require('../services/statsService');
const { requireLogin } = require('../middleware/authMiddleware');


// Login erforderlich
router.use(requireLogin);


// =============================================================
//  GET /api/stats — Alle Statistiken berechnen und liefern
// =============================================================
router.get('/', async function (req, res) {
    try {
        const userId = req.session.user.id;

        // Statistiken berechnen lassen
        const statistics = await statsService.calculateStats(userId);

        res.status(200).json({
            success: true,
            stats: statistics
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error calculating statistics: ' + error.message
        });
    }
});


// --- Router exportieren ---
module.exports = router;
