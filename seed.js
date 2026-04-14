/**
 * =============================================================
 *  seed.js — Fügt Testdaten in die App ein
 * =============================================================
 *
 *  Dieses Script erstellt einen Test-User und fügt
 *  Beispiel-Bewerbungen und Zeiträume ein.
 *
 *  Ausführen mit: node seed.js
 *
 *  Danach einloggen mit:
 *    Username: demo
 *    Password: demo1234
 * =============================================================
 */

const dataService = require('./services/dataService');
const authService = require('./services/authService');
const helpers = require('./utils/helpers');

async function seedData() {
    console.log('Initialisiere Datendateien...');
    await dataService.initializeDataFiles();

    // --- 1. Demo-User erstellen ---
    console.log('Erstelle Demo-User...');
    let demoUser;
    try {
        demoUser = await authService.registerUser('demo', 'demo1234');
        console.log('✓ User erstellt: demo / demo1234');
    } catch (error) {
        // User existiert vielleicht schon
        console.log('User "demo" existiert bereits, verwende bestehenden...');
        const allUsers = await dataService.readUsers();
        const found = allUsers.find(u => u.username.toLowerCase() === 'demo');
        if (found) {
            demoUser = { id: found.id, username: found.username };
        } else {
            console.log('FEHLER:', error.message);
            return;
        }
    }

    const userId = demoUser.id;

    // --- 2. Zeiträume erstellen (5 Stück) ---
    console.log('Erstelle Zeiträume...');

    const period1 = {
        id: helpers.generateUniqueId(),
        userId: userId,
        name: 'Summer Internship 2026',
        color: '#f59e0b'
    };

    const period2 = {
        id: helpers.generateUniqueId(),
        userId: userId,
        name: 'Mandatory Internship',
        color: '#8b5cf6'
    };

    const period3 = {
        id: helpers.generateUniqueId(),
        userId: userId,
        name: 'Working Student WS 25/26',
        color: '#3b82f6'
    };

    const period4 = {
        id: helpers.generateUniqueId(),
        userId: userId,
        name: 'Gap Year Applications',
        color: '#10b981'
    };

    const period5 = {
        id: helpers.generateUniqueId(),
        userId: userId,
        name: 'Dream Companies',
        color: '#ef4444'
    };

    const allPeriods = [period1, period2, period3, period4, period5];
    await dataService.writePeriods(allPeriods);
    console.log('✓ 5 Zeiträume erstellt');

    // --- 3. Beispiel-Bewerbungen erstellen ---
    console.log('Erstelle Bewerbungen...');

    // Hilfsfunktion: Datum relativ zu heute berechnen
    function dateOffset(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().slice(0, 10);
    }

    const sampleApplications = [
        // Deutschland
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Bosch',
            roleType: 'Internship',
            position: 'Software Engineering Intern',
            location: 'Stuttgart',
            country: 'Germany',
            status: 'Interview',
            deadline: dateOffset(3),
            appliedDate: dateOffset(-18),
            salary: 1200,
            url: 'https://www.bosch.de/karriere/',
            notes: 'Interview with HR on Thursday. Prepare presentation.',
            periodIds: [period2.id]
        },
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'McKinsey & Company',
            roleType: 'Internship',
            position: 'Business Analyst Intern',
            location: 'Munich',
            country: 'Germany',
            status: 'Applied',
            deadline: dateOffset(1),
            appliedDate: dateOffset(-5),
            salary: 2800,
            url: '',
            notes: 'Online application submitted. Waiting for response.',
            periodIds: [period1.id]
        },
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Roland Berger',
            roleType: 'Internship',
            position: 'Consulting Intern',
            location: 'Hamburg',
            country: 'Germany',
            status: 'Online Assessment',
            deadline: dateOffset(7),
            appliedDate: dateOffset(-10),
            salary: 2500,
            url: '',
            notes: 'Case study preparation needed.',
            periodIds: [period1.id, period2.id]
        },
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Siemens',
            roleType: 'Working Student',
            position: 'Working Student Data Science',
            location: 'Erlangen',
            country: 'Germany',
            status: 'Offer',
            deadline: dateOffset(-3),
            appliedDate: dateOffset(-30),
            salary: 1400,
            url: '',
            notes: 'Offer received! Review contract details.',
            periodIds: [period3.id]
        },
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'BMW Group',
            roleType: 'Working Student',
            position: 'Working Student Software Development',
            location: 'Munich',
            country: 'Germany',
            status: 'Rejected',
            deadline: dateOffset(-15),
            appliedDate: dateOffset(-40),
            salary: 1200,
            url: '',
            notes: 'Rejected after first interview round.',
            periodIds: [period3.id]
        },
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Allianz',
            roleType: 'Working Student',
            position: 'Working Student Product Management',
            location: 'Munich',
            country: 'Germany',
            status: 'Wishlist',
            deadline: dateOffset(14),
            appliedDate: '',
            salary: 1100,
            url: '',
            notes: 'Still working on cover letter.',
            periodIds: []
        },
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'SAP',
            roleType: 'Internship',
            position: 'UX Design Intern',
            location: 'Walldorf',
            country: 'Germany',
            status: 'Applied',
            deadline: dateOffset(10),
            appliedDate: dateOffset(-7),
            salary: 1500,
            url: 'https://www.sap.com/careers',
            notes: 'Applied via career portal. Portfolio attached.',
            periodIds: [period1.id]
        },
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Porsche',
            roleType: 'Internship',
            position: 'Marketing Intern',
            location: 'Stuttgart',
            country: 'Germany',
            status: 'Wishlist',
            deadline: dateOffset(20),
            appliedDate: '',
            salary: 1300,
            url: '',
            notes: 'Application opens next week.',
            periodIds: [period1.id]
        },
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Deutsche Bank',
            roleType: 'Internship',
            position: 'Finance Intern',
            location: 'Frankfurt',
            country: 'Germany',
            status: 'Interview',
            deadline: dateOffset(-1),
            appliedDate: dateOffset(-25),
            salary: 2000,
            url: '',
            notes: 'Second round interview next Monday. Prepare case.',
            periodIds: [period2.id]
        },
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Daimler Truck',
            roleType: 'Working Student',
            position: 'Working Student Supply Chain',
            location: 'Stuttgart',
            country: 'Germany',
            status: 'Applied',
            deadline: dateOffset(5),
            appliedDate: dateOffset(-3),
            salary: 1250,
            url: '',
            notes: 'Applied through LinkedIn.',
            periodIds: [period3.id]
        },
        // Grossbritannien
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Goldman Sachs',
            roleType: 'Internship',
            position: 'Summer Analyst — Investment Banking',
            location: 'London',
            country: 'United Kingdom',
            status: 'Applied',
            deadline: dateOffset(12),
            appliedDate: dateOffset(-8),
            salary: 3500,
            url: 'https://www.goldmansachs.com/careers/',
            notes: 'Summer analyst program. Very competitive.',
            periodIds: [period1.id, period5.id]
        },
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Deloitte',
            roleType: 'Internship',
            position: 'Consulting Intern',
            location: 'London',
            country: 'United Kingdom',
            status: 'Online Assessment',
            deadline: dateOffset(6),
            appliedDate: dateOffset(-14),
            salary: 2200,
            url: '',
            notes: 'Numerical reasoning + verbal test pending.',
            periodIds: [period1.id]
        },
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Amazon',
            roleType: 'Internship',
            position: 'Software Development Engineer Intern',
            location: 'London',
            country: 'United Kingdom',
            status: 'Wishlist',
            deadline: dateOffset(30),
            appliedDate: '',
            salary: 4000,
            url: 'https://www.amazon.jobs',
            notes: 'Need to prepare for LeetCode interviews.',
            periodIds: [period5.id]
        },
        // Schweiz
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'UBS',
            roleType: 'Internship',
            position: 'Finance Intern — Wealth Management',
            location: 'Zurich',
            country: 'Switzerland',
            status: 'Applied',
            deadline: dateOffset(9),
            appliedDate: dateOffset(-6),
            salary: 3200,
            url: '',
            notes: 'Applied for the spring intern cohort.',
            periodIds: [period4.id]
        },
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Nestlé',
            roleType: 'Internship',
            position: 'Marketing Intern',
            location: 'Vevey',
            country: 'Switzerland',
            status: 'Rejected',
            deadline: dateOffset(-20),
            appliedDate: dateOffset(-45),
            salary: 2700,
            url: '',
            notes: 'No feedback given.',
            periodIds: [period4.id]
        },
        // Niederlande
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'ASML',
            roleType: 'Internship',
            position: 'Systems Engineering Intern',
            location: 'Eindhoven',
            country: 'Netherlands',
            status: 'Interview',
            deadline: dateOffset(4),
            appliedDate: dateOffset(-20),
            salary: 1800,
            url: 'https://www.asml.com/en/careers',
            notes: 'Technical interview scheduled. Review control systems.',
            periodIds: [period2.id, period5.id]
        },
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Booking.com',
            roleType: 'Working Student',
            position: 'Data Analyst Working Student',
            location: 'Amsterdam',
            country: 'Netherlands',
            status: 'Applied',
            deadline: dateOffset(16),
            appliedDate: dateOffset(-4),
            salary: 2100,
            url: 'https://careers.booking.com',
            notes: 'Remote-friendly position.',
            periodIds: [period3.id]
        },
        // USA
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Google',
            roleType: 'Internship',
            position: 'Software Engineering Intern',
            location: 'New York',
            country: 'United States',
            status: 'Wishlist',
            deadline: dateOffset(45),
            appliedDate: '',
            salary: 7000,
            url: 'https://careers.google.com',
            notes: 'Dream company. Need strong algorithms preparation.',
            periodIds: [period5.id]
        },
        // Österreich
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Red Bull',
            roleType: 'Internship',
            position: 'Brand Management Intern',
            location: 'Salzburg',
            country: 'Austria',
            status: 'Applied',
            deadline: dateOffset(8),
            appliedDate: dateOffset(-9),
            salary: 1600,
            url: '',
            notes: 'Exciting brand. Good culture fit.',
            periodIds: [period1.id]
        },
        // Frankreich
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'L\'Oréal',
            roleType: 'Internship',
            position: 'Digital Marketing Intern',
            location: 'Paris',
            country: 'France',
            status: 'Wishlist',
            deadline: dateOffset(25),
            appliedDate: '',
            salary: 1700,
            url: '',
            notes: 'French language skills required — need to check.',
            periodIds: [period4.id]
        },
        // Spanien
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Banco Santander',
            roleType: 'Internship',
            position: 'FinTech Intern',
            location: 'Madrid',
            country: 'Spain',
            status: 'Rejected',
            deadline: dateOffset(-12),
            appliedDate: dateOffset(-35),
            salary: 1100,
            url: '',
            notes: 'Rejected at CV screening stage.',
            periodIds: []
        },
        // Irland
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Accenture',
            roleType: 'Working Student',
            position: 'Technology Consulting Working Student',
            location: 'Dublin',
            country: 'Ireland',
            status: 'Online Assessment',
            deadline: dateOffset(11),
            appliedDate: dateOffset(-12),
            salary: 1900,
            url: '',
            notes: 'Cognitive ability test scheduled for next week.',
            periodIds: [period3.id, period4.id]
        }
    ];

    await dataService.writeApplications(sampleApplications);
    console.log('✓ ' + sampleApplications.length + ' Bewerbungen erstellt');

    // --- Fertig ---
    console.log('');
    console.log('===========================================');
    console.log('  Testdaten erfolgreich eingefügt!');
    console.log('');
    console.log('  Login mit:');
    console.log('    Username: demo');
    console.log('    Password: demo1234');
    console.log('===========================================');
}

seedData().catch(function (error) {
    console.error('Fehler:', error);
});
