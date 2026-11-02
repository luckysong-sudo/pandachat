import React, { useEffect, useRef } from 'react';
import {
  Shield,
  Lock,
  Cpu,
  Share2,
  Terminal,
  Sparkles,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { Message, Room } from '../types/chat';
import { MessageItem } from './MessageItem';

interface ChatAreaProps {
  currentRoom: Room;
  messages: Message[];
  currentUserId: string;
  typingUsers: string[];
  onBurnMessage: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onCopyInvite: () => void;
  onOpenWiretap: () => void;
  onOpenWasm: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  currentRoom,
  messages,
  currentUserId,
  typingUsers,
  onBurnMessage,
  onReaction,
  onCopyInvite,
  onOpenWiretap,
  onOpenWasm,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto px-4 py-3 relative bg-slate-950/50">
      {/* Background cyber grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#083344_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Empty State / Room Key Briefing */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto z-10 space-y-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-emerald-500/20 border border-cyan-400/40 flex items-center justify-center shadow-xl shadow-cyan-500/10">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 border border-emerald-500/40 rounded-full text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              密室 #{currentRoom.name} 已加密激活
            </h2>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed font-mono">
              零知识协议已生效。通信内容均经由 WebCrypto (AES-256-GCM) 本地加密，服务器仅转发密文，无法被任何第三方窥探。
            </p>
          </div>

          {/* Room Security Cards */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left text-xs font-mono">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] text-cyan-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>加密算法标准</span>
              </div>
              <div className="text-slate-300 font-semibold text-[11px]">AES-GCM-256 (PBKDF2)</div>
              <div className="text-[10px] text-slate-500">100,000 次 SHA-256 迭代</div>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>加速引擎</span>
              </div>
              <div className="text-slate-300 font-semibold text-[11px]">WebAssembly 64KB 极速校验</div>
              <div className="text-[10px] text-slate-500">雪崩哈希实时防篡改</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={onCopyInvite}
              className="px-3.5 py-2 bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>复制私密链接</span>
            </button>
            <button
              onClick={onOpenWiretap}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>打开抓包审计</span>
            </button>
            <button
              onClick={onOpenWasm}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>WASM 基准测试</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-end">
          {/* Messages stream */}
          <div className="space-y-1">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                currentUserId={currentUserId}
                onBurn={onBurnMessage}
                onReaction={onReaction}
              />
            ))}
          </div>
        </div>
      )}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="py-1 px-3 text-[11px] text-cyan-400 font-mono flex items-center space-x-1.5 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>{typingUsers.join(', ')} 正在本地加密输入中...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
