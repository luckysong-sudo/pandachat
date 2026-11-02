import React, { useState } from 'react';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Star,
  ChevronRight,
  Send,
  Sparkles
} from 'lucide-react';
import { CloudMailMessage } from '../services/userVault';

interface CloudMailInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  inboxMails: CloudMailMessage[];
  onSendMail?: (to: string, subject: string, body: string) => void;
}

export const CloudMailInboxModal: React.FC<CloudMailInboxModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  inboxMails,
}) => {
  const [selectedMail, setSelectedMail] = useState<CloudMailMessage | null>(inboxMails[0] || null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] select-none">
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-emerald-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-1.5">
                <span>Panda 安全邮箱服务</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-full font-mono">
                  AES-256
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">{userEmail}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 text-sm">
            ✕
          </button>
        </div>

        {/* Content split view */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[350px]">
          {/* Mails List */}
          <div className="w-full md:w-5/12 border-r border-slate-200 bg-slate-50 overflow-y-auto divide-y divide-slate-200">
            {inboxMails.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">收件箱为空</div>
            ) : (
              inboxMails.map((mail) => {
                const isSelected = selectedMail?.id === mail.id;
                return (
                  <div
                    key={mail.id}
                    onClick={() => setSelectedMail(mail)}
                    className={`p-3 cursor-pointer transition-colors text-xs ${
                      isSelected ? 'bg-white font-bold border-l-4 border-l-emerald-600' : 'hover:bg-white/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-emerald-700 text-[11px] font-mono truncate">{mail.from}</span>
                      <span className="text-[10px] text-slate-400">{mail.date}</span>
                    </div>
                    <div className="text-slate-800 text-xs truncate">{mail.subject}</div>
                  </div>
                );
              })
            )}
          </div>

          {/* Mail Content Reader */}
          <div className="w-full md:w-7/12 bg-white p-5 overflow-y-auto space-y-3 flex flex-col">
            {selectedMail ? (
              <>
                <div className="border-b border-slate-100 pb-3 space-y-1">
                  <h4 className="font-bold text-sm text-slate-800">{selectedMail.subject}</h4>
                  <div className="text-xs text-slate-500 font-mono">发件人: {selectedMail.from}</div>
                  <div className="text-[10px] text-slate-400 font-mono">接收时间: {selectedMail.date}</div>
                </div>

                <div className="flex-1 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedMail.content}
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Panda 认证无篡改，所有邮件内容保存在用户独占沙盒中。</span>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                请在左侧选择一封邮件阅读
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[10px] text-slate-500">Panda 邮件协议 v2.0 • 零知识认证</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
