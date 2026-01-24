const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const quotedPrintable = require("quoted-printable");

// LOCAL token.json path
const TOKEN_PATH = path.join(__dirname, 'token.json');

// LOCAL ONLY: request new OAuth token
async function requestNewToken(auth) {
    const url = auth.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    });

    console.log(`gmail.js: 🔑 Open this URL to authenticate:\n${url}`);

    return new Promise((resolve) => {
        const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
        rl.question("gmail.js: 🔑 Enter the authorization code: ", async (code) => {
            try {
                const { tokens } = await auth.getToken(code);
                auth.setCredentials(tokens);

                if (!tokens.refresh_token) {
                    throw new Error("gmail.js: ##ERROR: No refresh token received.");
                }

                fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
                console.log("gmail.js: ##VALIDATED: Authentication successful!");
                rl.close();
                resolve(auth);
            } catch (error) {
                console.error("gmail.js: ##ERROR retrieving token:", error);
                rl.close();
                resolve(null);
            }
        });
    });
}

// CLOUD + LOCAL unified authenticate()
async function authenticate() {
    const auth = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        "urn:ietf:wg:oauth:2.0:oob"
    );

    // CLOUD MODE: use refresh token from env
    if (process.env.REFRESH_TOKEN) {
        auth.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        });
        return auth;
    }

    // LOCAL MODE: use token.json
    if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
        auth.setCredentials(token);
        return auth;
    }

    // LOCAL MODE: need to authenticate manually
    return await requestNewToken(auth);
}

// Helper to extract email body
function extractEmailBody(payload) {
    if (!payload) return null;

    if (payload.body?.data) {
        let decodedBody = Buffer.from(payload.body.data, 'base64').toString();
        if (decodedBody.includes("=")) decodedBody = quotedPrintable.decode(decodedBody);
        return decodedBody;
    }

    if (payload.parts) {
        for (const part of payload.parts) {
            const body = extractEmailBody(part);
            if (body) return body;
        }
    }

    return null;
}

// Main Gmail fetcher
async function getLatestEmail(auth) {
    if (!auth) {
        console.error("gmail.js: ##ERROR: AUTH FAILED.");
        return null;
    }

    const gmail = google.gmail({ version: 'v1', auth });
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const query = `after:${fiveDaysAgo} from:noreply@steampowered.com subject:"Your Steam account: Access from new"`;

    try {
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 10,
        });

        if (!response.data.messages?.length) {
            return { subject: "No matching emails", body: "None in last 5 days" };
        }

        const sortedEmails = await Promise.all(response.data.messages.map(async (msg) => {
            const msgDetails = await gmail.users.messages.get({ userId: 'me', id: msg.id });
            return {
                msgDetails,
                timestamp: parseInt(msgDetails.data.internalDate, 10)
            };
        }));

        sortedEmails.sort((a, b) => b.timestamp - a.timestamp);
        let latestEmail = sortedEmails[0].msgDetails;

        const subjectHeader = latestEmail.data.payload.headers.find(h => h.name === "Subject");
        const subject = subjectHeader ? subjectHeader.value : "No Subject";

        const emailBodyRaw = extractEmailBody(latestEmail.data.payload);
        if (!emailBodyRaw) return { subject, body: "Email body not available." };

        const startIndex = emailBodyRaw.indexOf("Login Code");
        const endIndex = emailBodyRaw.indexOf("If this wasn't you");
        const loginCode = (startIndex !== -1 && endIndex !== -1)
            ? emailBodyRaw.slice(startIndex, endIndex).trim()
            : "Login Code not found.";

        const usernameStart = emailBodyRaw.indexOf("Dear ");
        const usernameEnd = emailBodyRaw.indexOf(",", usernameStart);
        const steamUsername = (usernameStart !== -1 && usernameEnd !== -1)
            ? emailBodyRaw.slice(usernameStart + 5, usernameEnd).trim()
            : "Username not found.";

        return { subject, body: `Username: ${steamUsername}\n${loginCode}` };

    } catch (error) {
        console.error("gmail.js: ##ERROR FETCHING EMAILS:", error);
        return { subject: "Error retrieving email", body: "N/A" };
    }
}

module.exports = { authenticate, getLatestEmail };