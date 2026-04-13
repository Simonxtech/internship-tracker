/**
 * =============================================================
 *  services/statsService.js — Statistik-Berechnungen
 * =============================================================
 *
 *  Diese Datei berechnet alle Statistiken für das Dashboard:
 *    - Gesamtzahl der Bewerbungen
 *    - Anzahl nach Status (Wishlist, Applied, etc.)
 *    - Absagequote (Rejection Rate)
 *    - Verteilung Internship vs Working Student
 *    - Bewerbungen pro Monat
 *
 *  Wird von routes/statsRoutes.js benutzt.
 * =============================================================
 */

const applicationService = require('./applicationService');
const dataService = require('./dataService');


/**
 * Berechnet alle Statistiken für einen bestimmten User.
 *
 * @param {string} userId - ID des eingeloggten Users
 * @returns {object} - Objekt mit allen berechneten Statistiken
 */
async function calculateStats(userId) {
    // Alle Bewerbungen des Users laden
    const listOfApplications = await applicationService.getAllApplications(userId);

    // --- Gesamtzahl ---
    const totalCount = listOfApplications.length;

    // --- Zählung nach Status ---
    let wishlistCount = 0;
    let appliedCount = 0;
    let onlineAssessmentCount = 0;
    let interviewCount = 0;
    let offerCount = 0;
    let rejectedCount = 0;

    // Durch alle Bewerbungen gehen und Status zählen
    for (let i = 0; i < listOfApplications.length; i++) {
        const currentApplication = listOfApplications[i];

        if (currentApplication.status === 'Wishlist') {
            wishlistCount = wishlistCount + 1;
        } else if (currentApplication.status === 'Applied') {
            appliedCount = appliedCount + 1;
        } else if (currentApplication.status === 'Online Assessment') {
            onlineAssessmentCount = onlineAssessmentCount + 1;
        } else if (currentApplication.status === 'Interview') {
            interviewCount = interviewCount + 1;
        } else if (currentApplication.status === 'Offer') {
            offerCount = offerCount + 1;
        } else if (currentApplication.status === 'Rejected') {
            rejectedCount = rejectedCount + 1;
        }
    }

    // --- Absagequote berechnen ---
    // Nur Bewerbungen zählen die nicht mehr auf der Wishlist sind
    const submittedCount = totalCount - wishlistCount;
    let rejectionRate = 0;
    if (submittedCount > 0) {
        rejectionRate = Math.round((rejectedCount / submittedCount) * 100);
    }

    // --- Verteilung nach Typ ---
    let internshipCount = 0;
    let workingStudentCount = 0;

    for (let i = 0; i < listOfApplications.length; i++) {
        if (listOfApplications[i].roleType === 'Internship') {
            internshipCount = internshipCount + 1;
        } else if (listOfApplications[i].roleType === 'Working Student') {
            workingStudentCount = workingStudentCount + 1;
        }
    }

    // --- Bewerbungen pro Monat (letzte 6 Monate) ---
    const applicationsPerMonth = calculateMonthlyStats(listOfApplications);

    // --- Verteilung nach Zeiträumen ---
    const periodDistribution = await calculatePeriodDistribution(listOfApplications, userId);

    // --- Ergebnis als Objekt zusammenstellen ---
    const statsResult = {
        total: totalCount,
        byStatus: {
            wishlist: wishlistCount,
            applied: appliedCount,
            onlineAssessment: onlineAssessmentCount,
            interview: interviewCount,
            offer: offerCount,
            rejected: rejectedCount
        },
        rejectionRate: rejectionRate,
        rejectedCount: rejectedCount,
        byType: {
            internship: internshipCount,
            workingStudent: workingStudentCount
        },
        applicationsPerMonth: applicationsPerMonth,
        periodDistribution: periodDistribution
    };

    return statsResult;
}


/**
 * Berechnet wie viele Bewerbungen in den letzten 6 Monaten eingereicht wurden.
 *
 * @param {Array} listOfApplications - Alle Bewerbungen des Users
 * @returns {Array} - Array mit {month, year, label, count} für jeden Monat
 */
function calculateMonthlyStats(listOfApplications) {
    const monthlyData = [];
    const today = new Date();

    // Die letzten 6 Monate durchgehen
    for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const yearValue = targetDate.getFullYear();
        const monthValue = targetDate.getMonth() + 1;  // Monate sind 0-basiert in JS

        // Monatsname für die Anzeige (z.B. "Jan", "Feb")
        const monthLabel = targetDate.toLocaleDateString('en-US', { month: 'short' });

        // Schlüssel zum Vergleichen (z.B. "2026-04")
        const monthKey = yearValue + '-' + String(monthValue).padStart(2, '0');

        // Bewerbungen in diesem Monat zählen
        let count = 0;
        for (let j = 0; j < listOfApplications.length; j++) {
            const appliedDate = listOfApplications[j].appliedDate;
            if (appliedDate) {
                // Ersten 7 Zeichen vergleichen (z.B. "2026-04")
                const applicationMonth = appliedDate.slice(0, 7);
                if (applicationMonth === monthKey) {
                    count = count + 1;
                }
            }
        }

        monthlyData.push({
            month: monthValue,
            year: yearValue,
            label: monthLabel,
            count: count
        });
    }

    return monthlyData;
}


/**
 * Berechnet wie viele Bewerbungen pro Zeitraum zugeordnet sind.
 *
 * @param {Array} listOfApplications - Alle Bewerbungen
 * @param {string} userId - User-ID
 * @returns {Array} - Array mit {id, name, color, count} pro Zeitraum
 */
async function calculatePeriodDistribution(listOfApplications, userId) {
    // Alle Zeiträume des Users laden
    const allPeriods = await dataService.readPeriods();

    // Nur die Zeiträume des aktuellen Users
    const userPeriods = [];
    for (let i = 0; i < allPeriods.length; i++) {
        if (allPeriods[i].userId === userId) {
            userPeriods.push(allPeriods[i]);
        }
    }

    // Für jeden Zeitraum zählen wie viele Bewerbungen zugeordnet sind
    const distribution = [];
    for (let i = 0; i < userPeriods.length; i++) {
        const period = userPeriods[i];
        let count = 0;

        for (let j = 0; j < listOfApplications.length; j++) {
            const periodIds = listOfApplications[j].periodIds || [];
            if (periodIds.includes(period.id)) {
                count = count + 1;
            }
        }

        distribution.push({
            id: period.id,
            name: period.name,
            color: period.color,
            count: count
        });
    }

    return distribution;
}


// --- Funktionen exportieren ---
module.exports = {
    calculateStats
};
