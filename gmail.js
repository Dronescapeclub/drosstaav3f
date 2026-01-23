const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const striptags = require("striptags");
const quotedPrintable = require("quoted-printable");

// Use /tmp in cloud, __dirname locally
const TOKEN_PATH = process.env.KOYEB
    ? path.join('/tmp', 'token.json')
    : path.join(__dirname, 'token.json');

// If TOKEN_JSON is provided via environment variable, write it to /tmp/token.json
if (process.env.TOKEN_JSON) {
    fs.writeFileSync(TOKEN_PATH, process.env.TOKEN_JSON);
}

// Function to request new OAuth token manually (only if needed)
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
                    throw new Error("gmail.js: ##ERROR: Authentication failed: No refresh token received.");
                }

                fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
                console.log("gmail.js: ##VALIDATED: Authentication successful! Refresh token saved.");
                rl.close();
                resolve(auth);
            } catch (error) {
                console.error("gmail.js: ##ERROR: Error retrieving token:", error);
                rl.close();
                resolve(null);
            }
        });
    });
}
/*
OLD )Auth2 KEY FUNCTION


// Function to authenticate and refresh OAuth token automatically
async function authenticate() {
    const auth = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        "http://localhost:3000"
    );
    if (fs.existsSync(TOKEN_PATH)) {
        let token;
        try {
            token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
        } catch (err) {
            console.error("gmail.js: ##ERROR: Failed to parse token.json. Raw content:", fs.readFileSync(TOKEN_PATH, 'utf-8'));
            throw err;
        }

        auth.setCredentials(token);

        try {
            const { credentials } = await auth.refreshAccessToken();
            auth.setCredentials(credentials);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(auth.credentials, null, 2));
            console.log("gmail.js: ##VALIDATED: Token refreshed successfully!");
            return auth;
        } catch (error) {
            console.error("gmail.js: ##WARNING: Token refresh failed, requesting manual authentication:", error);
            return await requestNewToken(auth);
        }
    }

    return await requestNewToken(auth);
}
*/
//#####################################################3

async function authenticate() {
    try {
        if (!process.env.GOOGLE_CREDENTIALS_B64) {
            console.error("gmail.js: ##ERROR: Missing GOOGLE_CREDENTIALS_B64");
            return null;
        }

        const decoded = Buffer.from(process.env.GOOGLE_CREDENTIALS_B64, "base64").toString();
        const credentials = JSON.parse(decoded);

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/gmail.readonly"],
        });

        console.log("gmail.js: ##VALIDATED: Service account authentication successful!");
        return auth;
    } catch (error) {
        console.error("gmail.js: ##ERROR: Service account authentication failed:", error);
        return null;
    }
}


// Helper function to extract email body recursively
function extractEmailBody(payload) {
    if (!payload) return null;

    if (payload.body?.data) {
        let decodedBody = Buffer.from(payload.body.data, 'base64').toString();

        // Detect and decode quoted-printable formatting
        if (decodedBody.includes("=")) {
            decodedBody = quotedPrintable.decode(decodedBody);
        }

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

//main function
async function getLatestEmail(auth) {
    if (!auth) {
        console.error("gmail.js: ##ERROR: AUTHENTICATION FAILED. No valid token found.");
        return null;
    }

    const gmail = google.gmail({ version: 'v1', auth });
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const query = `after:${fiveDaysAgo} from:noreply@steampowered.com subject:"Your Steam account: Access from new"`; // ✅ Filters Steam emails

    try {
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 10,
        });

        if (!response.data.messages || response.data.messages.length === 0) {
            console.log("gmail.js: ##ERROR: NO MATCHING STEAM EMAILS FOUND WITHIN LAST 5 DAYS");
            return { subject: "No matching emails found.", body: "No requests within last 5 days" };
        }

        //  Ensure we fetch the latest valid Steam email (standalone or reply)
        const sortedEmails = await Promise.all(response.data.messages.map(async (msg) => {
            const msgDetails = await gmail.users.messages.get({ userId: 'me', id: msg.id });
            const timestamp = parseInt(msgDetails.data.internalDate, 10);
            return { msgDetails, timestamp };
        }));

        sortedEmails.sort((a, b) => b.timestamp - a.timestamp);
        let latestEmail = sortedEmails[0].msgDetails;

        //  Try to locate the latest reply in the thread
        const threadId = latestEmail.data.threadId;
        let threadMessages = await gmail.users.messages.list({ userId: 'me', q: `threadId:${threadId}` });

        if (threadMessages.data?.messages && threadMessages.data.messages.length > 1) {
            const sortedThreadMessages = await Promise.all(threadMessages.data.messages.map(async (msg) => {
                const msgDetails = await gmail.users.messages.get({ userId: 'me', id: msg.id });
                const timestamp = parseInt(msgDetails.data.internalDate, 10);
                return { msgDetails, timestamp };
            }));

            sortedThreadMessages.sort((a, b) => b.timestamp - a.timestamp);
            latestEmail = sortedThreadMessages[0]?.msgDetails || latestEmail;
            console.log("gmail.js: ##LOG: Latest reply in thread found!");
        } else {
            console.log("gmail.js: ##LOG: No replies found, using latest standalone Steam email.");
        }

        // Extract email subject
        const subjectHeader = latestEmail.data.payload.headers.find(header => header.name === "Subject");
        const subject = subjectHeader ? subjectHeader.value : "No Subject";

        // Extract email body
        const emailBodyRaw = extractEmailBody(latestEmail.data.payload);

        if (!emailBodyRaw) {
            console.log("gmail.js: ##ERROR: No email body found.");
            return { subject, body: "Email body not available." };
        }

        // Extract Steam Guard code
        const startIndex = emailBodyRaw.indexOf("Login Code");
        const endIndex = emailBodyRaw.indexOf("If this wasn't you");
        const loginCode = (startIndex !== -1 && endIndex !== -1) 
            ? emailBodyRaw.slice(startIndex, endIndex).trim()
            : "Login Code not found.";

        // Extract Steam username from "Dear dronescape___ ,"
        const usernameStart = emailBodyRaw.indexOf("Dear dronescape");
        const usernameEnd = emailBodyRaw.indexOf(",", usernameStart);
        const steamUsername = (usernameStart !== -1 && usernameEnd !== -1) 
            ? emailBodyRaw.slice(usernameStart + 5, usernameEnd).trim() // "+5" to remove "Dear "
            : "Username not found.";

        console.log(`gmail.js: ##LOG: Latest Steam Guard code retrieved: ${loginCode}`);
        console.log(`gmail.js: ##LOG: Steam Username retrieved: ${steamUsername}`);

        return { subject, body: `Username: ${steamUsername}\n${loginCode}` };
    } catch (error) {
        console.error("gmail.js: ##ERROR: ERROR FETCHING EMAILS:", error);
        return { subject: "Error retrieving email", body: "N/A" };
    }
}




module.exports = { authenticate, getLatestEmail };
