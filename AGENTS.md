# AGENTS.md — NCMAutoDaily

## Project summary
网易云音乐自动打卡 — Express.js 服务，通过代理外部 API 完成每日签到、黑胶乐签、云贝签到和听歌打卡。**支持多账号**，部署在 Vercel，也可本地运行。

## Developer commands
| 任务 | 命令 |
|---|---|
| 安装依赖 | `pnpm install` |
| 本地开发（热重载） | `pnpm dev`（nodemon） |
| 本地启动 | `pnpm start`（node index.js） |
| 文档开发 | `pnpm docs:dev`（VitePress，目录 `docs-source`） |

- 包管理器：**pnpm**（`packageManager: "pnpm@10.28.1"`）
- 无测试框架、无 linter、无 typecheck — 项目纯手动验证。

## Required environment variables
See `.env.example` for format.

### 多账号格式（推荐）
```
NETEASE_COOKIE_1=MUSIC_U=xxx;     PLAYLIST_ID_1=123
NETEASE_COOKIE_2=MUSIC_U=yyy;     PLAYLIST_ID_2=456
# 按需递增: _3, _4, _5...
AUTH_KEY=your-auth-key
API_BASE_URL=https://api.example.com
PORT=3000  # optional
```

### 单账号格式（兼容旧版）
```
NETEASE_COOKIE=MUSIC_U=xxx;
PLAYLIST_ID=123
```

**Gotcha:** `routes/sign.js` 和 `routes/api.js` 均有 fallback `API_BASE_URL = 'https://interface.163.focalors.ltd'`。未配置环境变量时会自动使用此第三方地址，但 README 要求必须显式配置。

## Architecture
```
index.js          ← Express 入口，挂载 routes 和 static public/
├── routes/api.js    — API 代理 + 多账号状态查询（/config/status, /user/account）
├── routes/sign.js   — 核心签到逻辑（GET /api/sign?key=AUTH_KEY），多账号并行
└── routes/login.js  — 二维码登录页面路由（GET /login）
public/           ← 前端页面
  ├── index.html     — 状态面板：多账号卡片展示 + 一键签到
  └── login.html     — 二维码登录：选择账号 → 扫码 → 显示对应环境变量名
```

- `module.exports = app` 在 `index.js` 末尾 — 支持 Vercel serverless 导入。
- `vercel.json` 将所有路由 `/(.*)` 转发到 `index.js`，使用 `@vercel/node` 构建。
- 前端页面通过 CDN 加载 axios（`fastly.jsdelivr.net`），无构建步骤。
- 多账号核心函数 `getAccounts()` 在 `sign.js` 和 `api.js` 中重复定义（扫描 `NETEASE_COOKIE_N` 环境变量），保持逻辑一致。

## Sign-in flow (`/api/sign`)
受 `AUTH_KEY` 保护，**对所有已配置账号并行执行**签到：
1. 获取用户账号信息（`/user/account`）
2. 每日签到（`/daily_signin`, `type: 1`）
3. 黑胶乐签（`/vip/sign`）
4. 云贝签到（`/yunbei/sign`）
5. 听歌打卡：取歌单前 100 首，逐首调用 `/scrobble`（`time: 61`）

每个步骤独立 try-catch，单个失败不阻断后续步骤。多账号使用 `Promise.allSettled` 并行执行。

## Vercel deployment
- 导入 GitHub 仓库到 Vercel，自动识别 `vercel.json`。
- 环境变量在 Vercel 项目设置中配置（非 `.env` 文件）。
- 定时打卡通过 cron-job.org 等外部服务每日访问 `/api/sign?key=...`。

## Notable conventions & quirks
- 无 CI、无 pre-commit、无代码格式化配置 — 代码风格随意。
- `docs-source/` 目录不存在于当前仓库，但 `package.json` 中有 VitePress 脚本。
- 二维码登录流程：`/login/qr/key` → `/login/qr/create` → 轮询 `/login/qr/check`（3s 间隔）。
- 状态码：800=过期, 801=已扫描, 802=已确认, 803=登录成功。
- `.env` 在 `.gitignore` 中，不提交。
