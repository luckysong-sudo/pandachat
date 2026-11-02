import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Heart,
  MessageSquare,
  Waves,
  Send,
  Plus,
  Reply,
  UserPlus,
  CheckCircle2,
  Inbox,
  Clock
} from 'lucide-react';
import {
  MomentPost,
  DriftingBottle,
  DriftingBottleReply,
  UserVaultManager,
  CloudMailAccount
} from '../services/userVault';

interface DiscoverTabProps {
  moments: MomentPost[];
  currentUserName: string;
  currentUserAvatar: string;
  currentUserAccount?: CloudMailAccount;
  onPostMoment: (content: string) => void;
  onLikeMoment: (postId: string) => void;
  onCommentMoment: (postId: string, text: string) => void;
  onAddFriendByWeChatId?: (wechatId: string) => void;
  // Deprecated/unused modal props left optional for backwards compatibility
  onOpenWasmModal?: () => void;
  onOpenCloudflareModal?: () => void;
  onOpenWiretapModal?: () => void;
}

export const DiscoverTab: React.FC<DiscoverTabProps> = ({
  moments,
  currentUserName,
  currentUserAvatar,
  currentUserAccount,
  onPostMoment,
  onLikeMoment,
  onCommentMoment,
  onAddFriendByWeChatId,
}) => {
  const [showMomentsView, setShowMomentsView] = useState(false);
  const [showBottleView, setShowBottleView] = useState(false);

  // Moments new post state
  const [newPostText, setNewPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [commentInput, setCommentInput] = useState<{ [postId: string]: string }>({});

  // Drift bottle states
  const [bottleSubTab, setBottleSubTab] = useState<'fish' | 'throw' | 'myBottles'>('fish');
  const [bottleThrowText, setBottleThrowText] = useState('');
  const [fishedBottle, setFishedBottle] = useState<DriftingBottle | null>(null);
  const [replyText, setReplyText] = useState('');
  const [bottleFeedback, setBottleFeedback] = useState<string | null>(null);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    onPostMoment(newPostText.trim());
    setNewPostText('');
    setIsPosting(false);
  };

  const handleThrowBottle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bottleThrowText.trim() || !currentUserAccount) return;
    try {
      UserVaultManager.throwDriftingBottle(currentUserAccount, bottleThrowText.trim());
      setBottleThrowText('');
      setBottleFeedback('🍾 您的加密漂流瓶已被抛入大海，等待有缘人捞起并回信！');
      setTimeout(() => setBottleFeedback(null), 4000);
      setBottleSubTab('myBottles');
    } catch (err: unknown) {
      alert((err as Error).message || '扔瓶子失败');
    }
  };

  const handleFishBottle = () => {
    setBottleFeedback(null);
    setReplyText('');
    const bottle = UserVaultManager.fishDriftingBottle(currentUserAccount?.email || '');
    if (!bottle) {
      setBottleFeedback('🌊 大海茫茫，暂时没有捞到瓶子，稍后再试或扔一个新瓶子吧~');
      return;
    }
    setFishedBottle(bottle);
  };

  const handleSendBottleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fishedBottle || !replyText.trim() || !currentUserAccount) return;

    try {
      const updated = UserVaultManager.replyDriftingBottle(
        fishedBottle.id,
        currentUserAccount,
        replyText.trim()
      );
      setFishedBottle({ ...updated });
      setReplyText('');
      setBottleFeedback(`🎉 成功将回信塞入瓶中并送达给丢瓶人「${fishedBottle.authorName}」！`);
      setTimeout(() => setBottleFeedback(null), 4000);
    } catch (err: unknown) {
      alert((err as Error).message || '发送回信失败');
    }
  };

  const handleAddAuthorAsFriend = (wechatId: string) => {
    if (!currentUserAccount) return;
    try {
      UserVaultManager.addFriendByWeChatId(currentUserAccount.email, wechatId);
      setBottleFeedback(`🎉 已通过 Chat ID「${wechatId}」成功添加对方为好友！`);
      setTimeout(() => setBottleFeedback(null), 4000);
    } catch (err: unknown) {
      alert((err as Error).message || '添加好友失败');
    }
  };

  // If inside Moments full screen
  if (showMomentsView) {
    return (
      <div className="flex-1 flex flex-col bg-white overflow-y-auto select-none">
        {/* Moments Top Header */}
        <div className="h-12 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setShowMomentsView(false)}
            className="text-xs font-bold text-emerald-600"
          >
            ‹ 返回发现
          </button>
          <span className="font-bold text-sm text-slate-800">朋友圈 🐼</span>
          <button
            onClick={() => setIsPosting(!isPosting)}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            title="发动态"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Moments Cover Photo Banner */}
        <div className="relative h-36 bg-gradient-to-r from-emerald-100 via-teal-100 to-slate-100 flex items-end justify-end p-4">
          <div className="flex items-center space-x-2 translate-y-6">
            <span className="font-bold text-sm text-slate-800 bg-white/90 px-2 py-0.5 rounded-lg shadow-sm">
              {currentUserName}
            </span>
            <div className="w-14 h-14 rounded-2xl bg-white border-2 border-white shadow-md flex items-center justify-center text-3xl">
              🐼
            </div>
          </div>
        </div>

        {/* Post new moment box */}
        {isPosting && (
          <form onSubmit={handleCreatePost} className="m-4 mt-8 p-3 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="这一刻的想法...（熊猫小动向）"
              rows={3}
              className="w-full text-xs text-slate-800 placeholder-slate-400 border-none focus:outline-none resize-none"
            />
            <div className="flex justify-end space-x-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPosting(false)}
                className="px-3 py-1 text-xs text-slate-500"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                发表
              </button>
            </div>
          </form>
        )}

        {/* Moments Feed */}
        <div className="p-4 pt-10 space-y-4">
          {moments.map((post) => (
            <div key={post.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl flex-shrink-0">
                  🐼
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-emerald-700">{post.authorName}</div>
                  <p className="text-xs text-slate-800 mt-1 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  <div className="text-[10px] text-slate-400 mt-2 font-mono">
                    {new Date(post.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Likes & Comments bar */}
              <div className="flex items-center justify-end space-x-3 text-xs text-slate-500 pt-1 border-t border-slate-100">
                <button
                  onClick={() => onLikeMoment(post.id)}
                  className="flex items-center space-x-1 hover:text-emerald-600 transition-colors"
                >
                  <Heart className={`w-3.5 h-3.5 ${post.likes.includes(currentUserName) ? 'text-red-500 fill-red-500' : ''}`} />
                  <span className="text-[11px]">{post.likes.length > 0 ? post.likes.length : '赞'}</span>
                </button>
              </div>

              {/* Likes list */}
              {post.likes.length > 0 && (
                <div className="bg-slate-50 p-2 rounded-xl text-[11px] text-slate-700 flex items-center space-x-1">
                  <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                  <span>{post.likes.join('、')}</span>
                </div>
              )}

              {/* Comments list */}
              {post.comments.length > 0 && (
                <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 text-xs">
                  {post.comments.map((c, i) => (
                    <div key={i} className="text-[11px] leading-relaxed">
                      <span className="font-bold text-emerald-700">{c.name}: </span>
                      <span className="text-slate-800">{c.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment input */}
              <div className="flex items-center space-x-1.5 pt-1">
                <input
                  type="text"
                  placeholder="评论..."
                  value={commentInput[post.id] || ''}
                  onChange={(e) => setCommentInput({ ...commentInput, [post.id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && commentInput[post.id]?.trim()) {
                      onCommentMoment(post.id, commentInput[post.id].trim());
                      setCommentInput({ ...commentInput, [post.id]: '' });
                    }
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (commentInput[post.id]?.trim()) {
                      onCommentMoment(post.id, commentInput[post.id].trim());
                      setCommentInput({ ...commentInput, [post.id]: '' });
                    }
                  }}
                  className="px-2 py-1 bg-emerald-600 text-white text-xs rounded-xl font-bold"
                >
                  发送
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If inside Drift Bottle
  if (showBottleView) {
    const myBottles = UserVaultManager.getDriftingBottles().filter(
      b => b.authorEmail === currentUserAccount?.email
    );

    return (
      <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto select-none p-3.5 space-y-3">
        {/* Bottle Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            onClick={() => setShowBottleView(false)}
            className="text-xs font-bold text-emerald-600 px-2 py-1 rounded-xl hover:bg-slate-200 transition-colors"
          >
            ‹ 返回发现
          </button>
          <span className="font-bold text-sm text-slate-800">经典漂流瓶 🍾</span>
          <div className="w-12" />
        </div>

        {/* Sub-tabs: 捞瓶子 / 扔瓶子 / 我的瓶子与回信 */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold">
          <button
            onClick={() => setBottleSubTab('fish')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              bottleSubTab === 'fish' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>捞瓶子</span>
          </button>
          <button
            onClick={() => setBottleSubTab('throw')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              bottleSubTab === 'throw' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>扔一个</span>
          </button>
          <button
            onClick={() => setBottleSubTab('myBottles')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              bottleSubTab === 'myBottles' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>收到的回信 ({myBottles.reduce((acc, b) => acc + b.replies.length, 0)})</span>
          </button>
        </div>

        {/* Feedback message banner */}
        {bottleFeedback && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center space-x-1.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{bottleFeedback}</span>
          </div>
        )}

        {/* Tab 1: 捞瓶子 + 回复丢瓶人 */}
        {bottleSubTab === 'fish' && (
          <div className="space-y-3">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center space-y-3 shadow-sm">
              <div className="text-4xl">🍾 🌊</div>
              <h3 className="font-bold text-slate-800 text-sm">捞起一个带着故事的瓶子</h3>
              <p className="text-xs text-slate-500">捡到后可以直接回复内容给丢漂流瓶的人哦！</p>

              <button
                onClick={handleFishBottle}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all inline-flex items-center space-x-1.5 active:scale-95"
              >
                <Waves className="w-4 h-4" />
                <span>捞一个瓶子</span>
              </button>
            </div>

            {/* Fished Bottle Card */}
            {fishedBottle && (
              <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-md space-y-3">
                {/* Bottle Header / Author info */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl">
                      🐼
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                        <span>{fishedBottle.authorName}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded-full font-mono">
                          丢瓶人
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Chat ID：{fishedBottle.authorWeChatId}
                      </div>
                    </div>
                  </div>

                  {/* Add Author as Friend Button */}
                  <button
                    onClick={() => handleAddAuthorAsFriend(fishedBottle.authorWeChatId)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-xl border border-emerald-200 transition-all flex items-center space-x-1"
                    title="通过 Chat ID 加为好友"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>加好友</span>
                  </button>
                </div>

                {/* Bottle Content */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {fishedBottle.content}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-2 font-mono flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>漂流于 {new Date(fishedBottle.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Existing Replies Thread */}
                {fishedBottle.replies.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-700 px-1 flex items-center space-x-1">
                      <Reply className="w-3 h-3" />
                      <span>已有的瓶内回信 ({fishedBottle.replies.length})</span>
                    </div>
                    <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 max-h-48 overflow-y-auto">
                      {fishedBottle.replies.map((rep) => (
                        <div key={rep.id} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-800 flex items-center space-x-1">
                              <span>🐼</span>
                              <span>{rep.authorName}</span>
                              <span className="text-[9px] text-slate-400 font-mono">({rep.authorWeChatId})</span>
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 pl-4">{rep.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Section: 回复漂流瓶给丢瓶人 */}
                <form onSubmit={handleSendBottleReply} className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 block">
                    💬 回复漂流瓶内容给丢漂流瓶的人：
                  </label>
                  <textarea
                    rows={2}
                    placeholder="写下温暖的回信，丢瓶人将在他的瓶子中心查看到..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl p-2.5 text-xs text-slate-800 focus:outline-none resize-none transition-all"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>发送回信给丢瓶人</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: 扔漂流瓶 */}
        {bottleSubTab === 'throw' && (
          <form onSubmit={handleThrowBottle} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="text-center space-y-1">
              <span className="text-3xl">🍾 💌</span>
              <h3 className="font-bold text-slate-800 text-sm">写下心事，封入瓶中</h3>
              <p className="text-xs text-slate-500">当有缘人捡到你的瓶子时，可以直接写回信给你！</p>
            </div>

            <textarea
              rows={4}
              placeholder="分享今日的一件小开心，或者一段治愈的心里话..."
              value={bottleThrowText}
              onChange={(e) => setBottleThrowText(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl p-3 text-xs text-slate-800 focus:outline-none resize-none"
            />

            <button
              type="submit"
              disabled={!bottleThrowText.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-2xl shadow-sm transition-all"
            >
              扔进大海 🌊
            </button>
          </form>
        )}

        {/* Tab 3: 我的漂流瓶与收到的回信 */}
        {bottleSubTab === 'myBottles' && (
          <div className="space-y-3">
            {myBottles.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-2">
                <span className="text-3xl">🏝️</span>
                <p className="text-xs text-slate-500">您还没有扔出过漂流瓶哦！</p>
                <button
                  onClick={() => setBottleSubTab('throw')}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-xs"
                >
                  去扔一个漂流瓶
                </button>
              </div>
            ) : (
              myBottles.map((bottle) => (
                <div key={bottle.id} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100">
                    <span className="font-bold text-slate-800">我扔出的瓶子</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(bottle.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl leading-relaxed">
                    {bottle.content}
                  </p>

                  {/* Replies received */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
                      <Reply className="w-3.5 h-3.5" />
                      <span>收到的回信 ({bottle.replies.length} 条)</span>
                    </div>

                    {bottle.replies.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic pl-2">
                        瓶子还在海上漂流中，静候有缘人的回信...
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {bottle.replies.map((rep) => (
                          <div key={rep.id} className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-800 flex items-center space-x-1">
                                <span>🐼</span>
                                <span>{rep.authorName}</span>
                                <span className="text-[10px] text-emerald-600 font-mono">({rep.authorWeChatId})</span>
                              </span>
                              <button
                                onClick={() => handleAddAuthorAsFriend(rep.authorWeChatId)}
                                className="text-[10px] text-emerald-700 underline hover:text-emerald-900 font-bold"
                              >
                                加为好友
                              </button>
                            </div>
                            <p className="text-xs text-emerald-900 pl-4">{rep.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // Discover Main Menu: Only classic Moments and Drifting Bottle
  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto select-none p-3 space-y-3">
      {/* Social Features */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
        <button
          onClick={() => setShowMomentsView(true)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">朋友圈</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-slate-400">›</span>
          </div>
        </button>

        <button
          onClick={() => setShowBottleView(true)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-emerald-600">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 text-left">漂流瓶 (怀旧经典)</div>
              <div className="text-[10px] text-slate-500 text-left">捞瓶子可直接回复丢瓶人，互相留下温暖回信</div>
            </div>
          </div>
          <span className="text-xs text-slate-400">›</span>
        </button>
      </div>
    </div>
  );
};
