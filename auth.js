const { google } = require('googleapis');
const fs = require('fs');   // <-- missing import
const path = require('path');

// Use /tmp in cloud, __dirname locally
const CREDENTIALS_PATH = process.env.KOYEB
    ? path.join('/tmp', 'credentials.json')
    : path.join(__dirname, 'credentials.json');

// If provided via environment variable, write to /tmp/credentials.json
if (process.env.CREDENTIALS_JSON) {
    fs.writeFileSync(CREDENTIALS_PATH, process.env.CREDENTIALS_JSON);
    console.log("gmail.js: ##WARN: cloud credentials detected, using specified variable");
}

async function authenticate() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: CREDENTIALS_PATH,
            scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
        });
        console.log("auth.js: ##✅ Google OAuth authentication successful.");
        return auth;
    } catch (error) {
        console.error("auth.js: ##ERROR: Google OAuth authentication failed:", error);
        return null;
    }
}

module.exports = authenticate;
