# NCMAutoDaily

网易云音乐自动打卡项目，自动完成每日签到、黑胶乐签、云贝签到和听歌打卡。

## 功能

- 每日签到
- 黑胶乐签
- 云贝签到
- 听歌打卡
- 二维码登录获取 Cookie

## 环境配置

在项目根目录创建 `.env` 文件，配置以下变量：

```
NETEASE_COOKIE=your_netease_cookie_here
AUTH_KEY=your_auth_key_here
PLAYLIST_ID=your_playlist_id_here
API_BASE_URL=your_api_base_url_here
PORT=3000
```

### 配置说明

- `NETEASE_COOKIE`：网易云音乐登录凭证（必填）
- `AUTH_KEY`：签到密钥，用于 API 访问验证（必填）
- `PLAYLIST_ID`：听歌打卡的歌单 ID（必填）
- `API_BASE_URL`：网易云音乐 API 基础地址（必填）
- `PORT`：服务器端口，默认 3000（可选）

## 安装和运行

### 安装依赖

```bash
pnpm install
```

### 运行项目

```bash
pnpm start
```

### 开发模式

```bash
pnpm dev
```

## 获取 Cookie

1. 访问 `http://localhost:3000/login`
2. 使用网易云音乐 App 扫描二维码登录
3. 复制显示的 `MUSIC_U` 值到 `.env` 文件

## API 接口

### 签到接口

```
GET /api/sign?key=AUTH_KEY
```

### 其他接口

- `GET /package-version` - 获取版本信息
- `POST /user/account` - 获取用户账号信息
- `GET /login/qr/key` - 获取二维码 key
- `GET /login/qr/create` - 生成二维码
- `GET /login/qr/check` - 检查二维码状态
- `GET /config/status` - 检查配置状态

## 部署

项目支持 Vercel 部署，根目录包含 `vercel.json` 配置文件。

## 许可证

AGPL-3.0-only