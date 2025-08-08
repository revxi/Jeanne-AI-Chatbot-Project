const OpenAI = require("openai");

// Add validation for API key
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in environment variables");
  process.exit(1);
}
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const historyPath = path.join(__dirname, '..', 'data', 'chatHistory.json');

const appendToHistory = (entry) => {
  try {
    const data = fs.existsSync(historyPath)
      ? JSON.parse(fs.readFileSync(historyPath, 'utf-8'))
      : [];
    data.push(entry);
    fs.writeFileSync(historyPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to write to chat history:', err);
  }
};


const chatController = {
  async sendMessage(req, res) {
    try {
      const { message, role } = req.body;
    const { message, role } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

      // Validate input
      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!role) {
        return res.status(400).json({ error: "Role is required" });
      }

      console.log("Received request:", {
        message: message.substring(0, 50) + "...",
        role,
      });

      const systemPrompt = `You are a ${role}. Be helpful, friendly, and respond appropriately to your role.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 500, // Add reasonable limit
        temperature: 0.7, // Add some creativity
      });

      if (
        !response.choices ||
        !response.choices[0] ||
        !response.choices[0].message
      ) {
        throw new Error("Invalid response from OpenAI API");
      }

      const reply = response.choices[0].message.content;
      console.log("Sending response:", reply.substring(0, 50) + "...");
      const reply = response.choices[0].message.content;

      // Save to file
      appendToHistory({ sender: 'user', text: message });
      appendToHistory({ sender: 'bot', text: reply });

      res.json({ reply });
    } catch (err) {
      console.error("ChatController Error:", err);

      // Handle specific OpenAI errors
      if (err.status === 401) {
        console.error("Invalid API key");
        return res.status(500).json({ error: "Invalid API configuration" });
      }

      if (err.status === 429) {
        console.error("Rate limit exceeded");
        return res
          .status(500)
          .json({ error: "Service temporarily unavailable" });
      }

      if (err.status === 400) {
        console.error("Bad request to OpenAI:", err.message);
        return res.status(500).json({ error: "Invalid request" });
      }

      // Generic error
      res.status(500).json({
        error: "Failed to get response from AI",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },

  getChatHistory(req, res) {
    try {
      const data = fs.existsSync(historyPath)
        ? JSON.parse(fs.readFileSync(historyPath, 'utf-8'))
        : [];
      res.json({ history: data });
    } catch (err) {
      console.error('Failed to read chat history:', err);
      res.status(500).json({ error: 'Unable to load chat history' });
    }
  }
};

module.exports = chatController;
