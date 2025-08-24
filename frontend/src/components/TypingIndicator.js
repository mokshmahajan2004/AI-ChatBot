import React from "react";

const TypingIndicator = () => {
  return (
    <div className="message-bubble bot typing">
      <div className="message-content">
        <div className="typing-indicator">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="typing-text">DeepSeek is thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
