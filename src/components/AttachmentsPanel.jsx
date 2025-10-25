import React, { useEffect, useMemo, useRef } from "react";
import {
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Remove as RemoveIcon,
  CameraAlt as CameraIcon,
} from "@mui/icons-material";

/**
 * Props:
 * - files: File[] (controlled)
 * - onAdd(Array<File>): append files
 * - onRemove(index): remove file by index
 * - onClear(): clear all
 * - accept: string for input accept
 */
export default function AttachmentsPanel({
  files = [],
  onAdd = () => {},
  onRemove = () => {},
  onClear = () => {},
  accept = "*",
}) {
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const idRef = useRef(`file-input-${Math.random().toString(36).slice(2, 9)}`);

  // derive preview items (revoke on cleanup)
  const items = useMemo(() => {
    return (files || []).map((f, idx) => ({
      id: `${f.name}-${f.size}-${idx}`,
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
      preview: isImageFile(f) ? URL.createObjectURL(f) : null,
      progress: 0,
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      items.forEach((it) => {
        if (it.preview) URL.revokeObjectURL(it.preview);
      });
    };
  }, [items]);

  // drag/drop on panel
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      el.classList.add("ring", "ring-2", "ring-dashed", "ring-sky-300");
    };
    const handleDragLeave = () => {
      el.classList.remove("ring", "ring-2", "ring-dashed", "ring-sky-300");
    };
    const handleDrop = (e) => {
      e.preventDefault();
      el.classList.remove("ring", "ring-2", "ring-dashed", "ring-sky-300");
      const dtFiles = e.dataTransfer.files;
      if (dtFiles && dtFiles.length) onAdd(Array.from(dtFiles));
    };

    el.addEventListener("dragover", handleDragOver);
    el.addEventListener("dragleave", handleDragLeave);
    el.addEventListener("drop", handleDrop);

    return () => {
      el.removeEventListener("dragover", handleDragOver);
      el.removeEventListener("dragleave", handleDragLeave);
      el.removeEventListener("drop", handleDrop);
    };
  }, [onAdd]);

  function formatBytes(bytes) {
    if (!bytes) return "0B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)}${sizes[i]}`;
  }

  const openFileDialog = () => {
    const input = fileInputRef.current;
    if (!input) {
      const el = document.getElementById(idRef.current);
      if (el) el.click();
      return;
    }
    try {
      input.click();
    } catch {
      input.focus();
      input.click();
    }
  };

  return (
    <div ref={dropRef} className="bg-white border border-gray-200 rounded-xl shadow-sm p-2" aria-label="attachments-panel">
      {/* header */}
      <div className="flex items-center justify-between px-2 py-1">
        <div className="text-sm font-medium text-gray-700">Attached Files</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => {}} className="text-sky-600 px-2 py-1 rounded-md text-sm font-medium" title="Add (UI only)">
            Add <span className="ml-1 text-gray-400">+</span>
          </button>

          <button onClick={onClear} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600" title="Delete all">
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/*Attachment list */}
      <div className="mt-1">
        {items.length === 0 ? (
          <div className="px-3 py-3 text-sm text-gray-500">No attachments</div>
        ) : (
          <ul className="divide-y divide-gray-100" style={{ maxHeight: 14 * 16 * 3.5, overflowY: "auto" }}>
            {items.map((a, i) => (
              <li key={a.id} className="px-3 py-2 flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-50 text-gray-600">
                  {a.preview ? <img src={a.preview} alt={a.name} className="w-6 h-6 object-cover rounded-md" /> : <AttachFileIcon fontSize="small" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800 truncate">{a.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                    <span>{formatBytes(a.size)}</span>
                    <div className="h-1 w-24 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400" style={{ width: `${Math.min(100, Math.round(a.progress))}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => onRemove(i)} className="p-1 rounded-md hover:bg-gray-100 text-gray-600" title="Remove file">
                    <RemoveIcon fontSize="small" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* footer: attach + image */}
      <div className="mt-2 px-2 pb-2 flex items-center gap-2">
        <button type="button" onClick={openFileDialog} className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-50 text-sm text-gray-700 hover:bg-gray-100">
          <AttachFileIcon fontSize="small" />
          Attach
        </button>

        <input
          id={idRef.current}
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const fl = e.target.files;
            if (fl && fl.length) {
              onAdd(Array.from(fl));
              e.target.value = null;
            }
          }}
        />

        <button title="Camera (design only)" className="p-2 rounded-md hover:bg-gray-100 text-gray-600" aria-hidden="true">
          <CameraIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}

function isImageFile(file) {
  return file && file.type && file.type.startsWith("image/");
}
