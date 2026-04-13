/**
 * =============================================================
 *  middleware/authMiddleware.js — Prüft ob der User eingeloggt ist
 * =============================================================
 *
 *  Middleware ist Code der ZWISCHEN dem Empfangen einer Anfrage
 *  und dem Verarbeiten ausgeführt wird.
 *
 *  Diese Middleware prüft bei jeder API-Anfrage:
 *    "Ist dieser User eingeloggt?"
 *
 *  Wenn ja → Die Anfrage wird normal weiterverarbeitet.
 *  Wenn nein → Die Anfrage wird mit Fehler 401 (Unauthorized) abgelehnt.
 *
 *  Wird in routes/applicationRoutes.js, periodRoutes.js, statsRoutes.js
 *  eingesetzt, damit nur eingeloggte User auf ihre Daten zugreifen können.
 * =============================================================
 */


/**
 * requireLogin: Middleware-Funktion die prüft ob eine Session existiert.
 *
 * In Express hat jede Middleware-Funktion drei Parameter:
 *   - req: Die eingehende Anfrage (Request)
 *   - res: Die Antwort die wir zurückschicken (Response)
 *   - next: Eine Funktion die man aufruft um zum nächsten Schritt weiterzugehen
 *
 * Wenn der User eingeloggt ist, hat req.session.user einen Wert.
 * Das wird beim Login in authRoutes.js gesetzt.
 */
function requireLogin(req, res, next) {
    // Prüfen ob eine Session mit User-Daten existiert
    if (req.session && req.session.user) {
        // User ist eingeloggt → weiter zur eigentlichen Route
        next();
    } else {
        // User ist NICHT eingeloggt → Fehler zurückschicken
        res.status(401).json({
            success: false,
            message: 'Please log in first.'
        });
    }
}


// --- Middleware exportieren ---
module.exports = {
    requireLogin
};
