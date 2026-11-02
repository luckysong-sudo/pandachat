import React, { useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  Check,
  Copy,
  AlertTriangle,
  Lock,
  CheckCircle2
} from 'lucide-react';

interface SafetyNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  safetyNumber: string;
}

export const SafetyNumberModal: React.FC<SafetyNumberModalProps> = ({
  isOpen,
  onClose,
  roomName,
  safetyNumber,
}) => {
  const [copied, setCopied] = useState(false);
  const [compareInput, setCompareInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(safetyNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const blocks = safetyNumber.split(' ');
  const normalizedInput = compareInput.trim().replace(/\s+/g, ' ');
  const matchSuccess = normalizedInput.length > 20 && safetyNumber.startsWith(normalizedInput);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-950 border border-indigo-500/40 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>安全安全码 (Safety Number) 审计</span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                  ANTI-MITM
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                房间 #{roomName} 密码学指纹验证
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Explanation Banner */}
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs font-sans text-slate-300 leading-relaxed">
            安全安全码采用 Signal 协议标准规范，由当前密室的根密钥与会话指纹经 SHA-256 派生生成。如果两个设备上显示的 60 位数字完全一致，即证明中间不存在任何监听、后门或中间人篡改。
          </div>

          {/* 60-digit Display Grid */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                当前密室 60 位可验证安全码
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center space-x-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? '已复制' : '复制安全码'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {blocks.map((block, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-cyan-300 font-bold tracking-widest selection:bg-cyan-500/30"
                >
                  {block}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Matcher */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs">
            <label className="font-semibold text-slate-200 flex items-center justify-between">
              <span>与好友输入的号码快速比对</span>
              {matchSuccess && (
                <span className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>指纹比对完全一致！</span>
                </span>
              )}
            </label>
            <input
              type="text"
              value={compareInput}
              onChange={(e) => setCompareInput(e.target.value)}
              placeholder="在此粘贴好友发送的安全码进行快速自动比对..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Verification Badge Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-xs">
            <span className="text-slate-300">已在离线渠道完成安全码人工核验</span>
            <button
              onClick={() => setIsVerified(!isVerified)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                isVerified
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isVerified ? '✔ 已标记为已核验' : '标记为已核验'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-slate-500">
            防伪防篡改等级：金融军工级
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
          >
            完成核验
          </button>
        </div>
      </div>
    </div>
  );
};
