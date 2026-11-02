import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, CheckCircle, Info, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Hide if already running inside standalone app
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Floating or Banner Install Prompt Button */}
      <button
        onClick={async () => {
          if (isInstallable) {
            await install();
          } else {
            setShowGuideModal(true);
          }
        }}
        className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[11px] font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1 active:scale-95"
        title="安装 Panda Chat 到手机桌面上（PWA原生应用）"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>安装手机版 App</span>
      </button>

      {/* Guide & APK Options Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 select-none">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-5 space-y-4 relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                🐼
              </div>
              <h3 className="font-bold text-sm text-slate-800">安装 Panda Chat 手机原生应用</h3>
              <p className="text-xs text-slate-500">免下载大文件，即刻添加至手机桌面上独立运行！</p>
            </div>

            {/* Installation Method Options */}
            <div className="space-y-2.5 pt-1">
              {/* Option 1: Chrome / Android Browser Install */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="font-bold text-xs text-emerald-800 flex items-center space-x-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>方法一：安卓手机浏览器直接添加</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-4">
                  在手机 Chrome / 微信 / Kiwi 浏览器菜单中点击 <strong>「添加到主屏幕」</strong> 或 <strong>「安装应用」</strong> 即可获得原生 App 体验。
                </p>
              </div>

              {/* Option 2: iOS Safari */}
              {isIOS && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="font-bold text-xs text-slate-800 flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>苹果 iOS Safari 添加方式</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-4">
                    点击 Safari 底部 <strong>「分享」</strong> 按钮 ➔ 向下滚动点击 <strong>「添加到主屏幕」</strong>。
                  </p>
                </div>
              )}

              {/* Option 3: APK Installer Link */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                <div className="font-bold text-xs text-emerald-900 flex items-center space-x-1">
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>方法二：一键打包标准安卓 .APK 安装包</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed pl-4">
                  使用微软官方 PWABuilder 工具，输入线上地址即可秒级在线打出 `.apk` 安装包：
                </p>
                <div className="pl-4 pt-1">
                  <a
                    href="https://www.pwabuilder.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-xl shadow-xs"
                  >
                    <span>前往 PWABuilder 导出 APK</span>
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-sm transition-all"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
};
