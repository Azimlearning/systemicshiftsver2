const functions = require('firebase-functions');

exports.chat = functions.https.onRequest((req, res) => {
    // Basic CORS handling
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // Simple echo bot for now
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).json({ error: 'No message provided.' });
    }

    const botResponse = `You said: ${userMessage}`;

    res.json({ reply: botResponse });
});