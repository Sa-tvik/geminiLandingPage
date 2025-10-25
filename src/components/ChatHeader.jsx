import React, { useState } from "react";
import {
  Menu as MenuIcon,
  Share as ShareIcon,
  Help as HelpIcon,
  Add as AddIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";
import { useChatContext } from "../contexts/ChatContext";

const ChatHeader = ({ handleDrawerToggle }) => {
  const { startNewChat } = useChatContext();
  const [model, setModel] = useState("chatgpt-4");

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            onClick={handleDrawerToggle}
          >
            <MenuIcon fontSize="small" />
          </button>

          {/* Model Selector */}
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="appearance-none bg-gray-100 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer pr-8"
            >
              <option value="chatgpt-4 cursor-pointer">ChatGPT 4</option>
              <option value="chatgpt-3.5 cursor-poitner">ChatGPT 3.5</option>
            </select>
            <ArrowDownIcon className="absolute right-2 top-1.5 text-gray-500 pointer-events-none" fontSize="small" />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
            <ShareIcon fontSize="small" />
          </button>

          <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
            <HelpIcon fontSize="small" />
          </button>

          <button
            onClick={startNewChat}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-2xl text-sm font-medium transition"
          >
            <AddIcon fontSize="small" />
            New Chat
          </button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
