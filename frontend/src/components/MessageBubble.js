import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

const MessageBubble = ({ message, showReasoning }) => {
  const [showFullReasoning, setShowFullReasoning] = useState(false);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={tomorrow}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  return (
    <div
      className={`message-bubble ${message.sender} ${
        message.isError ? "error" : ""
      }`}
    >
      <div className="message-content">
        <div className="message-text">
          <ReactMarkdown
            components={{
              code: CodeBlock,
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>

        {message.reasoning && showReasoning && (
          <div className="reasoning-section">
            <div className="reasoning-header">
              <span>🧠 Reasoning Process</span>
              {message.reasoning.length > 200 && (
                <button
                  onClick={() => setShowFullReasoning(!showFullReasoning)}
                  className="toggle-reasoning-detail"
                >
                  {showFullReasoning ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
            <div className="reasoning-content">
              <ReactMarkdown>
                {showFullReasoning || message.reasoning.length <= 200
                  ? message.reasoning
                  : message.reasoning.substring(0, 200) + "..."}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {message.usage && (
          <div className="usage-info">
            <small>
              Tokens: {message.usage.completion_tokens} completion,{" "}
              {message.usage.reasoning_tokens} reasoning
            </small>
          </div>
        )}
      </div>

      <div className="message-meta">
        <span className="timestamp">{formatTimestamp(message.timestamp)}</span>
        <span className="sender-label">
          {message.sender === "user" ? "You" : "DeepSeek"}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
