<template>
  <view class="login-page">
    <!-- 全局加载遮罩 -->
    <view v-if="isPageLoading" class="global-loading-mask">
      <view class="loading-progress-bar-info">
        <text class="loading-progress-text">{{ Math.round(progressBarWidth) }}%</text>
      </view>
      <view class="loading-progress-bar-wrap-bottom">
        <view class="loading-progress-bar" :style="{ width: progressBarWidth + '%' }"></view>
      </view>
      <image class="loading-logo" src="/static/logo.png" mode="aspectFit" />
      <text class="loading-title">好朋友心理</text>
      <view class="loading-spinner">
        <view class="dot"></view>
        <view class="dot"></view>
        <view class="dot"></view>
      </view>
      <text class="loading-text">{{ loadingText }}</text>
    </view>

    <!-- 头部 -->
    <view class="login-header">
      <text class="login-title">手机号快捷登录</text>
    </view>

    <!-- Logo区域 -->
    <view class="logo-section">
      <view class="logo-container">
        <image class="app-logo" src="/static/logo.png" />
        <text class="app-name">好朋友心理</text>
        <text class="welcome-text">欢迎登录，开启心理健康之旅</text>
      </view>
    </view>

    <!-- 登录表单 -->
    <view class="form-section">
      <!-- 手机号输入 -->
      <view class="input-group">
        <view class="input-label">手机号</view>
        <input 
          v-model="phoneNumber" 
          placeholder="请输入手机号" 
          type="number" 
          maxlength="11"
          class="form-input"
        />
      </view>

      <!-- 验证码输入 -->
      <view class="input-group">
        <view class="input-label">验证码</view>
        <view class="verification-container">
          <input 
            v-model="verificationCode" 
            placeholder="请输入验证码" 
            type="number" 
            maxlength="6"
            class="form-input code-input"
          />
          <button 
            class="send-code-btn" 
            :class="{ 'btn-ready': canSendCode && countdown === 0, 'btn-disabled': !canSendCode || countdown > 0 }"
            @click="sendVerificationCode"
            :disabled="countdown > 0"
          >
            {{ getCodeButtonText }}
          </button>
        </view>
      </view>

      <!-- 用户协议 -->
      <view class="agreement-section">
        <view class="agreement-container" @click="toggleTerms">
          <checkbox :checked="termsAccepted" class="agreement-checkbox" />
          <text class="agreement-text">
            我已阅读并同意
            <text class="link-text">《用户协议》</text>
            和
            <text class="link-text">《隐私政策》</text>
          </text>
        </view>
      </view>

      <!-- 登录按钮 -->
      <button class="login-btn" @click="handleLogin">
        立即登录
      </button>

      <!-- 其他登录方式 -->
      <view class="other-login">
        <view class="divider">
          <text class="divider-text">其他登录方式</text>
        </view>
        <view class="login-methods">
          <button class="method-btn" @click="goBrowse">
            <text class="method-text">先逛一逛</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 表单数据
const phoneNumber = ref('')
const verificationCode = ref('')
const termsAccepted = ref(false)
const countdown = ref(0)

// 进度条相关
const isPageLoading = ref(false)
const progressBarWidth = ref(0)
const loadingText = ref('加载中...')

// 进度条定时器
let progressTimer = null

// 计算属性：是否可以发送验证码
const canSendCode = computed(() => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phoneNumber.value) && termsAccepted.value
})

// 计算属性：验证码按钮文字
const getCodeButtonText = computed(() => {
  if (countdown.value > 0) {
    return `${countdown.value}s后重发`
  }
  
  const phoneRegex = /^1[3-9]\d{9}$/
  
  if (!phoneNumber.value) {
    return '请输入手机号'
  }
  
  if (!phoneRegex.test(phoneNumber.value)) {
    return '手机号格式错误'
  }
  
  if (!termsAccepted.value) {
    return '请同意协议'
  }
  
  return '获取验证码'
})

// 先逛一逛，跳转到首页
function goBrowse() {
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

// 切换协议同意状态
function toggleTerms() {
  termsAccepted.value = !termsAccepted.value
}

// 封装全局 loading 动画启动
function showLoadingWithProgress(duration = 500, text = '加载中...') {
  isPageLoading.value = true
  progressBarWidth.value = 0
  loadingText.value = text
  if (progressTimer) clearInterval(progressTimer)
  setTimeout(() => {
    let start = Date.now()
    progressTimer = setInterval(() => {
      const elapsed = Date.now() - start
      let percent = Math.min(100, (elapsed / duration) * 100)
      progressBarWidth.value = percent
      if (percent >= 100) {
        clearInterval(progressTimer)
        isPageLoading.value = false
      }
    }, 16)
  }, 30)
}

// 发送验证码
async function sendVerificationCode() {
  // 检查是否在倒计时中
  if (countdown.value > 0) {
    uni.showModal({
      title: '验证码发送限制',
      content: `验证码已发送，请等待 ${countdown.value} 秒后再次获取`,
      showCancel: false,
      confirmText: '我知道了'
    })
    return
  }

  const phoneRegex = /^1[3-9]\d{9}$/
  
  // 检查手机号格式
  if (!phoneNumber.value) {
    uni.showModal({
      title: '无法发送验证码',
      content: '请先输入手机号码',
      showCancel: false,
      confirmText: '我知道了'
    })
    return
  }
  
  if (!phoneRegex.test(phoneNumber.value)) {
    uni.showModal({
      title: '手机号格式错误',
      content: '请输入正确的11位手机号码\n（支持移动、联通、电信号段）',
      showCancel: false,
      confirmText: '我知道了'
    })
    return
  }

  // 检查用户协议
  if (!termsAccepted.value) {
    uni.showModal({
      title: '需要同意协议',
      content: '发送验证码前，请先阅读并同意《用户协议》和《隐私政策》',
      showCancel: false,
      confirmText: '我知道了'
    })
    return
  }

  // 模拟发送验证码，固定为123456
  uni.showToast({
    title: '验证码：123456',
    icon: 'success',
    duration: 3000
  })
  
  // 开始60秒倒计时
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 处理登录
function handleLogin() {
  // 检查协议是否同意
  if (!termsAccepted.value) {
    uni.showToast({
      title: '请先同意用户协议和隐私政策',
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 检查手机号
  if (!canSendCode.value) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none',
      duration: 1500
    })
    return
  }

  // 检查验证码
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    uni.showToast({
      title: '请输入6位验证码',
      icon: 'none',
      duration: 1500
    })
    return
  }

  // 验证固定验证码123456
  if (verificationCode.value !== '123456') {
    uni.showToast({
      title: '验证码错误qwq,请输入123456',
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 调用登录API
  performLogin()
}

// 执行登录请求
async function performLogin() {
  showLoadingWithProgress(1500, '登录中...')

  // 模拟登录成功
  setTimeout(() => {
    // 获取现有用户信息（如果有的话）
    const existingUserInfo = uni.getStorageSync('userInfo') || {}
    
    // 生成登录时间标识，用于测评数据清零
    const loginTime = Date.now().toString()
    
    // 模拟保存基础登录信息
    const mockToken = 'mock_token_' + Date.now()
    const mockUserInfo = {
      ...existingUserInfo,  // 保留已有信息
      phone: phoneNumber.value,
      nickname: existingUserInfo.nickname || '用户' + phoneNumber.value.slice(-4),
      loginTime: new Date().toISOString()
    }
    
    uni.setStorageSync('token', mockToken)
    uni.setStorageSync('userInfo', mockUserInfo)
    uni.setStorageSync('loginTime', loginTime) // 设置登录时间标识

    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500
    })
    
    // 延迟后跳转到个人主页
    setTimeout(() => {
      uni.showToast({
        title: '欢迎回来！',
        icon: 'success',
        duration: 1500
      })
      
      setTimeout(() => {
        // 登录成功后直接跳转到个人主页
        uni.reLaunch({
          url: '/pages/profile/profile'
        })
      }, 1500)
    }, 1500)
  }, 1000) // 模拟网络延迟
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ecb198 0%, #e2beeb 50%, #b5d9ee 100%);
}

/* 全局加载遮罩样式 */
.global-loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8f5e8 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-progress-bar-info {
  margin-bottom: 40rpx;
}

.loading-progress-text {
  font-size: 48rpx;
  font-weight: bold;
  background: linear-gradient(135deg, #ec407a, #ab47bc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.loading-progress-bar-wrap-bottom {
  width: 400rpx;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 80rpx;
}

.loading-progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #ec407a, #ab47bc);
  border-radius: 4rpx;
  transition: width 0.1s ease;
}

.loading-logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 32rpx;
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba(236, 64, 122, 0.3);
}

.loading-title {
  font-size: 48rpx;
  font-weight: 900;
  background: linear-gradient(135deg, #ec407a, #ab47bc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 48rpx;
}

.loading-spinner {
  display: flex;
  gap: 8rpx;
  margin-bottom: 24rpx;
}

.loading-spinner .dot {
  width: 12rpx;
  height: 12rpx;
  background: #ec407a;
  border-radius: 50%;
  animation: loading-bounce 1.4s ease-in-out infinite both;
}

.loading-spinner .dot:nth-child(1) { animation-delay: -0.32s; }
.loading-spinner .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes loading-bounce {
  0%, 80%, 100% { 
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% { 
    transform: scale(1.2);
    opacity: 1;
  }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 44rpx 32rpx 32rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
}

.login-title {
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
}

.logo-section {
  padding: 80rpx 0 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-container {
  text-align: center;
}

.app-logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 20rpx;
  margin-bottom: 32rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.welcome-text {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.form-section {
  padding: 0 48rpx;
}

.input-group {
  margin-bottom: 40rpx;
}

.input-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  height: 96rpx;
  padding: 0 32rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  font-size: 32rpx;
  background: #fff;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #42a5f5;
  outline: none;
}

.verification-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  height: 96rpx;
  padding: 0 32rpx;
  background: #9e9e9e;
  color: #fff;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  white-space: nowrap;
  min-width: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding-top: 4rpx;
  transition: all 0.3s ease;
}

.send-code-btn.btn-ready {
  background: linear-gradient(90deg, #1ba7d0, #4bc3b2);
  cursor: pointer;
}

.send-code-btn.btn-ready:active {
  background: linear-gradient(90deg, #4bc3b2, #1ba7d0);
  transform: scale(0.98);
}

.send-code-btn.btn-disabled {
  background: #9e9e9e;
  color: #fff;
  cursor: not-allowed;
  opacity: 0.6;
}

.send-code-btn:disabled {
  background: linear-gradient(90deg, #1ba7d0, #4bc3b2);
  color: #fff;
  cursor: not-allowed;
  opacity: 0.6;
}

.agreement-section {
  margin-bottom: 100rpx;
  margin-top: 60rpx;
}

.agreement-container {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.agreement-checkbox {
  margin-top: 8rpx;
}

.agreement-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  flex: 1;
  margin-top: 15rpx;
}

.link-text {
  color: #42a5f5;
}

.login-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(90deg, #1ba7d0, #4bc3b2);
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 48rpx;
  border: none;
  margin-bottom: 60rpx;
  box-shadow: 0 8rpx 24rpx rgba(27, 167, 208, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding-top: 4rpx;
}

.login-btn:active {
  background: linear-gradient(90deg, #4bc3b2, #1ba7d0);
}

.other-login {
  text-align: center;
}

.divider {
  position: relative;
  margin-bottom: 40rpx;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1rpx;
  background: #e0e0e0;
}

.divider-text {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fce4ec 100%);
  color: #999;
  font-size: 24rpx;
  padding: 0 32rpx;
  position: relative;
  z-index: 1;
}

.login-methods {
  display: flex;
  justify-content: center;
}

.method-btn {
  padding: 16rpx 48rpx;
  background: transparent;
  border: 2rpx solid #e0e0e0;
  border-radius: 48rpx;
  color: #666;
  font-size: 28rpx;
}

.method-btn:active {
  background: #f5f5f5;
}

.method-text {
  color: #666;
}
</style>
