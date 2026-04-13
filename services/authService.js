/**
 * =============================================================
 *  services/authService.js — Authentifizierungs-Logik
 * =============================================================
 *
 *  Diese Datei kümmert sich um Login und Registrierung.
 *  Sie prüft Benutzernamen und Passwörter und erstellt neue Accounts.
 *
 *  HINWEIS: Wir hashen Passwörter mit crypto (eingebaut in Node.js).
 *  Das bedeutet: Wir speichern nie das echte Passwort, sondern
 *  einen "Fingerabdruck" davon. Das ist sicherer.
 *
 *  Wird von routes/authRoutes.js benutzt.
 * =============================================================
 */

// --- Node.js Module laden ---
const crypto = require('crypto');

// --- Eigene Module laden ---
const dataService = require('./dataService');
const User = require('../models/User');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');


/**
 * Erzeugt einen Hash (Fingerabdruck) aus einem Passwort.
 * SHA-256 ist ein sicherer Hash-Algorithmus.
 * Der gleiche Input ergibt immer den gleichen Hash,
 * aber aus dem Hash kann man das Passwort nicht zurückrechnen.
 *
 * @param {string} password - Das Klartext-Passwort
 * @param {string} username - Der Username (als "Salt" benutzt)
 * @returns {string} - Der Hash als Hex-String
 */
function hashPassword(password, username) {
    // Wir fügen den Username als "Salt" hinzu damit gleiche Passwörter
    // verschiedene Hashes ergeben
    const stringToHash = username.toLowerCase() + ':' + password + ':internship_tracker_salt';

    // SHA-256 Hash berechnen
    const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');

    return hash;
}


/**
 * Registriert einen neuen Benutzer.
 * Prüft ob der Username noch frei ist und ob das Passwort lang genug ist.
 *
 * @param {string} username - Gewünschter Benutzername
 * @param {string} password - Gewünschtes Passwort
 * @returns {object} - Das neue User-Objekt (ohne Passwort)
 */
async function registerUser(username, password) {
    // --- Eingaben prüfen ---
    if (!username || username.trim().length < 2) {
        throw new Error('Username must be at least 2 characters long.');
    }

    if (!password || password.length < 4) {
        throw new Error('Password must be at least 4 characters long.');
    }

    // --- Alle bestehenden User lesen ---
    const allUsers = await dataService.readUsers();

    // --- Prüfen ob der Username schon existiert ---
    const usernameToCheck = username.trim().toLowerCase();

    let usernameExists = false;
    for (let i = 0; i < allUsers.length; i++) {
        if (allUsers[i].username.toLowerCase() === usernameToCheck) {
            usernameExists = true;
            break;
        }
    }

    if (usernameExists) {
        throw new Error('This username is already taken.');
    }

    // --- Passwort hashen ---
    const passwordHash = hashPassword(password, username.trim());

    // --- Neues User-Objekt erstellen ---
    const newUser = new User({
        username: username.trim(),
        passwordHash: passwordHash
    });

    // --- Zur User-Liste hinzufügen und speichern ---
    allUsers.push(newUser.toJSON());
    await dataService.writeUsers(allUsers);

    // --- Event loggen ---
    logger.emit('userRegistered', { username: newUser.username });

    // --- Sicheres User-Objekt zurückgeben (ohne Passwort-Hash) ---
    return newUser.toSafeJSON();
}


/**
 * Loggt einen Benutzer ein.
 * Prüft ob Username existiert und das Passwort stimmt.
 *
 * @param {string} username - Benutzername
 * @param {string} password - Passwort
 * @returns {object} - Das User-Objekt (ohne Passwort)
 */
async function loginUser(username, password) {
    // --- Eingaben prüfen ---
    if (!username || !password) {
        throw new Error('Username and password are required.');
    }

    // --- Alle User lesen ---
    const allUsers = await dataService.readUsers();

    // --- User suchen ---
    let foundUser = null;
    const usernameToFind = username.trim().toLowerCase();

    for (let i = 0; i < allUsers.length; i++) {
        if (allUsers[i].username.toLowerCase() === usernameToFind) {
            foundUser = allUsers[i];
            break;
        }
    }

    if (!foundUser) {
        throw new Error('Username not found.');
    }

    // --- Passwort prüfen ---
    const passwordHash = hashPassword(password, foundUser.username);

    if (passwordHash !== foundUser.passwordHash) {
        throw new Error('Incorrect password.');
    }

    // --- Event loggen ---
    logger.emit('userLoggedIn', { username: foundUser.username });

    // --- Sicheres User-Objekt zurückgeben (ohne Passwort-Hash) ---
    const userObject = new User(foundUser);
    return userObject.toSafeJSON();
}


// --- Funktionen exportieren ---
module.exports = {
    registerUser,
    loginUser,
    hashPassword
};
