/**
 * =============================================================
 *  public/js/login.js — Frontend-Logik für Login und Registrierung
 * =============================================================
 *
 *  Diese Datei wird nur auf login.html eingebunden.
 *  Sie macht:
 *    1. Tab-Wechsel zwischen Login und Register
 *    2. Login-Formular absenden per fetch() an /api/auth/login
 *    3. Register-Formular absenden per fetch() an /api/auth/register
 *    4. Fehler anzeigen wenn etwas schiefgeht
 *    5. Nach erfolgreichem Login zur Startseite weiterleiten
 *
 *  ROUNDTRIP: Frontend (fetch) → Backend (verarbeitet) → Frontend (Antwort)
 *  Das ist eine der Anforderungen vom Professor!
 * =============================================================
 */


/**
 * Beim Laden der Seite prüfen: Ist der User vielleicht schon eingeloggt?
 * Wenn ja, direkt zur Startseite weiterleiten.
 */
window.addEventListener('load', async function () {
    try {
        const response = await fetch('/api/auth/me');
        const result = await response.json();

        if (result.success) {
            // User ist schon eingeloggt → zur Startseite
            window.location.href = '/index.html';
        }
    } catch (error) {
        // Nicht eingeloggt → auf der Login-Seite bleiben (das ist normal)
    }
});


/**
 * showTab: Wechselt zwischen Login- und Register-Formular.
 *
 * @param {string} tabName - "login" oder "register"
 */
function showTab(tabName) {
    // Formulare ein-/ausblenden
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (tabName === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }

    // Tab-Buttons aktiv/inaktiv setzen
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');

    if (tabName === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
    } else {
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
    }

    // Fehlermeldungen verstecken beim Tab-Wechsel
    hideError('loginError');
    hideError('registerError');
}


/**
 * showError: Zeigt eine Fehlermeldung in dem angegebenen Element an.
 *
 * @param {string} elementId - ID des Fehler-Elements
 * @param {string} message - Die Fehlermeldung
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}


/**
 * hideError: Versteckt eine Fehlermeldung.
 */
function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.style.display = 'none';
}


/**
 * handleLogin: Wird aufgerufen wenn das Login-Formular abgeschickt wird.
 * Schickt Username und Passwort per fetch() an den Server.
 *
 * DAS IST DER ROUNDTRIP:
 *   1. Frontend sammelt Daten vom Formular
 *   2. fetch() schickt sie als POST an /api/auth/login
 *   3. Backend prüft die Daten (authRoutes.js → authService.js)
 *   4. Backend schickt Antwort zurück (Erfolg oder Fehler)
 *   5. Frontend reagiert auf die Antwort
 */
async function handleLogin(event) {
    // Verhindert dass die Seite neu geladen wird (Standard-Verhalten von Formularen)
    event.preventDefault();

    // Fehlermeldung verstecken
    hideError('loginError');

    // Button deaktivieren während die Anfrage läuft
    const loginButton = document.getElementById('loginButton');
    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';

    // Werte aus den Formularfeldern lesen
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // --- DER FETCH-CALL (Roundtrip zum Server!) ---
        const response = await fetch('/api/auth/login', {
            method: 'POST',                              // HTTP-Methode: POST
            headers: {
                'Content-Type': 'application/json'       // Wir schicken JSON
            },
            body: JSON.stringify({                        // Daten als JSON-String
                username: username,
                password: password
            })
        });

        // Antwort vom Server als JSON auslesen
        const result = await response.json();

        if (result.success) {
            // Login erfolgreich! → Zur Startseite weiterleiten
            window.location.href = '/index.html';
        } else {
            // Login fehlgeschlagen → Fehlermeldung anzeigen
            showError('loginError', result.message);
        }

    } catch (error) {
        showError('loginError', 'Connection error. Please try again.');
    }

    // Button wieder aktivieren
    loginButton.disabled = false;
    loginButton.textContent = 'Login';
}


/**
 * handleRegister: Wird aufgerufen wenn das Register-Formular abgeschickt wird.
 * Funktioniert ähnlich wie handleLogin.
 */
async function handleRegister(event) {
    event.preventDefault();
    hideError('registerError');

    const registerButton = document.getElementById('registerButton');
    registerButton.disabled = true;
    registerButton.textContent = 'Creating account...';

    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    // --- Frontend-Validierung ---
    // Prüfen ob die Passwörter übereinstimmen (bevor wir den Server fragen)
    if (password !== passwordConfirm) {
        showError('registerError', 'Passwords do not match.');
        registerButton.disabled = false;
        registerButton.textContent = 'Create Account';
        return;
    }

    if (password.length < 4) {
        showError('registerError', 'Password must be at least 4 characters long.');
        registerButton.disabled = false;
        registerButton.textContent = 'Create Account';
        return;
    }

    try {
        // --- FETCH-CALL zum Server ---
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            // Registrierung erfolgreich! → Zur Startseite
            window.location.href = '/index.html';
        } else {
            showError('registerError', result.message);
        }

    } catch (error) {
        showError('registerError', 'Connection error. Please try again.');
    }

    registerButton.disabled = false;
    registerButton.textContent = 'Create Account';
}
