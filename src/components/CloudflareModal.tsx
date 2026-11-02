import React, { useState } from 'react';
import {
  Cloud,
  Terminal,
  FileCode,
  Copy,
  Check,
  Download,
  Zap,
  Shield,
  ExternalLink,
  Sparkles,
  ServerOff
} from 'lucide-react';
import {
  CLOUDFLARE_WORKER_CODE,
  WRANGLER_JSONC,
  DEPLOY_SCRIPT,
  GITHUB_ACTIONS_WORKFLOW
} from '../services/cloudflareExporter';

interface CloudflareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareModal: React.FC<CloudflareModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'worker' | 'wrangler' | 'script' | 'github'>('worker');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getActiveCode = () => {
    switch (activeTab) {
      case 'worker':
        return CLOUDFLARE_WORKER_CODE;
      case 'wrangler':
        return WRANGLER_JSONC;
      case 'script':
        return DEPLOY_SCRIPT;
      case 'github':
        return GITHUB_ACTIONS_WORKFLOW;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const filenameMap = {
      worker: '_worker.js',
      wrangler: 'wrangler.jsonc',
      script: 'deploy.sh',
      github: 'deploy-cloudflare.yml',
    };
    const content = getActiveCode();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filenameMap[activeTab];
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-950 border border-orange-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-orange-950/60 border border-orange-500/40 text-orange-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Cloudflare 零成本服务器私有化部署套件</span>
                <span className="text-[10px] bg-orange-950 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30">
                  $0 / MONTH SERVERLESS
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                无需购买昂贵 VPS 服务器，免运维，全球 300+ 边缘节点抗 DDOS
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
          {/* Key Advantages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] text-orange-400 flex items-center space-x-1">
                <ServerOff className="w-3.5 h-3.5" />
                <span className="font-semibold">0 元服务器账单</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                托管于 Cloudflare Pages & Workers 免费额度，每日包含 10 万次无服务器请求与无限静态带宽。
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5" />
                <span className="font-semibold">超高并发不卡顿</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                利用 Cloudflare WebSocket 休眠机制与边缘转发，毫秒级就近响应，万人同时在线依然流畅。
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] text-cyan-400 flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5" />
                <span className="font-semibold">零运维与原生防御</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                自带免费高防 SSL 与企业级 DDoS 攻击清洗，无需安装 Nginx 或配置 Linux 补丁。
              </p>
            </div>
          </div>

          {/* 3-Step Setup Guide */}
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2 text-xs font-sans">
            <div className="font-bold text-white text-xs flex items-center space-x-1.5 font-mono">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>3分钟极速部署流程</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-xs">
              <li>
                <span className="font-semibold text-white">下载代码并提交至 GitHub：</span> 将本项目的完整源码推送到您的私有或公开 GitHub 仓库。
              </li>
              <li>
                <span className="font-semibold text-white">登录 Cloudflare 控制台：</span> 访问 <code className="bg-slate-950 px-1 py-0.5 rounded text-orange-300">dash.cloudflare.com</code>，点击 <strong>Workers & Pages &gt; 创建 &gt; Pages &gt; 连接到 Git</strong>。
              </li>
              <li>
                <span className="font-semibold text-white">设置构建配置：</span> 构建预设选择 <strong>Vite</strong>，构建命令填写 <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-300">npm run build</code>，构建输出目录填写 <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-300">dist</code>，点击保存并部署即可！
              </li>
            </ol>
          </div>

          {/* Code Viewer */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
            {/* Tabs */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800">
              <div className="flex space-x-1 text-xs">
                <button
                  onClick={() => setActiveTab('worker')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'worker'
                      ? 'bg-orange-950/60 text-orange-300 border border-orange-500/40 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  functions/_worker.js
                </button>
                <button
                  onClick={() => setActiveTab('wrangler')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'wrangler'
                      ? 'bg-orange-950/60 text-orange-300 border border-orange-500/40 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  wrangler.jsonc
                </button>
                <button
                  onClick={() => setActiveTab('script')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'script'
                      ? 'bg-orange-950/60 text-orange-300 border border-orange-500/40 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  deploy.sh
                </button>
                <button
                  onClick={() => setActiveTab('github')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'github'
                      ? 'bg-orange-950/60 text-orange-300 border border-orange-500/40 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  GitHub CI/CD
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadFile}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center space-x-1"
                  title="下载当前文件"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '已复制' : '复制代码'}</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <pre className="p-4 text-[11px] leading-relaxed text-slate-300 overflow-x-auto max-h-64 font-mono select-all">
              {getActiveCode()}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-slate-500">
            Cloudflare 边缘环境经过安全验证，已启用 WebSocket Hibernation API
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium"
          >
            完成了解
          </button>
        </div>
      </div>
    </div>
  );
};
