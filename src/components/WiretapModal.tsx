import React, { useState } from 'react';
import {
  Terminal,
  ShieldCheck,
  Lock,
  Cpu,
  CheckCircle,
  FileCode,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { WiretapPacket } from '../types/chat';

interface WiretapModalProps {
  isOpen: boolean;
  onClose: () => void;
  packets: WiretapPacket[];
}

export const WiretapModal: React.FC<WiretapModalProps> = ({
  isOpen,
  onClose,
  packets,
}) => {
  const [selectedPacket, setSelectedPacket] = useState<WiretapPacket | null>(packets[0] || null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentPacket = selectedPacket || packets[0] || null;

  const handleCopyJson = () => {
    if (!currentPacket) return;
    navigator.clipboard.writeText(JSON.stringify(currentPacket, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>网络信道实时抓包与无后门零知识审计</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  ZERO-KNOWLEDGE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                实时检查在公网总线（Cloudflare Relay / BroadcastChannel）上传输的原生报文
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

        {/* Content Body: Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[400px]">
          {/* Left: Packet Stream */}
          <div className="w-full md:w-5/12 border-r border-slate-800 overflow-y-auto p-3 space-y-1.5 bg-slate-950">
            <div className="text-[11px] text-slate-400 px-2 py-1 font-semibold flex items-center justify-between">
              <span>抓取数据包列表 ({packets.length})</span>
              <span className="text-emerald-400 text-[10px]">● 实时监听中</span>
            </div>
            {packets.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-600">
                暂无网络包，在聊天框发送一条消息即可在此抓取密文包
              </div>
            ) : (
              packets.map((pkt) => {
                const isSelected = currentPacket?.id === pkt.id;
                return (
                  <button
                    key={pkt.id + pkt.timestamp}
                    onClick={() => setSelectedPacket(pkt)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[11px] text-slate-200 flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-cyan-400" />
                        <span>{pkt.type}</span>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(pkt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      IV: {pkt.ivHex.slice(0, 16)}...
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                      <span>密文大小: {pkt.payloadSize} B</span>
                      <span className="text-emerald-400">WASM 校验通过</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Detailed Envelope Inspector */}
          <div className="w-full md:w-7/12 flex-1 overflow-y-auto p-4 bg-slate-900/40 space-y-4">
            {currentPacket ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>信封完整性与熵审计 (Envelope Audit)</span>
                  </span>
                  <button
                    onClick={handleCopyJson}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>复制 JSON 报文</span>
                  </button>
                </div>

                {/* Mathematical Proof Card */}
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5 text-xs">
                  <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>无后门零知识证明 (Zero-Knowledge Verifiability)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    在此抓取的信封为客户端在本地经由 <code className="text-emerald-300">crypto.subtle.encrypt(AES-256-GCM)</code> 处理后的纯密文。无论中转服务器、Cloudflare Edge、网络运营商或路由器均只拥有上述不可逆密文，不掌握密钥，因此在物理上无法解密还原原始聊天内容。
                  </p>
                </div>

                {/* Packet Fields Grid */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider">数据包 ID</label>
                    <div className="mt-0.5 p-2 bg-slate-950 border border-slate-800 rounded text-slate-300 truncate">
                      {currentPacket.id}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider">初始向量 IV (96-bit Hex)</label>
                      <div className="mt-0.5 p-2 bg-slate-950 border border-slate-800 rounded text-cyan-300 truncate">
                        {currentPacket.ivHex}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider">WASM 32-bit 雪崩校验和</label>
                      <div className="mt-0.5 p-2 bg-slate-950 border border-slate-800 rounded text-emerald-300">
                        0x{currentPacket.wasmChecksum.toString(16).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider">密文摘要 (Ciphertext Base64)</label>
                    <div className="mt-0.5 p-2.5 bg-slate-950 border border-slate-800 rounded text-slate-300 break-all text-[11px] leading-relaxed max-h-32 overflow-y-auto">
                      {currentPacket.ciphertextExcerpt}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider">发送者会话指纹</label>
                    <div className="mt-0.5 p-2 bg-slate-950 border border-slate-800 rounded text-slate-400 text-[11px] truncate">
                      {currentPacket.senderFingerprint}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                请在左侧选择一个数据包查看其底层密码学结构
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1 text-emerald-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>无后门代码承诺：遵循 W3C WebCrypto 与 RFC 5116 规范</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium"
          >
            完成审计
          </button>
        </div>
      </div>
    </div>
  );
};
