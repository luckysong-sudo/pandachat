import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for node:test environment if not present
if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => { store[key] = val; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    length: 0,
    key: () => null,
  };
}

import { UserVaultManager } from './userVault.ts';

test('Cloud Mail email normalization works', () => {
  assert.equal(UserVaultManager.normalizeEmail('lucky'), 'lucky@cloudmail.com');
  assert.equal(UserVaultManager.normalizeEmail('Lucky@CloudMail.COM'), 'lucky@cloudmail.com');
  assert.equal(UserVaultManager.normalizeEmail('bob@custom.com'), 'bob@custom.com');
});

test('User registration and login succeeds with isolated vaults', () => {
  const emailA = 'test_alice@cloudmail.com';
  const emailB = 'test_bob@cloudmail.com';

  const userA = UserVaultManager.registerAccount(emailA, 'pass123', '爱丽丝兔', '🐰');
  const userB = UserVaultManager.registerAccount(emailB, 'pass456', '波波熊', '🧸');

  assert.equal(userA.email, emailA);
  assert.equal(userB.email, emailB);

  // Login verification
  const loggedA = UserVaultManager.loginAccount(emailA, 'pass123');
  assert.equal(loggedA.nickname, '爱丽丝兔');

  // Wrong password fails
  assert.throws(() => {
    UserVaultManager.loginAccount(emailA, 'wrong_pass');
  }, /密码错误/);
});

test('Contacts and messages are strictly isolated per user database', () => {
  const emailA = 'user_kiki@cloudmail.com';
  const emailB = 'user_mimi@cloudmail.com';
  const emailC = 'user_coco@cloudmail.com';

  UserVaultManager.registerAccount(emailA, '123', '琪琪', '🐱');
  UserVaultManager.registerAccount(emailB, '123', '咪咪', '🌸');
  UserVaultManager.registerAccount(emailC, '123', '可可', '🐶');

  // Kiki adds Mimi as a friend
  UserVaultManager.addFriend(emailA, emailB);

  const vaultKiki = UserVaultManager.loadUserVault(emailA)!;
  const vaultCoco = UserVaultManager.loadUserVault(emailC)!;

  // Mimi is in Kiki's contact list
  assert.equal(vaultKiki.contacts.some(c => c.email === emailB), true);
  // Coco's vault must NOT have Mimi in contacts (strict isolation!)
  assert.equal(vaultCoco.contacts.some(c => c.email === emailB), false);

  // Kiki sends message to Mimi
  UserVaultManager.appendMessage(emailA, {
    id: 'msg_test_01',
    fromEmail: emailA,
    toEmail: emailB,
    isGroup: false,
    content: '你好咪咪！这是私密消息~',
    timestamp: Date.now(),
    status: 'sent',
    contentType: 'text',
  });

  const reloadedKiki = UserVaultManager.loadUserVault(emailA)!;
  const reloadedMimi = UserVaultManager.loadUserVault(emailB)!;
  const reloadedCoco = UserVaultManager.loadUserVault(emailC)!;

  // Present in Kiki and Mimi's isolated stores
  assert.equal(reloadedKiki.messages.some(m => m.id === 'msg_test_01'), true);
  assert.equal(reloadedMimi.messages.some(m => m.id === 'msg_test_01'), true);

  // Strictly NOT present in Coco's store
  assert.equal(reloadedCoco.messages.some(m => m.id === 'msg_test_01'), false);
});

test('Adding friends strictly by WeChat ID works', () => {
  const emailX = 'user_daisy@cloudmail.com';
  const emailY = 'user_tom@cloudmail.com';

  const userX = UserVaultManager.registerAccount(emailX, '123', '黛西', '🌼', 'wx_daisy_vip');
  const userY = UserVaultManager.registerAccount(emailY, '123', '汤姆猫', '🐱', 'wx_tom_cat');

  // Lookup by WeChat ID
  const found = UserVaultManager.findAccountByWeChatId('wx_tom_cat');
  assert.ok(found);
  assert.equal(found.email, emailY);

  // Add friend strictly by WeChat ID
  const contact = UserVaultManager.addFriendByWeChatId(emailX, 'wx_tom_cat');
  assert.equal(contact.nickname, '汤姆猫');
  assert.equal(contact.wechatId, 'wx_tom_cat');

  const vaultX = UserVaultManager.loadUserVault(emailX)!;
  assert.ok(vaultX.contacts.some(c => c.wechatId === 'wx_tom_cat'));

  // Disallow adding self
  assert.throws(() => {
    UserVaultManager.addFriendByWeChatId(emailX, 'wx_daisy_vip');
  }, /不能添加自己的微信号/);

  // Non-existent ID error
  assert.throws(() => {
    UserVaultManager.addFriendByWeChatId(emailX, 'wx_non_existent');
  }, /未找到微信号/);
});

test('Adding group members to an existing group updates members and posts notice', () => {
  const owner = 'owner@cloudmail.com';
  const member1 = 'mem1@cloudmail.com';
  const member2 = 'mem2@cloudmail.com';

  UserVaultManager.registerAccount(owner, '123', '群主糖糖', '🍬');
  UserVaultManager.registerAccount(member1, '123', '成员小布', '🍮');
  UserVaultManager.registerAccount(member2, '123', '成员小茶', '🍵');

  // Create initial group with owner and member1
  const grp = UserVaultManager.createGroup(owner, '测试下午茶群', [member1]);
  assert.equal(grp.members.length, 2);

  // Add member2 to existing group
  const updatedGrp = UserVaultManager.addGroupMembers(owner, grp.id, [member2], '群主糖糖');
  assert.equal(updatedGrp.members.length, 3);
  assert.ok(updatedGrp.members.includes(member2));

  // Reload owner vault and check system notice message was appended
  const ownerVault = UserVaultManager.loadUserVault(owner)!;
  const sysMsg = ownerVault.messages.find(m => m.isGroup && m.toEmail === grp.id && m.content.includes('邀请了'));
  assert.ok(sysMsg);
  assert.ok(sysMsg.content.includes('群主糖糖'));
});

test('Drifting bottle throw, fish, and reply to author works', () => {
  const author = UserVaultManager.registerAccount('drift_author@cloudmail.com', '123', '海风小兔', '🐰', 'wx_sea_rabbit');
  const finder = UserVaultManager.registerAccount('drift_finder@cloudmail.com', '123', '海边拾贝', '🐚', 'wx_shell_collector');

  // Author throws a bottle
  const bottle = UserVaultManager.throwDriftingBottle(author, '今天海风好温柔，有人听到海浪的声音吗？');
  assert.ok(bottle.id);
  assert.equal(bottle.authorName, '海风小兔');
  assert.equal(bottle.authorWeChatId, 'wx_sea_rabbit');

  // Finder replies to the bottle
  const replied = UserVaultManager.replyDriftingBottle(bottle.id, finder, '我听到了！今天我也在看海~');
  assert.equal(replied.replies.length, 1);
  assert.equal(replied.replies[0].authorName, '海边拾贝');
  assert.equal(replied.replies[0].content, '我听到了！今天我也在看海~');
});

