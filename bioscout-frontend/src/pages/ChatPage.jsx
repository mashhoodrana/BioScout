import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useChatHistory } from "../context/ChatHistoryContext";
import "./ChatPage.css";

const ChatPage = () => {
  const navigate = useNavigate();
  const { conversations, currentChatId, setCurrentChatId } = useChatHistory();

  const activeChat = useMemo(
    () => conversations.find((c) => c.id === currentChatId) || null,
    [conversations, currentChatId],
  );

  const handleNewChat = () => {
    // Navigate to map page to start a new chat
    navigate("/");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="chat-page">
      <div className="chat-shell">
        <div className="chat-header">
          <h2 className="chat-title">Chat & History</h2>
          {currentChatId && (
            <button className="new-chat-btn" onClick={handleNewChat}>
              + New Chat
            </button>
          )}
        </div>

        <div className="chat-body">
          <aside className="history-panel">
            <div className="history-header">
              <p className="history-title">Conversations</p>
              <span className="history-meta">{conversations.length} saved</span>
            </div>
            <div className="history-list">
              {conversations.length === 0 ? (
                <div className="empty-state-mini">
                  No conversations yet. Start chatting!
                </div>
              ) : (
                conversations.map((chat) => (
                  <button
                    key={chat.id}
                    className={`history-card ${chat.id === currentChatId ? "active" : ""}`}
                    onClick={() => setCurrentChatId(chat.id)}
                  >
                    <p className="history-title-text">{chat.title}</p>
                    <p className="history-meta">{formatDate(chat.updatedAt)}</p>
                    <p className="history-meta">
                      {chat.messages.length} messages
                    </p>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="chat-panel">
            {!activeChat ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <p>No active chat. Select one from the left or start new!</p>
              </div>
            ) : (
              <>
                <div className="chat-messages">
                  {activeChat.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`message-bubble ${msg.role === "user" ? "user" : ""}`}
                    >
                      <div>{msg.text}</div>
                      <div className="message-meta">
                        {msg.role === "user" ? "You" : "Assistant"} · {msg.time}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
