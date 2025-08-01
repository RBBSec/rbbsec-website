const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

const db = getFirestore();
const scoresRef = db.collection('leaderboard');

module.exports = async function (context, req) {
    context.log('Received request body:', req.body);
    const { fullName, leaderboardName, playerEmail, score, consentCheckbox, duration, lastMoves } = req.body;

    // Basic validation for new fields
    if (typeof duration !== 'number' || duration < 1) {
        context.res = {
            status: 400,
            body: 'Invalid duration.',
        };
        return;
    }

    if (!Array.isArray(lastMoves) || lastMoves.length === 0) {
        context.res = {
            status: 400,
            body: 'Invalid or empty lastMoves.',
        };
        return;
    }

    if (!fullName || !leaderboardName || typeof score !== 'number' || score <= 0 || score > 100 || !consentCheckbox) {
        context.res = {
            status: 400,
            body: 'Please provide fullName, leaderboardName, a valid score (0-100), and consentCheckbox.',
        };
        return;
    }

    // Full Name validation
    const nameRegex = /^[a-zA-Z\u00C0-\u017F' -]+$/;
    const words = fullName.trim().split(/\s+/).filter(word => word.length > 0);
    if (!nameRegex.test(fullName)) {
        context.res = {
            status: 400,
            body: "Full Name contains invalid characters. Please use letters, spaces, hyphens (-), or apostrophes (').",
        };
        return;
    }
    if (words.length < 2 || words.length > 3) {
        context.res = {
            status: 400,
            body: 'Please provide a full name with 2 to 3 words.',
        };
        return;
    }

    // Server-side email validation
    const emailRegex = /^[^
\s@]+@[^\s@]+\.[^\s@]+$/;
    if (playerEmail && !emailRegex.test(playerEmail)) {
        context.res = {
            status: 400,
            body: 'Invalid email address format.',
        };
        return;
    }

    try {
        const dataToSubmit = {
            fullName,
            leaderboardName,
            playerEmail,
            score,
            consentCheckbox,
            duration,
            lastMoves,
            createdAt: FieldValue.serverTimestamp(),
        };
        context.log('Data being submitted to Firestore:', dataToSubmit);

        await scoresRef.add(dataToSubmit);

        context.res = {
            status: 200,
            body: { message: 'Score submitted successfully!' },
        };
    } catch (err) {
        context.log.error('Error writing to Firestore:', err.stack || err.message);
        context.res = {
            status: 500,
            body: 'Failed to submit score to Firestore.',
        };
    }
};
