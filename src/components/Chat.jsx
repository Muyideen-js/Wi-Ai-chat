import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IoSettingsOutline } from "react-icons/io5";
import { IoAttach } from "react-icons/io5";
import { IoSend } from "react-icons/io5";
import { VscRobot } from "react-icons/vsc";
import Sidebar from "./Sidebar";
import Prism from "prismjs";
import VoiceMessage from "./VoiceMessage";
import axios from 'axios';

function Chat() {
  const aiSelectRef = useRef(null);
  const messagesEndRef = useRef(null);

  const aiModels = {
    websearch: {
      name: 'Web Search',
      model: 'web-search',
      api: 'google-search',
    },
    gemini: {
      name: 'Gemini',
      model: 'gemini-pro',
      api: 'google',
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const speechSynthesis = window.speechSynthesis;
  const speechUtterance = new SpeechSynthesisUtterance();

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const searchWeb = async (query) => {
    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: import.meta.env.VITE_GOOGLE_SEARCH_API_KEY,
          cx: import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID,
          q: query
        }
      });
      return response.data.items;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  };

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
    e.stopPropagation();
    if (!input.trim() && !filePreview) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let response;
      
      if (activeAI === 'websearch') {
        const searchResults = await searchWeb(input);
        response = searchResults
          .slice(0, 5)
          .map(item => `${item.title}\n${item.snippet}`)
          .join('\n\n');
      } else {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(input);
        response = result.response.text();
      }

      const assistantMessage = { role: "assistant", content: response };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.message || "An error occurred";
      setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }]);
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

  const speakMessage = (text) => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    speechUtterance.text = text;
    speechUtterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    speechSynthesis.speak(speechUtterance);
  };

  const handleVoiceSubmit = async (audioBlob) => {
    setIsLoading(true);
    try {
      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result;
        
        // Add voice message to chat
        const voiceMessage = {
          role: "user",
          content: "🎤 Voice Message",
          audio: base64Audio
        };
        
        setMessages(prev => [...prev, voiceMessage]);
        
        // Here you would typically send the audio to a speech-to-text API
        // For now, we'll just add a placeholder response
        const response = "I received your voice message! Once you integrate with a speech-to-text API, I'll be able to understand and respond to it.";
        
        const assistantMessage = {
          role: "assistant",
          content: response
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      };
    } catch (error) {
      console.error("Error processing voice message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const MessageContent = ({ message }) => {
    if (message.role === "assistant") {
      return (
        <div className="message-content-wrapper">
          {formatMessage(message.content)}
          <button 
            className={`speak-btn ${isSpeaking ? 'speaking' : ''}`}
            onClick={() => speakMessage(message.content)}
          >
            {isSpeaking ? '🔊' : '🔈'}
          </button>
        </div>
      );
    }
    
    if (message.audio) {
      return (
        <div className="voice-message-player">
          <audio controls src={message.audio} />
        </div>
      );
    }
    
    return formatMessage(message.content);
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
                  <div className="message-content">{MessageContent({ message })}</div>
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
            
            <VoiceMessage onVoiceSubmit={handleVoiceSubmit} />
            
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
                      onClick={() => {
                        setActiveAI(key);
                        setIsAISelectOpen(false);
                      }}
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
      </div>
    </div>
  );
}

export default Chat;
