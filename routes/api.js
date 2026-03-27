const express = require('express')
const router = express.Router()
const axios = require('axios')

const API_BASE_URL = process.env.API_BASE_URL || 'https://interface.163.focalors.ltd'

// 检查配置状态
router.get('/config/status', (req, res) => {
  const status = {
    apiBaseUrl: !!process.env.API_BASE_URL,
    neteaseCookie: !!process.env.NETEASE_COOKIE,
    authKey: !!process.env.AUTH_KEY,
    playlistId: !!process.env.PLAYLIST_ID
  }
  res.json(status)
})

// 获取包版本
router.get('/package-version', (req, res) => {
  const packageJson = require('../package.json')
  res.json({ version: packageJson.version })
})

// 获取用户账号信息
router.post('/user/account', async (req, res) => {
  try {
    const cookie = process.env.NETEASE_COOKIE
    if (!cookie) {
      return res.status(400).json({ code: -1, message: '未配置 NETEASE_COOKIE' })
    }
    const response = await axios({
      url: `${API_BASE_URL}/user/account`,
      method: 'post',
      data: { cookie }
    })
    res.json(response.data)
  } catch (error) {
    console.error('获取用户信息失败:', error.message)
    res.status(500).json({ code: -1, message: error.message })
  }
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