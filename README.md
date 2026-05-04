# NCMAutoDaily

网易云音乐自动打卡项目，**支持多账号**，自动完成每日签到、黑胶乐签、云贝签到和听歌打卡。

## 功能

- 多账号同时打卡
- 每日签到
- 黑胶乐签
- 云贝签到
- 听歌打卡
- 二维码登录获取 Cookie

## 快速上手

1. fork 本项目到你的 GitHub 账号。
2. 登录 Vercel，连接你的 GitHub 账号，并导入这个项目。
3. 在 Vercel 项目的环境变量设置中添加以下变量：

### 基础配置（必填）

| 变量 | 说明 |
|---|---|
| `AUTH_KEY` | 任意密码，访问签到接口时校验 |
| `API_BASE_URL` | 接口基础 URL，需部署 [NeteaseCloudMusicApiEnhanced](https://github.com/neteasecloudmusicapienhanced/api-enhanced) |
| `PORT` | 可选，默认 `3000` |

### 多账号配置

使用编号格式添加多个账号，按需递增：

```env
# 账号 1
NETEASE_COOKIE_1=MUSIC_U=xxx;
PLAYLIST_ID_1=123456

# 账号 2
NETEASE_COOKIE_2=MUSIC_U=yyy;
PLAYLIST_ID_2=789012

# 账号 3、4、5... 继续添加即可
NETEASE_COOKIE_3=MUSIC_U=zzz;
PLAYLIST_ID_3=111222
```

> **注意**：如果只使用 `NETEASE_COOKIE`（无编号），项目仍可正常运行单账号模式。

4. 部署项目, 添加域名到 Vercel 项目中。访问 `https://your-domain.com/api/sign?key=你在环境变量配置的AUTH_KEY` 可以触发所有账号打卡。
5. 登录 [cron-job.org](https://cron-job.org/) 或其他定时任务服务，设置每天访问上述签到 URL 来实现自动打卡。

## 获取 Cookie

部署后访问 `https://your-domain.com/login`，使用网易云音乐 App 扫码登录即可获取 Cookie，页面会提示你应添加到哪个环境变量。

## 许可证

AGPL-3.0-only
