import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ShieldCheck,
  Lock,
  Smile,
  Send,
  CheckCheck,
  Users,
  UserPlus,
  X,
  Check,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { DirectMessage, UserVaultManager, Contact, GroupChat } from '../services/userVault';
import { ChatSessionItem } from './ChatsTab';
import { LocationPickerModal, LocationData } from './LocationPickerModal';

interface WeChatChatViewProps {
  session: ChatSessionItem;
  currentEmail: string;
  currentNickname: string;
  currentAvatar: string;
  messages: DirectMessage[];
  contacts?: Contact[];
  onSendMessage: (text: string, contentType?: DirectMessage['contentType']) => void;
  onBack: () => void;
  onOpenSafetyModal: () => void;
  onReloadVault?: () => void;
  onOpenAddFriend?: () => void;
}

const CUTE_STICKERS = ['🍓', '🍮', '🌸', '🍰', '🐾', '🍡', '🧸', '🐱', '✨', '☕'];

export const WeChatChatView: React.FC<WeChatChatViewProps> = ({
  session,
  currentEmail,
  currentNickname,
  currentAvatar,
  messages,
  contacts = [],
  onSendMessage,
  onBack,
  onOpenSafetyModal,
  onReloadVault,
  onOpenAddFriend,
}) => {
  const [inputText, setInputText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [selectedNewMembers, setSelectedNewMembers] = useState<string[]>([]);
  const [groupFeedback, setGroupFeedback] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const handleSendLocation = (loc: LocationData) => {
    onSendMessage(JSON.stringify(loc), 'location');
  };

  const bottomRef = useRef<HTMLDivElement>(null);

  // Load group details if session is a group
  const currentVault = UserVaultManager.loadUserVault(currentEmail);
  const currentGroup: GroupChat | undefined = session.isGroup
    ? currentVault?.groups.find((g) => g.id === session.id)
    : undefined;

  // Filter messages strictly for this conversation
  const sessionMessages = messages.filter((m) => {
    if (session.isGroup) {
      return m.isGroup && m.toEmail === session.id;
    }
    return (
      !m.isGroup &&
      ((m.fromEmail === currentEmail && m.toEmail === session.id) ||
        (m.fromEmail === session.id && m.toEmail === currentEmail))
    );
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionMessages.length]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), 'text');
    setInputText('');
  };

  const handleSendSticker = (sticker: string) => {
    onSendMessage(sticker, 'sticker');
    setShowStickers(false);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Contacts available to be added (not currently members of this group)
  const availableContactsToAdd = (currentVault?.contacts || []).filter(
    (c) => !currentGroup?.members.includes(c.email)
  );

  const toggleSelectMember = (email: string) => {
    setSelectedNewMembers((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleConfirmAddMembers = () => {
    if (!currentGroup || selectedNewMembers.length === 0) return;
    try {
      UserVaultManager.addGroupMembers(
        currentEmail,
        currentGroup.id,
        selectedNewMembers,
        currentNickname
      );
      setSelectedNewMembers([]);
      setIsAddingMembers(false);
      setGroupFeedback('🎉 成员已成功加入群聊！');
      setTimeout(() => setGroupFeedback(null), 3000);
      onReloadVault?.();
    } catch (err: unknown) {
      alert((err as Error).message || '添加成员失败');
    }
  };

  // Member details helper
  const getMemberInfo = (memberEmail: string) => {
    if (memberEmail === currentEmail) {
      return {
        name: currentNickname,
        avatar: '🐼',
        wechatId: currentVault?.account.cloudMailId || ('pa_' + memberEmail.split('@')[0]),
        isSelf: true,
      };
    }
    const memVault = UserVaultManager.loadUserVault(memberEmail);
    if (memVault) {
      return {
        name: memVault.account.nickname,
        avatar: '🐼',
        wechatId: memVault.account.cloudMailId,
        isSelf: false,
      };
    }
    const contact = currentVault?.contacts.find((c) => c.email === memberEmail);
    return {
      name: contact?.nickname || memberEmail.split('@')[0],
      avatar: '🐼',
      wechatId: contact?.wechatId || ('pa_' + memberEmail.split('@')[0]),
      isSelf: false,
    };
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative select-none">
      {/* Top Header */}
      <div className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center space-x-1.5 min-w-0">
          <button
            onClick={onBack}
            aria-label="返回 Chat 会话列表"
            className="flex items-center text-slate-700 hover:text-slate-900 font-bold text-xs py-1 pr-1.5 -ml-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Chat</span>
          </button>
          <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-lg flex-shrink-0">
            🐼
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1">
              <span className="font-bold text-sm text-slate-800 truncate">
                {session.name}
                {session.isGroup && currentGroup && ` (${currentGroup.members.length})`}
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded-full font-mono flex items-center">
                <Lock className="w-2.5 h-2.5 mr-0.5" />
                E2EE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              {session.isGroup ? '群成员独立加密隔离' : session.id}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {session.isGroup && (
            <button
              onClick={() => {
                setShowGroupModal(true);
                setIsAddingMembers(false);
              }}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs font-bold"
              title="群成员与群设置"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{currentGroup?.members.length || 1} 人</span>
              <span className="text-[10px] bg-emerald-600 text-white px-1 rounded-md font-bold">+</span>
            </button>
          )}
        </div>
      </div>

      {/* Message Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
        {/* Security watermark header */}
        <div className="flex justify-center">
          <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] text-slate-500 font-mono flex items-center space-x-1.5 shadow-sm">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Panda 独立沙盒库 • AES-256-GCM 本地加密存储</span>
          </div>
        </div>

        {sessionMessages.map((msg) => {
          const isSelf = msg.fromEmail === currentEmail;
          const isSystem = msg.fromEmail.startsWith('sys') || msg.content.startsWith('🔔');

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-1">
                <div className="px-3 py-1 bg-slate-200/80 border border-slate-300 rounded-xl text-[11px] text-slate-700 shadow-2xs">
                  {msg.content}
                </div>
              </div>
            );
          }

          const senderInfo = getMemberInfo(msg.fromEmail);

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 ${
                isSelf ? 'flex-row-reverse space-x-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xl flex-shrink-0 shadow-xs"
                title={`${senderInfo.name} (${senderInfo.wechatId})`}
              >
                🐼
              </div>

              {/* Message Bubble Container */}
              <div className={`max-w-[75%] flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                {session.isGroup && !isSelf && (
                  <span className="text-[10px] text-slate-500 mb-0.5 ml-1 font-mono">
                    {senderInfo.name}
                  </span>
                )}

                {/* Bubble */}
                {msg.contentType === 'sticker' ? (
                  <div className="text-4xl p-1">{msg.content}</div>
                ) : msg.contentType === 'location' ? (
                  (() => {
                    let loc: LocationData;
                    try {
                      loc = JSON.parse(msg.content);
                    } catch {
                      loc = {
                        name: msg.content,
                        address: '位置定位消息',
                        latitude: 39.93,
                        longitude: 116.45,
                      };
                    }
                    return (
                      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2 max-w-[250px] text-slate-800">
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-slate-800 truncate">{loc.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono line-clamp-2 mt-0.5">{loc.address}</div>
                          </div>
                        </div>

                        {/* Simulated Map Widget */}
                        <div className="relative h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center p-2 text-white">
                          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:8px_8px]" />
                          <div className="relative z-10 text-center">
                            <span className="text-xl inline-block animate-bounce">📍</span>
                            <div className="text-[9px] font-mono text-emerald-300">
                              ({loc.latitude}°, {loc.longitude}°)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                          <span>{formatTime(msg.timestamp)}</span>
                          <span className="text-emerald-700 font-bold">位置消息</span>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div
                    className={`relative px-4 py-2.5 rounded-2xl text-xs leading-relaxed break-words shadow-xs border transition-all ${
                      isSelf
                        ? 'bg-emerald-600 border-emerald-600 text-white rounded-tr-xs'
                        : 'bg-white border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {msg.content}

                    <div className={`mt-1 flex items-center justify-end space-x-1 text-[9px] font-mono ${isSelf ? 'text-emerald-100' : 'text-slate-400'}`}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {isSelf && (
                        <span title="已安全送达专属库">
                          <CheckCheck className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Stickers Quick Tray */}
      {showStickers && (
        <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 overflow-x-auto z-10">
          <span className="text-[10px] text-slate-500 font-bold flex-shrink-0">萌系表情:</span>
          {CUTE_STICKERS.map((stk) => (
            <button
              key={stk}
              type="button"
              onClick={() => handleSendSticker(stk)}
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xl flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform"
            >
              {stk}
            </button>
          ))}
        </div>
      )}

      {/* Input Toolbar */}
      <form
        onSubmit={handleSend}
        className="p-2.5 bg-white border-t border-slate-200 flex items-center space-x-2 z-20"
      >
        <button
          type="button"
          onClick={() => setShowStickers(!showStickers)}
          className={`p-2 rounded-xl border transition-colors ${
            showStickers
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
          }`}
          title="Q版可爱表情与贴图"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setShowLocationModal(true)}
          className="p-2 rounded-xl border bg-white text-emerald-600 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
          title="发送当前位置定位卡片"
        >
          <MapPin className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="输入消息... (支持回车发送)"
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center space-x-1 disabled:opacity-40 active:scale-95 flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>发送</span>
        </button>
      </form>

      {/* Group Members & Settings Modal */}
      {showGroupModal && currentGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden p-5 space-y-4 select-none max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🐼</span>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{currentGroup.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    群成员共 {currentGroup.members.length} 人
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setIsAddingMembers(false);
                }}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {groupFeedback && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-1.5">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{groupFeedback}</span>
              </div>
            )}

            {/* Member Grid and Add Member action */}
            {!isAddingMembers ? (
              <div className="space-y-4 overflow-y-auto flex-1">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>群成员列表</span>
                    <button
                      onClick={() => setIsAddingMembers(true)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl flex items-center space-x-1 shadow-2xs transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ 添加群成员</span>
                    </button>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-4 gap-2.5 pt-1">
                    {/* Add button icon */}
                    <button
                      onClick={() => setIsAddingMembers(true)}
                      className="flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all aspect-square"
                      title="添加新群成员"
                    >
                      <UserPlus className="w-5 h-5 mb-0.5" />
                      <span className="text-[10px] font-bold">添加</span>
                    </button>

                    {/* Member Avatars */}
                    {currentGroup.members.map((email) => {
                      const info = getMemberInfo(email);
                      return (
                        <div
                          key={email}
                          className="flex flex-col items-center p-2 bg-slate-50 rounded-2xl border border-slate-200 text-center shadow-2xs"
                        >
                          <span className="text-2xl mb-1">🐼</span>
                          <span className="text-[11px] font-bold text-slate-800 truncate w-full">
                            {info.name}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono truncate w-full">
                            {info.wechatId}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Group Notice */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-emerald-700">📢 群公告</div>
                  <div className="text-slate-600 text-[11px] leading-relaxed">
                    {currentGroup.notice || '欢迎加入新群聊！大家开心畅聊，支持随时拉好友入群~'}
                  </div>
                </div>
              </div>
            ) : (
              /* Add Members selection sub-view */
              <div className="space-y-3 overflow-y-auto flex-1">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700">
                    选择好友加入群聊 ({selectedNewMembers.length})
                  </span>
                  <button
                    onClick={() => {
                      setIsAddingMembers(false);
                      setSelectedNewMembers([]);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    ‹ 返回成员列表
                  </button>
                </div>

                {availableContactsToAdd.length === 0 ? (
                  <div className="p-6 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
                    <AlertCircle className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="text-xs text-slate-500">
                      您的所有通讯录好友均已在该群聊中！
                    </p>
                    {onOpenAddFriend && (
                      <button
                        onClick={() => {
                          setShowGroupModal(false);
                          setIsAddingMembers(false);
                          onOpenAddFriend();
                        }}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-2xs"
                      >
                        去添加新朋友 (Chat ID)
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {availableContactsToAdd.map((contact) => {
                      const isSelected = selectedNewMembers.includes(contact.email);
                      return (
                        <div
                          key={contact.email}
                          onClick={() => toggleSelectMember(contact.email)}
                          className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-300'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="text-xl">🐼</span>
                            <div>
                              <div className="text-xs font-bold text-slate-800">
                                {contact.nickname}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                Chat ID：{contact.wechatId || ('pa_' + contact.email.split('@')[0])}
                              </div>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {availableContactsToAdd.length > 0 && (
                  <button
                    onClick={handleConfirmAddMembers}
                    disabled={selectedNewMembers.length === 0}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-2xl shadow-sm transition-all"
                  >
                    确认添加 ({selectedNewMembers.length}) 位好友进群
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSendLocation={handleSendLocation}
      />
    </div>
  );
};
