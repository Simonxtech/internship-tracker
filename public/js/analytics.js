/**
 * =============================================================
 *  public/js/analytics.js — Frontend-Logik für Statistiken
 * =============================================================
 *
 *  Diese Datei wird auf analytics.html eingebunden.
 *  Sie lädt Statistiken vom Server (GET /api/stats) und zeigt
 *  sie als Charts und Zahlen an.
 *
 *  Charts werden mit reinem HTML/CSS und SVG gezeichnet —
 *  keine externen Libraries nötig!
 * =============================================================
 */

// --- Status-Farben (gleiche wie auf den anderen Seiten) ---
const STATUS_COLORS = {
    'Wishlist':          '#6366f1',
    'Applied':           '#3b82f6',
    'Online Assessment': '#f59e0b',
    'Interview':         '#f97316',
    'Offer':             '#10b981',
    'Rejected':          '#ef4444'
};

// --- Status-Reihenfolge ---
const STATUS_ORDER = ['Wishlist', 'Applied', 'Online Assessment', 'Interview', 'Offer', 'Rejected'];


/**
 * Seite initialisieren und Statistiken laden.
 */
async function initAnalyticsPage() {
    const currentUser = await initPage('analytics');

    if (!currentUser) {
        return;
    }

    await loadAndRenderStats();
}


/**
 * Statistiken vom Server laden und alle Charts rendern.
 */
async function loadAndRenderStats() {
    try {
        const response = await fetch('/api/stats');
        const result = await response.json();

        if (result.success) {
            const stats = result.stats;

            // Stat-Cards befüllen
            renderStatCards(stats);

            // Pipeline-Leiste
            renderPipeline(stats);

            // Donut-Chart
            renderDonut(stats);

            // Funnel
            renderFunnel(stats);

            // Monatliche Übersicht
            renderMonthlyChart(stats);

            // Typ-Verteilung
            renderTypeDistribution(stats);

            // Period-Verteilung
            renderPeriodDistribution(stats);
        }

    } catch (error) {
        console.log('Fehler beim Laden der Statistiken:', error);
    }
}


/**
 * Füllt die Stat-Cards oben auf der Seite.
 */
function renderStatCards(stats) {
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statInterviews').textContent = stats.byStatus.interview;
    document.getElementById('statOffers').textContent = stats.byStatus.offer;
    document.getElementById('statRejRate').textContent = stats.rejectionRate + '%';
    document.getElementById('statRejSub').textContent = stats.rejectedCount + ' rejection' + (stats.rejectedCount === 1 ? '' : 's');
}


/**
 * Zeichnet die Pipeline-Übersichtsleiste.
 * Zeigt die Verteilung aller Status als farbigen Balken.
 */
function renderPipeline(stats) {
    const bar = document.getElementById('pipelineBar');
    const legend = document.getElementById('pipelineLegend');

    let barHtml = '';
    let legendHtml = '';

    // Status-Daten zusammenstellen
    const statusData = [
        { name: 'Wishlist',          count: stats.byStatus.wishlist },
        { name: 'Applied',           count: stats.byStatus.applied },
        { name: 'Online Assessment', count: stats.byStatus.onlineAssessment },
        { name: 'Interview',         count: stats.byStatus.interview },
        { name: 'Offer',             count: stats.byStatus.offer },
        { name: 'Rejected',          count: stats.byStatus.rejected }
    ];

    for (let i = 0; i < statusData.length; i++) {
        const item = statusData[i];

        if (item.count > 0) {
            barHtml = barHtml + '<div class="pipeline-segment" style="flex:' + item.count + '; background:' + STATUS_COLORS[item.name] + '" title="' + item.name + ': ' + item.count + '"></div>';

            legendHtml = legendHtml + '<div class="legend-item"><div class="legend-dot" style="background:' + STATUS_COLORS[item.name] + '"></div>' + item.name + ': <b>' + item.count + '</b></div>';
        }
    }

    // Wenn keine Daten, grauen Balken zeigen
    if (stats.total === 0) {
        barHtml = '<div class="pipeline-segment" style="flex:1; background:#e5e5e3"></div>';
    }

    bar.innerHTML = barHtml;
    legend.innerHTML = legendHtml;
}


/**
 * Zeichnet den Donut-Chart für die Status-Verteilung.
 * Benutzt SVG-Pfade um die Tortenstücke zu zeichnen.
 */
function renderDonut(stats) {
    const svg = document.getElementById('donutSvg');
    const legend = document.getElementById('donutLegend');

    const total = stats.total;

    // Wenn keine Daten → Platzhalter anzeigen
    if (total === 0) {
        svg.innerHTML = '<text x="70" y="76" text-anchor="middle" font-size="12" fill="#9ca3af">No data</text>';
        legend.innerHTML = '';
        return;
    }

    // Donut-Parameter
    const centerX = 70;
    const centerY = 70;
    const outerRadius = 60;
    const innerRadius = 40;

    // Segmente berechnen
    let currentAngle = -90;  // Start oben
    let svgPaths = '';
    let legendHtml = '';

    const statusCounts = [
        { name: 'Wishlist',          count: stats.byStatus.wishlist },
        { name: 'Applied',           count: stats.byStatus.applied },
        { name: 'Online Assessment', count: stats.byStatus.onlineAssessment },
        { name: 'Interview',         count: stats.byStatus.interview },
        { name: 'Offer',             count: stats.byStatus.offer },
        { name: 'Rejected',          count: stats.byStatus.rejected }
    ];

    for (let i = 0; i < statusCounts.length; i++) {
        const item = statusCounts[i];

        if (item.count === 0) {
            continue;
        }

        // Winkel für dieses Segment berechnen
        const segmentAngle = (item.count / total) * 360;
        const endAngle = currentAngle + segmentAngle;

        // SVG-Pfad erstellen
        const pathData = createDonutPath(centerX, centerY, outerRadius, innerRadius, currentAngle, endAngle);
        svgPaths = svgPaths + '<path d="' + pathData + '" fill="' + STATUS_COLORS[item.name] + '" stroke="white" stroke-width="2"/>';

        // Legende
        legendHtml = legendHtml + '<div class="donut-item">'
            + '<div class="donut-dot" style="background:' + STATUS_COLORS[item.name] + '"></div>'
            + '<span style="color:var(--text-muted)">' + item.name + '</span>'
            + '<span class="donut-count">' + item.count + '</span>'
            + '</div>';

        currentAngle = endAngle;
    }

    // Zahl in der Mitte
    svgPaths = svgPaths + '<text x="' + centerX + '" y="' + (centerY - 4) + '" text-anchor="middle" font-size="22" font-weight="700" fill="#1a1a1a">' + total + '</text>';
    svgPaths = svgPaths + '<text x="' + centerX + '" y="' + (centerY + 13) + '" text-anchor="middle" font-size="10" fill="#6b7280">Total</text>';

    svg.innerHTML = svgPaths;
    legend.innerHTML = legendHtml;
}


/**
 * Hilfsfunktion: Berechnet den SVG-Pfad für ein Donut-Segment.
 * Mathe: Punkte auf dem äußeren und inneren Kreis berechnen,
 * dann mit Bögen verbinden.
 */
function createDonutPath(cx, cy, outerR, innerR, startAngle, endAngle) {
    // Sonderfall: Fast voller Kreis (> 359°)
    if (Math.abs(endAngle - startAngle) >= 359.9) {
        const m1 = polarToCartesian(cx, cy, outerR, startAngle);
        const m2 = polarToCartesian(cx, cy, outerR, startAngle + 180);
        const m3 = polarToCartesian(cx, cy, innerR, startAngle + 180);
        const m4 = polarToCartesian(cx, cy, innerR, startAngle);

        return 'M' + m1.x.toFixed(2) + ',' + m1.y.toFixed(2)
            + ' A' + outerR + ',' + outerR + ' 0 1,1 ' + m2.x.toFixed(2) + ',' + m2.y.toFixed(2)
            + ' A' + outerR + ',' + outerR + ' 0 1,1 ' + m1.x.toFixed(2) + ',' + m1.y.toFixed(2)
            + ' M' + m4.x.toFixed(2) + ',' + m4.y.toFixed(2)
            + ' A' + innerR + ',' + innerR + ' 0 1,0 ' + m3.x.toFixed(2) + ',' + m3.y.toFixed(2)
            + ' A' + innerR + ',' + innerR + ' 0 1,0 ' + m4.x.toFixed(2) + ',' + m4.y.toFixed(2)
            + ' Z';
    }

    const p1 = polarToCartesian(cx, cy, outerR, startAngle);
    const p2 = polarToCartesian(cx, cy, outerR, endAngle);
    const p3 = polarToCartesian(cx, cy, innerR, endAngle);
    const p4 = polarToCartesian(cx, cy, innerR, startAngle);

    // Large-arc-flag: 1 wenn der Bogen größer als 180° ist
    const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;

    return 'M' + p1.x.toFixed(2) + ',' + p1.y.toFixed(2)
        + ' A' + outerR + ',' + outerR + ' 0 ' + largeArc + ',1 ' + p2.x.toFixed(2) + ',' + p2.y.toFixed(2)
        + ' L' + p3.x.toFixed(2) + ',' + p3.y.toFixed(2)
        + ' A' + innerR + ',' + innerR + ' 0 ' + largeArc + ',0 ' + p4.x.toFixed(2) + ',' + p4.y.toFixed(2)
        + ' Z';
}


/**
 * Rechnet Polarkoordinaten (Winkel + Radius) in kartesische Koordinaten (x, y) um.
 * Gebraucht für die Donut-Chart-Berechnung.
 */
function polarToCartesian(cx, cy, radius, angleDegrees) {
    const angleRadians = angleDegrees * Math.PI / 180;
    return {
        x: cx + radius * Math.cos(angleRadians),
        y: cy + radius * Math.sin(angleRadians)
    };
}


/**
 * Zeichnet den Conversion-Funnel.
 * Zeigt wie viele Bewerbungen jeden Status erreicht haben.
 */
function renderFunnel(stats) {
    const container = document.getElementById('funnelContainer');

    const funnelStages = [
        { name: 'Applied',           count: stats.byStatus.applied },
        { name: 'Online Assessment', count: stats.byStatus.onlineAssessment },
        { name: 'Interview',         count: stats.byStatus.interview },
        { name: 'Offer',             count: stats.byStatus.offer }
    ];

    // Gesamt ohne Wishlist für die Prozentberechnung
    const totalSubmitted = stats.total - stats.byStatus.wishlist;
    const maxCount = Math.max(1, Math.max(funnelStages[0].count, funnelStages[1].count, funnelStages[2].count, funnelStages[3].count));

    let html = '';

    for (let i = 0; i < funnelStages.length; i++) {
        const stage = funnelStages[i];
        const percentage = totalSubmitted > 0 ? Math.round((stage.count / totalSubmitted) * 100) : 0;
        const barWidth = maxCount > 0 ? Math.round((stage.count / maxCount) * 100) : 0;

        html = html
            + '<div class="bar-chart-item">'
            + '<div class="bar-label">' + stage.name + '</div>'
            + '<div class="bar-track">'
            + '<div class="bar-fill" style="width:' + barWidth + '%; background:' + STATUS_COLORS[stage.name] + '"></div>'
            + '</div>'
            + '<div class="bar-value">' + stage.count + ' (' + percentage + '%)</div>'
            + '</div>';
    }

    container.innerHTML = html;
}


/**
 * Zeichnet die monatliche Übersicht als CSS-Balkendiagramm.
 */
function renderMonthlyChart(stats) {
    const container = document.getElementById('monthlyChartContainer');
    const monthlyData = stats.applicationsPerMonth;

    if (!monthlyData || monthlyData.length === 0) {
        container.innerHTML = '<p style="color:var(--text-light); font-size:12px; text-align:center; padding:20px">No data available</p>';
        return;
    }

    // Maximalen Wert finden für die Skalierung
    let maxCount = 0;
    for (let i = 0; i < monthlyData.length; i++) {
        if (monthlyData[i].count > maxCount) {
            maxCount = monthlyData[i].count;
        }
    }
    if (maxCount === 0) {
        maxCount = 1;
    }

    let html = '';

    for (let i = 0; i < monthlyData.length; i++) {
        const month = monthlyData[i];
        const barWidth = Math.round((month.count / maxCount) * 100);

        html = html
            + '<div class="bar-chart-item">'
            + '<div class="bar-label">' + month.label + ' ' + month.year + '</div>'
            + '<div class="bar-track">'
            + '<div class="bar-fill" style="width:' + barWidth + '%; background:var(--accent)"></div>'
            + '</div>'
            + '<div class="bar-value">' + month.count + '</div>'
            + '</div>';
    }

    container.innerHTML = html;
}


/**
 * Zeigt die Verteilung zwischen Internship und Working Student.
 */
function renderTypeDistribution(stats) {
    const container = document.getElementById('typeDistContainer');
    const internshipCount = stats.byType.internship;
    const workingStudentCount = stats.byType.workingStudent;
    const total = stats.total;

    if (total === 0) {
        container.innerHTML = '<p style="color:var(--text-light); font-size:12px; text-align:center; padding:20px">No data</p>';
        return;
    }

    const internshipPercent = Math.round((internshipCount / total) * 100);
    const wsPercent = Math.round((workingStudentCount / total) * 100);

    let barHtml = '<div style="display:flex; height:28px; border-radius:6px; overflow:hidden; margin-bottom:12px;">';

    if (internshipCount > 0) {
        barHtml = barHtml + '<div style="width:' + internshipPercent + '%; background:#10b981; display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:700;">';
        if (internshipPercent > 15) {
            barHtml = barHtml + internshipPercent + '%';
        }
        barHtml = barHtml + '</div>';
    }

    if (workingStudentCount > 0) {
        barHtml = barHtml + '<div style="width:' + wsPercent + '%; background:#7c3aed; display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:700;">';
        if (wsPercent > 15) {
            barHtml = barHtml + wsPercent + '%';
        }
        barHtml = barHtml + '</div>';
    }

    barHtml = barHtml + '</div>';

    // Zahlen darunter
    barHtml = barHtml + '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">'
        + '<div style="background:#f4f4f3; border-radius:var(--radius); padding:10px; text-align:center;">'
        + '<div style="font-size:20px; font-weight:700; color:#10b981;">' + internshipCount + '</div>'
        + '<div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Internship</div>'
        + '</div>'
        + '<div style="background:#f4f4f3; border-radius:var(--radius); padding:10px; text-align:center;">'
        + '<div style="font-size:20px; font-weight:700; color:#7c3aed;">' + workingStudentCount + '</div>'
        + '<div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Working Student</div>'
        + '</div>'
        + '</div>';

    container.innerHTML = barHtml;
}


/**
 * Zeigt die Verteilung nach Zeiträumen (Periods).
 * Nur sichtbar wenn Zeiträume existieren.
 */
function renderPeriodDistribution(stats) {
    const card = document.getElementById('periodDistCard');
    const container = document.getElementById('periodDistContainer');
    const distribution = stats.periodDistribution;

    if (!distribution || distribution.length === 0) {
        card.style.display = 'none';
        return;
    }

    card.style.display = 'block';

    // Maximalen Wert finden
    let maxCount = 0;
    for (let i = 0; i < distribution.length; i++) {
        if (distribution[i].count > maxCount) {
            maxCount = distribution[i].count;
        }
    }
    if (maxCount === 0) {
        maxCount = 1;
    }

    let html = '';

    for (let i = 0; i < distribution.length; i++) {
        const period = distribution[i];
        const barWidth = Math.round((period.count / maxCount) * 100);

        html = html
            + '<div class="bar-chart-item">'
            + '<div class="bar-label" style="display:flex; align-items:center; gap:6px;">'
            + '<div style="width:8px; height:8px; border-radius:50%; background:' + period.color + '; flex-shrink:0;"></div>'
            + escapeHtml(period.name)
            + '</div>'
            + '<div class="bar-track">'
            + '<div class="bar-fill" style="width:' + barWidth + '%; background:' + period.color + '"></div>'
            + '</div>'
            + '<div class="bar-value">' + period.count + '</div>'
            + '</div>';
    }

    container.innerHTML = html;
}


// --- Seite initialisieren ---
initAnalyticsPage();
