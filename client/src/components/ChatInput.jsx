import { useState } from 'react';
import './ChatInput.css';

const ChatInput = ({ onSendMessage, onStartListening, isTyping }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
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
