import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Cloud,
  QrCode,
  Terminal,
  Volume2,
  VolumeX,
  UserPlus,
  Lock,
  Flame,
  Globe2
} from 'lucide-react';
import { Room } from '../types/chat';

interface HeaderProps {
  currentRoom: Room;
  peerCount: number;
  edgeNode: string;
  isWasmActive: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSafetyModal: () => void;
  onOpenWiretapModal: () => void;
  onOpenWasmModal: () => void;
  onOpenCloudflareModal: () => void;
  onSimulatePeer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoom,
  peerCount,
  edgeNode,
  isWasmActive,
  soundEnabled,
  onToggleSound,
  onOpenSafetyModal,
  onOpenWiretapModal,
  onOpenWasmModal,
  onOpenCloudflareModal,
  onSimulatePeer,
}) => {
  return (
    <header className="h-16 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between select-none z-20">
      {/* Left: Branding & Current Room Info */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 shadow-sm shadow-cyan-500/20">
            <Lock className="w-4 h-4 text-cyan-400" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white tracking-wide text-sm md:text-base flex items-center gap-1.5">
                Chat <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">v2.0</span>
              </span>
              <span className="hidden sm:inline-block text-slate-600">/</span>
              <span className="font-medium text-slate-200 text-sm truncate max-w-[120px] md:max-w-[200px]">
                #{currentRoom.name}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span className="flex items-center text-emerald-400 font-mono">
                <ShieldCheck className="w-3 h-3 mr-1 inline" />
                E2EE (AES-256-GCM)
              </span>
              <span>•</span>
              <span className="text-slate-400 font-mono">{peerCount} 在线成员</span>
              {currentRoom.defaultBurnTimer > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center text-amber-400 font-mono">
                    <Flame className="w-3 h-3 mr-0.5 inline" />
                    {currentRoom.defaultBurnTimer}s 自毁
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Security & Deployment Controls */}
      <div className="flex items-center space-x-1.5 md:space-x-2">
        {/* Wasm Accelerator Status Pill */}
        <button
          onClick={onOpenWasmModal}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
            isWasmActive
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400'
              : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}
          title="点击查看 WebAssembly 加速引擎与基准测试"
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="hidden lg:inline font-semibold">WASM 加速</span>
          <span className="text-[10px] bg-emerald-500/20 px-1 rounded text-emerald-200">ON</span>
        </button>

        {/* Cloudflare Edge Status Pill */}
        <button
          onClick={onOpenCloudflareModal}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-orange-950/30 border border-orange-500/30 text-orange-300 hover:bg-orange-900/40 hover:border-orange-400 transition-all"
          title="点击查看 Cloudflare Pages & Workers 零成本无服务器部署包"
        >
          <Cloud className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden md:inline">CF Edge</span>
          <span className="text-[10px] text-orange-400 font-mono bg-orange-500/10 px-1 py-0.5 rounded">
            {edgeNode}
          </span>
        </button>

        {/* Wiretap / Zero-Knowledge Audit */}
        <button
          onClick={onOpenWiretapModal}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 hover:border-cyan-400 transition-all"
          title="打开实时零知识抓包与密码学安全审计"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">安全抓包审计</span>
        </button>

        {/* Safety Fingerprint Modal Button */}
        <button
          onClick={onOpenSafetyModal}
          className="p-1.5 md:px-2.5 md:py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white transition-all flex items-center space-x-1"
          title="查看 60 位安全安全码与防中间人验证码"
        >
          <QrCode className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden xl:inline">安全安全码</span>
        </button>

        {/* Simulate Peer Button (Instant multi-user test in one tab!) */}
        <button
          onClick={onSimulatePeer}
          className="p-1.5 md:px-2.5 md:py-1.5 rounded-lg text-xs font-mono bg-cyan-600/20 border border-cyan-500/40 text-cyan-200 hover:bg-cyan-600/30 hover:border-cyan-300 transition-all flex items-center space-x-1"
          title="生成一个本地虚拟加密对端节点，立即体验双向实时密聊"
        >
          <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xl:inline">模拟对端</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
          title={soundEnabled ? '静音音效' : '开启音效'}
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </div>
    </header>
  );
};
