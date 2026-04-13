/**
 * =============================================================
 *  public/js/map.js — Frontend-Logik für die Kartenansicht
 * =============================================================
 *
 *  Diese Datei wird auf map.html eingebunden.
 *  Sie macht:
 *    1. Alle Bewerbungen laden
 *    2. Standorte gruppieren (z.B. alle "Stuttgart"-Bewerbungen zusammen)
 *    3. Für jeden Standort die Koordinaten per Geocoding-API ermitteln
 *    4. Marker auf die Leaflet-Karte setzen
 *
 *  Geocoding: Wir nutzen die kostenlose Nominatim-API von OpenStreetMap
 *  um Ortsnamen in Koordinaten umzuwandeln.
 *  Beispiel: "Stuttgart" → { lat: 48.7758, lon: 9.1829 }
 * =============================================================
 */

// --- Globale Variable für die Leaflet-Karte ---
var mapInstance = null;


/**
 * Seite initialisieren.
 */
async function initMapPage() {
    const currentUser = await initPage('map');

    if (!currentUser) {
        return;
    }

    // Karte initialisieren
    initializeMap();

    // Bewerbungen laden und Marker setzen
    await loadAndShowLocations();
}


/**
 * Erstellt die Leaflet-Karte mit Standard-Einstellungen.
 * Zentriert auf Deutschland.
 */
function initializeMap() {
    // Leaflet-Karte erstellen
    // Parameter: Container-ID, { center: [Breite, Länge], zoom: Zoomstufe }
    mapInstance = L.map('mapContainer').setView([51.1657, 10.4515], 6);

    // Karten-Kacheln von OpenStreetMap laden
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(mapInstance);
}


/**
 * Lädt Bewerbungen, gruppiert sie nach Standort und setzt Marker.
 */
async function loadAndShowLocations() {
    try {
        const response = await fetch('/api/applications');
        const result = await response.json();

        if (!result.success) {
            return;
        }

        const listOfApplications = result.applications;

        // Standorte gruppieren (wie viele Bewerbungen pro Ort?)
        const locationGroups = groupByLocation(listOfApplications);

        // Standort-Liste anzeigen
        renderLocationList(locationGroups);

        // Für jeden Standort Koordinaten suchen und Marker setzen
        // Wir benutzen eine for-Schleife damit die Anfragen nacheinander laufen
        // (nicht alle gleichzeitig — das wäre unhöflich gegenüber der API)
        const allMarkerCoordinates = [];

        for (let i = 0; i < locationGroups.length; i++) {
            const group = locationGroups[i];

            // "Remote" braucht keinen Marker
            if (group.location.toLowerCase() === 'remote') {
                continue;
            }

            // Koordinaten per Geocoding ermitteln
            const coordinates = await geocodeLocation(group.location);

            if (coordinates) {
                // Marker auf die Karte setzen
                addMarkerToMap(coordinates, group);
                allMarkerCoordinates.push(coordinates);
            }

            // Kurze Pause zwischen den API-Anfragen (Nominatim-Policy: max 1/Sekunde)
            await sleep(1100);
        }

        // Karte so zoomen dass alle Marker sichtbar sind
        if (allMarkerCoordinates.length > 0) {
            const bounds = L.latLngBounds(allMarkerCoordinates.map(function (coord) {
                return [coord.lat, coord.lon];
            }));
            mapInstance.fitBounds(bounds, { padding: [50, 50] });
        }

    } catch (error) {
        console.log('Fehler beim Laden der Standorte:', error);
    }
}


/**
 * Gruppiert Bewerbungen nach ihrem Standort.
 * Beispiel: 3 Bewerbungen in "Stuttgart" → { location: "Stuttgart", count: 3, applications: [...] }
 */
function groupByLocation(listOfApplications) {
    const groups = {};

    for (let i = 0; i < listOfApplications.length; i++) {
        const app = listOfApplications[i];
        const location = app.location || 'Unknown';

        if (!groups[location]) {
            groups[location] = {
                location: location,
                count: 0,
                applications: []
            };
        }

        groups[location].count = groups[location].count + 1;
        groups[location].applications.push(app);
    }

    // In ein Array umwandeln und nach Anzahl sortieren
    const groupArray = [];
    const locationNames = Object.keys(groups);

    for (let i = 0; i < locationNames.length; i++) {
        groupArray.push(groups[locationNames[i]]);
    }

    // Sortieren: Meiste Bewerbungen zuerst
    groupArray.sort(function (a, b) {
        return b.count - a.count;
    });

    return groupArray;
}


/**
 * Zeigt die Liste der Standorte unter der Karte an.
 */
function renderLocationList(locationGroups) {
    const container = document.getElementById('locationListBody');

    if (locationGroups.length === 0) {
        container.innerHTML = '<p style="color:var(--text-light); font-size:12px; padding:12px;">No locations found. Add applications with locations to see them here.</p>';
        return;
    }

    let html = '';

    for (let i = 0; i < locationGroups.length; i++) {
        const group = locationGroups[i];

        // Firmennamen auflisten
        const companyNames = [];
        for (let j = 0; j < group.applications.length; j++) {
            companyNames.push(group.applications[j].company);
        }

        html = html
            + '<div class="location-item">'
            + '<span class="location-count">' + group.count + '</span>'
            + '<div>'
            + '<div style="font-weight:600;">' + escapeHtml(group.location) + '</div>'
            + '<div style="font-size:11px; color:var(--text-muted);">' + escapeHtml(companyNames.join(', ')) + '</div>'
            + '</div>'
            + '</div>';
    }

    container.innerHTML = html;
}


/**
 * Geocoding: Wandelt einen Ortsnamen in Koordinaten um.
 * Benutzt die Nominatim-API von OpenStreetMap (kostenlos).
 *
 * @param {string} locationName - z.B. "Stuttgart"
 * @returns {object|null} - { lat, lon } oder null wenn nicht gefunden
 */
async function geocodeLocation(locationName) {
    try {
        // URL für die Nominatim-API zusammenbauen
        const encodedLocation = encodeURIComponent(locationName + ', Germany');
        const apiUrl = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodedLocation + '&limit=1';

        const response = await fetch(apiUrl, {
            headers: {
                // Nominatim verlangt einen User-Agent
                'User-Agent': 'InternshipTracker/1.0 (student project)'
            }
        });

        const results = await response.json();

        if (results.length > 0) {
            return {
                lat: parseFloat(results[0].lat),
                lon: parseFloat(results[0].lon)
            };
        }

        return null;

    } catch (error) {
        console.log('Geocoding-Fehler für "' + locationName + '":', error);
        return null;
    }
}


/**
 * Setzt einen Marker auf die Karte mit einem Popup.
 */
function addMarkerToMap(coordinates, locationGroup) {
    // Popup-Inhalt zusammenbauen
    let popupContent = '<b>' + escapeHtml(locationGroup.location) + '</b>';
    popupContent = popupContent + '<br>' + locationGroup.count + ' application' + (locationGroup.count === 1 ? '' : 's');

    // Firmennamen auflisten
    for (let i = 0; i < locationGroup.applications.length; i++) {
        const app = locationGroup.applications[i];
        popupContent = popupContent + '<br>• ' + escapeHtml(app.company) + ' — ' + escapeHtml(app.position);
    }

    // Marker erstellen und zur Karte hinzufügen
    const marker = L.marker([coordinates.lat, coordinates.lon]).addTo(mapInstance);
    marker.bindPopup(popupContent);
}


/**
 * Hilfsfunktion: Wartet eine bestimmte Zeit (in Millisekunden).
 * Wird benutzt um zwischen Geocoding-Anfragen zu pausieren.
 */
function sleep(milliseconds) {
    return new Promise(function (resolve) {
        setTimeout(resolve, milliseconds);
    });
}


// --- Seite initialisieren ---
initMapPage();
