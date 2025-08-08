const OpenAI = require("openai");

// Add validation for API key
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in environment variables");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatController = {
  async sendMessage(req, res) {
    try {
      const { message, role } = req.body;

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
};

module.exports = chatController;
