// ChatContext.jsx
import React, { createContext, useContext, useRef, useState, useEffect } from "react";

const ChatContext = createContext(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const initialRecentChats = [
    {
      id: "1",
      title: "Write a Shakespearean sonnet about a cat that...",
      messages: [],
      lastUpdated: new Date(Date.now() - 86400000),
    },
    {
      id: "2",
      title: "If cereal commercials were directed by Christc...",
      messages: [],
      lastUpdated: new Date(Date.now() - 172800000),
    },
    {
      id: "3",
      title: "Renewable Energy Trends",
      messages: [],
      lastUpdated: new Date(Date.now() - 259200000),
    },
    {
      id: "4",
      title: "Describe a medieval jousting tournament wher...",
      messages: [],
      lastUpdated: new Date(Date.now() - 345600000),
    },
    {
      id: "5",
      title: "What would a job interview be like if aliens wer...",
      messages: [],
      lastUpdated: new Date(Date.now() - 432000000),
    },
    {
      id: "6",
      title: "Generate a rap battle between a sentient toaste...",
      messages: [],
      lastUpdated: new Date(Date.now() - 518400000),
    },
    {
      id: "7",
      title: "What if oxygen was actually a hallucinogen, and...",
      messages: [],
      lastUpdated: new Date(Date.now() - 604800000),
    },
    {
      id: "8",
      title: "Pitch a reality TV show where ghosts haunt infl...",
      messages: [],
      lastUpdated: new Date(Date.now() - 691200000),
    },
  ];

  const predefinedResponses = [
    "Lorem ipsum dolor sit amet.",
    "ipsum dolor sit amet.",
    "dolor sit amet.",
  ];

  const [currentChat, setCurrentChat] = useState(null);
  const [recentChats, setRecentChats] = useState(initialRecentChats);

  const urlPoolRef = useRef([]); // track object URLs to revoke on unmount

  const generateChatId = () => `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const generateAttachmentId = () => `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  // convert File[] to attachment metadata objects used in messages
  const filesToAttachments = (files = []) => {
    if (!files || !files.length) return [];
    return files.map((file) => {
      const url = URL.createObjectURL(file);
      // revoke later
      urlPoolRef.current.push(url);
      return {
        id: generateAttachmentId(),
        name: file.name,
        size: file.size,
        type: file.type,
        url, // objectURL for immediate preview in UI
      };
    });
  };

  // startNewChat remains same
  const startNewChat = () => {
    setCurrentChat(null);
  };

  /**
   * sendMessage now supports attachments (File[]).
   * - text: string
   * - attachments: optional array of File objects (from input)
   */
  const sendMessage = (text, attachments = []) => {
    const trimmed = (text || "").trim();

    const mappedAttachments = filesToAttachments(Array.isArray(attachments) ? attachments : []);

    const userMessage = {
      id: generateMessageId(),
      text: trimmed,
      isUser: true,
      timestamp: new Date(),
      attachments: mappedAttachments, // may be []
    };

    if (currentChat) {
      // append to existing
      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, userMessage],
        lastUpdated: new Date(),
      };
      setCurrentChat(updatedChat);

      setRecentChats((prev) => prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat)));
    } else {
      // create new chat
      const newChat = {
        id: generateChatId(),
        title: trimmed ? (trimmed.length > 50 ? trimmed.substring(0, 47) + "..." : trimmed) : "New Chat",
        messages: [userMessage],
        lastUpdated: new Date(),
      };
      setCurrentChat(newChat);
      setRecentChats((prev) => [newChat, ...prev]);
    }

    // Simulate AI response after short delay (no attachments added by AI)
    setTimeout(() => {
      const aiResponse = {
        id: generateMessageId(),
        text: predefinedResponses[Math.floor(Math.random() * predefinedResponses.length)],
        isUser: false,
        timestamp: new Date(),
        attachments: [], // AI response doesn't attach files here; adapt if you want
      };

      setCurrentChat((prev) => {
        if (!prev) return null;
        const updatedChat = {
          ...prev,
          messages: [...prev.messages, aiResponse],
          lastUpdated: new Date(),
        };
        setRecentChats((prevChats) => prevChats.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat)));
        return updatedChat;
      });
    }, 1000 + Math.random() * 2000);
  };

  const selectChat = (chatId) => {
    const selectedChat = recentChats.find((chat) => chat.id === chatId);
    if (selectedChat) {
      setCurrentChat(selectedChat);
    }
  };

  // cleanup objectURLs on unmount to avoid leaking
  useEffect(() => {
    return () => {
      urlPoolRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch (e) {
          // ignore
        }
      });
      urlPoolRef.current = [];
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        recentChats,
        startNewChat,
        sendMessage,
        selectChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
  