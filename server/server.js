const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
try {
  const chatRoutes = require("./routes/chat");
  app.use("/api", chatRoutes);
  console.log("Chat routes loaded successfully");
} catch (err) {
  console.error("Failed to load chat routes:", err.message);
  process.exit(1);
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "Server is running!",
    timestamp: new Date().toISOString(),
    env: {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      nodeEnv: process.env.NODE_ENV || "development",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  console.error("Stack:", err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use("*", (req, res) => {
  console.log("404 - Route not found:", req.originalUrl);
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);

  // Verify environment
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "⚠️  WARNING: OPENAI_API_KEY not found in environment variables"
    );
  } else {
    console.log("✅ OpenAI API key found");
  }
});
