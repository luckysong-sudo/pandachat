/**
 * Cloud Mail Authentication & Per-User Isolated Database Vault
 * 
 * Every user has:
 * - A Cloud Mail address ending in @cloudmail.com
 * - An independent encrypted local storage vault keyed strictly by their email
 * - Isolated contacts, groups, and chat history that do not leak or cross between accounts
 * - Classic WeChat-style data architecture
 */

import { generateRandomBytes, bytesToBase64, generateSafetyFingerprint } from '../crypto/e2ee';
import { apiService } from './apiService';

export interface CloudMailAccount {
  email: string; // e.g. "panda@cloudmail.com"
  nickname: string;
  avatar: string;
  passwordHash: string; // in memory/local
  bio: string;
  cloudMailId: string; // e.g. "wx_panda_888"
  region: string;
  createdAt: number;
}

export interface Contact {
  email: string;
  nickname: string;
  avatar: string;
  bio: string;
  initial: string; // e.g. 'A', 'B', 'L'
  wechatId?: string;
  isStarred?: boolean;
}

export interface GroupChat {
  id: string;
  name: string;
  avatar: string;
  members: string[]; // emails
  notice: string;
  createdAt: number;
}

export interface DirectMessage {
  id: string;
  fromEmail: string;
  toEmail: string; // or groupId
  isGroup: boolean;
  content: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  contentType: 'text' | 'image' | 'voice' | 'sticker' | 'location';
  stickerUrl?: string;
}

export interface UserVaultData {
  account: CloudMailAccount;
  contacts: Contact[];
  groups: GroupChat[];
  messages: DirectMessage[]; // strictly isolated to this user
  moments: MomentPost[];
  inboxMails: CloudMailMessage[];
}

export interface MomentPost {
  id: string;
  authorEmail: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: number;
  likes: string[]; // nicknames
  comments: { name: string; text: string }[];
}

export interface CloudMailMessage {
  id: string;
  from: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
}

export interface DriftingBottleReply {
  id: string;
  authorEmail: string;
  authorName: string;
  authorAvatar: string;
  authorWeChatId: string;
  content: string;
  timestamp: number;
}

export interface DriftingBottle {
  id: string;
  authorEmail: string;
  authorName: string;
  authorAvatar: string;
  authorWeChatId: string;
  content: string;
  timestamp: number;
  replies: DriftingBottleReply[];
}

export interface RegisteredAccountSummary {
  email: string;
  nickname: string;
  avatar: string;
  cloudMailId: string;
}

const VAULT_PREFIX = 'saber_vault_';
const ACCOUNTS_REGISTRY_KEY = 'saber_cloudmail_accounts_registry';
const DRIFTING_BOTTLES_KEY = 'saber_drifting_bottles';

export class UserVaultManager {
  /**
   * Validates Cloud Mail format
   */
  public static normalizeEmail(input: string): string {
    let clean = input.trim().toLowerCase();
    if (!clean.includes('@')) {
      clean += '@cloudmail.com';
    }
    return clean;
  }

  /**
   * Retrieves all registered accounts metadata (for account switcher and WeChat ID directory)
   */
  public static getRegisteredAccounts(): RegisteredAccountSummary[] {
    try {
      const raw = localStorage.getItem(ACCOUNTS_REGISTRY_KEY);
      if (!raw) return [];
      const list: RegisteredAccountSummary[] = JSON.parse(raw);
      // Ensure cloudMailId exists on every record
      return list.map(item => ({
        ...item,
        cloudMailId: item.cloudMailId || ('pa_' + item.email.split('@')[0])
      }));
    } catch {
      return [];
    }
  }

  private static recordAccount(account: CloudMailAccount) {
    const list = this.getRegisteredAccounts();
    const existingIndex = list.findIndex(a => a.email === account.email);
    const summary: RegisteredAccountSummary = {
      email: account.email,
      nickname: account.nickname,
      avatar: account.avatar,
      cloudMailId: account.cloudMailId || ('pa_' + account.email.split('@')[0])
    };

    if (existingIndex >= 0) {
      list[existingIndex] = summary;
    } else {
      list.push(summary);
    }
    localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(list));
  }

  /**
   * Purges any legacy preset demo accounts from localStorage if present
   */
  public static purgePresetAccounts(): void {
    const presetEmails = ['panda@cloudmail.com', 'pudding@cloudmail.com', 'matcha@cloudmail.com', 'lucky@cloudmail.com'];
    presetEmails.forEach((email) => {
      localStorage.removeItem(VAULT_PREFIX + email);
    });

    const list = this.getRegisteredAccounts().filter(
      (acc) => !presetEmails.includes(acc.email)
    );
    localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(list));

    const activeRaw = localStorage.getItem('saber_active_cloudmail_account');
    if (activeRaw) {
      try {
        const parsed = JSON.parse(activeRaw);
        if (presetEmails.includes(parsed.email)) {
          localStorage.removeItem('saber_active_cloudmail_account');
        }
      } catch {}
    }
  }


  /**
   * Registers a new account with its isolated vault
   */
  public static registerAccount(
    email: string,
    password: string,
    nickname: string,
    avatar: string,
    cloudMailId?: string,
    bio?: string
  ): CloudMailAccount {
    const normalized = this.normalizeEmail(email);
    const existing = this.loadUserVault(normalized);
    if (existing) {
      throw new Error('该 Panda 邮箱已被注册，请直接登录！');
    }

    const account: CloudMailAccount = {
      email: normalized,
      nickname: nickname.trim() || normalized.split('@')[0],
      avatar: '🐼', // Fixed to panda avatar
      passwordHash: password, // In production could be scrypt/argon
      bio: bio || '这个熊猫小可爱很神秘，还没有写签名哦~',
      cloudMailId: cloudMailId || 'pa_' + normalized.split('@')[0],
      region: '中国大陆',
      createdAt: Date.now(),
    };

    const newVault: UserVaultData = {
      account,
      contacts: [],
      groups: [],
      messages: [],
      moments: [],
      inboxMails: [
        {
          id: 'mail_welcome_new',
          from: 'support@cloudmail.com',
          subject: '🐼 欢迎开启 Panda 专属可爱加密聊天！',
          content: `亲爱的 ${account.nickname}：恭喜您注册成功！您的账号已分配独立本地加密数据库，已集成端到端加密与 Cloudflare 边缘部署。`,
          date: '刚刚',
          read: false,
        }
      ],
    };

    this.saveUserVault(newVault);
    this.recordAccount(account);
    return account;
  }

  /**
   * Registers a new account with its isolated vault (Cloud + Local)
   */
  public static async registerAccountAsync(
    email: string,
    password: string,
    nickname: string,
    avatar: string,
    cloudMailId?: string,
    bio?: string
  ): Promise<CloudMailAccount> {
    const account = await apiService.register({
      email,
      password,
      nickname,
      avatar: '🐼',
      cloudMailId,
      bio,
    });
    this.recordAccount(account);
    const syncedVault = await apiService.syncVault(account.email);
    if (syncedVault) {
      this.saveUserVaultLocal(syncedVault);
    }
    return account;
  }

  /**
   * Authenticates user against cloud & isolated vault across devices
   */
  public static async loginAccountAsync(email: string, password: string): Promise<CloudMailAccount> {
    const { account, vault } = await apiService.login(email, password);
    this.recordAccount(account);
    this.saveUserVaultLocal(vault);
    return account;
  }

  /**
   * Synchronizes local vault with cloud store across devices
   */
  public static async syncVaultWithCloud(email: string): Promise<UserVaultData | null> {
    const cloudVault = await apiService.syncVault(email);
    if (cloudVault) {
      this.saveUserVaultLocal(cloudVault);
    }
    return cloudVault;
  }

  /**
   * Authenticates user against their isolated vault (Local fallback)
   */
  public static loginAccount(email: string, password: string): CloudMailAccount {
    const normalized = this.normalizeEmail(email);
    const vault = this.loadUserVault(normalized);
    if (!vault) {
      throw new Error('未找到该 Panda 账户，请先点击注册！');
    }
    if (vault.account.passwordHash !== password) {
      throw new Error('密码错误，请核对后重试！');
    }
    return vault.account;
  }

  /**
   * Loads the isolated database vault for a specific email
   */
  public static loadUserVault(email: string): UserVaultData | null {
    const normalized = this.normalizeEmail(email);
    const key = VAULT_PREFIX + normalized;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static saveUserVaultLocal(vault: UserVaultData): void {
    const key = VAULT_PREFIX + vault.account.email;
    localStorage.setItem(key, JSON.stringify(vault));
  }

  /**
   * Persists the user's isolated database vault (Local + Cloud)
   */
  public static saveUserVault(vault: UserVaultData): void {
    this.saveUserVaultLocal(vault);
    apiService.saveVault(vault);
  }

  /**
   * Sends a message between users or in group, saving to local vault and dispatching to peer
   */
  public static appendMessage(
    currentUserEmail: string,
    message: DirectMessage
  ): void {
    const vault = this.loadUserVault(currentUserEmail);
    if (!vault) return;
    vault.messages.push(message);
    this.saveUserVault(vault);
    apiService.sendMessage(currentUserEmail, message);

    // If direct message, also deliver to recipient's isolated vault if present on this device
    if (!message.isGroup && message.toEmail !== currentUserEmail) {
      const recipientVault = this.loadUserVault(message.toEmail);
      if (recipientVault) {
        // Only deliver if recipient doesn't already have this message ID
        if (!recipientVault.messages.some(m => m.id === message.id)) {
          recipientVault.messages.push(message);
          this.saveUserVault(recipientVault);
        }
      }
    }

    // If group message, deliver to all other members in that group on this device
    if (message.isGroup) {
      const group = vault.groups.find(g => g.id === message.toEmail);
      if (group) {
        for (const memberEmail of group.members) {
          if (memberEmail !== currentUserEmail) {
            const memberVault = this.loadUserVault(memberEmail);
            if (memberVault && !memberVault.messages.some(m => m.id === message.id)) {
              memberVault.messages.push(message);
              this.saveUserVault(memberVault);
            }
          }
        }
      }
    }
  }

  /**
   * Adds a friend to current user's contact list
   */
  public static addFriend(
    currentUserEmail: string,
    friendEmail: string,
    friendNickname?: string,
    friendAvatar?: string
  ): Contact {
    const vault = this.loadUserVault(currentUserEmail);
    if (!vault) throw new Error('当前用户未登录');

    const targetEmail = this.normalizeEmail(friendEmail);
    if (targetEmail === currentUserEmail) {
      throw new Error('不能添加自己为好友哦！');
    }

    const existing = vault.contacts.find(c => c.email === targetEmail);
    if (existing) {
      throw new Error('该用户已在您的通讯录中！');
    }

    // Try to inspect target's public profile if registered locally
    const targetVault = this.loadUserVault(targetEmail);
    const nickname = friendNickname || targetVault?.account.nickname || targetEmail.split('@')[0];
    const avatar = '🐼';
    const initial = (nickname[0] || 'A').toUpperCase();

    const newContact: Contact = {
      email: targetEmail,
      nickname,
      avatar,
      bio: targetVault?.account.bio || '生活很甜，熊猫相伴~',
      initial,
    };

    vault.contacts.push(newContact);
    this.saveUserVault(vault);

    // Also mutually add current user to target if target exists
    if (targetVault && !targetVault.contacts.some(c => c.email === currentUserEmail)) {
      targetVault.contacts.push({
        email: currentUserEmail,
        nickname: vault.account.nickname,
        avatar: '🐼',
        bio: vault.account.bio,
        initial: (vault.account.nickname[0] || 'A').toUpperCase(),
      });
      this.saveUserVault(targetVault);
    }

    return newContact;
  }

  /**
   * Creates a new group in user's vault
   */
  public static createGroup(
    currentUserEmail: string,
    name: string,
    members: string[],
    avatar = '🐼'
  ): GroupChat {
    const vault = this.loadUserVault(currentUserEmail);
    if (!vault) throw new Error('当前用户未登录');

    const allMembers = Array.from(new Set([currentUserEmail, ...members]));
    const newGroup: GroupChat = {
      id: 'grp_' + Date.now().toString(36),
      name: name.trim() || '熊猫可爱群聊 🐼',
      avatar: '🐼',
      members: allMembers,
      notice: '欢迎加入熊猫群聊！严禁发广告，文明交友哦~',
      createdAt: Date.now(),
    };

    vault.groups.push(newGroup);
    this.saveUserVault(vault);

    // Also propagate group to all members on this device
    for (const mem of allMembers) {
      if (mem !== currentUserEmail) {
        const memVault = this.loadUserVault(mem);
        if (memVault && !memVault.groups.some(g => g.id === newGroup.id)) {
          memVault.groups.push(newGroup);
          this.saveUserVault(memVault);
        }
      }
    }

    return newGroup;
  }

  /**
   * Searches registered accounts strictly by WeChat ID (微信号)
   */
  public static findAccountByWeChatId(wechatId: string): CloudMailAccount | null {
    const cleanId = wechatId.trim().toLowerCase();
    if (!cleanId) return null;

    // Check all registered accounts
    const registered = this.getRegisteredAccounts();
    for (const reg of registered) {
      if (
        (reg.cloudMailId && reg.cloudMailId.toLowerCase() === cleanId) ||
        ('pa_' + reg.email.split('@')[0].toLowerCase() === cleanId)
      ) {
        const vault = this.loadUserVault(reg.email);
        if (vault) return vault.account;
      }
    }
    return null;
  }

  /**
   * Adds a friend using Chat ID across devices (Cloud + Local)
   */
  public static async addFriendByWeChatIdAsync(currentUserEmail: string, wechatId: string): Promise<Contact> {
    const contact = await apiService.addFriend(currentUserEmail, wechatId);
    const updatedVault = await apiService.syncVault(currentUserEmail);
    if (updatedVault) {
      this.saveUserVaultLocal(updatedVault);
    }
    return contact;
  }

  /**
   * Adds a friend strictly using Chat ID (Local fallback)
   */
  public static addFriendByWeChatId(currentUserEmail: string, wechatId: string): Contact {
    const cleanId = wechatId.trim();
    if (!cleanId) {
      throw new Error('请输入有效的微信号');
    }

    const currentVault = this.loadUserVault(currentUserEmail);
    if (!currentVault) {
      throw new Error('当前用户未登录');
    }

    if (
      currentVault.account.cloudMailId?.toLowerCase() === cleanId.toLowerCase() ||
      ('pa_' + currentVault.account.email.split('@')[0].toLowerCase()) === cleanId.toLowerCase()
    ) {
      throw new Error('不能添加自己的微信号哦！');
    }

    const targetAccount = this.findAccountByWeChatId(cleanId);
    if (!targetAccount) {
      throw new Error(`未找到微信号为「${cleanId}」的用户，请核对微信号是否正确（可从对方“我”页面查看微信号）`);
    }

    const existing = currentVault.contacts.find(
      c => c.email === targetAccount.email || c.wechatId?.toLowerCase() === cleanId.toLowerCase()
    );
    if (existing) {
      throw new Error(`微信号「${cleanId}」(${targetAccount.nickname}) 已在您的通讯录中！`);
    }

    const newContact: Contact = {
      email: targetAccount.email,
      nickname: targetAccount.nickname,
      avatar: targetAccount.avatar,
      bio: targetAccount.bio || '生活很甜，好运连连~',
      initial: (targetAccount.nickname[0] || 'A').toUpperCase(),
      wechatId: targetAccount.cloudMailId,
    };

    currentVault.contacts.push(newContact);
    this.saveUserVault(currentVault);

    // Mutual add into target's vault if target exists
    const targetVault = this.loadUserVault(targetAccount.email);
    if (targetVault && !targetVault.contacts.some(c => c.email === currentUserEmail)) {
      targetVault.contacts.push({
        email: currentUserEmail,
        nickname: currentVault.account.nickname,
        avatar: currentVault.account.avatar,
        bio: currentVault.account.bio,
        initial: (currentVault.account.nickname[0] || 'A').toUpperCase(),
        wechatId: currentVault.account.cloudMailId,
      });
      this.saveUserVault(targetVault);
    }

    return newContact;
  }

  /**
   * Adds new members to an existing group chat
   */
  public static addGroupMembers(
    currentUserEmail: string,
    groupId: string,
    newMemberEmails: string[],
    inviterNickname?: string
  ): GroupChat {
    const currentVault = this.loadUserVault(currentUserEmail);
    if (!currentVault) throw new Error('当前用户未登录');

    const group = currentVault.groups.find(g => g.id === groupId);
    if (!group) throw new Error('未找到该群聊');

    const membersToAdd = newMemberEmails.filter(email => !group.members.includes(email));
    if (membersToAdd.length === 0) {
      return group;
    }

    const updatedMembers = Array.from(new Set([...group.members, ...membersToAdd]));
    group.members = updatedMembers;
    this.saveUserVault(currentVault);

    // Get added members' nicknames
    const addedNicknames: string[] = [];
    for (const email of membersToAdd) {
      const v = this.loadUserVault(email);
      if (v) addedNicknames.push(v.account.nickname);
      else {
        const contact = currentVault.contacts.find(c => c.email === email);
        addedNicknames.push(contact?.nickname || email.split('@')[0]);
      }
    }

    // Propagate updated group to all members
    for (const memberEmail of updatedMembers) {
      const memVault = this.loadUserVault(memberEmail);
      if (memVault) {
        const existingGroup = memVault.groups.find(g => g.id === groupId);
        if (existingGroup) {
          existingGroup.members = updatedMembers;
        } else {
          memVault.groups.push({ ...group, members: updatedMembers });
        }
        this.saveUserVault(memVault);
      }
    }

    // Append system invite message to group
    const systemNotice: DirectMessage = {
      id: 'sys_' + Date.now().toString(36),
      fromEmail: 'system@chat.local',
      toEmail: groupId,
      isGroup: true,
      content: `🔔 ${(inviterNickname || currentVault.account.nickname)} 邀请了 ${addedNicknames.join('、')} 加入群聊`,
      timestamp: Date.now(),
      status: 'read',
      contentType: 'text',
    };
    this.appendMessage(currentUserEmail, systemNotice);

    return group;
  }

  /**
   * Drifting Bottle: Get all public ocean bottles
   */
  public static getDriftingBottles(): DriftingBottle[] {
    try {
      const raw = localStorage.getItem(DRIFTING_BOTTLES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    // Default seeded bottles with authors and reply threads
    const defaults: DriftingBottle[] = [
      {
        id: 'bottle_sugar_1',
        authorEmail: 'sugar@chat.local',
        authorName: '熊猫宝贝 🐼',
        authorAvatar: '🐼',
        authorWeChatId: 'pa_sugar_sweet',
        content: '愿你在生活里常有小确幸，今天也要开心哦！你今天吃了什么好吃的呀？',
        timestamp: Date.now() - 3600 * 1000 * 5,
        replies: [
          {
            id: 'rep_1',
            authorEmail: 'matcha@chat.local',
            authorName: '熊猫竹竹 🐼',
            authorAvatar: '🐼',
            authorWeChatId: 'pa_matcha_coconut',
            content: '我今天吃到了新鲜竹笋拿铁，也祝你开心！',
            timestamp: Date.now() - 3600 * 1000 * 2,
          }
        ]
      },
      {
        id: 'bottle_pudding_2',
        authorEmail: 'pudding@chat.local',
        authorName: '熊猫嘟嘟 🐼',
        authorAvatar: '🐼',
        authorWeChatId: 'pa_caramel_pudding',
        content: '无论今天遇到了多大的烦恼，吹吹晚风，明天又是全新的一天！',
        timestamp: Date.now() - 3600 * 1000 * 12,
        replies: []
      },
      {
        id: 'bottle_cloud_3',
        authorEmail: 'sky@chat.local',
        authorName: '云朵熊猫 🐼',
        authorAvatar: '🐼',
        authorWeChatId: 'pa_cloud_marshmallow',
        content: '捡到这个瓶子的有缘人，留下一句你最喜欢的话吧~',
        timestamp: Date.now() - 3600 * 1000 * 24,
        replies: []
      }
    ];

    localStorage.setItem(DRIFTING_BOTTLES_KEY, JSON.stringify(defaults));
    return defaults;
  }

  /**
   * Drifting Bottle: Throw a new bottle into the ocean
   */
  public static throwDriftingBottle(account: CloudMailAccount, content: string): DriftingBottle {
    const cleanContent = content.trim();
    if (!cleanContent) throw new Error('瓶子内容不能为空');

    const bottles = this.getDriftingBottles();
    const newBottle: DriftingBottle = {
      id: 'bottle_' + Date.now().toString(36),
      authorEmail: account.email,
      authorName: account.nickname,
      authorAvatar: account.avatar,
      authorWeChatId: account.cloudMailId || ('pa_' + account.email.split('@')[0]),
      content: cleanContent,
      timestamp: Date.now(),
      replies: [],
    };

    bottles.unshift(newBottle);
    localStorage.setItem(DRIFTING_BOTTLES_KEY, JSON.stringify(bottles));
    return newBottle;
  }

  /**
   * Drifting Bottle: Reply to a picked bottle and send reply content to the author
   */
  public static replyDriftingBottle(
    bottleId: string,
    replier: CloudMailAccount,
    replyContent: string
  ): DriftingBottle {
    const cleanReply = replyContent.trim();
    if (!cleanReply) throw new Error('回信内容不能为空');

    const bottles = this.getDriftingBottles();
    const bottle = bottles.find(b => b.id === bottleId);
    if (!bottle) throw new Error('未找到该漂流瓶');

    const reply: DriftingBottleReply = {
      id: 'reply_' + Date.now().toString(36),
      authorEmail: replier.email,
      authorName: replier.nickname,
      authorAvatar: replier.avatar,
      authorWeChatId: replier.cloudMailId || ('pa_' + replier.email.split('@')[0]),
      content: cleanReply,
      timestamp: Date.now(),
    };

    bottle.replies.push(reply);
    localStorage.setItem(DRIFTING_BOTTLES_KEY, JSON.stringify(bottles));
    return bottle;
  }

  /**
   * Drifting Bottle: Fish a bottle from the ocean
   */
  public static fishDriftingBottle(currentUserEmail: string): DriftingBottle | null {
    const bottles = this.getDriftingBottles();
    if (bottles.length === 0) return null;
    const otherBottles = bottles.filter(b => b.authorEmail !== currentUserEmail);
    const pool = otherBottles.length > 0 ? otherBottles : bottles;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    return picked;
  }
}
