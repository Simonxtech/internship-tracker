/**
 * =============================================================
 *  public/js/applicationForm.js — Frontend-Logik für das Formular
 * =============================================================
 *
 *  Diese Datei wird auf application-form.html eingebunden.
 *  Sie behandelt zwei Modi:
 *
 *  ERSTELLEN-MODUS (keine ID in der URL):
 *    - Leeres Formular
 *    - Beim Speichern: POST /api/applications
 *
 *  BEARBEITEN-MODUS (ID in der URL, z.B. ?id=abc123):
 *    - Bestehende Daten werden geladen: GET /api/applications/:id
 *    - Beim Speichern: PUT /api/applications/:id
 *    - Delete-Button wird angezeigt
 *
 *  ROUNDTRIP:
 *    Frontend (Formular) → fetch(POST oder PUT) → Backend → Antwort → Frontend
 * =============================================================
 */

// --- Zustandsvariablen ---
let editingId = null;            // null = Erstellen-Modus, sonst die ID der Bewerbung
let allPeriods = [];             // Alle Zeiträume des Users
let selectedPeriodIds = [];      // Welche Zeiträume ausgewählt sind


/**
 * Seite initialisieren.
 * Prüft ob eine ID in der URL steht und wechselt ggf. in den Bearbeiten-Modus.
 */
async function initFormPage() {
    const currentUser = await initPage('add');

    if (!currentUser) {
        return;
    }

    // Zeiträume laden
    await loadPeriods();

    // Prüfen ob eine ID in der URL steht (z.B. ?id=abc123)
    const urlParams = new URLSearchParams(window.location.search);
    const applicationId = urlParams.get('id');

    if (applicationId) {
        // Bearbeiten-Modus: Bestehende Bewerbung laden
        editingId = applicationId;
        document.getElementById('formTitle').textContent = 'Edit Application';
        document.getElementById('formSubtitle').textContent = 'Update the details of your application.';
        document.getElementById('deleteButton').style.display = 'inline-flex';

        await loadExistingApplication(applicationId);
    }
}


/**
 * Lädt die Zeiträume vom Server und zeigt sie als klickbare Chips an.
 */
async function loadPeriods() {
    try {
        const response = await fetch('/api/periods');
        const result = await response.json();

        if (result.success) {
            allPeriods = result.periods;
            renderPeriodChips();
        }
    } catch (error) {
        console.log('Fehler beim Laden der Zeiträume:', error);
    }
}


/**
 * Zeigt die Zeiträume als klickbare Chips im Formular an.
 * Ausgewählte Chips bekommen eine farbige Hintergrundfarbe.
 */
function renderPeriodChips() {
    const container = document.getElementById('periodChipsContainer');

    if (allPeriods.length === 0) {
        container.innerHTML = '<span style="font-size:12px; color:var(--text-light)">No periods created yet. You can create periods on the analytics page.</span>';
        return;
    }

    let chipsHtml = '';

    for (let i = 0; i < allPeriods.length; i++) {
        const period = allPeriods[i];
        const isSelected = selectedPeriodIds.includes(period.id);

        if (isSelected) {
            // Ausgewählter Chip: farbiger Hintergrund
            chipsHtml = chipsHtml + '<div class="period-chip selected" '
                + 'style="background:' + period.color + '; color:white; border-color:' + period.color + ';" '
                + 'onclick="togglePeriod(\'' + period.id + '\')">'
                + escapeHtml(period.name)
                + '</div>';
        } else {
            // Nicht ausgewählter Chip: grauer Hintergrund
            chipsHtml = chipsHtml + '<div class="period-chip unselected" '
                + 'onclick="togglePeriod(\'' + period.id + '\')">'
                + escapeHtml(period.name)
                + '</div>';
        }
    }

    container.innerHTML = chipsHtml;
}


/**
 * Schaltet einen Zeitraum an oder aus (toggle).
 */
function togglePeriod(periodId) {
    // Prüfen ob der Zeitraum schon ausgewählt ist
    const indexInArray = selectedPeriodIds.indexOf(periodId);

    if (indexInArray >= 0) {
        // Schon drin → rausnehmen
        selectedPeriodIds.splice(indexInArray, 1);
    } else {
        // Nicht drin → hinzufügen
        selectedPeriodIds.push(periodId);
    }

    // Chips neu rendern
    renderPeriodChips();
}


/**
 * Lädt eine bestehende Bewerbung vom Server und füllt das Formular.
 * Wird im Bearbeiten-Modus aufgerufen.
 */
async function loadExistingApplication(applicationId) {
    try {
        const response = await fetch('/api/applications/' + applicationId);
        const result = await response.json();

        if (result.success) {
            const app = result.application;

            // Formularfelder mit den bestehenden Werten füllen
            document.getElementById('fieldCompany').value = app.company || '';
            document.getElementById('fieldRoleType').value = app.roleType || '';
            document.getElementById('fieldPosition').value = app.position || '';
            document.getElementById('fieldLocation').value = app.location || '';
            document.getElementById('fieldStatus').value = app.status || 'Wishlist';
            document.getElementById('fieldDeadline').value = app.deadline || '';
            document.getElementById('fieldAppliedDate').value = app.appliedDate || '';
            document.getElementById('fieldSalary').value = app.salary || '';
            document.getElementById('fieldUrl').value = app.url || '';
            document.getElementById('fieldNotes').value = app.notes || '';

            // Zugeordnete Zeiträume setzen
            selectedPeriodIds = app.periodIds || [];
            renderPeriodChips();

        } else {
            showToast('Application not found.');
            window.location.href = '/applications.html';
        }

    } catch (error) {
        showToast('Error loading application.');
        console.log('Fehler:', error);
    }
}


/**
 * Wird aufgerufen wenn das Formular abgeschickt wird (Speichern-Button).
 * Entscheidet ob POST (neu) oder PUT (bearbeiten) verwendet wird.
 */
async function handleSaveApplication(event) {
    event.preventDefault();

    const saveButton = document.getElementById('saveButton');
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    // Alle Werte aus dem Formular sammeln
    const applicationData = {
        company:     document.getElementById('fieldCompany').value.trim(),
        roleType:    document.getElementById('fieldRoleType').value,
        position:    document.getElementById('fieldPosition').value.trim(),
        location:    document.getElementById('fieldLocation').value.trim(),
        status:      document.getElementById('fieldStatus').value,
        deadline:    document.getElementById('fieldDeadline').value,
        appliedDate: document.getElementById('fieldAppliedDate').value,
        salary:      document.getElementById('fieldSalary').value.trim(),
        url:         document.getElementById('fieldUrl').value.trim(),
        notes:       document.getElementById('fieldNotes').value.trim(),
        periodIds:   selectedPeriodIds
    };

    try {
        let response;

        if (editingId) {
            // BEARBEITEN-MODUS: PUT-Request
            response = await fetch('/api/applications/' + editingId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicationData)
            });
        } else {
            // ERSTELLEN-MODUS: POST-Request
            response = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicationData)
            });
        }

        const result = await response.json();

        if (result.success) {
            // Erfolg! Zur Übersicht weiterleiten
            window.location.href = '/applications.html';
        } else {
            showToast('Error: ' + result.message);
        }

    } catch (error) {
        showToast('Connection error. Please try again.');
    }

    saveButton.disabled = false;
    saveButton.textContent = '💾 Save Application';
}


/**
 * Löscht die aktuell bearbeitete Bewerbung.
 * Nur im Bearbeiten-Modus verfügbar.
 */
async function handleDeleteApplication() {
    if (!editingId) {
        return;
    }

    const companyName = document.getElementById('fieldCompany').value;
    const confirmed = confirm('Do you really want to delete the application at "' + companyName + '"?');

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch('/api/applications/' + editingId, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            window.location.href = '/applications.html';
        } else {
            showToast('Error: ' + result.message);
        }

    } catch (error) {
        showToast('Connection error.');
    }
}


// --- Seite initialisieren ---
initFormPage();
