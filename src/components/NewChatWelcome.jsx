// components/NewChatWelcome.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AttachFile, Image, Send, AutoAwesome as Sparkle } from "@mui/icons-material";
import { useChatContext } from "../contexts/ChatContext";
import AttachmentsPanel from "./AttachmentsPanel"; // use your existing panel

const NewChatWelcome = () => {
  const [inputValue, setInputValue] = useState("");
  const { sendMessage } = useChatContext();

  // attachments state (controlled here)
  const [files, setFiles] = useState([]);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);

  // refs
  const textareaRef = useRef(null);
  const panelWrapperRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const fileInputRef = useRef(null);

  const suggestionCards = [
    {
      icon: <Sparkle className="text-blue-600 text-lg" />,
      text: "Give me a concise summary of this meeting transcript",
    },
    {
      icon: <Sparkle className="text-blue-600 text-lg" />,
      text: "Write a product description for a minimalist smartwatch",
    },
    {
      icon: <Sparkle className="text-blue-600 text-lg" />,
      text: "Provide a polite response to a customer asking for a refund",
    },
  ];

  const handleSendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed && files.length === 0) return;

    // sendMessage supports attachments: sendMessage(text, File[])
    sendMessage(trimmed, files);

    setInputValue("");
    setFiles([]);
    setAttachmentsOpen(false);
    textareaRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (text) => {
    sendMessage(text);
  };

  const onAdd = (newFiles) => {
    if (!newFiles || !newFiles.length) return;
    setFiles((prev) => [...prev, ...newFiles]);
    setAttachmentsOpen(false);
    textareaRef.current?.focus();
  };
  const onRemove = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const onClear = () => {
    setFiles([]);
  };

  // paperclip button
  const openFilePicker = () => {
    const input = fileInputRef.current;
    if (!input) return;
    try {
      input.click();
    } catch {
      input.focus();
      input.click();
    }
  };

  // paste handler (global) - attach pasted files and close panel
  useEffect(() => {
    const onPaste = (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      const pasted = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind === "file") {
          const f = it.getAsFile();
          if (f) pasted.push(f);
        }
      }
      if (pasted.length) {
        setFiles((prev) => [...prev, ...pasted]);
        setAttachmentsOpen(false);
        textareaRef.current?.focus();
        e.preventDefault();
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  // outside-click & Escape close for the small attachments popup
  useEffect(() => {
    if (!attachmentsOpen) return;
    const handler = (e) => {
      const panelEl = panelWrapperRef.current;
      const toggleBtn = toggleButtonRef.current;
      if (!panelEl) return;
      if (panelEl.contains(e.target)) return;
      if (toggleBtn && toggleBtn.contains(e.target)) return;
      setAttachmentsOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setAttachmentsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onEsc);
    };
  }, [attachmentsOpen]);

  return (
    <div className="flex flex-col justify-between flex-1 p-6 max-w-4xl mx-auto min-h-screen">
      {/* Greeting Section */}
      <div className="flex flex-col justify-between pt-16">
        <div className="mb-8 flex flex-col items-start">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-3">
            <motion.span
              role="img"
              aria-label="wave"
              className="inline-block text-xl origin-[70%_70%] hover:text-2xl"
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              👋
            </motion.span>
            Hi Laurence!
          </h1>

          <h2 className="text-3xl md:text-4xl font-normal text-gray-900">
            What do uou want to learn today?
          </h2>
        </div>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 w-full max-w-5xl gap-3">
          {suggestionCards.map((card, index) => (
            <motion.div
              key={index}
              whileHover={{
                scale: 1.02,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
              }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
              className="cursor-pointer rounded-2xl p-5 flex flex-col gap-16 bg-gradient-to-br from-blue-50/50 to-purple-50/30 hover:from-blue-50 hover:to-purple-50 transition-all min-h-[160px]"
              onClick={() => handleSuggestionClick(card.text)}
            >
              <div className="flex-shrink-0">{card.icon}</div>
              <p className="text-sm text-gray-800 leading-relaxed font-medium">{card.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="w-full max-w-3xl relative border-2 border-gray-300 rounded-2xl p-2 shadow-sm">
        {/* small popup attachments panel (absolute) */}
        <div
          ref={panelWrapperRef}
          className={`absolute left-4 bottom-16 z-50 transform transition-all ${attachmentsOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
          style={{ width: 360 }}
        >
          <AttachmentsPanel files={files} onAdd={onAdd} onRemove={onRemove} onClear={onClear} accept="*" />
        </div>

        <div className={`border-2 ${inputValue ? "border-blue-500" : "border-gray-300"} rounded-2xl transition flex items-end p-3 shadow-sm`}>

          {/* Input */}
          <textarea
            ref={textareaRef}
            className="flex-1 resize-none outline-none border-none bg-transparent text-gray-900 placeholder-gray-400 px-3 py-2 text-base min-h-[44px] max-h-[150px] overflow-y-auto"
            placeholder=""
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            maxLength={1000}
          />
        </div>

        <div className="flex items-center justify-between mb-7 py-1">

          {/* Left Icons */}
          <div className="flex items-center gap-1 text-gray-500">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition"
              onClick={() => {
                setAttachmentsOpen((s) => !s);
              }}
              aria-label="attach-file"
              ref={toggleButtonRef}
            >
              <AttachFile fontSize="small" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition" onClick={() => textareaRef.current?.focus()}>
              <Image fontSize="small" />
            </button>
          </div>
          <div className="flex items-center gap-1 text-gray-500" />


          {/* Right Controls */}
          <div className="flex items-center gap-3 pr-1">
            <span className="text-xs text-gray-400">{inputValue.length}/1000</span>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() && files.length === 0}
              className={`p-2 rounded-full transition-all ${
                inputValue.trim() || files.length > 0 ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send fontSize="small" />
            </button>
          </div>
        </div>

        {/* hidden native file input used by paperclip open (if user wants direct pick) */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*"
          className="hidden"
          onChange={(e) => {
            const fl = e.target.files;
            if (fl && fl.length) {
              setFiles((prev) => [...prev, ...Array.from(fl)]);
              setAttachmentsOpen(false);
              textareaRef.current?.focus();
              e.target.value = null;
            }
          }}
        />

        {/* inline attachments summary */}
        {files.length > 0 && (
          <div className="mt-3 px-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="font-medium">Attachments:</div>
              <div className="flex gap-2 overflow-auto">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs" title={f.name}>
                    <div className="w-6 h-6 flex items-center justify-center bg-white border rounded text-gray-600">
                      <AttachFile style={{ fontSize: 14 }} />
                    </div>
                    <div className="truncate max-w-[10rem]">{f.name}</div>
                    <button onClick={() => onRemove(i)} className="ml-1 text-xs text-gray-500 hover:text-red-500" title="Remove">−</button>
                  </div>
                ))}
              </div>

              <button onClick={onClear} className="ml-2 text-sm text-red-500 hover:underline" title="Remove all attachments">Remove all</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewChatWelcome;
