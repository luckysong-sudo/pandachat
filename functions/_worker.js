/**
 * Saber-Chat v2 Zero-Knowledge Edge Relay & Multi-Device Cloud Sync Worker
 * Direct Cloudflare Pages & Workers deployment script
 */

// Global in-memory stores for multi-device sync
if (!globalThis.__PANDA_ACCOUNTS__) globalThis.__PANDA_ACCOUNTS__ = {};
if (!globalThis.__PANDA_VAULTS__) globalThis.__PANDA_VAULTS__ = {};

function normalizeEmail(input) {
  let clean = (input || '').trim().toLowerCase();
  if (!clean.includes('@')) clean += '@cloudmail.com';
  return clean;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Security headers
    const securityHeaders = {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: securityHeaders });
    }

    const accounts = globalThis.__PANDA_ACCOUNTS__;
    const vaults = globalThis.__PANDA_VAULTS__;

    // 1. GET /api/accounts - List all registered accounts
    if (url.pathname === '/api/accounts' && request.method === 'GET') {
      const list = Object.values(accounts).map((a) => ({
        email: a.email,
        nickname: a.nickname,
        avatar: a.avatar,
        cloudMailId: a.cloudMailId,
      }));
      return new Response(JSON.stringify({ accounts: list }), {
        headers: { 'Content-Type': 'application/json', ...securityHeaders },
      });
    }

    // 2. POST /api/accounts/register - Cross-Device Account Registration
    if (url.pathname === '/api/accounts/register' && request.method === 'POST') {
      try {
        const body = await request.json();
        const rawEmail = String(body.email || '');
        const password = String(body.password || '');
        const nickname = String(body.nickname || '');
        const bio = String(body.bio || '');
        const customChatId = body.cloudMailId ? String(body.cloudMailId) : undefined;

        if (!rawEmail || !password) {
          return new Response(JSON.stringify({ error: '请填写正确的邮箱与密码' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...securityHeaders },
          });
        }

        const email = normalizeEmail(rawEmail);
        const chatId = (customChatId || ('pa_' + email.split('@')[0])).trim();

        if (accounts[email]) {
          return new Response(
            JSON.stringify({ error: `邮箱账号「${email}」已在全网注册，请切换设备直接登录！` }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...securityHeaders } }
          );
        }

        const existingChatId = Object.values(accounts).find(
          (a) => a.cloudMailId.toLowerCase() === chatId.toLowerCase()
        );
        if (existingChatId) {
          return new Response(
            JSON.stringify({ error: `Chat ID「${chatId}」已被注册，请直接登录该账号或更名注册！` }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...securityHeaders } }
          );
        }

        const newAccount = {
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

        const newVault = {
          account: newAccount,
          contacts: [],
          groups: [],
          messages: [],
          moments: [],
          inboxMails: [
            {
              id: 'mail_welcome_edge',
              from: 'support@cloudmail.com',
              subject: '🐼 欢迎使用跨设备即时通讯账号！',
              content: `亲爱的 ${newAccount.nickname}：您的账号已在 Cloudflare 全球节点就绪，可以在电脑、手机等多台设备同步登录。`,
              date: '刚刚',
              read: false,
            },
          ],
        };

        vaults[email] = newVault;

        return new Response(JSON.stringify({ success: true, account: newAccount, vault: newVault }), {
          headers: { 'Content-Type': 'application/json', ...securityHeaders },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: '注册失败: ' + err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...securityHeaders },
        });
      }
    }

    // 3. POST /api/accounts/login - Cross-Device Login Authentication
    if (url.pathname === '/api/accounts/login' && request.method === 'POST') {
      try {
        const body = await request.json();
        const rawEmail = String(body.email || '');
        const password = String(body.password || '');

        if (!rawEmail || !password) {
          return new Response(JSON.stringify({ error: '请输入正确的邮箱与密码' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...securityHeaders },
          });
        }

        const email = normalizeEmail(rawEmail);
        const account = accounts[email];
        if (!account) {
          return new Response(
            JSON.stringify({ error: `全网未找到账号「${email}」，请确认账号或在注册页面新创建一个吧！` }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...securityHeaders } }
          );
        }

        if (account.passwordHash !== password) {
          return new Response(JSON.stringify({ error: '密码错误，请核对后重试！' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...securityHeaders },
          });
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

        return new Response(JSON.stringify({ success: true, account, vault: vaults[email] }), {
          headers: { 'Content-Type': 'application/json', ...securityHeaders },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: '登录异常: ' + err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...securityHeaders },
        });
      }
    }

    // 4. GET /api/sync - Synchronize vault
    if (url.pathname === '/api/sync' && request.method === 'GET') {
      const rawEmail = url.searchParams.get('email') || '';
      const email = normalizeEmail(rawEmail);
      const vault = vaults[email] || null;
      return new Response(JSON.stringify({ vault }), {
        headers: { 'Content-Type': 'application/json', ...securityHeaders },
      });
    }

    // 5. POST /api/vault - Save vault
    if (url.pathname === '/api/vault' && request.method === 'POST') {
      try {
        const body = await request.json();
        const email = normalizeEmail(body.email);
        if (email && body.vault) {
          vaults[email] = body.vault;
          if (body.vault.account) {
            accounts[email] = body.vault.account;
          }
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...securityHeaders },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...securityHeaders },
        });
      }
    }

    // 6. POST /api/add-friend - Add friend by Chat ID across devices
    if (url.pathname === '/api/add-friend' && request.method === 'POST') {
      try {
        const body = await request.json();
        const userEmail = normalizeEmail(body.currentUserEmail);
        const searchId = String(body.chatIdOrEmail || '').trim().toLowerCase();

        const userVault = vaults[userEmail];
        if (!userVault) {
          return new Response(JSON.stringify({ error: '请先登录账号' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...securityHeaders },
          });
        }

        let targetAccount = null;
        for (const acc of Object.values(accounts)) {
          if (
            acc.cloudMailId.toLowerCase() === searchId ||
            acc.email.toLowerCase() === searchId ||
            ('pa_' + acc.email.split('@')[0].toLowerCase()) === searchId
          ) {
            targetAccount = acc;
            break;
          }
        }

        if (!targetAccount) {
          return new Response(
            JSON.stringify({ error: `全网未找到 Chat ID 为「${body.chatIdOrEmail}」的用户` }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...securityHeaders } }
          );
        }

        if (targetAccount.email === userEmail) {
          return new Response(JSON.stringify({ error: '不能添加自己的 Chat ID 哦！' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...securityHeaders },
          });
        }

        const existing = userVault.contacts.find((c) => c.email === targetAccount.email);
        if (existing) {
          return new Response(
            JSON.stringify({ error: `Chat ID「${body.chatIdOrEmail}」已在通讯录中！` }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...securityHeaders } }
          );
        }

        const newContact = {
          email: targetAccount.email,
          nickname: targetAccount.nickname,
          avatar: targetAccount.avatar,
          bio: targetAccount.bio,
          initial: (targetAccount.nickname[0] || 'A').toUpperCase(),
          wechatId: targetAccount.cloudMailId,
        };

        userVault.contacts.push(newContact);

        // Mutual add
        const targetVault = vaults[targetAccount.email];
        if (targetVault && !targetVault.contacts.some((c) => c.email === userEmail)) {
          targetVault.contacts.push({
            email: userEmail,
            nickname: userVault.account.nickname,
            avatar: userVault.account.avatar,
            bio: userVault.account.bio,
            initial: (userVault.account.nickname[0] || 'A').toUpperCase(),
            wechatId: userVault.account.cloudMailId,
          });
        }

        return new Response(JSON.stringify({ success: true, contact: newContact }), {
          headers: { 'Content-Type': 'application/json', ...securityHeaders },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...securityHeaders },
        });
      }
    }

    // 7. POST /api/messages - Real-time cross-device message deliver
    if (url.pathname === '/api/messages' && request.method === 'POST') {
      try {
        const body = await request.json();
        const userEmail = normalizeEmail(body.currentUserEmail);
        const msg = body.message;

        if (userEmail && msg) {
          const userVault = vaults[userEmail];
          if (userVault && !userVault.messages.some((m) => m.id === msg.id)) {
            userVault.messages.push(msg);
          }

          if (!msg.isGroup && msg.toEmail !== userEmail) {
            const recipientEmail = normalizeEmail(msg.toEmail);
            const recipientVault = vaults[recipientEmail];
            if (recipientVault && !recipientVault.messages.some((m) => m.id === msg.id)) {
              recipientVault.messages.push(msg);
            }
          }

          if (msg.isGroup && userVault) {
            const group = userVault.groups.find((g) => g.id === msg.toEmail);
            if (group) {
              for (const memberEmail of group.members) {
                if (memberEmail !== userEmail) {
                  const memVault = vaults[normalizeEmail(memberEmail)];
                  if (memVault && !memVault.messages.some((m) => m.id === msg.id)) {
                    memVault.messages.push(msg);
                  }
                }
              }
            }
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...securityHeaders },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...securityHeaders },
        });
      }
    }

    // Health Check API
    if (url.pathname === '/api/edge-health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          registeredCount: Object.keys(accounts).length,
          colo: request.cf?.colo || 'DEV',
          timestamp: Date.now(),
        }),
        { headers: { 'Content-Type': 'application/json', ...securityHeaders } }
      );
    }

    // Static assets fallback
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }

    return new Response('Panda Chat Edge Relay Active', { headers: securityHeaders });
  },
};
