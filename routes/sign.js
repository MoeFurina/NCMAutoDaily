const express = require('express')
const router = express.Router()
const axios = require('axios')

const API_BASE_URL = process.env.API_BASE_URL

/**
 * 收集所有账号配置
 * 环境变量格式: NETEASE_COOKIE_1, NETEASE_COOKIE_2... / PLAYLIST_ID_1, PLAYLIST_ID_2...
 * 兼容旧格式: NETEASE_COOKIE (单账号)
 */
function getAccounts() {
  const accounts = []

  // 优先读取编号格式 (NETEASE_COOKIE_1, NETEASE_COOKIE_2...)
  let i = 1
  while (process.env[`NETEASE_COOKIE_${i}`]) {
    accounts.push({
      index: i,
      cookie: process.env[`NETEASE_COOKIE_${i}`],
      playlistId: process.env[`PLAYLIST_ID_${i}`] || null,
      name: `账号${i}`
    })
    i++
  }

  // 兼容旧版单账号格式
  if (accounts.length === 0 && process.env.NETEASE_COOKIE) {
    accounts.push({
      index: 1,
      cookie: process.env.NETEASE_COOKIE,
      playlistId: process.env.PLAYLIST_ID || null,
      name: '主账号'
    })
  }

  return accounts
}

/**
 * 执行单个账号的完整签到流程
 */
async function signOneAccount(account) {
  const { cookie, playlistId, name } = account
  const results = {
    daily_signin: null,
    vip_sign: null,
    scrobble: null,
    yunbei_sign: null,
    account: null
  }

  // 1. 获取账号信息
  try {
    const response = await axios({
      url: `${API_BASE_URL}/user/account`,
      method: 'post',
      data: { cookie }
    })
    results.account = response.data
    // 如果有昵称则更新账号名
    if (response.data.profile?.nickname) {
      account.displayName = response.data.profile.nickname
    }
  } catch (error) {
    console.error(`[${name}] 获取账号信息失败:`, error.message)
    results.account = { error: error.message }
  }

  // 2. 每日签到
  try {
    const response = await axios({
      url: `${API_BASE_URL}/daily_signin`,
      method: 'post',
      data: { type: 1, cookie }
    })
    results.daily_signin = response.data
  } catch (error) {
    console.error(`[${name}] 每日签到失败:`, error.message)
    results.daily_signin = { error: error.message }
  }

  // 3. 黑胶乐签
  try {
    const response = await axios({
      url: `${API_BASE_URL}/vip/sign`,
      method: 'post',
      data: { cookie }
    })
    results.vip_sign = response.data
  } catch (error) {
    console.error(`[${name}] 黑胶乐签失败:`, error.message)
    results.vip_sign = { error: error.message }
  }

  // 4. 云贝签到
  try {
    const response = await axios({
      url: `${API_BASE_URL}/yunbei/sign`,
      method: 'post',
      data: { cookie }
    })
    results.yunbei_sign = response.data
  } catch (error) {
    console.error(`[${name}] 云贝签到失败:`, error.message)
    results.yunbei_sign = { error: error.message }
  }

  // 5. 听歌打卡
  if (playlistId) {
    try {
      const response = await axios({
        url: `${API_BASE_URL}/playlist/detail`,
        method: 'get',
        params: { id: playlistId, cookie }
      })
      const trackIds = response.data.playlist.trackIds.slice(0, 100).map(t => t.id)

      for (const trackId of trackIds) {
        try {
          await axios({
            url: `${API_BASE_URL}/scrobble`,
            method: 'post',
            data: {
              id: trackId,
              sourceid: playlistId,
              time: 61,
              cookie
            }
          })
        } catch (error) {
          console.error(`[${name}] 听歌打卡失败 (歌曲ID: ${trackId}):`, error.message)
        }
      }
      results.scrobble = { success: true, count: trackIds.length }
    } catch (error) {
      console.error(`[${name}] 听歌打卡失败:`, error.message)
      results.scrobble = { error: error.message }
    }
  } else {
    results.scrobble = { skipped: true, reason: '未配置歌单ID' }
  }

  return { name: account.displayName || name, results }
}

router.get('/', async (req, res) => {
  try {
    const { key } = req.query
    const authKey = process.env.AUTH_KEY || 'your_default_auth_key'

    if (key !== authKey) {
      return res.status(401).json({ success: false, message: '认证失败：密钥无效' })
    }

    const accounts = getAccounts()
    if (accounts.length === 0) {
      return res.status(400).json({ success: false, message: '错误：未配置任何账号' })
    }

    console.log(`开始签到，共 ${accounts.length} 个账号`)

    // 并行执行所有账号签到
    const signPromises = accounts.map(account => signOneAccount(account))
    const signResults = await Promise.allSettled(signPromises)

    // 整理结果
    const results = {}
    let successCount = 0
    let failCount = 0

    signResults.forEach((result, index) => {
      const accountName = accounts[index].displayName || accounts[index].name
      if (result.status === 'fulfilled') {
        results[accountName] = result.value.results
        successCount++
      } else {
        results[accountName] = { error: result.reason?.message || '未知错误' }
        failCount++
      }
    })

    res.json({
      success: true,
      message: `签到完成 (${successCount}成功/${failCount}失败)`,
      totalAccounts: accounts.length,
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('签到过程发生错误:', error)
    res.status(500).json({
      success: false,
      message: '签到失败',
      error: error.message
    })
  }
})

module.exports = router