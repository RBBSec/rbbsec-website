const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

const db = getFirestore();
const scoresRef = db.collection('leaderboard');

module.exports = async function (context, req) {
    try {
        const snapshot = await scoresRef.orderBy('score', 'desc').limit(10).get();
        const leaderboard = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            leaderboard.push({
                leaderboardName: data.leaderboardName,
                score: data.score
            });
        });

        context.res = {
            status: 200,
            body: leaderboard,
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (err) {
        context.log.error('Error reading from Firestore:', err.stack || err.message);
        context.res = {
            status: 500,
            body: 'Failed to retrieve leaderboard',
        };
    }
};