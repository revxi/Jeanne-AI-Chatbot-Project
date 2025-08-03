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
    const { message, role } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are a ${role}.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      });

      const reply = response.choices[0].message.content;

      // Save to file
      appendToHistory({ sender: 'user', text: message });
      appendToHistory({ sender: 'bot', text: reply });

      res.json({ reply });
    } catch (err) {
      console.error('OpenAI Error:', err);
      res.status(500).json({ error: 'Failed to get response from AI' });
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
