/**
 * =============================================================
 *  routes/quizRoutes.js — API-Routen für das Career Assessment Quiz
 * =============================================================
 *
 *  Endpunkte:
 *    GET  /api/quiz/results → Gespeichertes Ergebnis des Users laden
 *    POST /api/quiz/results → Ergebnis nach Abschluss des Quiz speichern
 *
 *  Wird in server.js eingebunden mit:
 *    app.use('/api/quiz', quizRoutes)
 * =============================================================
 */

const express = require('express');
const router = express.Router();

const quizService = require('../services/quizService');
const { requireLogin } = require('../middleware/authMiddleware');


// Alle Routen brauchen Login
router.use(requireLogin);


// =============================================================
//  GET /api/quiz/results — Gespeichertes Ergebnis laden
// =============================================================
router.get('/results', async function (req, res) {
    try {
        const userId = req.session.user.id;
        const result = await quizService.getResult(userId);

        res.status(200).json({
            success: true,
            quizResult: result  // null wenn noch kein Ergebnis gespeichert
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error loading quiz result: ' + error.message
        });
    }
});


// =============================================================
//  POST /api/quiz/results — Ergebnis speichern
// =============================================================
router.post('/results', async function (req, res) {
    try {
        const userId = req.session.user.id;
        const resultData = req.body;

        // Antworten müssen vorhanden sein
        if (!resultData.answers || !Array.isArray(resultData.answers)) {
            res.status(400).json({
                success: false,
                message: 'Answers are required.'
            });
            return;
        }

        const savedResult = await quizService.saveResult(userId, resultData);

        res.status(200).json({
            success: true,
            message: 'Quiz result saved!',
            quizResult: savedResult
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error saving quiz result: ' + error.message
        });
    }
});


// --- Router exportieren ---
module.exports = router;
