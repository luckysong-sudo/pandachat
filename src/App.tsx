/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  UserVaultManager,
  CloudMailAccount,
  UserVaultData,
  DirectMessage,
  Contact,
  GroupChat,
  MomentPost
} from './services/userVault';
import {
  deriveKeyFromSecret,
  encryptPayload,
  decryptPayload,
  generateRandomBytes,
  bytesToBase64,
  base64ToBytes,
  generateRandomId,
  generateSafetyFingerprint,
} from './crypto/e2ee';
import { wasmEngine } from './crypto/wasmEngine';
import { networkRelay, RelayPacket } from './services/networkRelay';
import { soundEffects } from './utils/audio';

import { AuthModal } from './components/AuthModal';
import { WeChatNavbar } from './components/WeChatNavbar';
import { WeChatTabBar, WeChatTabType } from './components/WeChatTabBar';
import { ChatsTab, ChatSessionItem } from './components/ChatsTab';
import { ContactsTab } from './components/ContactsTab';
import { DiscoverTab } from './components/DiscoverTab';
import { MeTab } from './components/MeTab';
import { WeChatChatView } from './components/WeChatChatView';

import { AddFriendModal } from './components/AddFriendModal';
import { CreateGroupModal } from './components/CreateGroupModal';
import { CloudMailInboxModal } from './components/CloudMailInboxModal';
import { WiretapModal } from './components/WiretapModal';
import { WasmModal } from './components/WasmModal';
import { SafetyNumberModal } from './components/SafetyNumberModal';
import { CloudflareModal } from './components/CloudflareModal';
import { WiretapPacket } from './types/chat';

const ACTIVE_ACCOUNT_KEY = 'saber_active_cloudmail_account';

export default function App() {
  // 1. Purge any legacy preset demo accounts on mount
  useEffect(() => {
    UserVaultManager.purgePresetAccounts();
  }, []);

  // 2. Active Account state (defaults to null if not logged in)
  const [currentAccount, setCurrentAccount] = useState<CloudMailAccount | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_ACCOUNT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const presetEmails = ['panda@cloudmail.com', 'pudding@cloudmail.com', 'matcha@cloudmail.com', 'lucky@cloudmail.com'];
        if (!presetEmails.includes(parsed.email)) {
          const v = UserVaultManager.loadUserVault(parsed.email);
          if (v) return v.account;
        }
      }
    } catch {}
    return null;
  });

  // Current user's isolated vault
  const [userVault, setUserVault] = useState<UserVaultData | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<WeChatTabType>('chats');

  // Currently open chat session (if null, shows tab list; if set, shows chat view)
  const [activeChat, setActiveChat] = useState<ChatSessionItem | null>(null);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showMailboxModal, setShowMailboxModal] = useState(false);
  const [showWiretapModal, setShowWiretapModal] = useState(false);
  const [showWasmModal, setShowWasmModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showCloudflareModal, setShowCloudflareModal] = useState(false);
  const [wiretapPackets, setWiretapPackets] = useState<WiretapPacket[]>([]);

  // Safety number for current conversation or user
  const [currentSafetyNumber, setCurrentSafetyNumber] = useState(
    '49201 84920 10294 85739 20485 71928 30194 82019 47291 02948 10294 85920'
  );

  // Load vault when currentAccount changes
  const reloadVault = useCallback(() => {
    if (!currentAccount) {
      setUserVault(null);
      return;
    }
    const vault = UserVaultManager.loadUserVault(currentAccount.email);
    setUserVault(vault);
  }, [currentAccount]);

  useEffect(() => {
    reloadVault();
  }, [currentAccount, reloadVault]);

  // Wiretap listener
  useEffect(() => {
    setWiretapPackets(networkRelay.getWiretapLog());
    const unsub = networkRelay.subscribeWiretap((pkt) => {
      setWiretapPackets((prev) => [pkt, ...prev.slice(0, 99)]);
    });
    return unsub;
  }, []);

  // Real-time network sync across tabs / peers
  useEffect(() => {
    if (!currentAccount) return;

    const unsub = networkRelay.subscribe(async (packet: RelayPacket) => {
      if (packet.type === 'ENVELOPE' && packet.envelope) {
        // Only decrypt if targeted to current user or group
        if (packet.senderId === currentAccount.email) return;

        try {
          const saltBytes = base64ToBytes(packet.envelope.salt);
          const key = await deriveKeyFromSecret(currentAccount.email + '_shared_seed', saltBytes);
          const decrypted = await decryptPayload<{ text: string; contentType?: DirectMessage['contentType'] }>(
            packet.envelope,
            key
          );

          // Append to current user's isolated database
          const incomingMsg: DirectMessage = {
            id: packet.id,
            fromEmail: packet.senderId,
            toEmail: currentAccount.email,
            isGroup: false,
            content: decrypted.text,
            timestamp: packet.timestamp,
            status: 'delivered',
            contentType: decrypted.contentType || 'text',
          };

          UserVaultManager.appendMessage(currentAccount.email, incomingMsg);
          reloadVault();
          soundEffects.playReceive();
        } catch {
          // Message not for this account or wrong key
        }
      }
    });

    return unsub;
  }, [currentAccount, reloadVault]);

  // Login handler
  const handleLoginSuccess = (account: CloudMailAccount) => {
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, JSON.stringify(account));
    setCurrentAccount(account);
    setActiveChat(null);
    setShowAuthModal(false);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    setCurrentAccount(null);
    setUserVault(null);
    setActiveChat(null);
    setShowAuthModal(true);
  };

  // Send message
  const handleSendMessage = async (
    text: string,
    contentType: DirectMessage['contentType'] = 'text'
  ) => {
    if (!currentAccount || !activeChat) return;

    const msgId = generateRandomId('msg');
    const newMsg: DirectMessage = {
      id: msgId,
      fromEmail: currentAccount.email,
      toEmail: activeChat.id,
      isGroup: activeChat.isGroup,
      content: text,
      timestamp: Date.now(),
      status: 'sent',
      contentType,
    };

    // 1. Save to isolated database vault
    UserVaultManager.appendMessage(currentAccount.email, newMsg);
    reloadVault();
    soundEffects.playSend();

    // 2. Encrypt and broadcast on Zero-Knowledge network bus
    try {
      const salt = generateRandomBytes(16);
      const key = await deriveKeyFromSecret(activeChat.id + '_shared_seed', salt);
      const envelope = await encryptPayload(
        { text, contentType },
        key,
        salt,
        {
          name: currentAccount.nickname,
          avatar: currentAccount.avatar,
          fingerprint: currentAccount.cloudMailId,
        }
      );

      networkRelay.broadcast({
        id: msgId,
        type: 'ENVELOPE',
        roomId: activeChat.id,
        senderId: currentAccount.email,
        senderName: currentAccount.nickname,
        timestamp: Date.now(),
        envelope,
      });
    } catch (err) {
      console.warn('[E2EE] Relay broadcast error:', err);
    }
  };

  // Moments handlers
  const handlePostMoment = (content: string) => {
    if (!currentAccount || !userVault) return;
    const post: MomentPost = {
      id: 'post_' + Date.now().toString(36),
      authorEmail: currentAccount.email,
      authorName: currentAccount.nickname,
      authorAvatar: currentAccount.avatar,
      content,
      timestamp: Date.now(),
      likes: [],
      comments: [],
    };
    userVault.moments.unshift(post);
    UserVaultManager.saveUserVault(userVault);
    reloadVault();
  };

  const handleLikeMoment = (postId: string) => {
    if (!currentAccount || !userVault) return;
    const post = userVault.moments.find((p) => p.id === postId);
    if (!post) return;
    if (post.likes.includes(currentAccount.nickname)) {
      post.likes = post.likes.filter((n) => n !== currentAccount.nickname);
    } else {
      post.likes.push(currentAccount.nickname);
    }
    UserVaultManager.saveUserVault(userVault);
    reloadVault();
  };

  const handleCommentMoment = (postId: string, text: string) => {
    if (!currentAccount || !userVault) return;
    const post = userVault.moments.find((p) => p.id === postId);
    if (!post) return;
    post.comments.push({ name: currentAccount.nickname, text });
    UserVaultManager.saveUserVault(userVault);
    reloadVault();
  };

  // Determine top bar title
  const getNavbarTitle = () => {
    if (activeChat) return activeChat.name;
    switch (activeTab) {
      case 'chats':
        return `Chat (${userVault?.contacts.length || 0})`;
      case 'contacts':
        return '通讯录';
      case 'discover':
        return '发现';
      case 'me':
        return '我';
    }
  };

  if (!currentAccount) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
        <AuthModal isOpen={true} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="flex justify-center h-screen w-screen bg-slate-100 overflow-hidden select-none">
      {/* Mobile-friendly container: centered on wide desktops, 100% full width on mobile/tablets */}
      <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl h-full flex flex-col bg-white shadow-xl relative border-x border-slate-200">
        {/* WeChat Top Navbar (visible on main tabs) */}
        {!activeChat && (
          <WeChatNavbar
            title={getNavbarTitle()}
            unreadTotal={0}
            onOpenAddFriend={() => setShowAddFriendModal(true)}
            onOpenCreateGroup={() => setShowCreateGroupModal(true)}
            onOpenMailbox={() => setShowMailboxModal(true)}
            onBack={undefined}
            isInsideChat={false}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeChat ? (
            /* Active Conversation View */
            <WeChatChatView
              session={activeChat}
              currentEmail={currentAccount.email}
              currentNickname={currentAccount.nickname}
              currentAvatar={currentAccount.avatar}
              messages={userVault?.messages || []}
              contacts={userVault?.contacts || []}
              onSendMessage={handleSendMessage}
              onBack={() => setActiveChat(null)}
              onOpenSafetyModal={() => setShowSafetyModal(true)}
              onReloadVault={reloadVault}
              onOpenAddFriend={() => setShowAddFriendModal(true)}
            />
          ) : (
            /* 4 Classic Tabs */
            <>
              {activeTab === 'chats' && (
                <ChatsTab
                  contacts={userVault?.contacts || []}
                  groups={userVault?.groups || []}
                  messages={userVault?.messages || []}
                  currentEmail={currentAccount.email}
                  onSelectChat={(chat) => setActiveChat(chat)}
                  onOpenAddFriend={() => setShowAddFriendModal(true)}
                />
              )}

              {activeTab === 'contacts' && (
                <ContactsTab
                  contacts={userVault?.contacts || []}
                  groups={userVault?.groups || []}
                  onSelectChat={(chat) => setActiveChat(chat)}
                  onOpenAddFriend={() => setShowAddFriendModal(true)}
                  onOpenCreateGroup={() => setShowCreateGroupModal(true)}
                />
              )}

              {activeTab === 'discover' && (
                <DiscoverTab
                  moments={userVault?.moments || []}
                  currentUserName={currentAccount.nickname}
                  currentUserAvatar={currentAccount.avatar}
                  currentUserAccount={currentAccount}
                  onPostMoment={handlePostMoment}
                  onLikeMoment={handleLikeMoment}
                  onCommentMoment={handleCommentMoment}
                  onAddFriendByWeChatId={(wechatId) => {
                    UserVaultManager.addFriendByWeChatId(currentAccount.email, wechatId);
                    reloadVault();
                  }}
                />
              )}

              {activeTab === 'me' && (
                <MeTab
                  account={currentAccount}
                  messagesCount={userVault?.messages.length || 0}
                  contactsCount={userVault?.contacts.length || 0}
                  groupsCount={userVault?.groups.length || 0}
                  unreadMailsCount={userVault?.inboxMails.filter((m) => !m.read).length || 0}
                  onOpenMailbox={() => setShowMailboxModal(true)}
                  onOpenSafetyModal={() => setShowSafetyModal(true)}
                  onSwitchAccount={() => setShowAuthModal(true)}
                  onLogout={handleLogout}
                />
              )}
            </>
          )}
        </div>

        {/* WeChat Classic Bottom Tab Bar (hidden when inside active conversation view, matching classic WeChat) */}
        {!activeChat && (
          <WeChatTabBar
            activeTab={activeTab}
            onChangeTab={(t) => setActiveTab(t)}
            unreadChatsCount={0}
            hasMomentsUpdate={true}
          />
        )}
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onLoginSuccess={handleLoginSuccess}
      />

      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        currentUserEmail={currentAccount.email}
        onFriendAdded={reloadVault}
      />

      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        currentUserEmail={currentAccount.email}
        contacts={userVault?.contacts || []}
        onGroupCreated={reloadVault}
      />

      <CloudMailInboxModal
        isOpen={showMailboxModal}
        onClose={() => setShowMailboxModal(false)}
        userEmail={currentAccount.email}
        inboxMails={userVault?.inboxMails || []}
      />

      <WiretapModal
        isOpen={showWiretapModal}
        onClose={() => setShowWiretapModal(false)}
        packets={wiretapPackets}
      />

      <WasmModal
        isOpen={showWasmModal}
        onClose={() => setShowWasmModal(false)}
      />

      <SafetyNumberModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        roomName={activeChat?.name || currentAccount.nickname}
        safetyNumber={currentSafetyNumber}
      />

      <CloudflareModal
        isOpen={showCloudflareModal}
        onClose={() => setShowCloudflareModal(false)}
      />
    </div>
  );
}
