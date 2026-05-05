//
const fetch = require("node-fetch");
const WEBHOOK_URL = process.env.GMAIL_PROXY_URL;

async function getSteamCode() {
    if (!WEBHOOK_URL) {
        console.error("gmailProxy.js: ##ERROR: Missing GMAIL_PROXY_URL");
        return { ok: false, message: "Proxy not configured" };
    }

    const params = new URLSearchParams({
        action: "getSteamCode"
    });

    let res;
    try {
        res = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        });
    } catch (err) {
        console.error("gmailProxy.js: ##ERROR: Failed to reach Apps Script:", err);
        return { ok: false, message: "Failed to reach Gmail proxy" };
    }

    const text = await res.text();

    let data;
    try {
        data = JSON.parse(text);
    } catch {
        console.error("gmailProxy.js: ##ERROR: Invalid JSON from Apps Script:", text);
        return { ok: false, message: "Invalid JSON from Gmail proxy" };
    }

    if (!data.ok) {
        console.warn("gmailProxy.js: ##WARNING: Proxy returned empty:", data.message);
        return { ok: false, message: data.message || "Proxy returned error" };
    }

    if (!data.username || data.username === "Username not found") {
        console.warn("gmailProxy.js: ##WARNING: Username missing in email");
        return { ok: false, message: "Username missing in email" };
    }

    if (!data.code || data.code === "Code not found") {
        console.warn("gmailProxy.js: ##WARNING: Steam code missing in email");
        return { ok: false, message: "Steam code missing in email" };
    }

    return {
        ok: true,
        username: data.username,
        code: data.code
    };
}

module.exports = { getSteamCode };