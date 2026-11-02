import React from 'react';
import {
  UserPlus,
  Users,
  Tags,
  MessageCircle,
  Star,
  Sparkles
} from 'lucide-react';
import { Contact, GroupChat } from '../services/userVault';
import { ChatSessionItem } from './ChatsTab';

interface ContactsTabProps {
  contacts: Contact[];
  groups: GroupChat[];
  onSelectChat: (chat: ChatSessionItem) => void;
  onOpenAddFriend: () => void;
  onOpenCreateGroup: () => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  contacts,
  groups,
  onSelectChat,
  onOpenAddFriend,
  onOpenCreateGroup,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto select-none p-3 space-y-3">
      {/* Top Functional Rows */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
        <button
          onClick={onOpenAddFriend}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-emerald-600">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">添加新朋友 (Panda)</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
            + 加好友
          </span>
        </button>

        <button
          onClick={onOpenCreateGroup}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">群聊 ({groups.length})</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
            + 建群
          </span>
        </button>
      </div>

      {/* Group Chats Section */}
      {groups.length > 0 && (
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-slate-500 px-2 flex items-center space-x-1">
            <Users className="w-3 h-3 text-emerald-600" />
            <span>我的专属群聊 (数据库隔离)</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() =>
                  onSelectChat({
                    id: group.id,
                    name: group.name,
                    avatar: '🐼',
                    isGroup: true,
                  })
                }
                className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl">
                    🐼
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{group.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{group.members.length} 位群成员</div>
                  </div>
                </div>
                <button className="p-2 text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends Contacts List */}
      <div className="space-y-1">
        <div className="text-[11px] font-bold text-slate-500 px-2 flex items-center justify-between">
          <span>好友联系人 ({contacts.length})</span>
          <span className="text-[10px] text-slate-400 font-mono">严格账号隔离</span>
        </div>

        {contacts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-2">
            <p className="text-xs text-slate-500">当前通讯录为空</p>
            <button
              onClick={onOpenAddFriend}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              通过 Chat ID 添加朋友
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
            {contacts.map((contact) => (
              <div
                key={contact.email}
                onClick={() =>
                  onSelectChat({
                    id: contact.email,
                    name: contact.nickname,
                    avatar: '🐼',
                    isGroup: false,
                  })
                }
                className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl shadow-xs">
                    🐼
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate flex items-center space-x-1.5">
                      <span>{contact.nickname}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      Chat ID：{contact.wechatId || ('pa_' + contact.email.split('@')[0])}
                    </div>
                  </div>
                </div>
                <button
                  className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center space-x-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>发消息</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
