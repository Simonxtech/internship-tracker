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

    // --- 2. Zeiträume erstellen ---
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

    const allPeriods = [period1, period2, period3];
    await dataService.writePeriods(allPeriods);
    console.log('✓ 3 Zeiträume erstellt');

    // --- 3. Beispiel-Bewerbungen erstellen ---
    console.log('Erstelle Bewerbungen...');

    // Hilfsfunktion: Datum relativ zu heute berechnen
    function dateOffset(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().slice(0, 10);
    }

    const sampleApplications = [
        {
            id: helpers.generateUniqueId(),
            userId: userId,
            company: 'Bosch',
            roleType: 'Internship',
            position: 'Software Engineering Intern',
            location: 'Stuttgart',
            status: 'Interview',
            deadline: dateOffset(3),
            appliedDate: dateOffset(-18),
            salary: '1,200€/month',
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
            status: 'Applied',
            deadline: dateOffset(1),
            appliedDate: dateOffset(-5),
            salary: '2,800€/month',
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
            status: 'Online Assessment',
            deadline: dateOffset(7),
            appliedDate: dateOffset(-10),
            salary: '2,500€/month',
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
            status: 'Offer',
            deadline: dateOffset(-3),
            appliedDate: dateOffset(-30),
            salary: '1,400€/month',
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
            status: 'Rejected',
            deadline: dateOffset(-15),
            appliedDate: dateOffset(-40),
            salary: '1,200€/month',
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
            status: 'Wishlist',
            deadline: dateOffset(14),
            appliedDate: '',
            salary: '1,100€/month',
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
            status: 'Applied',
            deadline: dateOffset(10),
            appliedDate: dateOffset(-7),
            salary: '1,500€/month',
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
            status: 'Wishlist',
            deadline: dateOffset(20),
            appliedDate: '',
            salary: '1,300€/month',
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
            status: 'Interview',
            deadline: dateOffset(-1),
            appliedDate: dateOffset(-25),
            salary: '2,000€/month',
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
            status: 'Applied',
            deadline: dateOffset(5),
            appliedDate: dateOffset(-3),
            salary: '1,250€/month',
            url: '',
            notes: 'Applied through LinkedIn.',
            periodIds: [period3.id]
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
