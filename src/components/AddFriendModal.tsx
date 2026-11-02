import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import { UserVaultManager } from '../services/userVault';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
  onFriendAdded: () => void;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  onFriendAdded,
}) => {
  const [friendWeChatId, setFriendWeChatId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const added = UserVaultManager.addFriendByWeChatId(currentUserEmail, friendWeChatId.trim());
      setSuccessMsg(`🎉 成功添加好友「${added.nickname}」(${friendWeChatId.trim()}) 至您的通讯录！`);
      setTimeout(() => {
        onFriendAdded();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || '添加失败');
    }
  };

  const currentVault = UserVaultManager.loadUserVault(currentUserEmail);
  const myWeChatId = currentVault?.account.cloudMailId || ('pa_' + currentUserEmail.split('@')[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden p-5 space-y-4 select-none">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Chat ID 添加朋友</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-sm font-bold">
            ✕
          </button>
        </div>

        {/* My WeChat ID hint */}
        <div className="p-2.5 bg-slate-50 rounded-2xl flex items-center justify-between text-xs border border-slate-200">
          <span className="text-slate-500">我的 Chat ID：</span>
          <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
            {myWeChatId}
          </span>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start space-x-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-1.5">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              输入朋友的 Chat ID
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="例如: pa_panda_888"
                value={friendWeChatId}
                onChange={(e) => setFriendWeChatId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              * 为保护个人隐私，请向朋友询问并输入其精确的 Chat ID
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>通过 Chat ID 查找并添加</span>
          </button>
        </form>
      </div>
    </div>
  );
};
