const { addDoc, Timestamp } = require('firebase/firestore');
const { scoresRef } = require('../../firebase');
const axios = require('axios');

module.exports = async function (context, req) {
    const { name, email, score } = req.body || {};

    if (!name || !score) {
        context.res = {
            status: 400,
            body: { message: 'Name and score are required.' }
        };
        return;
    }

    try {
        // 1. Add to Firebase
        await addDoc(scoresRef, {
            name,
            email,
            score,
            createdAt: Timestamp.now()
        });

        // 2. Send to HubSpot (optional if email is provided)
        if (email) {
            const hubspotApiKey = process.env.HUBSPOT_API_KEY;
            const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${process.env.HUBSPOT_PORTAL_ID}/${process.env.HUBSPOT_FORM_ID}`;

            const hubspotData = {
                fields: [
                    { name: 'email', value: email },
                    { name: 'firstname', value: name },
                    { name: 'score__c', value: score } // Optional custom property
                ]
            };

            await axios.post(hubspotUrl, hubspotData, {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        context.res = {
            status: 200,
            body: { message: 'Score and contact saved successfully.' }
        };
    } catch (err) {
        console.error('Submit error:', err.message);
        context.res = {
            status: 500,
            body: { message: 'Something went wrong.' }
        };
    }
};