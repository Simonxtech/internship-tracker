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

    // --- 2. Zeiträume (Tags) erstellen ---
    console.log('Erstelle Zeiträume/Tags...');

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
        name: 'Gap Year',
        color: '#10b981'
    };

    const period5 = {
        id: helpers.generateUniqueId(),
        userId: userId,
        name: 'Voluntary Internship',
        color: '#ef4444'
    };

    const allPeriods = [period1, period2, period3, period4, period5];
    await dataService.writePeriods(allPeriods);
    console.log('✓ 5 Zeiträume erstellt');

    // --- 3. Hilfsfunktion für Datum-Berechnung ---
    function dateOffset(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().slice(0, 10);
    }

    // --- 4. Beispiel-Bewerbungen erstellen (20+) mit realistischen Daten ---
    console.log('Erstelle 20+ Bewerbungen mit realistischen Daten...');

    const sampleApplications = [
        // GERMANY — Stuttgart
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

        // GERMANY — Munich
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

        // GERMANY — Hamburg
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

        // GERMANY — Erlangen
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

        // GERMANY — Frankfurt
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Deutsche Bank',
            roleType: 'Internship',
            position: 'Investment Banking Analyst',
            location: 'Frankfurt',
            country: 'Germany',
            status: 'Wishlist',
            deadline: dateOffset(25),
            appliedDate: '',
            salary: 3000,
            url: 'https://careers.db.com',
            notes: 'Interested but not applied yet. Good salary.',
            periodIds: [period1.id]
        },

        // GERMANY — Berlin
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'SoundCloud',
            roleType: 'Internship',
            position: 'Product Management Intern',
            location: 'Berlin',
            country: 'Germany',
            status: 'Rejected',
            deadline: dateOffset(-10),
            appliedDate: dateOffset(-35),
            salary: 1600,
            url: '',
            notes: 'Application rejected. Timing was not good.',
            periodIds: [period1.id]
        },

        // GERMANY — Düsseldorf
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'ThyssenKrupp',
            roleType: 'Working Student',
            position: 'Working Student Engineering',
            location: 'Düsseldorf',
            country: 'Germany',
            status: 'Applied',
            deadline: dateOffset(14),
            appliedDate: dateOffset(-8),
            salary: 1350,
            url: '',
            notes: 'Waiting for interview invitation.',
            periodIds: [period3.id]
        },

        // GERMANY — Cologne
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'DocuSign',
            roleType: 'Internship',
            position: 'Marketing Intern',
            location: 'Cologne',
            country: 'Germany',
            status: 'Wishlist',
            deadline: dateOffset(20),
            appliedDate: '',
            salary: 1500,
            url: 'https://www.docusign.de/careers',
            notes: 'Tech company, great culture.',
            periodIds: [period1.id]
        },

        // GERMANY — Walldorf
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'SAP',
            roleType: 'Internship',
            position: 'Business Technology Intern',
            location: 'Walldorf',
            country: 'Germany',
            status: 'Online Assessment',
            deadline: dateOffset(5),
            appliedDate: dateOffset(-15),
            salary: 2200,
            url: '',
            notes: 'Large global company. Tough interview process.',
            periodIds: [period2.id]
        },

        // GERMANY — Heidelberg
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Heidelberg University',
            roleType: 'Working Student',
            position: 'Research Assistant',
            location: 'Heidelberg',
            country: 'Germany',
            status: 'Offer',
            deadline: dateOffset(-5),
            appliedDate: dateOffset(-20),
            salary: 450,
            url: '',
            notes: 'Research position in Computer Science.',
            periodIds: [period5.id]
        },

        // UK — London
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Goldman Sachs',
            roleType: 'Internship',
            position: 'Summer Analyst',
            location: 'London',
            country: 'United Kingdom',
            status: 'Interview',
            deadline: dateOffset(15),
            appliedDate: dateOffset(-40),
            salary: 3500,
            url: 'https://www.goldmansachs.com/careers/',
            notes: 'First phone interview scheduled. Prepare case studies.',
            periodIds: [period1.id, period4.id]
        },

        // UK — London (another)
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Deloitte UK',
            roleType: 'Internship',
            position: 'Consulting Intern',
            location: 'London',
            country: 'United Kingdom',
            status: 'Applied',
            deadline: dateOffset(30),
            appliedDate: dateOffset(-12),
            salary: 2800,
            url: '',
            notes: 'Applied last week. Still waiting for response.',
            periodIds: [period1.id]
        },

        // Switzerland — Zurich
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'UBS',
            roleType: 'Internship',
            position: 'Wealth Management Intern',
            location: 'Zurich',
            country: 'Switzerland',
            status: 'Wishlist',
            deadline: dateOffset(45),
            appliedDate: '',
            salary: 3200,
            url: 'https://www.ubs.com/careers/',
            notes: 'High salary but competitive. Need to improve skills first.',
            periodIds: [period4.id]
        },

        // Switzerland — Zurich (another)
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Switzerland Tourism Board',
            roleType: 'Internship',
            position: 'Digital Marketing Intern',
            location: 'Zurich',
            country: 'Switzerland',
            status: 'Rejected',
            deadline: dateOffset(-15),
            appliedDate: dateOffset(-45),
            salary: 2000,
            url: '',
            notes: 'Did not advance to interview stage.',
            periodIds: [period1.id]
        },

        // Netherlands — Amsterdam
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Adyen',
            roleType: 'Internship',
            position: 'Engineering Intern',
            location: 'Amsterdam',
            country: 'Netherlands',
            status: 'Online Assessment',
            deadline: dateOffset(10),
            appliedDate: dateOffset(-18),
            salary: 2400,
            url: 'https://www.adyen.com/careers/',
            notes: 'Fintech company. Technical assessment coming up.',
            periodIds: [period2.id]
        },

        // Netherlands — Amsterdam (another)
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'ING Netherlands',
            roleType: 'Internship',
            position: 'Finance Intern',
            location: 'Amsterdam',
            country: 'Netherlands',
            status: 'Applied',
            deadline: dateOffset(20),
            appliedDate: dateOffset(-7),
            salary: 2100,
            url: '',
            notes: 'Large banking group with good training programs.',
            periodIds: [period1.id]
        },

        // GERMANY — More applications
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Otto Group',
            roleType: 'Working Student',
            position: 'Supply Chain Associate',
            location: 'Hamburg',
            country: 'Germany',
            status: 'Interview',
            deadline: dateOffset(8),
            appliedDate: dateOffset(-22),
            salary: 1300,
            url: '',
            notes: 'Interview with department manager scheduled for next week.',
            periodIds: [period3.id]
        },

        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'BASF',
            roleType: 'Internship',
            position: 'Chemistry Intern',
            location: 'Ludwigshafen',
            country: 'Germany',
            status: 'Wishlist',
            deadline: dateOffset(60),
            appliedDate: '',
            salary: 1500,
            url: 'https://www.basf.com/careers/',
            notes: 'Working in chemical industry. Need to verify qualification.',
            periodIds: [period5.id]
        },

        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Lufthansa',
            roleType: 'Internship',
            position: 'Corporate Strategy Intern',
            location: 'Frankfurt',
            country: 'Germany',
            status: 'Online Assessment',
            deadline: dateOffset(12),
            appliedDate: dateOffset(-20),
            salary: 1800,
            url: '',
            notes: 'Large aviation company. Assessment includes case studies.',
            periodIds: [period1.id]
        },

        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Zalando',
            roleType: 'Internship',
            position: 'Data Analytics Intern',
            location: 'Berlin',
            country: 'Germany',
            status: 'Rejected',
            deadline: dateOffset(-8),
            appliedDate: dateOffset(-50),
            salary: 2000,
            url: '',
            notes: 'Did not qualify for this round. Can try again next year.',
            periodIds: [period1.id]
        },

        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Infineon',
            roleType: 'Internship',
            position: 'Hardware Engineering Intern',
            location: 'Munich',
            country: 'Germany',
            status: 'Applied',
            deadline: dateOffset(35),
            appliedDate: dateOffset(-3),
            salary: 2600,
            url: 'https://www.infineon.com/careers/',
            notes: 'Semiconductor company. Just applied.',
            periodIds: [period2.id]
        },

        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Daimler',
            roleType: 'Working Student',
            position: 'Automotive Engineering',
            location: 'Stuttgart',
            country: 'Germany',
            status: 'Wishlist',
            deadline: dateOffset(90),
            appliedDate: '',
            salary: 1700,
            url: 'https://careers.daimler.com',
            notes: 'Luxury automotive manufacturer. Worth applying.',
            periodIds: [period3.id, period4.id]
        }
    ];

    // --- 5. Alle Bewerbungen speichern ---
    await dataService.writeApplications(sampleApplications);
    console.log('✓ ' + sampleApplications.length + ' Bewerbungen erstellt');

    // --- Erfolg-Nachricht ---
    console.log('');
    console.log('===========================================');
    console.log('Seed-Daten erfolgreich eingefügt!');
    console.log('');
    console.log('Login-Daten:');
    console.log('  Username: demo');
    console.log('  Password: demo1234');
    console.log('');
    console.log('Server starten: node server.js');
    console.log('Dann öffnen: http://localhost:8080');
    console.log('===========================================');
}

seedData().catch(function (error) {
    console.error('Fehler:', error);
});
