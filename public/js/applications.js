/**
 * =============================================================
 *  public/js/applications.js — Frontend-Logik für die Bewerbungstabelle
 * =============================================================
 *
 *  Diese Datei wird auf applications.html eingebunden.
 *  Sie macht:
 *    1. Alle Bewerbungen vom Server laden (GET /api/applications)
 *    2. Bewerbungen als Tabelle anzeigen
 *    3. Suche und Filter anwenden
 *    4. Sortierung nach Spalten
 *    5. Löschen per DELETE-Request
 *
 *  ROUNDTRIP: Jede Aktion (Laden, Löschen) geht über fetch()
 *  zum Server und zurück — keine Daten im Browser gespeichert!
 * =============================================================
 */

// --- Zustandsvariablen ---
// let statt const, weil sich die Werte ändern
let allApplications = [];      // Alle Bewerbungen vom Server
let currentSortKey = 'deadline'; // Nach welcher Spalte sortiert wird
let currentSortDirection = 1;    // 1 = aufsteigend, -1 = absteigend


// --- Status-Metadaten: Farben und CSS-Klassen für jeden Status ---
const STATUS_INFO = {
    'Wishlist':          { cssClass: 'badge-wishlist',   color: '#6366f1' },
    'Applied':           { cssClass: 'badge-applied',    color: '#3b82f6' },
    'Online Assessment': { cssClass: 'badge-oa',         color: '#f59e0b' },
    'Interview':         { cssClass: 'badge-interview',  color: '#f97316' },
    'Offer':             { cssClass: 'badge-offer',      color: '#10b981' },
    'Rejected':          { cssClass: 'badge-rejected',   color: '#ef4444' }
};


/**
 * Seite initialisieren: Login prüfen, Navigation aufbauen,
 * dann die Bewerbungen vom Server laden.
 */
async function initApplicationsPage() {
    const currentUser = await initPage('applications');

    if (!currentUser) {
        return;
    }

    // Bewerbungen laden
    await loadApplications();
}


/**
 * Lädt alle Bewerbungen vom Server und zeigt sie als Tabelle an.
 * Macht einen GET-Request an /api/applications.
 */
async function loadApplications() {
    try {
        const response = await fetch('/api/applications');
        const result = await response.json();

        if (result.success) {
            allApplications = result.applications;
            renderTable();
        } else {
            console.log('Fehler beim Laden:', result.message);
        }

    } catch (error) {
        console.log('Verbindungsfehler:', error);
    }
}


/**
 * Rendert die Tabelle basierend auf den aktuellen Filtern und der Sortierung.
 * Wird bei jeder Änderung aufgerufen (Filter, Suche, Sortierung).
 */
function renderTable() {
    // Zuerst filtern, dann sortieren
    const filteredList = getFilteredApplications();
    const sortedList = getSortedApplications(filteredList);

    // Tabellen-Body und Empty-State-Element holen
    const tableBody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');

    // Wenn keine Bewerbungen vorhanden sind
    if (sortedList.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // HTML für jede Tabellenzeile erstellen
    let tableHtml = '';

    for (let i = 0; i < sortedList.length; i++) {
        const app = sortedList[i];

        // Status-Badge erstellen
        const statusInfo = STATUS_INFO[app.status] || { cssClass: '', color: '#666' };
        const statusBadge = '<span class="badge ' + statusInfo.cssClass + '">' + escapeHtml(app.status) + '</span>';

        // Typ-Badge erstellen
        let typeBadge = '';
        if (app.roleType === 'Internship') {
            typeBadge = '<span class="badge badge-internship">Internship</span>';
        } else {
            typeBadge = '<span class="badge badge-working-student">Working Student</span>';
        }

        // Datum formatieren
        const deadlineFormatted = formatDate(app.deadline);
        const appliedFormatted = formatDate(app.appliedDate);

        // Deadline-Warnung
        let deadlineClass = '';
        if (app.deadline && (app.status === 'Wishlist' || app.status === 'Applied')) {
            const daysLeft = daysUntil(app.deadline);
            if (daysLeft !== null && daysLeft < 0) {
                deadlineClass = 'deadline-expired';
            } else if (daysLeft !== null && daysLeft <= 3) {
                deadlineClass = 'deadline-warn';
            }
        }

        // URL-Link
        let urlHtml = '';
        if (app.url) {
            urlHtml = '<a href="' + escapeHtml(app.url) + '" target="_blank" class="url-link">🔗</a>';
        }

        // Tabellenzeile zusammenbauen
        tableHtml = tableHtml
            + '<tr>'
            + '<td>' + escapeHtml(app.company) + ' ' + urlHtml + '</td>'
            + '<td>' + typeBadge + '</td>'
            + '<td>' + escapeHtml(app.position) + '</td>'
            + '<td>' + (escapeHtml(app.location) || '–') + '</td>'
            + '<td>' + statusBadge + '</td>'
            + '<td class="' + deadlineClass + '">' + deadlineFormatted + '</td>'
            + '<td>' + appliedFormatted + '</td>'
            + '<td>' + (escapeHtml(app.salary) || '–') + '</td>'
            + '<td class="notes-cell" title="' + escapeHtml(app.notes) + '">' + (escapeHtml(app.notes) || '–') + '</td>'
            + '<td>'
            +   '<div class="table-actions">'
            +     '<a href="/application-form.html?id=' + app.id + '" class="btn btn-ghost btn-sm btn-icon" title="Edit">✏️</a>'
            +     '<button class="btn btn-danger btn-sm btn-icon" onclick="deleteApplication(\'' + app.id + '\', \'' + escapeHtml(app.company) + '\')" title="Delete">🗑️</button>'
            +   '</div>'
            + '</td>'
            + '</tr>';
    }

    tableBody.innerHTML = tableHtml;
}


/**
 * Filtert die Bewerbungen basierend auf den aktuellen Filter-Einstellungen.
 * Prüft Suchtext, Status-Filter und Typ-Filter.
 */
function getFilteredApplications() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const typeFilter = document.getElementById('filterType').value;

    const filteredList = [];

    for (let i = 0; i < allApplications.length; i++) {
        const app = allApplications[i];

        // Status-Filter prüfen
        if (statusFilter && app.status !== statusFilter) {
            continue;  // Diese Bewerbung überspringen
        }

        // Typ-Filter prüfen
        if (typeFilter && app.roleType !== typeFilter) {
            continue;
        }

        // Suchtext prüfen (in Company, Position, Location, Notes)
        if (searchText) {
            const searchableText = (app.company + ' ' + app.position + ' ' + app.location + ' ' + app.notes).toLowerCase();
            if (!searchableText.includes(searchText)) {
                continue;
            }
        }

        // Alle Filter bestanden → zur Liste hinzufügen
        filteredList.push(app);
    }

    return filteredList;
}


/**
 * Sortiert eine Liste von Bewerbungen nach der aktuellen Sortier-Spalte.
 */
function getSortedApplications(listToSort) {
    // Kopie der Liste erstellen damit wir das Original nicht verändern
    const sortedList = [];
    for (let i = 0; i < listToSort.length; i++) {
        sortedList.push(listToSort[i]);
    }

    // Sortieren
    sortedList.sort(function (a, b) {
        let valueA = a[currentSortKey] || '';
        let valueB = b[currentSortKey] || '';

        // Leere Werte ans Ende sortieren
        if (!valueA && valueB) {
            return 1;
        }
        if (valueA && !valueB) {
            return -1;
        }

        // Vergleichen
        if (valueA < valueB) {
            return -1 * currentSortDirection;
        }
        if (valueA > valueB) {
            return 1 * currentSortDirection;
        }

        return 0;
    });

    return sortedList;
}


/**
 * Wird aufgerufen wenn auf eine Spaltenüberschrift geklickt wird.
 * Wechselt die Sortierrichtung wenn dieselbe Spalte nochmal geklickt wird.
 */
function sortByColumn(columnName) {
    if (currentSortKey === columnName) {
        // Gleiche Spalte → Richtung umkehren
        currentSortDirection = currentSortDirection * -1;
    } else {
        // Andere Spalte → aufsteigend
        currentSortKey = columnName;
        currentSortDirection = 1;
    }

    renderTable();
}


/**
 * Wird aufgerufen wenn ein Filter geändert wird.
 * Rendert die Tabelle mit den neuen Filtern.
 */
function applyFilters() {
    renderTable();
}


/**
 * Löscht eine Bewerbung nach Bestätigung.
 * Macht einen DELETE-Request an den Server.
 */
async function deleteApplication(applicationId, companyName) {
    // Bestätigung vom User einholen
    const confirmed = confirm('Do you really want to delete the application at "' + companyName + '"?');

    if (!confirmed) {
        return;
    }

    try {
        // DELETE-Request an den Server schicken
        const response = await fetch('/api/applications/' + applicationId, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showToast('Application deleted!');
            // Bewerbungen neu laden
            await loadApplications();
        } else {
            showToast('Error: ' + result.message);
        }

    } catch (error) {
        showToast('Connection error.');
    }
}


/**
 * Datum formatieren: "2026-04-15" → "15.04.2026"
 */
function formatDate(dateString) {
    if (!dateString) {
        return '–';
    }
    const parts = dateString.split('-');
    return parts[2] + '.' + parts[1] + '.' + parts[0];
}


/**
 * Berechnet Tage bis zu einem Datum.
 */
function daysUntil(dateString) {
    if (!dateString) {
        return null;
    }
    const target = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / 86400000);
    return diff;
}


// --- Seite initialisieren ---
initApplicationsPage();
