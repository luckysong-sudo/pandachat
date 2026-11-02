import React, { useState } from 'react';
import {
  Hash,
  Lock,
  Plus,
  Share2,
  Shield,
  Key,
  Flame,
  Check,
  Copy,
  Users,
  Settings,
  Sparkles
} from 'lucide-react';
import { Room, UserProfile } from '../types/chat';

interface SidebarProps {
  rooms: Room[];
  currentRoom: Room;
  onSelectRoom: (room: Room) => void;
  onCreateRoom: (name: string, password?: string, burnTimer?: number) => void;
  userProfile: UserProfile;
  onUpdateProfile: (name: string, avatar: string) => void;
  onOpenCloudflareModal: () => void;
}

const AVATAR_OPTIONS = ['🦊', '🐱', '🐼', '🦁', '🐺', '🦉', '🚀', '⚡', '🛡️', '👾'];

export const Sidebar: React.FC<SidebarProps> = ({
  rooms,
  currentRoom,
  onSelectRoom,
  onCreateRoom,
  userProfile,
  onUpdateProfile,
  onOpenCloudflareModal,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [newRoomBurnTimer, setNewRoomBurnTimer] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editNickname, setEditNickname] = useState(userProfile.nickname);
  const [editAvatar, setEditAvatar] = useState(userProfile.avatar);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onCreateRoom(newRoomName.trim(), newRoomPassword.trim() || undefined, newRoomBurnTimer);
    setNewRoomName('');
    setNewRoomPassword('');
    setNewRoomBurnTimer(0);
    setShowCreateModal(false);
  };

  const handleCopyInviteLink = () => {
    const url = new URL(window.location.href);
    // RFC 3986: Hash fragments (#) are strictly client-side and never transmitted in HTTP headers!
    url.hash = `room=${encodeURIComponent(currentRoom.id)}&key=${encodeURIComponent(currentRoom.salt)}`;
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveProfile = () => {
    if (editNickname.trim()) {
      onUpdateProfile(editNickname.trim(), editAvatar);
    }
    setIsEditingProfile(false);
  };

  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-900 flex flex-col h-full select-none flex-shrink-0">
      {/* User Profile Card */}
      <div className="p-4 border-b border-slate-900 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="w-10 h-10 rounded-xl bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-xl hover:scale-105 transition-transform"
              title="修改头像与昵称"
            >
              {userProfile.avatar}
            </button>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-slate-100 text-sm">
                  {userProfile.nickname}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="在线" />
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex items-center">
                <span>ID: {userProfile.keyFingerprint.substring(0, 10)}...</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="设置个人资料"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Profile edit dropdown */}
        {isEditingProfile && (
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5">
            <label className="text-[11px] text-slate-400 font-medium">选择身份头像</label>
            <div className="flex flex-wrap gap-1.5">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setEditAvatar(emoji)}
                  className={`w-7 h-7 text-sm rounded-lg flex items-center justify-center border transition-all ${
                    editAvatar === emoji
                      ? 'border-cyan-400 bg-cyan-950/50'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-medium">昵称</label>
              <input
                type="text"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                maxLength={24}
                className="w-full mt-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-2 py-1 text-xs text-slate-400 hover:text-white"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rooms header */}
      <div className="p-3 pb-2 flex items-center justify-between text-xs font-semibold text-slate-400 tracking-wider">
        <span className="flex items-center space-x-1.5">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>加密密室列表</span>
        </span>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1 px-2 py-1 bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 rounded hover:bg-cyan-900/50 hover:border-cyan-400 transition-all text-[11px]"
        >
          <Plus className="w-3 h-3" />
          <span>新建密室</span>
        </button>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {rooms.map((room) => {
          const isActive = room.id === currentRoom.id;
          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room)}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between group transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/50 border border-cyan-500/40 text-cyan-200 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs border ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 group-hover:border-slate-700'
                  }`}
                >
                  {room.hasPassword ? <Lock className="w-3.5 h-3.5" /> : <Hash className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate flex items-center space-x-1">
                    <span className="truncate">{room.name}</span>
                    {room.defaultBurnTimer > 0 && (
                      <Flame className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {room.hasPassword ? '密码加固 • E2EE' : '零知识共享 • E2EE'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                {room.participantCount}人
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Invite & Key Sharing Tool */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/80 space-y-2">
        <button
          onClick={handleCopyInviteLink}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-200 hover:border-cyan-500/50 hover:text-cyan-300 transition-all"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">已复制私密邀请链!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>复制当前密室邀请链接</span>
            </>
          )}
        </button>
        <p className="text-[10px] text-slate-500 text-center leading-relaxed font-mono">
          密钥保存在 URL 锚点(#)中，根据 RFC 协议绝对不会发送给服务器
        </p>
      </div>

      {/* Security Architecture & Cloudflare Promo Card */}
      <div className="p-3 border-t border-slate-900 bg-gradient-to-br from-slate-950 to-slate-900 text-xs">
        <div className="flex items-center justify-between text-slate-300 mb-1.5">
          <span className="flex items-center space-x-1 font-semibold text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            <span>无后门安全架构</span>
          </span>
          <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
            已审计
          </span>
        </div>
        <ul className="text-[10px] text-slate-400 space-y-1 font-mono">
          <li className="flex items-center">
            <span className="text-emerald-400 mr-1.5">✔</span> 客户端 WebCrypto AES-GCM
          </li>
          <li className="flex items-center">
            <span className="text-emerald-400 mr-1.5">✔</span> WebAssembly 高性能哈希引擎
          </li>
          <li className="flex items-center">
            <span className="text-emerald-400 mr-1.5">✔</span> Cloudflare Workers 零成本边缘
          </li>
        </ul>
        <button
          onClick={onOpenCloudflareModal}
          className="mt-2.5 w-full py-1.5 bg-orange-950/40 border border-orange-500/30 text-orange-300 rounded hover:bg-orange-900/50 transition-colors text-[11px] font-medium flex items-center justify-center space-x-1"
        >
          <Sparkles className="w-3 h-3 text-orange-400" />
          <span>私有化部署 Cloudflare 教程</span>
        </button>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white flex items-center space-x-2 text-base">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>新建端到端加密密室</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 font-medium">密室名称 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：极客茶话会 或 operation-nebula"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                  <span>独立加密口令 (可选，留空则自动生成随机高强度密钥)</span>
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                </label>
                <input
                  type="password"
                  placeholder="自定义密码（派生 AES-256 密钥）"
                  value={newRoomPassword}
                  onChange={(e) => setNewRoomPassword(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>默认阅后即焚倒计时</span>
                </label>
                <select
                  value={newRoomBurnTimer}
                  onChange={(e) => setNewRoomBurnTimer(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value={0}>关闭（保留至页面刷新）</option>
                  <option value={5}>5 秒后自动销毁</option>
                  <option value={10}>10 秒后自动销毁</option>
                  <option value={30}>30 秒后自动销毁</option>
                  <option value={60}>60 秒后自动销毁</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-300 font-mono">
                🔒 零知识保障：密室信息与密钥均在浏览器中生成，服务器仅负责不可解密的密文包转发。
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg"
                >
                  创建并进入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
