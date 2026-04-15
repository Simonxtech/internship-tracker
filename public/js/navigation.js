/**
 * =============================================================
 *  public/js/navigation.js — Gemeinsame Navigation für alle Seiten
 * =============================================================
 *
 *  Diese Datei wird auf JEDER Seite eingebunden.
 *  Sie macht folgendes:
 *    1. Prüft ob der User eingeloggt ist (GET /api/auth/me)
 *    2. Wenn nicht eingeloggt → Weiterleitung zu login.html
 *    3. Baut die Navigation oben auf der Seite auf
 *    4. Markiert den aktiven Navigations-Link
 *    5. Stellt die Logout-Funktion bereit
 *
 *  Wird per <script src="/js/navigation.js"></script> eingebunden.
 * =============================================================
 */


/**
 * checkLogin: Prüft ob der User eingeloggt ist.
 * Wird beim Laden jeder Seite aufgerufen.
 * Gibt die User-Daten zurück wenn eingeloggt, sonst leitet es zu login.html weiter.
 */
async function checkLogin() {
    try {
        // fetch() macht eine HTTP-Anfrage an unseren Server
        // GET /api/auth/me prüft ob eine gültige Session existiert
        const response = await fetch('/api/auth/me');
        const result = await response.json();

        if (result.success) {
            // User ist eingeloggt — User-Daten zurückgeben
            return result.user;
        } else {
            // User ist NICHT eingeloggt — zur Login-Seite weiterleiten
            window.location.href = '/login.html';
            return null;
        }

    } catch (error) {
        console.log('Fehler beim Prüfen des Login-Status:', error);
        window.location.href = '/login.html';
        return null;
    }
}


/**
 * buildNavigation: Erstellt die Navigationsleiste und fügt sie
 * in das Element mit id="navbar" ein.
 *
 * @param {object} user - Der eingeloggte User
 * @param {string} activePage - Welche Seite gerade aktiv ist (z.B. "home")
 */
function buildNavigation(user, activePage) {
    // Das HTML-Element finden wo die Navigation reinkommen soll
    const navbarElement = document.getElementById('navbar');

    if (!navbarElement) {
        console.log('Warnung: Kein Element mit id="navbar" gefunden.');
        return;
    }

    // Den ersten Buchstaben des Usernamens für den Avatar
    const avatarLetter = user.username.charAt(0).toUpperCase();

    // Alle Navigations-Links definieren
    // Jeder Eintrag hat: id (zum Markieren), href (Link), label (Anzeigename), icon (Emoji)
    const navigationLinks = [
        { id: 'home',          href: '/index.html',            label: 'Home'         },
        { id: 'applications',  href: '/applications.html',     label: 'Applications' },
        { id: 'add',           href: '/application-form.html', label: 'Add New'      },
        { id: 'analytics',     href: '/analytics.html',        label: 'Analytics'    },
        { id: 'map',           href: '/map.html',              label: 'Map'          },
        { id: 'page7',         href: '/page7.html',            label: 'Assessment'   }
    ];

    // Links als HTML-Strings bauen
    let linksHtml = '';
    for (let i = 0; i < navigationLinks.length; i++) {
        const link = navigationLinks[i];
        const isActive = (link.id === activePage);
        const activeClass = isActive ? ' active' : '';

        linksHtml = linksHtml + '<a href="' + link.href + '" class="navbar-link' + activeClass + '">';
        linksHtml = linksHtml + link.label;
        linksHtml = linksHtml + '</a>';
    }

    // Gesamte Navigation zusammenbauen
    const navigationHtml = ''
        + '<div class="navbar-inner">'
        +   '<a href="/index.html" class="navbar-brand">'
        +     '<img src="/img/logo.png" alt="Intern Buddy" style="height:32px;">'
        +     '<span class="navbar-title">Intern Buddy</span>'
        +   '</a>'
        +   '<div class="navbar-links" id="navLinks">'
        +     linksHtml
        +   '</div>'
        +   '<div class="navbar-right">'
        +     '<div class="user-chip">'
        +       '<div class="user-avatar">' + avatarLetter + '</div>'
        +       '<span>' + escapeHtml(user.username) + '</span>'
        +     '</div>'
        +     '<button class="btn btn-ghost" onclick="doLogout()" style="font-size:13px; color:var(--text-muted); padding:6px 12px;">'
        +       'Log out'
        +     '</button>'
        +   '</div>'
        + '</div>';

    navbarElement.innerHTML = navigationHtml;
}


/**
 * doLogout: Loggt den User aus und leitet zur Login-Seite weiter.
 * Macht einen POST-Request an /api/auth/logout.
 */
async function doLogout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST'
        });
    } catch (error) {
        console.log('Fehler beim Logout:', error);
    }

    // Zur Login-Seite weiterleiten
    window.location.href = '/login.html';
}


/**
 * escapeHtml: Schützt vor XSS-Angriffen indem HTML-Sonderzeichen
 * durch sichere Varianten ersetzt werden.
 * Beispiel: "<script>" wird zu "&lt;script&gt;"
 */
function escapeHtml(text) {
    if (!text) {
        return '';
    }

    let safe = String(text);
    safe = safe.replace(/&/g, '&amp;');
    safe = safe.replace(/</g, '&lt;');
    safe = safe.replace(/>/g, '&gt;');
    safe = safe.replace(/"/g, '&quot;');

    return safe;
}


/**
 * showToast: Zeigt eine kurze Benachrichtigung unten rechts an.
 * Verschwindet automatisch nach 2.5 Sekunden.
 *
 * @param {string} message - Der Text der angezeigt werden soll
 */
var toastTimerId = null;

function showToast(message) {
    // Toast-Element finden oder erstellen
    let toastElement = document.getElementById('toast');

    if (!toastElement) {
        // Toast-Element existiert noch nicht → erstellen
        toastElement = document.createElement('div');
        toastElement.id = 'toast';
        toastElement.className = 'toast';
        document.body.appendChild(toastElement);
    }

    // Text setzen und anzeigen
    toastElement.textContent = message;
    toastElement.classList.add('show');

    // Vorherigen Timer löschen falls noch aktiv
    if (toastTimerId) {
        clearTimeout(toastTimerId);
    }

    // Nach 2.5 Sekunden automatisch ausblenden
    toastTimerId = setTimeout(function () {
        toastElement.classList.remove('show');
    }, 2500);
}


/**
 * initPage: Haupt-Initialisierungsfunktion die auf jeder Seite
 * aufgerufen werden soll. Prüft Login und baut Navigation auf.
 *
 * @param {string} activePage - ID der aktuellen Seite (z.B. "home")
 * @returns {object|null} - Die User-Daten wenn eingeloggt
 */
async function initPage(activePage) {
    // Login prüfen
    const user = await checkLogin();

    if (!user) {
        return null;
    }

    // Navigation aufbauen
    buildNavigation(user, activePage);

    return user;
}
