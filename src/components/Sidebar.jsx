import { useState } from 'react';

function Sidebar({ chats, activeChat, onNewChat, onSelectChat, onEditChatName, onDeleteChat }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewChat}>
          <span>+</span> New Chat
        </button>
      </div>
      <div className="chats-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${chat.id === activeChat ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <span>{chat.name}</span>
            <div className="chat-item-actions">
              <button
                className="chat-item-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  const newName = prompt('Enter new name:', chat.name);
                  if (newName) onEditChatName(chat.id, newName);
                }}
              >
                ✏️
              </button>
              <button
                className="chat-item-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar; 