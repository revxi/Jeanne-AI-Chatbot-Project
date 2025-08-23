const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const historyDirPath = path.join(__dirname, '..', 'data', 'history');

// Ensure the history directory exists
const ensureHistoryDir = async () => {
  try {
    await fs.access(historyDirPath);
  } catch {
    await fs.mkdir(historyDirPath, { recursive: true });
  }
};
ensureHistoryDir();

// Helper to get the user's history file path
const getUserHistoryPath = (userId) => {
  // Sanitize userId to prevent path traversal issues
  const safeUserId = path.basename(userId);
  return path.join(historyDirPath, `${safeUserId}.json`);
};

exports.sendMessage = async (req, res) => {
  try {
    const { message, role } = req.body;
    const userId = req.user.uid; // Get UID from our auth middleware
    const userHistoryPath = getUserHistoryPath(userId);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const chat = model.startChat({
      history: [{ role: 'user', parts: [{ text: `You are a ${role}.` }] }],
      generationConfig: { maxOutputTokens: 200 },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const reply = response.text();
    
    // Read user's existing history
    let userHistory = [];
    try {
      const data = await fs.readFile(userHistoryPath, 'utf8');
      userHistory = JSON.parse(data);
    } catch (error) {
      // File doesn't exist, start with empty history
    }

    // Add new messages and save
    const userMessage = { sender: "user", text: message, timestamp: new Date().toISOString(), id: Date.now() };
    const botMessage = { sender: "bot", text: reply, timestamp: new Date().toISOString(), id: Date.now() + 1 };
    userHistory.push(userMessage, botMessage);
    await fs.writeFile(userHistoryPath, JSON.stringify(userHistory, null, 2));

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userHistoryPath = getUserHistoryPath(userId);

    let history = [];
    try {
        const data = await fs.readFile(userHistoryPath, 'utf8');
        history = JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, it means no history, which is fine
    }
    
    res.json({ history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
};