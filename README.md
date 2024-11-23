# IzhyAI Chat

A modern, responsive AI chat interface powered by Groq's Llama3 model. Features a beautiful UI with smooth animations and real-time interactions.

## Features

- Modern UI with gradient themes and 3D effects
- Real-time chat with typing indicators
- Adjustable response lengths (short/medium/long)
- Response regeneration capability
- One-click message copying
- Smooth animations and transitions
- Fully responsive design

## Tech Stack

- Backend:
  - Node.js
  - Express
  - Groq AI (Llama3-8b-8192 model)
- Frontend:
  - Vanilla JavaScript
  - Modern CSS3
  - HTML5

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/izhyai-chat.git
cd izhyai-chat
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Groq API key:
```
GROQ_API_KEY=your_api_key_here
```

4. Start the server:
```bash
node server.js
```

5. Open `http://localhost:3000` in your browser

## Environment Variables

- `GROQ_API_KEY` - Your Groq API key
- `PORT` - Server port (default: 3000)

## License

MIT License - feel free to use this project for any purpose.

## Author

Muhammad Izhaan
