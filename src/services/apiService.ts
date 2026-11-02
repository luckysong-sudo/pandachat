import { CloudMailAccount, UserVaultData, Contact, DirectMessage } from './userVault';

export const apiService = {
  /**
   * Register account globally across devices
   */
  async register(data: {
    email: string;
    password: string;
    nickname: string;
    avatar?: string;
    cloudMailId?: string;
    bio?: string;
  }): Promise<CloudMailAccount> {
    const res = await fetch('/api/accounts/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || json.error) {
      throw new Error(json.error || '全网账号注册失败，请稍后重试');
    }
    return json.account;
  },

  /**
   * Login account globally across devices
   */
  async login(email: string, password: string): Promise<{ account: CloudMailAccount; vault: UserVaultData }> {
    const res = await fetch('/api/accounts/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok || json.error) {
      throw new Error(json.error || '登录校验失败');
    }
    return { account: json.account, vault: json.vault };
  },

  /**
   * Sync latest vault and registered accounts across devices
   */
  async syncVault(email: string): Promise<UserVaultData | null> {
    try {
      const res = await fetch(`/api/sync?email=${encodeURIComponent(email)}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.vault || null;
    } catch {
      return null;
    }
  },

  /**
   * Save vault globally across devices
   */
  async saveVault(vault: UserVaultData): Promise<void> {
    try {
      await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: vault.account.email, vault }),
      });
    } catch (err) {
      console.warn('[APIService] Save vault error:', err);
    }
  },

  /**
   * Add friend by Chat ID globally across devices
   */
  async addFriend(currentUserEmail: string, chatIdOrEmail: string): Promise<Contact> {
    const res = await fetch('/api/add-friend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserEmail, chatIdOrEmail }),
    });
    const json = await res.json();
    if (!res.ok || json.error) {
      throw new Error(json.error || '添加好友失败');
    }
    return json.contact;
  },

  /**
   * Append message globally across devices
   */
  async sendMessage(currentUserEmail: string, message: DirectMessage): Promise<void> {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUserEmail, message }),
      });
    } catch (err) {
      console.warn('[APIService] Send message error:', err);
    }
  }
};
