import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  UserPlus,
  Users,
  Mail,
  ChevronLeft
} from 'lucide-react';

import { PWAInstallButton } from './PWAInstallButton';

interface WeChatNavbarProps {
  title: string;
  unreadTotal: number;
  edgeNode?: string;
  isWasmActive?: boolean;
  onOpenAddFriend: () => void;
  onOpenCreateGroup: () => void;
  onOpenSafetyModal?: () => void;
  onOpenMailbox: () => void;
  onOpenWasmModal?: () => void;
  onOpenCloudflareModal?: () => void;
  onBack?: () => void;
  isInsideChat?: boolean;
}

export const WeChatNavbar: React.FC<WeChatNavbarProps> = ({
  title,
  unreadTotal,
  onOpenAddFriend,
  onOpenCreateGroup,
  onOpenMailbox,
  onBack,
  isInsideChat,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none z-30 shadow-sm">
      {/* Left: Back button (if inside chat) or App Title */}
      <div className="flex items-center space-x-2 min-w-0">
        {isInsideChat && onBack ? (
          <button
            onClick={onBack}
            className="flex items-center space-x-0.5 text-slate-700 hover:text-slate-900 font-bold text-sm -ml-1 pr-1.5 py-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Chat</span>
            {unreadTotal > 0 && (
              <span className="text-[11px] bg-red-100 text-red-600 px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                {unreadTotal}
              </span>
            )}
          </button>
        ) : null}

        <div className="flex items-center space-x-1.5 truncate">
          <span className="font-bold text-slate-800 text-base truncate">
            {title}
          </span>
          <span
            className="hidden sm:inline-flex items-center text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full font-mono"
            title="全流程客户端端到端加密"
          >
            <ShieldCheck className="w-3 h-3 mr-0.5" />
            E2EE
          </span>
        </div>
      </div>

      {/* Right Controls: PWA Install, Mailbox shortcut and Classic WeChat '+' button */}
      <div className="flex items-center space-x-1.5 relative">
        {/* PWA / APK Mobile Install Prompt */}
        <PWAInstallButton />

        {/* Mailbox shortcut button */}
        <button
          onClick={onOpenMailbox}
          className="p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
          title="我的 Panda 安全邮箱"
        >
          <Mail className="w-4 h-4" />
        </button>

        {/* WeChat Classic '+' Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1.5 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all shadow-sm active:scale-95"
            title="功能菜单"
          >
            <Plus className="w-4 h-4" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-10 w-40 bg-slate-800 text-white rounded-2xl shadow-xl p-1.5 z-50 text-xs font-medium space-y-0.5 border border-slate-700 animate-scale-in">
                <button
                  onClick={() => { setShowDropdown(false); onOpenCreateGroup(); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-700 flex items-center space-x-2 transition-colors"
                >
                  <Users className="w-4 h-4 text-emerald-300" />
                  <span>发起群聊</span>
                </button>
                <button
                  onClick={() => { setShowDropdown(false); onOpenAddFriend(); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-700 flex items-center space-x-2 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-emerald-300" />
                  <span>添加朋友</span>
                </button>
                <button
                  onClick={() => { setShowDropdown(false); onOpenMailbox(); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-700 flex items-center space-x-2 transition-colors"
                >
                  <Mail className="w-4 h-4 text-emerald-300" />
                  <span>Panda 邮箱</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
