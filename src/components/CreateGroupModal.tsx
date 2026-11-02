import React, { useState } from 'react';
import {
  Users,
  Check,
  Sparkles
} from 'lucide-react';
import { UserVaultManager, Contact } from '../services/userVault';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
  contacts: Contact[];
  onGroupCreated: () => void;
}

const GROUP_AVATARS = ['🍰', '🧁', '🍪', '🍮', '🍓', '🍡', '🍵', '🐾'];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  contacts,
  onGroupCreated,
}) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleMember = (email: string) => {
    setSelectedMembers((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setErrorMsg('请填写群聊名称');
      return;
    }

    try {
      UserVaultManager.createGroup(currentUserEmail, groupName.trim(), selectedMembers, '🐼');
      onGroupCreated();
      onClose();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || '创建群聊失败');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden p-5 space-y-4 select-none">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>发起新群聊 (专属数据库)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-sm">
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">群聊名称</label>
            <input
              type="text"
              placeholder="例如: 功夫熊猫乐园 🐼"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
              从通讯录选择成员 ({selectedMembers.length} 人已选)
            </label>
            {contacts.length === 0 ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                暂无好友，可先添加好友再拉群
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                {contacts.map((contact) => {
                  const isChecked = selectedMembers.includes(contact.email);
                  return (
                    <div
                      key={contact.email}
                      onClick={() => toggleMember(contact.email)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition-colors ${
                        isChecked ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🐼</span>
                        <span className="font-bold">{contact.nickname}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all"
          >
            完成创建
          </button>
        </form>
      </div>
    </div>
  );
};
