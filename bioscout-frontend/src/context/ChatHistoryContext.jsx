import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getConversations,
  createConversation,
  addMessageToConversation,
  deleteConversation as deleteConversationAPI,
} from "../services/api";
import { useAuth } from "./AuthContext";

const ChatHistoryContext = createContext(null);

export const ChatHistoryProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch conversations from API when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversationsFromAPI();
    } else {
      setConversations([]);
      setCurrentChatId(null);
    }
  }, [isAuthenticated]);

  const fetchConversationsFromAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConversations();
      const formattedConversations = (data.conversations || []).map((conv) => ({
        id: conv.id,
        title: conv.title,
        messages: (conv.messages || []).map((msg) => ({
          role: msg.role,
          text: msg.content,
          time: new Date(msg.created_at).toLocaleTimeString(),
        })),
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
      }));
      setConversations(formattedConversations);
      if (formattedConversations.length > 0) {
        setCurrentChatId(formattedConversations[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
      setError("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async (firstQuery, firstResponse) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createConversation(firstQuery, firstResponse);

      const newChat = {
        id: response.id,
        title:
          response.title ||
          firstQuery.substring(0, 50) + (firstQuery.length > 50 ? "..." : ""),
        messages: [
          {
            role: "user",
            text: firstQuery,
            time: new Date().toLocaleTimeString(),
          },
          {
            role: "assistant",
            text: firstResponse,
            time: new Date().toLocaleTimeString(),
          },
        ],
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      };

      setConversations((prev) => [newChat, ...prev]);
      setCurrentChatId(response.id);
      return response.id;
    } catch (err) {
      console.error("Failed to create conversation", err);
      setError("Failed to create chat");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addMessageToChat = async (chatId, userMessage, assistantResponse) => {
    setLoading(true);
    setError(null);
    try {
      const response = await addMessageToConversation(
        chatId,
        userMessage,
        assistantResponse,
      );

      setConversations((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  role: "user",
                  text: userMessage,
                  time: new Date().toLocaleTimeString(),
                },
                {
                  role: "assistant",
                  text: assistantResponse,
                  time: new Date().toLocaleTimeString(),
                },
              ],
              updatedAt: response.updated_at,
            };
          }
          return chat;
        }),
      );
    } catch (err) {
      console.error("Failed to add message", err);
      setError("Failed to add message to chat");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteConversationAPI(chatId);

      const updatedConversations = conversations.filter((c) => c.id !== chatId);
      setConversations(updatedConversations);

      if (currentChatId === chatId) {
        setCurrentChatId(updatedConversations[0]?.id || null);
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
      setError("Failed to delete chat");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const renameChat = (chatId, newTitle) => {
    setConversations((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat,
      ),
    );
  };

  const getCurrentChat = () => {
    return conversations.find((c) => c.id === currentChatId) || null;
  };

  const value = useMemo(
    () => ({
      conversations,
      currentChatId,
      setCurrentChatId,
      createNewChat,
      addMessageToChat,
      deleteChat,
      renameChat,
      getCurrentChat,
      loading,
      error,
    }),
    [conversations, currentChatId, loading, error],
  );

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
};

export const useChatHistory = () => {
  const ctx = useContext(ChatHistoryContext);
  if (!ctx) {
    throw new Error("useChatHistory must be used within ChatHistoryProvider");
  }
  return ctx;
};
