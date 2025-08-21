<template>
  <view class="login-page">
    <!-- 头部 -->
    <view class="login-header">
      <text class="login-title">手机号快捷登录</text>
      
      <!-- 登录类型切换 -->
      <view class="login-type-switch">
        <view 
          class="type-option" 
          :class="{ active: loginType === 'user' }"
          @click="switchLoginType('user')"
        >
          <text class="type-text">用户登录</text>
        </view>
        <view 
          class="type-option" 
          :class="{ active: loginType === 'counselor' }"
          @click="switchLoginType('counselor')"
        >
          <text class="type-text">咨询师登录</text>
        </view>
      </view>
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
        {{ loginType === 'user' ? '用户登录' : '咨询师登录' }}
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
import { userAPI,BASE_URL } from '@/utils/api.js'

// 登录类型
const loginType = ref('user') // 'user' 或 'counselor'

// 表单数据
const phoneNumber = ref('')
const verificationCode = ref('')
const termsAccepted = ref(false)
const countdown = ref(0)

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



// 切换登录类型
function switchLoginType(type) {
  loginType.value = type
  // 清空表单数据
  phoneNumber.value = ''
  verificationCode.value = ''
}

// 切换协议同意状态
function toggleTerms() {
  termsAccepted.value = !termsAccepted.value
}

// 先逛一逛功能 - 跳转到首页
function goBrowse() {
  uni.reLaunch({
    url: '/pages/index/index'
  })
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

  // 模拟发送验证码（临时使用固定验证码123456）
  uni.showModal({
    title: '验证码发送成功',
    content: '由于验证码服务还在开发中，请使用固定验证码：123456',
    showCancel: false,
    confirmText: '我知道了'
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
  if (!verificationCode.value || verificationCode.value.length < 1) {
    uni.showToast({
      title: '请输入验证码',
      icon: 'none',
      duration: 1500
    })
    return
  }

  // 调用登录API
  performLogin()
}

// 执行登录请求
async function performLogin() {
  uni.showLoading({
    title: '登录中...'
  })

  try {
    // 临时验证码验证（验证码API还没准备好，先使用固定验证码123456）
    if (verificationCode.value !== '123456') {
      uni.hideLoading()
      uni.showToast({
        title: '验证码错误，请输入123456',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    // 调用真实登录API
    const response = await userAPI.login(
      phoneNumber.value, 
      verificationCode.value, 
      loginType.value === 'counselor' ? 'CONSULTANT' : 'USER'
    )
    
    uni.hideLoading()
    
    // 处理登录成功 - 后端直接返回token
    if (response && (typeof response === 'string')) {
      // 如果返回的是字符串，说明整个响应就是token
      const token = response
      // 保存token
      uni.setStorageSync('token', token)
      
      const userInfo = {
        phone: phoneNumber.value,
        nickname: '',
        avatar: `${BASE_URL}/static/user/avatars/default.jpg`,
        loginTime: new Date().toISOString(),
        userType: loginType.value,
        token: token
      }
      
      uni.setStorageSync('userInfo', userInfo)
      uni.setStorageSync('loginTime', Date.now().toString())

      uni.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      })
      
      // 延迟后跳转到相应页面
      setTimeout(() => {
        uni.showToast({
          title: '欢迎回来！',
          icon: 'success',
          duration: 1500
        })
        
        setTimeout(() => {
          // 根据登录类型跳转到不同页面
          if (loginType.value === 'counselor') {
            console.log('尝试跳转到咨询师页面')
            uni.navigateTo({
              url: '/pages/counselor/appointments',
              success: () => {
                console.log('成功跳转到咨询师预约页面')
              },
              fail: (err) => {
                console.error('跳转失败:', err)
                uni.showToast({
                  title: '页面跳转失败，请稍后重试',
                  icon: 'none',
                  duration: 2000
                })
                // 降级处理，跳转到首页
                setTimeout(() => {
                  uni.reLaunch({
                    url: '/pages/index/index'
                  })
                }, 2000)
              }
            })
          } else {
            // 用户登录后直接跳转到个人信息页面完善资料
            uni.reLaunch({
              url: '/pages/profile/profile'
            })
          }
        }, 1500)
      }, 1500)
    } else {
      // 登录失败 - 没有返回token
      console.log('登录失败，服务器响应:', response)
      uni.showToast({
        title: '登录失败，请检查手机号和验证码',
        icon: 'none',
        duration: 2000
      })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('登录失败:', error)
    
    // 处理不同类型的错误
    let errorMessage = '网络连接失败，请检查网络后重试'
    
    if (error.statusCode === 401) {
      errorMessage = '验证码错误或已过期'
    } else if (error.statusCode === 400) {
      errorMessage = '请求参数错误，请检查手机号和验证码'
    } else if (error.statusCode === 404) {
      errorMessage = '用户不存在，请先注册'
    } else if (error.data && error.data.message) {
      errorMessage = error.data.message
    }
    
    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    })
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ecb198 0%, #e2beeb 50%, #b5d9ee 100%);
}

.login-header {
  display: flex;
  flex-direction: column;
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
  margin-bottom: 24rpx;
}

.login-type-switch {
  display: flex;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 4rpx;
  width: 400rpx;
}

.type-option {
  flex: 1;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  transition: all 0.3s ease;
  cursor: pointer;
}

.type-option.active {
  background: #ec407a;
  box-shadow: 0 2rpx 8rpx rgba(236, 64, 122, 0.3);
}

.type-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #666;
  transition: color 0.3s ease;
}

.type-option.active .type-text {
  color: #fff;
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
