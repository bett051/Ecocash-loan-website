const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Bulletproof Fix: Search for index.html everywhere and serve it directly!
app.get('/', (req, res) => {
    const possiblePaths = [
        path.join(__dirname, 'public', 'index.html'),
        path.join(__dirname, '(public', 'index.html'),
        path.join(__dirname, 'index.html')
    ];

    let fileSent = false;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            res.sendFile(p);
            fileSent = true;
            break;
        }
    }

    if (!fileSent) {
        res.status(404).send('Error: index.html file could not be found in your GitHub files.');
    }
});

// Secure route that sends data to Telegram
app.post('/api/notify', async (req, res) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    const { fullName, phone, amount, period } = req.body;

    const telegramMessage = `
💰 *New Loan Application Received!*
───────────────────
👤 *Name:* ${fullName}
📞 *Phone:* ${phone}
💵 *Amount:* KSH ${amount}
⏳ *Period:* ${period}
───────────────────
⏱️ *Status:* Client is waiting on the loading screen.
`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: telegramMessage,
                parse_mode: 'Markdown'
            })
        });
        
        const data = await response.json();
        if (data.ok) {
            res.status(200).json({ success: true });
        } else {
            res.status(500).json({ success: false, error: data.description });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
