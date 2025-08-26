import React from "react";
import ChatInterface from "./components/ChatInterface";
import "./styles/App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>DeepMind : Your AI Buddy</h1>
        <p>Powered by DeepSeek</p>
      </header>
      <main className="App-main">
        <ChatInterface />
      </main>
    </div>
  );
}

export default App;
