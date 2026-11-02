import { CloudMailAccount, UserVaultData, Contact, DirectMessage } from './userVault';

interface GlobalAccountsRegistry {
  [email: string]: CloudMailAccount;
}

interface GlobalVaultsMap {
  [email: string]: UserVaultData;
}

// In-memory global store backed by globalThis
const getAccounts = (): GlobalAccountsRegistry => {
  if (!(globalThis as unknown as { __PANDA_ACCOUNTS__?: GlobalAccountsRegistry }).__PANDA_ACCOUNTS__) {
    (globalThis as unknown as { __PANDA_ACCOUNTS__: GlobalAccountsRegistry }).__PANDA_ACCOUNTS__ = {};
  }
  return (globalThis as unknown as { __PANDA_ACCOUNTS__: GlobalAccountsRegistry }).__PANDA_ACCOUNTS__;
};

const getVaults = (): GlobalVaultsMap => {
  if (!(globalThis as unknown as { __PANDA_VAULTS__?: GlobalVaultsMap }).__PANDA_VAULTS__) {
    (globalThis as unknown as { __PANDA_VAULTS__: GlobalVaultsMap }).__PANDA_VAULTS__ = {};
  }
  return (globalThis as unknown as { __PANDA_VAULTS__: GlobalVaultsMap }).__PANDA_VAULTS__;
};

export function normalizeEmail(input: string): string {
  let clean = (input || '').trim().toLowerCase();
  if (!clean.includes('@')) {
    clean += '@cloudmail.com';
  }
  return clean;
}

export async function handleCloudApiRequest(
  pathname: string,
  method: string,
  body: Record<string, unknown> = {},
  queryParams: URLSearchParams = new URLSearchParams()
): Promise<{ status: number; json: Record<string, unknown> }> {
  const accounts = getAccounts();
  const vaults = getVaults();

  // 1. GET /api/accounts - List all registered accounts
  if (pathname === '/api/accounts' && method === 'GET') {
    const list = Object.values(accounts).map((a) => ({
      email: a.email,
      nickname: a.nickname,
      avatar: a.avatar,
      cloudMailId: a.cloudMailId,
    }));
    return { status: 200, json: { accounts: list } };
  }

  // 2. POST /api/accounts/register - Register new account
  if (pathname === '/api/accounts/register' && method === 'POST') {
    const rawEmail = String(body.email || '');
    const password = String(body.password || '');
    const nickname = String(body.nickname || '');
    const bio = String(body.bio || '');
    const customChatId = body.cloudMailId ? String(body.cloudMailId) : undefined;

    if (!rawEmail || !password) {
      return { status: 400, json: { error: '请填写正确的邮箱与密码' } };
    }

    const email = normalizeEmail(rawEmail);
    const chatId = (customChatId || ('pa_' + email.split('@')[0])).trim();

    // Check duplicate email
    if (accounts[email]) {
      return { status: 400, json: { error: `邮箱账号「${email}」已被注册，请切换设备直接点击登录！` } };
    }

    // Check duplicate Chat ID across all accounts
    const existingWithChatId = Object.values(accounts).find(
      (a) => a.cloudMailId.toLowerCase() === chatId.toLowerCase()
    );
    if (existingWithChatId) {
      return { status: 400, json: { error: `Chat ID「${chatId}」在全网已被注册，请直接使用该账号登录或更换注册！` } };
    }

    const newAccount: CloudMailAccount = {
      email,
      nickname: nickname.trim() || email.split('@')[0],
      avatar: '🐼',
      passwordHash: password,
      bio: bio || '这个熊猫小可爱很神秘，还没有写签名哦~',
      cloudMailId: chatId,
      region: '中国大陆',
      createdAt: Date.now(),
    };

    accounts[email] = newAccount;

    const newVault: UserVaultData = {
      account: newAccount,
      contacts: [],
      groups: [],
      messages: [],
      moments: [],
      inboxMails: [
        {
          id: 'mail_welcome_global',
          from: 'support@cloudmail.com',
          subject: '🐼 欢迎开启 Panda 跨设备加密即时通讯！',
          content: `亲爱的 ${newAccount.nickname}：恭喜注册成功！您的账号已在全网节点节点就绪，支持在手机、电脑等多设备自由登录，联系人与聊天卡片实时同步。`,
          date: '刚刚',
          read: false,
        },
      ],
    };

    vaults[email] = newVault;

    return { status: 200, json: { success: true, account: newAccount, vault: newVault } };
  }

  // 3. POST /api/accounts/login - Authenticate account globally
  if (pathname === '/api/accounts/login' && method === 'POST') {
    const rawEmail = String(body.email || '');
    const password = String(body.password || '');
    if (!rawEmail || !password) {
      return { status: 400, json: { error: '请输入正确的邮箱与密码' } };
    }

    const email = normalizeEmail(rawEmail);
    const account = accounts[email];
    if (!account) {
      return {
        status: 400,
        json: { error: `未找到账号「${email}」，请确认账号或在注册页面新创建一个吧！` },
      };
    }

    if (account.passwordHash !== password) {
      return { status: 400, json: { error: '密码错误，请核对密码后重试！' } };
    }

    if (!vaults[email]) {
      vaults[email] = {
        account,
        contacts: [],
        groups: [],
        messages: [],
        moments: [],
        inboxMails: [],
      };
    }

    return { status: 200, json: { success: true, account, vault: vaults[email] } };
  }

  // 4. GET /api/sync - Sync vault & account directory
  if (pathname === '/api/sync' && method === 'GET') {
    const rawEmail = queryParams.get('email') || '';
    if (!rawEmail) {
      return { status: 400, json: { error: '缺少 email 参数' } };
    }
    const email = normalizeEmail(rawEmail);
    const vault = vaults[email] || null;
    return { status: 200, json: { vault } };
  }

  // 5. POST /api/vault - Save vault
  if (pathname === '/api/vault' && method === 'POST') {
    const rawEmail = String(body.email || '');
    const vaultData = body.vault as UserVaultData;
    if (rawEmail && vaultData) {
      const email = normalizeEmail(rawEmail);
      vaults[email] = vaultData;
      if (vaultData.account) {
        accounts[email] = vaultData.account;
      }
    }
    return { status: 200, json: { success: true } };
  }

  // 6. POST /api/add-friend - Add friend by Chat ID across devices
  if (pathname === '/api/add-friend' && method === 'POST') {
    const rawUserEmail = String(body.currentUserEmail || '');
    const rawChatIdOrEmail = String(body.chatIdOrEmail || '').trim();

    if (!rawUserEmail || !rawChatIdOrEmail) {
      return { status: 400, json: { error: '参数不完整，请提供 Chat ID 或邮箱' } };
    }

    const userEmail = normalizeEmail(rawUserEmail);
    const userVault = vaults[userEmail];
    if (!userVault) {
      return { status: 400, json: { error: '当前用户登录状态失效' } };
    }

    // Search target account globally across all registered accounts
    const cleanSearch = rawChatIdOrEmail.toLowerCase();
    let targetAccount: CloudMailAccount | null = null;

    for (const acc of Object.values(accounts)) {
      if (
        acc.cloudMailId.toLowerCase() === cleanSearch ||
        acc.email.toLowerCase() === cleanSearch ||
        ('pa_' + acc.email.split('@')[0].toLowerCase()) === cleanSearch
      ) {
        targetAccount = acc;
        break;
      }
    }

    if (!targetAccount) {
      return {
        status: 400,
        json: { error: `全网未找到 Chat ID 为「${rawChatIdOrEmail}」的用户，请与朋友核对该 Chat ID` },
      };
    }

    if (targetAccount.email === userEmail) {
      return { status: 400, json: { error: '不能添加自己的 Chat ID 哦！' } };
    }

    // Check if already in user's contacts
    const existing = userVault.contacts.find((c) => c.email === targetAccount!.email);
    if (existing) {
      return {
        status: 400,
        json: { error: `Chat ID「${rawChatIdOrEmail}」(${targetAccount.nickname}) 已在您的通讯录中！` },
      };
    }

    const newContactForUser: Contact = {
      email: targetAccount.email,
      nickname: targetAccount.nickname,
      avatar: targetAccount.avatar,
      bio: targetAccount.bio,
      initial: (targetAccount.nickname[0] || 'A').toUpperCase(),
      wechatId: targetAccount.cloudMailId,
    };

    userVault.contacts.push(newContactForUser);

    // Mutual addition into target's vault
    const targetVault = vaults[targetAccount.email];
    if (targetVault) {
      const existsInTarget = targetVault.contacts.some((c) => c.email === userEmail);
      if (!existsInTarget) {
        targetVault.contacts.push({
          email: userEmail,
          nickname: userVault.account.nickname,
          avatar: userVault.account.avatar,
          bio: userVault.account.bio,
          initial: (userVault.account.nickname[0] || 'A').toUpperCase(),
          wechatId: userVault.account.cloudMailId,
        });
      }
    }

    return { status: 200, json: { success: true, contact: newContactForUser } };
  }

  // 7. POST /api/messages - Append message globally across devices
  if (pathname === '/api/messages' && method === 'POST') {
    const rawUserEmail = String(body.currentUserEmail || '');
    const message = body.message as DirectMessage;

    if (rawUserEmail && message) {
      const userEmail = normalizeEmail(rawUserEmail);
      const userVault = vaults[userEmail];
      if (userVault) {
        if (!userVault.messages.some((m) => m.id === message.id)) {
          userVault.messages.push(message);
        }
      }

      // Deliver to recipient vault if direct message
      if (!message.isGroup && message.toEmail !== userEmail) {
        const recipientEmail = normalizeEmail(message.toEmail);
        const recipientVault = vaults[recipientEmail];
        if (recipientVault) {
          if (!recipientVault.messages.some((m) => m.id === message.id)) {
            recipientVault.messages.push(message);
          }
        }
      }

      // Deliver to group members if group message
      if (message.isGroup && userVault) {
        const group = userVault.groups.find((g) => g.id === message.toEmail);
        if (group) {
          for (const memberEmail of group.members) {
            if (memberEmail !== userEmail) {
              const memberVault = vaults[memberEmail];
              if (memberVault && !memberVault.messages.some((m) => m.id === message.id)) {
                memberVault.messages.push(message);
              }
            }
          }
        }
      }
    }

    return { status: 200, json: { success: true } };
  }

  return { status: 404, json: { error: 'Not Found' } };
}
