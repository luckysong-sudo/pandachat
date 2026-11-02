import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Flame,
  CheckCheck,
  Lock,
  Copy,
  Check,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
  Cpu
} from 'lucide-react';
import { Message } from '../types/chat';

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  onBurn: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '🔒', '🚀'];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  onBurn,
  onReaction,
}) => {
  const isSelf = message.senderId === currentUserId;
  const [copied, setCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  // Burn-after-reading countdown timer
  useEffect(() => {
    if (message.isBurned || !message.burnDuration || message.burnDuration <= 0) {
      return;
    }

    const expiresAt = message.burnExpiresAt || (message.timestamp + message.burnDuration * 1000);
    const updateCountdown = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.ceil((expiresAt - now) / 1000));
      setSecondsRemaining(diffSec);

      if (diffSec <= 0) {
        onBurn(message.id);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 500);
    return () => clearInterval(interval);
  }, [message.id, message.isBurned, message.burnDuration, message.burnExpiresAt, message.timestamp, onBurn]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Burned State
  if (message.isBurned) {
    return (
      <div className={`flex my-2.5 ${isSelf ? 'justify-end' : 'justify-start'}`}>
        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-red-500/30 text-red-300/80 text-xs font-mono shadow-inner">
          <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>[此消息已按阅后即焚协议销毁 • 内存已清零]</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex my-3 group ${isSelf ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isSelf ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm border shadow-sm ${
            isSelf
              ? 'ml-2 bg-cyan-950/70 border-cyan-500/40'
              : 'mr-2 bg-slate-800 border-slate-700'
          }`}
        >
          {message.senderAvatar}
        </div>

        {/* Message Bubble Container */}
        <div className="flex flex-col">
          {/* Sender Header */}
          <div className={`flex items-center space-x-1.5 mb-1 px-1 text-[11px] ${isSelf ? 'justify-end' : 'justify-start'}`}>
            <span className="font-semibold text-slate-300">{message.senderName}</span>
            <span className="text-slate-500 font-mono text-[10px]">{formatTime(message.timestamp)}</span>
            <span
              className="flex items-center text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-1 py-0.2 rounded border border-emerald-500/20"
              title={`E2EE 校验哈希: 0x${message.wasmChecksum.toString(16)}`}
            >
              <ShieldCheck className="w-2.5 h-2.5 mr-0.5 inline" />
              WASM Verified
            </span>
          </div>

          {/* Bubble */}
          <div
            className={`relative rounded-2xl px-4 py-2.5 shadow-md backdrop-blur-sm border transition-all ${
              isSelf
                ? 'bg-gradient-to-br from-cyan-950/80 to-blue-900/60 border-cyan-500/40 text-slate-100 rounded-tr-sm'
                : 'bg-slate-900/90 border-slate-800 text-slate-100 rounded-tl-sm'
            }`}
          >
            {/* Burn countdown banner */}
            {secondsRemaining !== null && secondsRemaining > 0 && (
              <div className="mb-2 pb-1 border-b border-amber-500/30 flex items-center justify-between text-[11px] text-amber-300 font-mono">
                <span className="flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>阅后即焚倒计时</span>
                </span>
                <span className="font-bold bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200">
                  {secondsRemaining}s
                </span>
              </div>
            )}

            {/* Media Attachment if any */}
            {message.contentType === 'image' && message.mediaUrl && (
              <div className="mb-2 rounded-lg overflow-hidden border border-slate-700 max-w-sm">
                <img
                  src={message.mediaUrl}
                  alt={message.mediaName || 'Encrypted Image'}
                  className="w-full h-auto object-cover max-h-60 rounded"
                />
                <div className="px-2 py-1 bg-slate-950/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>🔒 AES-256 加密图片</span>
                  <span>{message.mediaName}</span>
                </div>
              </div>
            )}

            {/* Plain text body */}
            <div className="text-sm whitespace-pre-wrap break-words leading-relaxed selection:bg-cyan-500/30">
              {message.plainText}
            </div>

            {/* Bottom Status bar */}
            <div className="mt-1 pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <div className="flex items-center space-x-1 text-slate-500">
                <Cpu className="w-2.5 h-2.5 text-emerald-400" />
                <span>0x{message.wasmChecksum.toString(16).slice(0, 6)}</span>
              </div>
              <div className="flex items-center space-x-1.5 ml-3">
                <button
                  onClick={handleCopy}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white transition-opacity"
                  title="复制明文"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <span title="已加密并完成完整性校验">
                  <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
                </span>
              </div>
            </div>
          </div>

          {/* Reactions bar */}
          <div className={`flex items-center flex-wrap gap-1 mt-1 px-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(message.reactions || {}).map(([emoji, users]) => {
              if (users.length === 0) return null;
              const hasReacted = users.includes(currentUserId);
              return (
                <button
                  key={emoji}
                  onClick={() => onReaction(message.id, emoji)}
                  className={`px-1.5 py-0.5 rounded-full text-xs flex items-center space-x-1 border transition-all ${
                    hasReacted
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="text-[10px] font-mono">{users.length}</span>
                </button>
              );
            })}

            {/* Add reaction trigger */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(message.id, emoji)}
                  className="w-5 h-5 flex items-center justify-center text-xs hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
