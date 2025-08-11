/*ChatInput.jsx*/
import { useState, useRef, useEffect } from "react";
import "./ChatInput.css";

const ChatInput = ({ onSendMessage, onStartListening, isTyping }) => {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);
  const maxChars = 1000;

  const suggestedPrompts = [
    "Tell me a joke",
    "Explain quantum physics",
    "Help me write an email",
    "What's the weather like?",
    "Give me cooking tips",
  ];

  useEffect(() => {
    setCharCount(input.length);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping || input.length > maxChars) return;

    onSendMessage(input.trim());
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      // Stop recording logic would go here
      setIsRecording(false);
      return;
    }

    setIsRecording(true);

    // Enhanced speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (e) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInput((prev) => prev + finalTranscript);
          setIsRecording(false);
        } else if (interimTranscript) {
          // Show interim results in input
          const currentInput = input.replace(/\[Listening...\]$/, "");
          setInput(currentInput + interimTranscript + "[Listening...]");
        }
      };

      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e.error);
        setIsRecording(false);
        setInput((prev) => prev.replace(/\[Listening...\]$/, ""));
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInput((prev) => prev.replace(/\[Listening...\]$/, ""));
      };

      recognition.start();
    } else {
      onStartListening();
      setIsRecording(false);
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    setInput(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const isInputValid = input.trim() && input.length <= maxChars;
  const showCharCounter = charCount > maxChars * 0.8 || charCount > maxChars;
  const charCounterClass =
    charCount > maxChars
      ? "error"
      : charCount > maxChars * 0.9
      ? "warning"
      : "";

  return (
    <div className="chat-input">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <div className="message-input-container">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift + Enter for new line)"
              disabled={isTyping}
              className={`message-input ${isTyping ? "input-loading" : ""}`}
              rows="1"
              maxLength={maxChars + 100} // Allow slight overflow for UX
            />

            {!input && !isTyping && (
              <div className="keyboard-shortcut">Enter ↵</div>
            )}

            {showCharCounter && (
              <div className={`character-counter ${charCounterClass} visible`}>
                {charCount}/{maxChars}
              </div>
            )}
          </div>

          <div className="input-actions">
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={isTyping}
              className={`voice-button ${isRecording ? "recording" : ""}`}
              title={isRecording ? "Stop recording" : "Voice input"}
              aria-label={
                isRecording ? "Stop voice recording" : "Start voice input"
              }
            >
              <span className="button-icon">{isRecording ? "⏹️" : "🎙️"}</span>
            </button>

            <button
              type="submit"
              disabled={!isInputValid || isTyping}
              className="send-button"
              title="Send message"
              aria-label="Send message"
            >
              <span className="button-icon">{isTyping ? "⏳" : "🚀"}</span>
            </button>
          </div>
        </div>
      </form>

      {!input && !isTyping && (
        <div className="input-hints">
          {suggestedPrompts.map((prompt, index) => (
            <button
              key={index}
              type="button"
              className="input-hint"
              onClick={() => handleSuggestedPrompt(prompt)}
              title={`Try: ${prompt}`}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
    </div>
    <form className="chat-input" onSubmit={handleSubmit}>
      <div className="input-group">
        <textarea
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isTyping}
          className="message-input"
        >
        </textarea>
        <button 
          type="submit" 
          disabled={!input.trim() || isTyping}
          className="send-button"
        >
          Send
        </button>
        <button 
          type="button"
          onClick={onStartListening}
          disabled={isTyping}
          className="voice-button"
          title="Voice input"
        >
          🎙️
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
