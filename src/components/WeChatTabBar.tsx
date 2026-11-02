import React from 'react';
import {
  MessageSquare,
  Users,
  Compass,
  User
} from 'lucide-react';

export type WeChatTabType = 'chats' | 'contacts' | 'discover' | 'me';

interface WeChatTabBarProps {
  activeTab: WeChatTabType;
  onChangeTab: (tab: WeChatTabType) => void;
  unreadChatsCount: number;
  hasMomentsUpdate?: boolean;
}

export const WeChatTabBar: React.FC<WeChatTabBarProps> = ({
  activeTab,
  onChangeTab,
  unreadChatsCount,
  hasMomentsUpdate = true,
}) => {
  return (
    <nav className="h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-2 select-none z-30 shadow-sm">
      {/* Tab 1: 微信 (Chats) */}
      <button
        onClick={() => onChangeTab('chats')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
          activeTab === 'chats' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 stroke-[2.2]" />
          {unreadChatsCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center shadow-sm">
              {unreadChatsCount > 99 ? '99+' : unreadChatsCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold mt-0.5">Chat</span>
      </button>

      {/* Tab 2: 通讯录 (Contacts) */}
      <button
        onClick={() => onChangeTab('contacts')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
          activeTab === 'contacts' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Users className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] font-bold mt-0.5">通讯录</span>
      </button>

      {/* Tab 3: 发现 (Discover) */}
      <button
        onClick={() => onChangeTab('discover')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
          activeTab === 'discover' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <Compass className="w-5 h-5 stroke-[2.2]" />
          {hasMomentsUpdate && (
            <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
        <span className="text-[10px] font-bold mt-0.5">发现</span>
      </button>

      {/* Tab 4: 我 (Me) */}
      <button
        onClick={() => onChangeTab('me')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
          activeTab === 'me' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <User className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] font-bold mt-0.5">我</span>
      </button>
    </nav>
  );
};
