const express = require('express')
const router = express.Router()
const axios = require('axios')

const API_BASE_URL = process.env.API_BASE_URL || 'https://interface.163.focalors.ltd'

/**
 * 获取所有账号配置（与 sign.js 保持一致）
 */
function getAccounts() {
  const accounts = []
  let i = 1
  while (process.env[`NETEASE_COOKIE_${i}`]) {
    accounts.push({
      index: i,
      cookie: process.env[`NETEASE_COOKIE_${i}`],
      playlistId: process.env[`PLAYLIST_ID_${i}`] || null
    })
    i++
  }
  if (accounts.length === 0 && process.env.NETEASE_COOKIE) {
    accounts.push({
      index: 1,
      cookie: process.env.NETEASE_COOKIE,
      playlistId: process.env.PLAYLIST_ID || null
    })
  }
  return accounts
}

// 检查配置状态（支持多账号）
router.get('/config/status', (req, res) => {
  const accounts = getAccounts()
  const accountStatuses = accounts.map(acc => ({
    index: acc.index,
    cookieConfigured: !!acc.cookie,
    playlistConfigured: !!acc.playlistId
  }))

  const status = {
    apiBaseUrl: !!process.env.API_BASE_URL,
    authKey: !!process.env.AUTH_KEY,
    totalAccounts: accounts.length,
    accounts: accountStatuses
  }
  res.json(status)
})

// 获取所有账号信息（支持多账号）
router.post('/user/account', async (req, res) => {
  const accounts = getAccounts()
  if (accounts.length === 0) {
    return res.status(400).json({ code: -1, message: '未配置任何账号' })
  }

  // 如果指定了账号索引，只返回该账号
  const { index } = req.body
  if (index) {
    const account = accounts.find(a => a.index === Number(index))
    if (!account) {
      return res.status(400).json({ code: -1, message: `账号${index}不存在` })
    }
    try {
      const response = await axios({
        url: `${API_BASE_URL}/user/account`,
        method: 'post',
        data: { cookie: account.cookie }
      })
      return res.json({ ...response.data, accountIndex: account.index })
    } catch (error) {
      return res.status(500).json({ code: -1, message: error.message, accountIndex: account.index })
    }
  }

  // 未指定索引，返回所有账号信息
  const results = await Promise.allSettled(
    accounts.map(async (account) => {
      const response = await axios({
        url: `${API_BASE_URL}/user/account`,
        method: 'post',
        data: { cookie: account.cookie }
      })
      return { ...response.data, accountIndex: account.index }
    })
  )

  const accountsInfo = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    return { code: -1, error: r.reason?.message || '获取失败', accountIndex: accounts[i].index }
  })

  res.json(accountsInfo)
})

// 获取包版本
router.get('/package-version', (req, res) => {
  const packageJson = require('../package.json')
  res.json({ version: packageJson.version })
})

// 二维码登录 - 获取 key
router.get('/login/qr/key', async (req, res) => {
  try {
    const response = await axios({
      url: `${API_BASE_URL}/login/qr/key`,
      method: 'get',
      params: {
        timestamp: req.query.timestamp || Date.now()
      }
    })
    res.json(response.data)
  } catch (error) {
    console.error('获取二维码key失败:', error.message)
    res.status(500).json({ code: -1, message: error.message })
  }
})

// 二维码登录 - 生成二维码
router.get('/login/qr/create', async (req, res) => {
  try {
    const { key, qrimg = 'true' } = req.query
    const response = await axios({
      url: `${API_BASE_URL}/login/qr/create`,
      method: 'get',
      params: {
        key,
        qrimg: qrimg === 'true',
        timestamp: req.query.timestamp || Date.now()
      }
    })
    res.json(response.data)
  } catch (error) {
    console.error('创建二维码失败:', error.message)
    res.status(500).json({ code: -1, message: error.message })
  }
})

// 二维码登录 - 检查状态
router.get('/login/qr/check', async (req, res) => {
  try {
    const { key, noCookie = 'false' } = req.query
    const response = await axios({
      url: `${API_BASE_URL}/login/qr/check`,
      method: 'get',
      params: {
        key,
        noCookie: noCookie === 'true',
        timestamp: req.query.timestamp || Date.now()
      }
    })
    res.json(response.data)
  } catch (error) {
    console.error('检查二维码状态失败:', error.message)
    res.status(500).json({ code: -1, message: error.message })
  }
})

module.exports = router