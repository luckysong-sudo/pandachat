import React, { useState, useRef } from 'react';
import {
  Send,
  Flame,
  Paperclip,
  Smile,
  Shield,
  X,
  FileCode,
  Image as ImageIcon
} from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (
    text: string,
    burnTimer?: number,
    attachment?: { url: string; name: string; size: number; type: 'image' | 'file' }
  ) => void;
  isEncrypting: boolean;
  defaultBurnTimer: number;
}

const COMMON_EMOJIS = ['👋', '🔒', '⚡', '🚀', '🔥', '🛡️', '🤖', '💻', '🎉', '👍'];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isEncrypting,
  defaultBurnTimer,
}) => {
  const [text, setText] = useState('');
  const [burnTimer, setBurnTimer] = useState<number>(defaultBurnTimer);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<{
    url: string;
    name: string;
    size: number;
    type: 'image' | 'file';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() && !attachment) return;
    onSendMessage(text.trim(), burnTimer, attachment || undefined);
    setText('');
    setAttachment(null);
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('附件大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const isImg = file.type.startsWith('image/');
      setAttachment({
        url: reader.result as string,
        name: file.name,
        size: file.size,
        type: isImg ? 'image' : 'file',
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-3 bg-slate-950 border-t border-slate-900 select-none relative">
      {/* File attachment preview */}
      {attachment && (
        <div className="mb-2 px-3 py-2 bg-slate-900 border border-cyan-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {attachment.type === 'image' ? (
              <img src={attachment.url} alt="preview" className="w-8 h-8 rounded object-cover border border-slate-700" />
            ) : (
              <FileCode className="w-6 h-6 text-cyan-400" />
            )}
            <div>
              <div className="text-xs font-medium text-slate-200 truncate max-w-xs">{attachment.name}</div>
              <div className="text-[10px] text-cyan-400 font-mono">
                {(attachment.size / 1024).toFixed(1)} KB • 发送前将进行客户端 AES-256-GCM 本地加密
              </div>
            </div>
          </div>
          <button
            onClick={() => setAttachment(null)}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top controls: Burn timer + Emoji bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {/* Burn Timer Pill */}
          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Flame className={`w-3.5 h-3.5 ${burnTimer > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <select
              value={burnTimer}
              onChange={(e) => setBurnTimer(Number(e.target.value))}
              className="bg-transparent text-[11px] text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value={0} className="bg-slate-900">永久消息</option>
              <option value={5} className="bg-slate-900">5秒 阅后即焚</option>
              <option value={10} className="bg-slate-900">10秒 阅后即焚</option>
              <option value={30} className="bg-slate-900">30秒 阅后即焚</option>
              <option value={60} className="bg-slate-900">60秒 阅后即焚</option>
            </select>
          </div>

          {/* Quick Security Badge */}
          <span className="hidden sm:flex items-center space-x-1 text-[11px] text-emerald-400/80 font-mono">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>端到端零知识传输</span>
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Emoji trigger */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-900 transition-colors"
            title="选择常用表情"
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-900 transition-colors"
            title="添加加密图片或文件附件"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.txt,.json,.md,.zip"
          />
        </div>
      </div>

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-wrap gap-1.5 max-w-[200px] z-30">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="w-8 h-8 rounded-lg hover:bg-slate-800 text-base flex items-center justify-center transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main input container */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入保密消息... (Enter 发送, Shift+Enter 换行)"
          rows={1}
          className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 resize-none max-h-32 min-h-[42px]"
        />

        <button
          type="submit"
          disabled={isEncrypting || (!text.trim() && !attachment)}
          className={`h-[42px] px-4 rounded-xl font-medium text-xs flex items-center space-x-1.5 transition-all select-none ${
            !text.trim() && !attachment
              ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 active:scale-95'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-mono">
            {isEncrypting ? 'WASM 加密中...' : '加密发送'}
          </span>
        </button>
      </form>
    </div>
  );
};
