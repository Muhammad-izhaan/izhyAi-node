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

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store conversation history
let conversationHistory = [];

app.post('/chat', async (req, res) => {
    try {
        const { message, responseLength } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                error: 'Message is required' 
            });
        }

        // Configure max tokens based on response length
        let maxTokens;
        let systemInstruction;
        switch(responseLength) {
            case 'short':
                maxTokens = 100;
                systemInstruction = "Provide a very brief, concise response in 1-2 sentences maximum.";
                break;
            case 'medium':
                maxTokens = 300;
                systemInstruction = "Provide a balanced response in 2-4 sentences.";
                break;
            case 'long':
                maxTokens = 500;
                systemInstruction = "Provide a detailed response but stay focused on the main points.";
                break;
            default:
                maxTokens = 300;
                systemInstruction = "Provide a balanced response in 2-4 sentences.";
        }

        // Add user message to conversation history
        conversationHistory.push({
            role: "user",
            content: message
        });

        // Add length preference to system message
        const systemMessage = {
            role: "system",
            content: systemInstruction
        };

        const completion = await groq.chat.completions.create({
            messages: [systemMessage, ...conversationHistory],
            model: "llama3-8b-8192",
            temperature: 0.7,
            max_tokens: maxTokens,
            top_p: 1,
            stream: false,
        });

        if (!completion.choices || !completion.choices[0]) {
            throw new Error('No response from Groq API');
        }

        const response = completion.choices[0].message.content;
        
        // Add AI response to conversation history
        conversationHistory.push({
            role: "assistant",
            content: response
        });

        res.json({ response });
    } catch (error) {
        console.error('Error in /chat endpoint:', error);
        
        // Send a more detailed error message
        res.status(500).json({ 
            error: 'Error processing request',
            details: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('API Key status:', process.env.GROQ_API_KEY ? 'Present' : 'Missing');
});
