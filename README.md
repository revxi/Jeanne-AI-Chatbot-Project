# Jeanne AI Chatbot Project

A full-stack AI chatbot application built with React (frontend) and Node.js/Express (backend), powered by OpenAI's GPT model.

## Project Structure

```
ai-chatbot/
├── client/                 # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # Backend (Node.js + Express)
│   ├── controllers/
│   │   └── chatController.js
│   ├── routes/
│   │   └── chat.js
│   ├── server.js
│   └── package.json
├── .env                    # Environment variables (keep this secure)
├── .gitignore
├── package.json            # Root package.json for scripts
└── README.md
```

## ✨ Features

- 🤖 AI-powered chatbot using OpenAI GPT-3.5-turbo
- 🎙️ Voice input support
- 🔊 Text-to-speech responses
- 💾 Chat history persistence
- 🎭 Multiple personality modes (Friendly Assistant, Teacher, Funny Friend)
- 📱 Responsive design

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Jeanne-AI-Chatbot-Project
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   Or install individually:
   ```bash
   npm install
   npm run install:server
   npm run install:client
   ```

3. **Set up environment variables**
   - Copy the `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   PORT=5000
   ```

### Running the Application

#### Development Mode (Both client and server)
```bash
npm run dev
```

#### Run individually
```bash
# Start server only
npm run server:dev

# Start client only
npm run client:dev
```

#### Production Mode
```bash
# Build client
npm run client:build

# Start server
npm run server:start
```

### URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## API Endpoints

### POST /api/chat
Send a message to the chatbot.

**Request Body:**
```json
{
  "message": "Hello, how are you?",
  "role": "friendly assistant"
}
```

**Response:**
```json
{
  "reply": "Hello! I'm doing great, thank you for asking. How can I help you today?"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `PORT` | Server port number | 5000 |

## Technologies Used

### Frontend
- React 18
- Vite
- Axios for API calls
- CSS3

### Backend
- Node.js
- Express.js
- OpenAI API
- CORS
- dotenv

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**: Make sure your API key is correctly set in the `.env` file
2. **CORS Issues**: The server is configured to accept requests from the frontend
3. **Port Conflicts**: Change the port in the `.env` file if 5000 is already in use

### Getting Help

If you encounter any issues, please check:
- Console logs in both frontend and backend
- Network tab in browser developer tools
- Server logs for detailed error messages
