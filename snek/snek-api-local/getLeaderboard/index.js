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
        // Fetch all scores, ordered by score descending
        const snapshot = await scoresRef.orderBy('score', 'desc').get();
        
        const uniqueLeaderboard = new Map(); // Map to store highest score per email

        snapshot.forEach(doc => {
            const data = doc.data();
            const playerEmail = data.playerEmail; // Assuming playerEmail is stored

            // If this email is not yet in the map, or if this score is higher
            if (playerEmail && (!uniqueLeaderboard.has(playerEmail) || data.score > uniqueLeaderboard.get(playerEmail).score)) {
                uniqueLeaderboard.set(playerEmail, {
                    leaderboardName: data.leaderboardName,
                    score: data.score,
                    // You might want to include other fields here if needed by frontend
                });
            }
        });

        // Convert map values to an array, sort by score, and take top 10
        const finalLeaderboard = Array.from(uniqueLeaderboard.values())
                                    .sort((a, b) => b.score - a.score)
                                    .slice(0, 10);

        context.res = {
            status: 200,
            body: finalLeaderboard,
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