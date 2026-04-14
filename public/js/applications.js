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
let allPeriods = [];           // Alle Zeiträume/Tags des Users
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

    // URL-Parameter prüfen: Kommt der User von einer Stat-Card?
    // Wenn z.B. ?status=Interview in der URL steht, Filter vorsetzen
    const urlParams = new URLSearchParams(window.location.search);
    const statusFromUrl = urlParams.get('status');
    if (statusFromUrl) {
        const filterDropdown = document.getElementById('filterStatus');
        if (filterDropdown) {
            filterDropdown.value = statusFromUrl;
        }
    }

    // Zeiträume/Tags laden (brauchen wir um die Badges zu zeigen)
    await loadPeriods();

    // Bewerbungen laden
    await loadApplications();
}


/**
 * Lädt alle Zeiträume des Users vom Server.
 * Werden für die Tag-Badges in der Tabelle benötigt.
 */
async function loadPeriods() {
    try {
        const response = await fetch('/api/periods');
        const result = await response.json();

        if (result.success) {
            allPeriods = result.periods;
        }
    } catch (error) {
        console.log('Fehler beim Laden der Zeiträume:', error);
    }
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
            // Location-Dropdown mit allen einzigartigen Standorten befüllen
            populateLocationFilter();
            // Tag-Dropdown mit allen Periods befüllen
            populateTagFilter();
            // Dringende Deadlines prüfen und Banner zeigen
            renderUrgentBanner(allApplications);
            renderTable();
        } else {
            console.log('Fehler beim Laden:', result.message);
        }

    } catch (error) {
        console.log('Verbindungsfehler:', error);
    }
}


/**
 * Befüllt das Location-Dropdown mit allen einzigartigen Standorten,
 * alphabetisch sortiert.
 */
function populateLocationFilter() {
    const dropdown = document.getElementById('filterLocation');
    if (!dropdown) {
        return;
    }

    // Alle einzigartigen Locations sammeln
    const locationSet = {};
    for (let i = 0; i < allApplications.length; i++) {
        const loc = allApplications[i].location;
        if (loc && loc.trim() !== '') {
            locationSet[loc] = true;
        }
    }

    // In ein Array umwandeln und alphabetisch sortieren
    const locationList = Object.keys(locationSet);
    locationList.sort();

    // Vorherigen Wert merken damit er nach dem Neuaufbau wieder gesetzt wird
    const previousValue = dropdown.value;

    // Dropdown neu aufbauen
    dropdown.innerHTML = '<option value="">All Locations</option>';
    for (let i = 0; i < locationList.length; i++) {
        const option = document.createElement('option');
        option.value = locationList[i];
        option.textContent = locationList[i];
        dropdown.appendChild(option);
    }

    // Vorherigen Wert wiederherstellen
    dropdown.value = previousValue;
}


/**
 * Befüllt das Tag-Dropdown mit allen Periods des Users.
 */
function populateTagFilter() {
    const dropdown = document.getElementById('filterTag');
    if (!dropdown) {
        return;
    }

    const previousValue = dropdown.value;

    dropdown.innerHTML = '<option value="">All Tags</option>';
    for (let i = 0; i < allPeriods.length; i++) {
        const period = allPeriods[i];
        const option = document.createElement('option');
        option.value = period.id;
        option.textContent = period.name;
        dropdown.appendChild(option);
    }

    dropdown.value = previousValue;
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
            urlHtml = '<a href="' + escapeHtml(app.url) + '" target="_blank" class="url-link" style="font-size:11px; color:var(--accent);">Link</a>';
        }

        // Tabellenzeile zusammenbauen
        tableHtml = tableHtml
            + '<tr>'
            + '<td>' + escapeHtml(app.company) + ' ' + urlHtml + '</td>'
            + '<td>' + typeBadge + '</td>'
            + '<td>' + escapeHtml(app.position) + '</td>'
            + '<td>' + formatLocation(app.location, app.country) + '</td>'
            + '<td>' + statusBadge + '</td>'
            + '<td>' + buildTagBadges(app.periodIds) + '</td>'
            + '<td class="' + deadlineClass + '">' + deadlineFormatted + '</td>'
            + '<td>' + appliedFormatted + '</td>'
            + '<td>' + formatSalary(app.salary) + '</td>'
            + '<td class="notes-cell" title="' + escapeHtml(app.notes) + '">' + (escapeHtml(app.notes) || '–') + '</td>'
            + '<td>'
            +   '<div class="table-actions">'
            +     '<a href="/application-form.html?id=' + app.id + '" class="btn btn-ghost btn-sm" title="Edit">Edit</a>'
            +     '<button class="btn btn-danger btn-sm" onclick="deleteApplication(\'' + app.id + '\', \'' + escapeHtml(app.company) + '\')" title="Delete">Delete</button>'
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

    // Neue Filter auslesen
    const locationFilter = document.getElementById('filterLocation') ? document.getElementById('filterLocation').value : '';
    const tagFilter = document.getElementById('filterTag') ? document.getElementById('filterTag').value : '';
    const salaryMinRaw = document.getElementById('filterSalaryMin') ? document.getElementById('filterSalaryMin').value : '';
    const salaryMaxRaw = document.getElementById('filterSalaryMax') ? document.getElementById('filterSalaryMax').value : '';
    const salaryMin = salaryMinRaw !== '' ? Number(salaryMinRaw) : null;
    const salaryMax = salaryMaxRaw !== '' ? Number(salaryMaxRaw) : null;

    const filteredList = [];

    for (let i = 0; i < allApplications.length; i++) {
        const app = allApplications[i];

        // Status-Filter prüfen
        if (statusFilter && app.status !== statusFilter) {
            continue;
        }

        // Typ-Filter prüfen
        if (typeFilter && app.roleType !== typeFilter) {
            continue;
        }

        // Location-Filter prüfen
        if (locationFilter && app.location !== locationFilter) {
            continue;
        }

        // Tag-Filter prüfen: Bewerbung muss den ausgewählten Tag haben
        if (tagFilter) {
            const hasPeriod = app.periodIds && app.periodIds.includes(tagFilter);
            if (!hasPeriod) {
                continue;
            }
        }

        // Salary-Filter prüfen
        if (salaryMin !== null && (app.salary || 0) < salaryMin) {
            continue;
        }
        if (salaryMax !== null && (app.salary || 0) > salaryMax) {
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


/**
 * Prüft ob es dringende Deadlines gibt und zeigt ein farbiges Banner.
 * Gelb: 1-3 Tage verbleibend
 * Rot: Abgelaufen oder heute fällig
 *
 * @param {Array} applications - Liste aller Bewerbungen
 */
function renderUrgentBanner(applications) {
    var banner = document.getElementById('urgentBanner');
    var content = document.getElementById('urgentBannerContent');

    if (!banner || !content) {
        return;
    }

    var urgentItems = [];
    var hasOverdue = false;
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    for (var i = 0; i < applications.length; i++) {
        var app = applications[i];

        // Nur Wishlist und Applied prüfen
        if (!app.deadline) {
            continue;
        }
        if (app.status !== 'Wishlist' && app.status !== 'Applied') {
            continue;
        }

        var deadlineDate = new Date(app.deadline);
        var diffDays = Math.ceil((deadlineDate - today) / 86400000);

        if (diffDays < 0) {
            urgentItems.push(app.company + ' — ' + app.position + ': Overdue by ' + Math.abs(diffDays) + ' day' + (Math.abs(diffDays) === 1 ? '' : 's'));
            hasOverdue = true;
        } else if (diffDays === 0) {
            urgentItems.push(app.company + ' — ' + app.position + ': Due today');
            hasOverdue = true;
        } else if (diffDays <= 3) {
            urgentItems.push(app.company + ' — ' + app.position + ': Due in ' + diffDays + ' day' + (diffDays === 1 ? '' : 's'));
        }
    }

    if (urgentItems.length === 0) {
        banner.style.display = 'none';
        return;
    }

    banner.style.display = 'block';

    if (hasOverdue) {
        banner.style.background = '#fef2f2';
        banner.style.border = '1px solid #fecaca';
    } else {
        banner.style.background = '#fffbeb';
        banner.style.border = '1px solid #fde68a';
    }

    var html = '<strong>Urgent Deadlines</strong><br>';
    for (var j = 0; j < urgentItems.length; j++) {
        html = html + urgentItems[j] + '<br>';
    }
    content.innerHTML = html;
}


/**
 * Baut die farbigen Tag-Badges für eine Bewerbung.
 * Gibt HTML-String zurück oder "–" wenn keine Tags zugeordnet.
 *
 * @param {Array} periodIds - Liste der zugeordneten Period-IDs
 * @returns {string} - HTML mit farbigen Badge-Spans
 */
function buildTagBadges(periodIds) {
    if (!periodIds || periodIds.length === 0) {
        return '–';
    }

    let badgesHtml = '';

    for (let i = 0; i < periodIds.length; i++) {
        const periodId = periodIds[i];

        // Period-Objekt anhand der ID suchen
        let foundPeriod = null;
        for (let j = 0; j < allPeriods.length; j++) {
            if (allPeriods[j].id === periodId) {
                foundPeriod = allPeriods[j];
                break;
            }
        }

        // Period gefunden → Badge erstellen
        if (foundPeriod) {
            badgesHtml = badgesHtml
                + '<span style="background:' + foundPeriod.color + '; color:white; padding:2px 8px; border-radius:12px; font-size:11px; display:inline-block; margin:1px 2px 1px 0; white-space:nowrap;">'
                + escapeHtml(foundPeriod.name)
                + '</span>';
        }
    }

    if (!badgesHtml) {
        return '–';
    }

    return badgesHtml;
}


/**
 * Zeigt "City, Country" oder nur eines davon, oder "–" wenn beides leer.
 */
function formatLocation(city, country) {
    const cityStr = city ? escapeHtml(city) : '';
    const countryStr = country ? escapeHtml(country) : '';
    if (cityStr && countryStr) {
        return cityStr + ', ' + countryStr;
    }
    if (cityStr) {
        return cityStr;
    }
    if (countryStr) {
        return countryStr;
    }
    return '–';
}


/**
 * Formatiert einen Salary-Betrag als "€1,200/mo".
 * Wenn kein Wert vorhanden: "–"
 */
function formatSalary(amount) {
    if (!amount || amount === 0) {
        return '–';
    }
    return '€' + Number(amount).toLocaleString('en-US') + '/mo';
}


// =============================================================
//  Manage Tags Modal
// =============================================================

/**
 * Öffnet das Modal und zeigt die aktuellen Tags.
 */
function openTagsModal() {
    var overlay = document.getElementById('tagsModalOverlay');
    overlay.style.display = 'flex';
    renderTagsModalList();
    document.getElementById('newTagName').value = '';
    document.getElementById('tagsModalError').style.display = 'none';
}


/**
 * Schließt das Modal.
 */
function closeTagsModal() {
    document.getElementById('tagsModalOverlay').style.display = 'none';
}


/**
 * Baut die Liste der bestehenden Tags im Modal.
 */
function renderTagsModalList() {
    var container = document.getElementById('tagsModalList');

    if (allPeriods.length === 0) {
        container.innerHTML = '<p style="font-size:13px; color:var(--text-light); margin:0;">No tags yet. Create your first tag below.</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < allPeriods.length; i++) {
        var period = allPeriods[i];
        html = html
            + '<div style="display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid var(--border);">'
            +   '<span style="width:14px; height:14px; border-radius:50%; background:' + period.color + '; display:inline-block; flex-shrink:0;"></span>'
            +   '<span style="flex:1; font-size:13px;">' + escapeHtml(period.name) + '</span>'
            +   '<button class="btn btn-danger btn-sm" onclick="deleteTag(\'' + period.id + '\', \'' + escapeHtml(period.name) + '\')">Delete</button>'
            + '</div>';
    }
    container.innerHTML = html;
}


/**
 * Erstellt einen neuen Tag per POST /api/periods.
 */
async function createTag() {
    var nameInput = document.getElementById('newTagName');
    var colorInput = document.getElementById('newTagColor');
    var errorDiv = document.getElementById('tagsModalError');

    var name = nameInput.value.trim();
    var color = colorInput.value;

    errorDiv.style.display = 'none';

    if (!name) {
        errorDiv.textContent = 'Please enter a tag name.';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        var response = await fetch('/api/periods', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, color: color })
        });

        var result = await response.json();

        if (result.success) {
            nameInput.value = '';
            // Periods neu laden damit Modal und Chips aktuell sind
            await loadPeriods();
            renderTagsModalList();
            populateTagFilter();
            showToast('Tag "' + name + '" created!');
        } else {
            errorDiv.textContent = result.message;
            errorDiv.style.display = 'block';
        }

    } catch (error) {
        errorDiv.textContent = 'Connection error.';
        errorDiv.style.display = 'block';
    }
}


/**
 * Löscht einen Tag per DELETE /api/periods/:id.
 */
async function deleteTag(periodId, periodName) {
    var confirmed = confirm('Delete tag "' + periodName + '"? It will be removed from all applications.');
    if (!confirmed) {
        return;
    }

    try {
        var response = await fetch('/api/periods/' + periodId, {
            method: 'DELETE'
        });

        var result = await response.json();

        if (result.success) {
            // Periods neu laden
            await loadPeriods();
            renderTagsModalList();
            populateTagFilter();
            // Tabelle neu rendern damit Tags-Spalte aktuell ist
            renderTable();
            showToast('Tag "' + periodName + '" deleted.');
        } else {
            showToast('Error: ' + result.message);
        }

    } catch (error) {
        showToast('Connection error.');
    }
}


// --- Seite initialisieren ---
initApplicationsPage();
