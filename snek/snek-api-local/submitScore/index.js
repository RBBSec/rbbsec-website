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
    const { fullName, leaderboardName, playerEmail, score, consentCheckbox } = req.body;

    if (!fullName || !leaderboardName || typeof score !== 'number' || score <= 0 || !consentCheckbox) {
        context.res = {
            status: 400,
            body: 'Please provide fullName, leaderboardName, a valid score (>0), and consentCheckbox.',
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
