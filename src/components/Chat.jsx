import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IoSettingsOutline } from "react-icons/io5";
import { IoAttach } from "react-icons/io5";
import { IoSend } from "react-icons/io5";
import { VscRobot } from "react-icons/vsc";
import Sidebar from "./Sidebar";
import Prism from "prismjs";
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import ConfirmModal from './ConfirmModal';

function Chat() {
  const aiSelectRef = useRef(null);
  const messagesEndRef = useRef(null);

  const aiModels = {
    gemini: {
      name: 'Gemini',
      model: 'gemini-pro',
      api: 'google',
    },
    gpt: {
      name: 'ChatGPT',
      model: 'gpt-3.5-turbo',
      api: 'openai',
    },
    claude: {
      name: 'Claude',
      model: 'claude-2',
      api: 'anthropic',
    }
  };

  const [activeAI, setActiveAI] = useState('gemini');
  const [isAISelectOpen, setIsAISelectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! 👋 How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState("gold");
  const [filePreview, setFilePreview] = useState(null);
  const [activeChatId, setActiveChatId] = useState(1);
  const [chats, setChats] = useState([
    {
      id: 1,
      name: "New Chat",
      messages: [],
      timestamp: new Date().toISOString()
    }
  ]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAI, setPendingAI] = useState(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (aiSelectRef.current && !aiSelectRef.current.contains(event.target)) {
        setIsAISelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let response;
      
      switch (activeAI) {
        case 'gemini':
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const result = await model.generateContent(input);
          response = result.response.text();
          break;

        case 'gpt':
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: input }],
          });
          response = completion.choices[0].message.content;
          break;

        case 'claude':
          const message = await anthropic.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 1000,
            messages: [{ role: "user", content: input }],
            system: "You are a helpful AI assistant."
          });
          response = message.content[0].text;
          break;
      }

      const assistantMessage = { role: "assistant", content: response };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // Handle file upload logic here
  };

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
      timestamp: new Date().toISOString(),
    };

    setChats((prev) => [...prev, newChat]);
    setActiveChatId(newChat.id);
    setMessages([]); 
  };

  const handleEditChatName = (id, newName) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, name: newName } : chat))
    );
  };

  const handleDeleteChat = (id) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
      setMessages([]);
    }
  };

  // Load messages when switching chats
  useEffect(() => {
    if (activeChatId) {
      const activeChat = chats.find((chat) => chat.id === activeChatId);
      if (activeChat) {
        setMessages(activeChat.messages || []);
      }
    }
  }, [activeChatId]);

  const formatMessage = (content) => {
    if (content.includes('```')) {
      const parts = content.split('```');
      return parts.map((part, index) => {
        if (index % 2 === 1) { // Code block
          const firstLineBreak = part.indexOf('\n');
          const language = part.slice(0, firstLineBreak).trim() || 'javascript';
          const code = part.slice(firstLineBreak + 1).trim();
          
          const highlighted = Prism.highlight(
            code,
            Prism.languages[language] || Prism.languages.javascript,
            language
          );

          return (
            <pre key={index} className={`code-block language-${language}`}>
              <div className="code-header">
                <span>{language}</span>
              </div>
              <code 
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            </pre>
          );
        }
        // Regular text - create element instead of using string replacement
        return (
          <div key={index} className="text-content">
            {part.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i !== part.split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
        );
      });
    }

    // If no code blocks, still properly format the text
    return (
      <div className="text-content">
        {content.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i !== content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    );
  };

  const handleAISwitch = (aiKey) => {
    setPendingAI(aiKey);
    setShowConfirm(true);
    setIsAISelectOpen(false);
  };

  const confirmAISwitch = () => {
    setActiveAI(pendingAI);
    setShowConfirm(false);
    setPendingAI(null);
  };

  return (
    <div className={`chat-layout ${theme}`}>
      <Sidebar
        chats={chats}
        activeChat={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={setActiveChatId}
        onEditChatName={handleEditChatName}
        onDeleteChat={handleDeleteChat}
        theme={theme}
        onThemeChange={setTheme}
      />
      <div className="chat-container">
        <button className="settings-btn">
          <IoSettingsOutline size={24} />
        </button>
        <div className="messages">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <div className="ai-highlight">
                <div className="ai-icon">
                  <VscRobot  size={40} />
                </div>
                <h1>How can I help you today?</h1>
                <p>Ask me anything - I'm here to help with your questions!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  {message.file && (
                    <div className="file-preview">
                      <img src={message.file} alt="Uploaded file" />
                    </div>
                  )}
                  <div className="message-content">{formatMessage(message.content)}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
          {isLoading && (
            <div className="loading">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <label className="file-input-label">
              <IoAttach size={20} />
              <input
                type="file"
                onChange={handleFileChange}
                className="file-input"
                accept="image/*,.pdf"
              />
            </label>
            
            <div className="custom-select" ref={aiSelectRef}>
              <button
                type="button"
                className="select-button"
                onClick={() => setIsAISelectOpen(!isAISelectOpen)}
              >
                {aiModels[activeAI].name}
                <span className={`arrow ${isAISelectOpen ? 'open' : ''}`}>▼</span>
              </button>
              {isAISelectOpen && (
                <div className="select-dropdown">
                  {Object.entries(aiModels).map(([key, ai]) => (
                    <button
                      key={key}
                      className={`select-option ${activeAI === key ? 'active' : ''}`}
                      onClick={() => handleAISwitch(key)}
                      type="button"
                    >
                      {ai.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
          <button type="submit" disabled={isLoading}>
            <IoSend size={20} />
          </button>
          </div>
        </form>

        <ConfirmModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={confirmAISwitch}
          aiName={pendingAI ? aiModels[pendingAI].name : ''}
        />
      </div>
    </div>
  );
}

export default Chat;
