import React from 'react';
import {
  Mail,
  Database,
  QrCode,
  ShieldCheck,
  Users,
  LogOut,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Lock
} from 'lucide-react';
import { CloudMailAccount } from '../services/userVault';

interface MeTabProps {
  account: CloudMailAccount;
  messagesCount: number;
  contactsCount: number;
  groupsCount: number;
  unreadMailsCount: number;
  onOpenMailbox: () => void;
  onOpenSafetyModal: () => void;
  onSwitchAccount: () => void;
  onLogout: () => void;
}

export const MeTab: React.FC<MeTabProps> = ({
  account,
  messagesCount,
  contactsCount,
  groupsCount,
  unreadMailsCount,
  onOpenMailbox,
  onOpenSafetyModal,
  onSwitchAccount,
  onLogout,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto select-none p-3 space-y-3">
      {/* User Profile Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
            🐼
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base text-slate-800 truncate flex items-center space-x-1.5">
              <span>{account.nickname}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-full font-bold">
                在线
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
              Chat ID：{account.cloudMailId}
            </p>
            <p className="text-[11px] text-emerald-600 font-mono truncate">
              邮箱：{account.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(account.cloudMailId);
              alert(`已复制 Chat ID「${account.cloudMailId}」到剪贴板，朋友可直接搜索此 Chat ID 添加您！`);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center space-x-1 active:scale-95"
            title="复制我的 Chat ID"
          >
            <span>复制 Chat ID</span>
          </button>
          <span className="text-[10px] text-slate-400">朋友专属 ID</span>
        </div>
      </div>

      {/* Cloud Mail Mailbox Entry */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={onOpenMailbox}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-emerald-600">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 text-left">
                Panda 安全邮箱收件箱
              </div>
              <div className="text-[10px] text-slate-500 text-left">
                系统验证邮件与重要安全通知
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {unreadMailsCount > 0 && (
              <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                {unreadMailsCount} 封新邮件
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>
      </div>

      {/* Database Isolation Vault Metrics Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>当前专属数据库沙盒状态</span>
          </span>
          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
            100% 独立隔离
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[10px] text-slate-500">私有聊天消息</div>
            <div className="text-slate-800 font-bold text-sm mt-0.5">{messagesCount} 条</div>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[10px] text-slate-500">专属好友列表</div>
            <div className="text-slate-800 font-bold text-sm mt-0.5">{contactsCount} 位</div>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[10px] text-slate-500">私人群组</div>
            <div className="text-slate-800 font-bold text-sm mt-0.5">{groupsCount} 个</div>
          </div>
        </div>

      </div>

      {/* Account Switcher and Logout Buttons */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
        <button
          onClick={onSwitchAccount}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">切换 Panda 登录账号</div>
              <div className="text-[10px] text-slate-500">
                切换至其他用户测试数据绝对隔离不互串
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-between p-3.5 hover:bg-red-50 transition-colors text-red-600"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">退出当前账号</span>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
};
