import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  Database,
  Users
} from 'lucide-react';
import { UserVaultManager, CloudMailAccount } from '../services/userVault';

interface AuthModalProps {
  isOpen: boolean;
  onLoginSuccess: (account: CloudMailAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('请填写邮箱与密码');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const account = await UserVaultManager.loginAccountAsync(email, password);
        onLoginSuccess(account);
      } else {
        if (!nickname.trim()) {
          setErrorMsg('请填写萌萌哒熊猫昵称');
          setIsLoading(false);
          return;
        }
        const account = await UserVaultManager.registerAccountAsync(
          email,
          password,
          nickname,
          '🐼', // Fixed panda avatar
          undefined,
          bio
        );
        onLoginSuccess(account);
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto select-none transition-all">
        {/* Top Header */}
        <div className="bg-white p-6 text-center border-b border-slate-100 relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 border-2 border-slate-200 shadow-sm flex items-center justify-center text-3xl mb-3 hover:scale-105 transition-transform">
            🐼
          </div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-1.5">
            <span>Panda</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            老款微信体验 • 专属独立数据库 • 端到端零知识加密
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl max-w-xs mx-auto mt-4">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Panda 登录
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              注册新邮箱
            </button>
          </div>
        </div>

        {/* Previously registered accounts on this device if any exist */}
        {mode === 'login' && UserVaultManager.getRegisteredAccounts().length > 0 && (
          <div className="px-6 pt-4 pb-1 bg-white">
            <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>选择已在本机注册的账号登录：</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {UserVaultManager.getRegisteredAccounts().map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => setEmail(acc.email)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <span className="text-base">🐼</span>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800">{acc.nickname}</div>
                    <div className="text-[9px] text-slate-500 font-mono">{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 bg-white">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* Email input with @cloudmail.com automatic suffix */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>Panda 邮箱账号</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="例如: panda 或 panda@cloudmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              系统将自动补全为 <code className="text-emerald-600 font-mono">@cloudmail.com</code> 独立邮箱
            </p>
          </div>

          {/* Registration Extra Fields */}
          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>熊猫萌萌哒昵称</span>
                </label>
                <input
                  type="text"
                  placeholder="例如: 功夫熊猫 🐼"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  个性签名
                </label>
                <input
                  type="text"
                  placeholder="写一句熊猫小可爱的话吧~"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={40}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </>
          )}

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>登录密码</span>
            </label>
            <input
              type="password"
              placeholder="请输入密码（演示账号默认密码: 123456）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Database isolation reassurance */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
            <Database className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">数据库独立隔离保障：</span>
              每个 Panda 邮箱对应一个专属本地加密沙盒库。不同账户之间的聊天记录与好友列表绝对不互串。
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {isLoading ? (
              <span>加载中...</span>
            ) : mode === 'login' ? (
              <>
                <span>进入我的 Panda</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>立即注册并创建独立数据库</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

