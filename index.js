import Groq from 'groq-sdk';
import say from 'say';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

const groq = new Groq({
    apiKey: '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'
});

// Store conversation history
let conversationHistory = [];
let isListening = false;

async function getChatCompletion(messages) {
    try {
        const completion = await groq.chat.completions.create({
            messages: messages,
            model: "mixtral-8x7b-32768",
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
        });

        return completion.choices[0]?.message?.content || "No response generated";
    } catch (error) {
        console.error('Error getting chat completion:', error);
        return "Sorry, I encountered an error processing your request.";
    }
}

async function speakResponse(text) {
    return new Promise((resolve) => {
        say.speak(text, null, 1.0, (err) => {
            if (err) {
                console.error('Error speaking:', err);
            }
            resolve();
        });
    });
}

async function startListening() {
    const speechConfig = sdk.SpeechConfig.fromSubscription("YOUR_SUBSCRIPTION_KEY", "YOUR_SERVICE_REGION");
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    console.log('Listening... Say something!');

    recognizer.recognizeOnceAsync(async (result) => {
        if (result.text) {
            console.log(`You said: ${result.text}`);

            if (result.text.toLowerCase().includes('exit')) {
                console.log('Goodbye!');
                recognizer.close();
                process.exit(0);
            }

            // Add user message to conversation history
            conversationHistory.push({
                role: "user",
                content: result.text
            });

            // Get AI response
            const response = await getChatCompletion(conversationHistory);
            
            // Add AI response to conversation history
            conversationHistory.push({
                role: "assistant",
                content: response
            });

            console.log('\nAI:', response);
            await speakResponse(response);
            
            // Continue listening
            startListening();
        }
    });
}

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\nGoodbye!');
    process.exit(0);
});

// Start the conversation
console.log('Welcome to Groq Voice Chatbot!');
console.log('Speak your message (Press Ctrl+C to exit)');
startListening();
