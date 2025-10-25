import React, { useEffect, useRef, useState } from "react";
import { AttachFile as AttachFileIcon, Image as ImageIcon, Send as SendIcon } from "@mui/icons-material";
import { useChatContext } from "../contexts/ChatContext";
import AttachmentsPanel from "./AttachmentsPanel";

export default function ActiveChat() {
  const { currentChat, sendMessage } = useChatContext();
  const [inputValue, setInputValue] = useState("");
  const [files, setFiles] = useState([]); // File[]
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputWrapperRef = useRef(null);
  const panelWrapperRef = useRef(null);
  const toggleButtonRef = useRef(null); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  if (!currentChat) return null;

  const isTyping =
    currentChat.messages.length > 0 &&
    currentChat.messages[currentChat.messages.length - 1].isUser;

  // Drag & drop onto input wrapper (user drags directly onto input area)
  // Automatically close attachment panel after adding files to prevent trap.
  const handleDropOnInput = (e) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    if (!dt) return;
    const dropped = Array.from(dt.files || []);
    if (dropped.length) {
      setFiles((prev) => [...prev, ...dropped]);
      setAttachmentsOpen(false);
      textareaRef.current?.focus();
    }
    removeInputDragStyles();
  };
  const handleDragOverOnInput = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    addInputDragStyles();
  };
  const handleDragLeaveOnInput = () => {
    removeInputDragStyles();
  };
  function addInputDragStyles() {
    inputWrapperRef.current?.classList.add("ring", "ring-2", "ring-sky-300", "ring-dashed");
  }
  function removeInputDragStyles() {
    inputWrapperRef.current?.classList.remove("ring", "ring-2", "ring-sky-300", "ring-dashed");
  }

  // Paste: global handler (images/files from clipboard)
  // auto-close to avoid getting stuck
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

  // Attachments panel callbacks 
  // onAdd now appends files AND auto-closes panel (and focuses textarea)
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

  // Outside-click & Escape to close panel
  useEffect(() => {
    if (!attachmentsOpen) return;

    const onDocMouseDown = (e) => {
      const panelEl = panelWrapperRef.current;
      const toggleBtn = toggleButtonRef.current;
      if (!panelEl) return;
      // If click is inside panel -> do nothing
      if (panelEl.contains(e.target)) return;
      // If click is on the toggle button -> do nothing (toggle handled by button)
      if (toggleBtn && toggleBtn.contains(e.target)) return;
      // otherwise close
      setAttachmentsOpen(false);
    };

    const onEsc = (e) => {
      if (e.key === "Escape") setAttachmentsOpen(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [attachmentsOpen]);

  // --------------------------
  // Send
  // --------------------------
  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text && files.length === 0) return;

    try {
      await sendMessage(text, files);
    } catch (err) {
      console.error("sendMessage failed:", err);
    }

    // reset UI
    setInputValue("");
    setFiles([]);
    setAttachmentsOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col gap-5 scrollbar-thin scrollbar-thumb-gray-300">
        {currentChat.messages.map((m) => (
          <div key={m.id} className={`flex items-start gap-3 ${m.isUser ? "justify-end" : "justify-start"}`}>
            {!m.isUser && <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-semibold shadow-sm">I</div>}

            <div className={`p-3 md:p-4 max-w-[75%] text-[15px] leading-relaxed break-words shadow-sm transition-all duration-200 ${m.isUser ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" : "bg-gray-100 text-gray-800 border border-gray-200 rounded-2xl rounded-tl-sm"}`}>
              {m.text}
              {m.attachments && m.attachments.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {m.attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 text-sm text-gray-700">
                      {att.url && att.type && att.type.startsWith("image/") ? (
                        <img src={att.url} alt={att.name} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-50 border rounded flex items-center justify-center text-gray-500">
                          <AttachFileIcon style={{ fontSize: 16 }} />
                        </div>
                      )}
                      <div className="truncate">{att.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {m.isUser && <div className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-800 rounded-full text-sm font-semibold shadow-sm">L</div>}
          </div>
        ))}

        {/* typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-semibold shadow-sm">I</div>
            <div className="bg-gray-100 border border-gray-200 px-4 py-2 rounded-2xl rounded-tl-sm flex items-center gap-2 text-sm text-gray-600 shadow-sm">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Intelliq is thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white p-4 md:p-5 relative">
        {/* panel (wrapper has ref) */}
        <div
          ref={panelWrapperRef}
          className={`absolute left-4 bottom-16 z-50 transform transition-all ${attachmentsOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
          style={{ width: 360 }}
        >
          <AttachmentsPanel files={files} onAdd={onAdd} onRemove={onRemove} onClear={onClear} accept="*" />
        </div>

        <div
          ref={inputWrapperRef}
          onDrop={handleDropOnInput}
          onDragOver={handleDragOverOnInput}
          onDragLeave={handleDragLeaveOnInput}
          className="relative flex items-center"
        >
          {/* left icons */}
          <div className="absolute left-3 flex items-center gap-1 text-gray-500">
            <button
              ref={toggleButtonRef}
              onClick={() => setAttachmentsOpen((s) => !s)}
              className="p-1 hover:text-blue-600 rounded-md transition"
              aria-label="toggle-attachments"
            >
              <AttachFileIcon style={{ fontSize: 18 }} />
            </button>
            <button onClick={() => textareaRef.current?.focus()} className="p-1 hover:text-blue-600 rounded-md transition" aria-label="image">
              <ImageIcon style={{ fontSize: 18 }} />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Ask me a question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="w-full resize-none border border-gray-300 rounded-xl pl-20 pr-20 py-6 text-[15px] text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400 max-h-44 overflow-y-auto hide-scrollbar"
          />

          {/* right: counter + send */}
          <div className="absolute right-3 flex items-center gap-2">
            <span className="text-xs text-gray-400">{inputValue.length}/1000</span>
            {(inputValue.trim() || files.length > 0) && (
              <button onClick={handleSend} className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-full transition" aria-label="send">
                <SendIcon style={{ fontSize: 18 }} />
              </button>
            )}
          </div>
        </div>

        {/* inline attachments summary */}
        {files.length > 0 && (
          <div className="mt-3 px-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="font-medium">Attachments:</div>
              <div className="flex gap-2 overflow-auto hide-scrollbar">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs" title={f.name}>
                    <div className="w-6 h-6 flex items-center justify-center bg-white border rounded text-gray-600">
                      <AttachFileIcon style={{ fontSize: 14 }} />
                    </div>
                    <div className="truncate max-w-[10rem]">{f.name}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => setFiles([])} className="ml-2 text-sm text-red-500 hover:underline" title="Remove all attachments">
                Remove all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
