# NCMAutoDaily

网易云音乐自动打卡项目，自动完成每日签到、黑胶乐签、云贝签到和听歌打卡。

## 功能

- 每日签到
- 黑胶乐签
- 云贝签到
- 听歌打卡
- 二维码登录获取 Cookie

## 快速上手

1. fork 本项目到你的 GitHub 账号。
2. 登录 Vercel，连接你的 GitHub 账号，并导入这个项目。
3. 在 Vercel 项目的环境变量设置中添加以下变量：
- `NETEASE_COOKIE`：你的网易云音乐 Cookie, 以`MUSIC_U=`开头以`;`结尾。
- `AUTH_KEY`：任意密码。
- `PLAYLIST_ID`：可选，听歌打卡的歌单 ID。
- `API_BASE_URL`：必填，访问接口的基础 URL, 需要部署[NeteaseCloudMusicApiEnhanced](https://github.com/neteasecloudmusicapienhanced/api-enhanced)。
4. 部署项目, 添加域名到 Vercel 项目中。访问 `https://your-domain.com/daily?key=你在环境变量配置的密码` 可以触发打卡。
5. 登录[cron-job.org](https://cron-job.org/)或其他定时任务服务，设置每天访问 `https://your-domain.com/daily?key=你在环境变量配置的密码` 来实现自动打卡。

## 许可证

AGPL-3.0-only