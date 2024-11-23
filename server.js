import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const groq = new Groq({
    apiKey: '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'
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/chat', async (req, res) => {
    try {
        const { message, responseLength } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let maxTokens = 300;
        if (responseLength === 'short') maxTokens = 100;
        if (responseLength === 'long') maxTokens = 500;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            model: "mixtral-8x7b-32768",
            temperature: 0.7,
            max_tokens: maxTokens,
            top_p: 1,
            stream: false
        });

        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
