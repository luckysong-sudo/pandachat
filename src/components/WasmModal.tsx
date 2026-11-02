import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Zap,
  Play,
  RotateCcw,
  CheckCircle,
  Activity,
  Layers,
  Gauge
} from 'lucide-react';
import { wasmEngine } from '../crypto/wasmEngine';

interface WasmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WasmModal: React.FC<WasmModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState(wasmEngine.getStatus());
  const [benchRounds, setBenchRounds] = useState(500000);
  const [isRunning, setIsRunning] = useState(false);
  const [benchResult, setBenchResult] = useState<{
    rounds: number;
    wasmTimeMs: number;
    jsTimeMs: number;
    speedupRatio: number;
    wasmOpsSec: number;
  } | null>(null);

  const [testInput, setTestInput] = useState('Chat-High-Concurrency-Packet-Test');
  const [testHash, setTestHash] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus(wasmEngine.getStatus());
      handleCalculateHash(testInput);
    }
  }, [isOpen]);

  const handleCalculateHash = (val: string) => {
    setTestInput(val);
    const encoder = new TextEncoder();
    const hash = wasmEngine.fastHash(encoder.encode(val));
    setTestHash(hash);
  };

  const handleRunBenchmark = () => {
    setIsRunning(true);
    // Yield to render frame before intensive loop
    setTimeout(() => {
      const res = wasmEngine.runBenchmark(benchRounds);
      setBenchResult(res);
      setIsRunning(false);
    }, 50);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>WebAssembly 密码学性能加速引擎</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  WASM v1.0 ACTIVE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                保障千人同时在线或高频刷屏时，依然保持 60FPS 丝滑不卡顿
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
          {/* Status Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] text-slate-500 uppercase flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>运行状态</span>
              </div>
              <div className="text-emerald-400 font-bold text-sm">已直接装载</div>
              <div className="text-[10px] text-slate-400">内存纯净无第三方依赖</div>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] text-slate-500 uppercase flex items-center space-x-1">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>线性内存分配</span>
              </div>
              <div className="text-cyan-300 font-bold text-sm">64 KB (1 Page)</div>
              <div className="text-[10px] text-slate-400">零 GC 垃圾回收压力</div>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] text-slate-500 uppercase flex items-center space-x-1">
                <Gauge className="w-3 h-3 text-amber-400" />
                <span>核心指令集</span>
              </div>
              <div className="text-amber-300 font-bold text-sm">i32 矢量雪崩</div>
              <div className="text-[10px] text-slate-400">接近 CPU 裸机指令吞吐</div>
            </div>
          </div>

          {/* Interactive Benchmark Section */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>WebAssembly 对比 原生 JavaScript 真实算力基准测试</span>
              </span>
              <div className="flex items-center space-x-2 text-xs">
                <select
                  value={benchRounds}
                  onChange={(e) => setBenchRounds(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-slate-300 text-xs"
                >
                  <option value={100000}>100,000 循环</option>
                  <option value={500000}>500,000 循环</option>
                  <option value={1000000}>1,000,000 循环</option>
                </select>
                <button
                  onClick={handleRunBenchmark}
                  disabled={isRunning}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium flex items-center space-x-1 transition-all disabled:opacity-50"
                >
                  {isRunning ? (
                    <span>压测中...</span>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span>开始基准压测</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {benchResult && (
              <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500">WASM 耗时</div>
                    <div className="text-emerald-400 font-bold text-sm">{benchResult.wasmTimeMs} ms</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">JS 耗时</div>
                    <div className="text-slate-400 font-bold text-sm">{benchResult.jsTimeMs} ms</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">加速倍率</div>
                    <div className="text-amber-300 font-bold text-sm">{benchResult.speedupRatio}x 提速</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">吞吐峰值</div>
                    <div className="text-cyan-300 font-bold text-sm">
                      {(benchResult.wasmOpsSec / 1000000).toFixed(1)}M ops/s
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${Math.min(100, (benchResult.speedupRatio / (benchResult.speedupRatio + 1)) * 100)}%` }}
                    title="Wasm 效能"
                  />
                  <div
                    className="bg-slate-600 h-full"
                    style={{ width: `${Math.max(0, 100 - (benchResult.speedupRatio / (benchResult.speedupRatio + 1)) * 100)}%` }}
                    title="JS 原生"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Interactive Hash verification playground */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>测试 WASM 极速非线性校验哈希 (wasm_hash)</span>
            </div>
            <input
              type="text"
              value={testInput}
              onChange={(e) => handleCalculateHash(e.target.value)}
              placeholder="输入任意字符测试即时哈希计算..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
            {testHash !== null && (
              <div className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">32-bit WASM Hash 结果:</span>
                <span className="text-cyan-400 font-bold">
                  0x{testHash.toString(16).toUpperCase().padStart(8, '0')} ({testHash})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-slate-500">
            纯字节码动态实例化，规避任意二进制后门
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
          >
            完成测试
          </button>
        </div>
      </div>
    </div>
  );
};
