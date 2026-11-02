# 🐼 Panda Chat (无后门·端到端加密·萌系 Serverless 即时通讯平台)

<p align="center">
  <img src="https://img.shields.io/badge/Security-AES--256--GCM%20%2B%20E2EE-emerald?style=flat-square" alt="E2EE Security" />
  <img src="https://img.shields.io/badge/Performance-WebAssembly%20Accelerated-blue?style=flat-square" alt="WASM Engine" />
  <img src="https://img.shields.io/badge/Deployment-Cloudflare%20Serverless-orange?style=flat-square" alt="Cloudflare Deploy" />
  <img src="https://img.shields.io/badge/UI%20Style-Pure%20White%20%26%20Cute%20Panda-slate?style=flat-square" alt="Cute Panda UI" />
</p>

---

## 🌟 项目简介

**Panda Chat** 是一款兼具**极高安全性、零后门校验、萌系纯白 UI 体验与端到端加密（E2EE）**的即时通讯与私有社交应用。底层重构彻底移除了任何后门逻辑，支持私有化部署，并可直接零成本一键部署于 Cloudflare Serverless 平台，无需购买昂贵服务器即可享有极致流畅的并发体验。

---

## 🔥 核心特性

### 1. 🛡️ 完全无后门与端到端加密（E2EE）
- **物理数据隔离**：经典老款微信体验，每个用户拥有独占的本地加密数据沙盒（Sandbox Vault），不同账户的聊天记录、好友列表及私人群组严格隔离不互串。
- **WebAssembly 算法加速**：集成 WebAssembly (WASM) 底层加密引擎与 WebCrypto 标准，实现零知识（Zero-Knowledge）消息加密广播。
- **隐私保护导向**：Chat ID 采用统一萌系 `pa_` 前缀，搜索添加好友需输入精准 Chat ID，取消全局推荐展示，最大程度保障用户个人隐私。

### 2. 📧 Cloud Mail 账号体系集成
- **独立账号体系**：支持通过集成的 Cloud Mail 邮箱（格式 `@cloudmail.com`）快速注册与登录。
- **独立邮箱收件箱**：内置 Panda 安全邮箱面板，可实时查收系统验证与重要安全通知。

### 3. 💬 丰富而可爱的聊天体验
- **单聊与私人群组**：支持自由发起新群聊、随时邀请通讯录好友进群，并配置群公告。
- **📍 GPS 实时定位卡片**：聊天框支持一键调用设备 GPS 测量实时坐标，或选择热门萌系地标快捷发送，渲染可视化微缩地图卡片。
- **Q 版可爱萌系表情与贴图**：内置丰富 Panda 表情包与快捷贴图。

### 4. 🍾 怀旧漂流瓶与朋友圈
- **经典漂流瓶**：捞瓶子后可直接给丢瓶人发送回复回信，互相加为好友。
- **朋友圈**：支持发表熊猫小动态、点赞与互动评论。

### 5. ⚡ Cloudflare 零成本极速部署
- 无需购买云服务器，原生兼容 Cloudflare Pages / Workers 及边缘 Node 运行环境，轻量无压力，抗高并发卡顿。

---

## 🛠️ 技术栈

- **前端框架**：React 19 + TypeScript + Vite 8
- **UI 样式**：Tailwind CSS (纯白简约萌系设计)
- **图标与动画**：Lucide React + Motion
- **加密引擎**：WebCrypto API + WebAssembly (WASM)
- **网络通信**：Zero-Knowledge Real-Time Relay Event Bus

---

## 🚀 快速本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在本地 `http://localhost:3000` 运行。

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出至 `dist/` 目录，可直接拖拽部署至 Cloudflare Pages 或任何静态 Serverless 托管服务。

---

## 📄 开源许可

Apache-2.0 License
