import React, { useState } from 'react';
import {
  Search,
  Lock,
  Users,
  MessageSquareHeart,
  Sparkles
} from 'lucide-react';
import { Contact, GroupChat, DirectMessage } from '../services/userVault';

export interface ChatSessionItem {
  id: string; // contact email or groupId
  name: string;
  avatar: string;
  isGroup: boolean;
  lastMessage?: string;
  lastTimestamp?: number;
  unreadCount?: number;
}

interface ChatsTabProps {
  contacts: Contact[];
  groups: GroupChat[];
  messages: DirectMessage[];
  currentEmail: string;
  onSelectChat: (chat: ChatSessionItem) => void;
  onOpenAddFriend: () => void;
}

export const ChatsTab: React.FC<ChatsTabProps> = ({
  contacts,
  groups,
  messages,
  currentEmail,
  onSelectChat,
  onOpenAddFriend,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Assemble chat sessions from contacts and groups
  const sessions: ChatSessionItem[] = [];

  // Groups
  groups.forEach((g) => {
    const groupMsgs = messages.filter((m) => m.isGroup && m.toEmail === g.id);
    const lastMsg = groupMsgs[groupMsgs.length - 1];
    sessions.push({
      id: g.id,
      name: g.name,
      avatar: g.avatar,
      isGroup: true,
      lastMessage: lastMsg ? `${lastMsg.fromEmail === currentEmail ? '我: ' : ''}${lastMsg.content}` : '群聊已创建，开启加密畅聊',
      lastTimestamp: lastMsg ? lastMsg.timestamp : g.createdAt,
      unreadCount: 0,
    });
  });

  // Direct contact chats
  contacts.forEach((c) => {
    const directMsgs = messages.filter(
      (m) =>
        !m.isGroup &&
        ((m.fromEmail === currentEmail && m.toEmail === c.email) ||
          (m.fromEmail === c.email && m.toEmail === currentEmail))
    );
    const lastMsg = directMsgs[directMsgs.length - 1];
    sessions.push({
      id: c.email,
      name: c.nickname,
      avatar: c.avatar,
      isGroup: false,
      lastMessage: lastMsg ? lastMsg.content : '快来戳一戳开启端到端密聊吧~',
      lastTimestamp: lastMsg ? lastMsg.timestamp : Date.now() - 3600000,
      unreadCount: 0,
    });
  });

  // Sort sessions by last message timestamp descending
  sessions.sort((a, b) => (b.lastTimestamp || 0) - (a.lastTimestamp || 0));

  // Filter by search
  const filtered = sessions.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (ts?: number) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto select-none">
      {/* Search Bar */}
      <div className="p-3 bg-white">
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 shadow-sm focus-within:border-emerald-500 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索好友、群聊或 Panda..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 px-2 bg-white">
        {filtered.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl">
              🐼
            </div>
            <p className="text-xs text-slate-500 font-medium">
              当前独立数据库暂无会话
            </p>
            <button
              onClick={onOpenAddFriend}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all inline-flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>添加一个 Panda 好友</span>
            </button>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectChat(item)}
              className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group active:scale-[0.99]"
            >
              {/* Avatar Bubble */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  🐼
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"
                  title="在线"
                />
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span className="font-bold text-slate-800 text-sm truncate">
                      {item.name}
                    </span>
                    {item.isGroup ? (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded-md font-bold">
                        群
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-mono truncate max-w-[100px]">
                        {item.id}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatTime(item.lastTimestamp)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 truncate leading-tight">
                    {item.lastMessage}
                  </p>
                  <span title="E2EE 加密会话">
                    <Lock className="w-3 h-3 text-emerald-600 opacity-70 flex-shrink-0 ml-1" />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
