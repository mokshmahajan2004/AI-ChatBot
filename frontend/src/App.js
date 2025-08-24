import React from "react";
import ChatInterface from "./components/ChatInterface";
import "./styles/App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>DeepSeek R1T2 Chimera Chatbot</h1>
        <p>Powered by TNG Technology & AWS</p>
      </header>
      <main className="App-main">
        <ChatInterface />
      </main>
    </div>
  );
}

export default App;
