/**
 * =============================================================
 *  routes/quizRoutes.js — API-Routen für das Career Assessment Quiz
 * =============================================================
 *
 *  Endpunkte:
 *    GET  /api/quiz/questions   → Liefert alle 20 Fragen
 *    GET  /api/quiz/careers     → Liefert alle 50 Karrieren
 *    POST /api/quiz/results     → Speichert Quiz-Ergebnis
 *    GET  /api/quiz/results     → Lädt letztes Quiz-Ergebnis
 *
 *  Alle Routen erfordern Login (authMiddleware).
 * =============================================================
 */

const express = require('express');
const router = express.Router();
const quizService = require('../services/quizService');
const { requireLogin } = require('../middleware/authMiddleware');

/**
 * GET /api/quiz/questions
 * Gibt alle 20 Quiz-Fragen zurück.
 * Öffentlich (keine Login-Prüfung nötig, um die Seite zu laden)
 */
router.get('/questions', function(req, res) {
    const questions = quizService.getQuestions();
    return res.json({
        success: true,
        questions: questions
    });
});

/**
 * GET /api/quiz/careers
 * Gibt alle 50 Karriere-Beschreibungen zurück.
 * Sowie die Profile-Typen.
 */
router.get('/careers', function(req, res) {
    const careers = quizService.getCareers();
    const profiles = quizService.getProfiles();
    
    return res.json({
        success: true,
        careers: careers,
        profiles: profiles
    });
});

/**
 * POST /api/quiz/results
 * Speichert das Quiz-Ergebnis des eingeloggten Users.
 * 
 * Body:
 * {
 *   "scores": { "Career1": 10, "Career2": 8, ... },
 *   "topCareers": ["Career1", "Career2", "Career3"],
 *   "profile": { emoji: "🧠", type: "The Strategist", ... }
 * }
 */
router.post('/results', requireLogin, async function(req, res) {
    const userId = req.session.userId;
    const resultData = req.body;
    
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Not logged in' });
    }
    
    if (!resultData || !resultData.scores) {
        return res.status(400).json({ success: false, message: 'Missing scores data' });
    }
    
    try {
        const savedResult = await quizService.saveResult(userId, resultData);
        
        if (savedResult) {
            return res.json({
                success: true,
                message: 'Quiz result saved',
                result: savedResult
            });
        } else {
            return res.status(500).json({ success: false, message: 'Error saving result' });
        }
    } catch (error) {
        console.log('Fehler beim Speichern des Quiz-Ergebnisses:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/quiz/results
 * Lädt das letzte Quiz-Ergebnis des eingeloggten Users.
 */
router.get('/results', requireLogin, async function(req, res) {
    const userId = req.session.userId;
    
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Not logged in' });
    }
    
    try {
        const result = await quizService.getResult(userId);
        
        return res.json({
            success: true,
            result: result
        });
    } catch (error) {
        console.log('Fehler beim Laden des Quiz-Ergebnisses:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
