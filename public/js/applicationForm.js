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
            document.getElementById('fieldCountry').value = app.country || '';
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
 * Zeigt eine Fehlermeldung unter einem Formularfeld.
 *
 * @param {string} fieldId - ID des Feldes (z.B. "Company" → sucht "errorCompany")
 * @param {string} message - Die anzuzeigende Fehlermeldung
 */
function showFieldError(fieldId, message) {
    var el = document.getElementById('error' + fieldId);
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}


/**
 * Versteckt alle Fehlermeldungen im Formular.
 */
function clearFieldErrors() {
    var errors = document.querySelectorAll('.field-error');
    for (var i = 0; i < errors.length; i++) {
        errors[i].style.display = 'none';
    }
}


/**
 * Validiert alle Formularfelder vor dem Absenden.
 * Zeigt Fehlermeldungen direkt unter den Feldern an.
 * Gibt true zurück wenn alles gültig ist, sonst false.
 */
function validateForm() {
    clearFieldErrors();
    var isValid = true;

    var company = document.getElementById('fieldCompany').value.trim();
    var position = document.getElementById('fieldPosition').value.trim();
    var roleType = document.getElementById('fieldRoleType').value;
    var location = document.getElementById('fieldLocation').value.trim();
    var salary = document.getElementById('fieldSalary').value;
    var url = document.getElementById('fieldUrl').value.trim();
    var deadline = document.getElementById('fieldDeadline').value;
    var appliedDate = document.getElementById('fieldAppliedDate').value;
    var notes = document.getElementById('fieldNotes').value;

    // Company: Pflicht, 1-100 Zeichen
    if (!company || company.length < 1) {
        showFieldError('Company', 'Company name is required.');
        isValid = false;
    } else if (company.length > 100) {
        showFieldError('Company', 'Company name must be 100 characters or less.');
        isValid = false;
    }

    // Position: Pflicht, 2-200 Zeichen
    if (!position || position.length < 2) {
        showFieldError('Position', 'Position must be at least 2 characters.');
        isValid = false;
    } else if (position.length > 200) {
        showFieldError('Position', 'Position must be 200 characters or less.');
        isValid = false;
    }

    // RoleType: Pflicht
    if (!roleType || roleType === '') {
        showFieldError('RoleType', 'Please select a type (Internship or Working Student).');
        isValid = false;
    }

    // Location: Optional, maximal 100 Zeichen
    if (location && location.length > 100) {
        showFieldError('Location', 'Location must be 100 characters or less.');
        isValid = false;
    }

    // Salary: Wenn ausgefüllt, muss eine Zahl zwischen 0 und 20000 sein
    if (salary !== '' && salary !== undefined) {
        var salaryNum = Number(salary);
        if (isNaN(salaryNum) || salaryNum < 0 || salaryNum > 20000) {
            showFieldError('Salary', 'Salary must be a number between 0 and 20,000.');
            isValid = false;
        }
    }

    // URL: Wenn ausgefüllt, muss mit http:// oder https:// anfangen
    if (url && url !== '') {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            showFieldError('Url', 'URL must start with http:// or https://');
            isValid = false;
        }
    }

    // Deadline und Applied Date: Applied Date darf nicht nach Deadline liegen
    if (deadline && appliedDate) {
        if (appliedDate > deadline) {
            showFieldError('Deadline', 'Applied date cannot be after the acceptance deadline.');
            isValid = false;
        }
    }

    // Notes: Maximal 1000 Zeichen
    if (notes && notes.length > 1000) {
        showFieldError('Notes', 'Notes must be 1,000 characters or less.');
        isValid = false;
    }

    return isValid;
}


/**
 * Wird aufgerufen wenn das Formular abgeschickt wird (Speichern-Button).
 * Entscheidet ob POST (neu) oder PUT (bearbeiten) verwendet wird.
 */
async function handleSaveApplication(event) {
    event.preventDefault();

    // Validierung: Abbrechen wenn Fehler gefunden wurden
    if (!validateForm()) {
        return;
    }

    const saveButton = document.getElementById('saveButton');
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    // Alle Werte aus dem Formular sammeln
    const applicationData = {
        company:     document.getElementById('fieldCompany').value.trim(),
        roleType:    document.getElementById('fieldRoleType').value,
        position:    document.getElementById('fieldPosition').value.trim(),
        location:    document.getElementById('fieldLocation').value.trim(),
        country:     document.getElementById('fieldCountry').value.trim(),
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
    saveButton.textContent = 'Save Application';
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
