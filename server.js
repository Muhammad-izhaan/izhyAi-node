import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Check if API key is available
if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in environment variables');
    process.exit(1);
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Serve static files
app.use(express.static(join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', apiKeyPresent: !!process.env.GROQ_API_KEY });
});

app.post('/chat', async (req, res) => {
    try {
        const { message, responseLength } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                error: 'Message is required' 
            });
        }

        let maxTokens;
        switch(responseLength) {
            case 'short':
                maxTokens = 100;
                break;
            case 'medium':
                maxTokens = 300;
                break;
            case 'long':
                maxTokens = 500;
                break;
            default:
                maxTokens = 300;
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful and knowledgeable AI assistant. Provide clear, accurate, and engaging responses."
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

        if (!completion.choices || !completion.choices[0]) {
            throw new Error('No response from Groq API');
        }

        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error in /chat endpoint:', error);
        
        res.status(500).json({ 
            error: 'Error processing request',
            details: error.message
        });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('API Key status:', process.env.GROQ_API_KEY ? 'Present' : 'Missing');
});
