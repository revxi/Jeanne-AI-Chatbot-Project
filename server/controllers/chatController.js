const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      
      res.json({ reply: response.choices[0].message.content });
    } catch (err) {
      console.error('OpenAI Error:', err);
      res.status(500).json({ error: 'Failed to get response from AI' });
    }
  }
};

module.exports = chatController;
