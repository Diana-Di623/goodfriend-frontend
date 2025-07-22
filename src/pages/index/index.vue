<template>
  <view class="min-h-screen bg-gradient">
    <!-- 顶部导航区 -->
    <view class="header">
      <view class="slogan">{{ slogans[currentSlogan] }}</view>
      <view class="avatar-group" @click="goProfile">
        <image class="avatar-img" src="/static/logo.png" />
        <view v-if="isLoggedIn && currentUserInfo.nickname" class="user-info">
          <text class="user-nickname">{{ currentUserInfo.nickname }}</text>
        </view>
      </view>
    </view>

    <view class="main-content">
      <!-- 专业团队区域 -->
      <view class="section">
        <view class="section-title">
          <text class="icon-heart"></text>
          <text>专业团队</text>
          <text class="badge">认证心理咨询师在线支持</text>
        </view>
        <view class="counselor-scroll">
          <view class="counselor-container">
            <view v-for="(counselor, idx) in visibleCounselors" :key="idx" class="counselor-card" @click="handleCounselorClick(counselor)">
              <image class="counselor-avatar" :src="counselor.avatar" />
              <view class="counselor-info">
                <view class="counselor-name">{{ counselor.name }} <text class="level">{{ counselor.level }}</text></view>
                <view class="counselor-meta">
                  <text class="specialty">{{ counselor.specialty }}</text>
                  <text class="meta-item">{{ counselor.gender }}</text>
                  <text class="meta-item">{{ counselor.location }}</text>
                  <text class="meta-item">⭐{{ counselor.rating }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 心理测评卡片 -->
      <view class="test-card" @click="handleTestClick">
        <view class="test-title">专业心理测评</view>
        <view class="test-desc">5分钟快速了解你的心理状态</view>
        <view class="test-footer">
          <text>已累计帮助10,000+用户</text>
          <button class="test-btn">开始测试</button>
        </view>
      </view>

      <!-- 心理推文板块 -->
      <view class="section">
        <view class="section-title">
          <text class="icon-message"></text>
          <text>心理推文</text>
        </view>
        <scroll-view scroll-x class="article-list">
          <view v-for="(article, idx) in articles" :key="idx" class="article-card" @click="handleArticleClick(article)">
            <view class="article-title">{{ article }}</view>
            <view class="article-desc">点击阅读全文</view>
          </view>
        </scroll-view>
      </view>

      <!-- 心愿心语区域 -->
      <view class="wish-card">
        <view class="wish-header">
          <text class="icon-heart"></text>
          <text>心愿心语</text>
          <view v-if="unreadMessageCount > 0" class="message-badge">
            {{ unreadMessageCount > 99 ? '99+' : unreadMessageCount }}
          </view>
        </view>
        <view class="wish-desc">在这里分享你的心情，倾听他人的故事</view>
        <button class="wish-btn" @click="handleWishClick">写下/查看心愿</button>
      </view>
    </view>

    <!-- 下拉刷新提示 -->
    <view class="refresh-tip" :class="{ show: isRefreshing }">
      <text class="icon-refresh"></text>
      有什么麻烦都可以跟好朋友说哟
    </view>

    <!-- 刷新按钮 -->
    <button class="refresh-btn" @click="handleRefresh">
      <text class="icon-refresh"></text>
    </button>

    <!-- 登录弹窗 -->
    <view v-if="showLoginModal" class="login-modal">
      <view class="login-overlay" @click="closeLogin"></view>
      <view class="login-content">
        <!-- 头部 -->
        <view class="login-header">
          <text class="login-title">会员登录</text>
        </view>

        <!-- Logo区域 -->
        <view class="logo-section">
          <view class="logo-container">
            <image class="app-logo" src="/static/logo.png" />
            <text class="app-name">好朋友心理</text>
          </view>
        </view>

        <!-- 底部操作区 -->
        <view class="login-bottom">
          <!-- 用户协议 -->
          <view class="terms-section" @click="toggleTerms">
            <checkbox :checked="termsAccepted" class="terms-checkbox" />
            <text class="terms-text">我同意好朋友心理服务条款与隐私政策</text>
          </view>

          <!-- 登录按钮 -->
          <button class="login-btn" @click="goToLoginPage">
            手机号快捷登录
          </button>

          <!-- 先逛一逛 -->
          <button class="browse-btn" @click="handleBrowse">
            先逛一逛
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const currentSlogan = ref(0)
const hasNewMessage = ref(true)
const unreadMessageCount = ref(15) // 未读消息数量
const isRefreshing = ref(false)
const scrollTop = ref(0) // 竖向滚动位置
const currentPage = ref(0) // 当前页
const showLoginModal = ref(true) // 显示登录弹窗（进入页面立即显示）
const termsAccepted = ref(false) // 用户协议同意状态
const isLoggedIn = ref(false) // 用户登录状态
const counselorIndex = ref(0) // 当前显示的咨询师起始索引
const currentUserInfo = ref({}) // 当前用户信息

const slogans = [
  '每个情绪都值得被倾听',
  `你今天的心理电量是多少呀？`,
  '专业团队24小时守护'
]

const counselors = [
  {
    name: '牢陈头',
    level: '低级咨询师',
    specialty: '焦虑抑郁',
    gender: '男',
    location: '连州',
    rating: 0.1,
    avatar: '/static/logo.png'
  },
  {
    name: '王明轩',
    level: '资深咨询师',
    specialty: '情感关系',
    gender: '男',
    location: '上海',
    rating: 4.8,
    avatar: '/static/logo.png'
  },
  {
    name: '张雨萌',
    level: '专家咨询师',
    specialty: '青少年心理',
    gender: '女',
    location: '广州',
    rating: 5.0,
    avatar: '/static/logo.png'
  },
  {
    name: '李心怡',
    level: '高级咨询师',
    specialty: '家庭治疗',
    gender: '女',
    location: '北京',
    rating: 4.9,
    avatar: '/static/logo.png'
  },
  {
    name: '陈志强',
    level: '资深咨询师',
    specialty: '职场压力',
    gender: '男',
    location: '深圳',
    rating: 4.7,
    avatar: '/static/logo.png'
  },
  {
    name: '赵美丽',
    level: '专家咨询师',
    specialty: '情绪管理',
    gender: '女',
    location: '杭州',
    rating: 4.8,
    avatar: '/static/logo.png'
  },
  {
    name: '刘建国',
    level: '高级咨询师',
    specialty: '婚姻咨询',
    gender: '男',
    location: '成都',
    rating: 4.6,
    avatar: '/static/logo.png'
  },
  {
    name: '周小雅',
    level: '资深咨询师',
    specialty: '创伤治疗',
    gender: '女',
    location: '武汉',
    rating: 4.9,
    avatar: '/static/logo.png'
  },
  {
    name: '马天宇',
    level: '专家咨询师',
    specialty: '认知行为',
    gender: '男',
    location: '西安',
    rating: 4.8,
    avatar: '/static/logo.png'
  },
  {
    name: '孙丽华',
    level: '高级咨询师',
    specialty: '亲子关系',
    gender: '女',
    location: '南京',
    rating: 4.7,
    avatar: '/static/logo.png'
  },
  {
    name: '胡晓明',
    level: '资深咨询师',
    specialty: '强迫症',
    gender: '男',
    location: '重庆',
    rating: 4.8,
    avatar: '/static/logo.png'
  },
  {
    name: '林静雯',
    level: '专家咨询师',
    specialty: '睡眠障碍',
    gender: '女',
    location: '厦门',
    rating: 4.9,
    avatar: '/static/logo.png'
  }
]

const articles = [
  '焦虑时试试478呼吸法',
  '抑郁知多少',
  '考试焦虑应对指南'
]

// 计算属性：获取当前显示的3个咨询师
const visibleCounselors = computed(() => {
  const startIndex = counselorIndex.value
  const result = []
  for (let i = 0; i < 3; i++) {
    const index = (startIndex + i) % counselors.length
    result.push(counselors[index])
  }
  return result
})

let interval = null
let scrollInterval = null

onMounted(() => {
  // 检查登录状态
  const token = uni.getStorageSync('token')
  const userInfo = uni.getStorageSync('userInfo')
  
  if (token && userInfo) {
    isLoggedIn.value = true
    currentUserInfo.value = userInfo
    showLoginModal.value = false
  } else {
    // 每次进入小程序都清除登录状态，要求重新登录
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    isLoggedIn.value = false
    showLoginModal.value = true
  }
  
  // 标语轮播
  interval = setInterval(() => {
    currentSlogan.value = (currentSlogan.value + 1) % slogans.length
  }, 3000)
  
  // 咨询师列表自动切换（每3秒切换到下一组3个咨询师）
  scrollInterval = setInterval(() => {
    counselorIndex.value = (counselorIndex.value + 3) % counselors.length
  }, 3000)
})

onUnmounted(() => {
  clearInterval(interval)
  clearInterval(scrollInterval)
})

function handleRefresh() {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}
function goProfile() {
  // 检查是否已登录
  const token = uni.getStorageSync('token')
  if (!token) {
    // 未登录，跳转到登录页面
    uni.navigateTo({
      url: '/pages/login/login'
    })
    return
  }

  // 已登录，直接跳转到个人资料页面
  uni.navigateTo({
    url: '/pages/profile/profile'
  })
}

// 退出登录
function logout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        isLoggedIn.value = false
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        uni.showToast({
          title: '已退出登录',
          icon: 'success',
          duration: 1500
        })
      }
    }
  })
}
function goTest() {
  // 跳转到心理测评页
}

// 检查登录状态的通用函数
function checkLoginAndShowModal(action) {
  // 检查是否有有效的登录token
  const token = uni.getStorageSync('token')
  if (!token || !isLoggedIn.value) {
    showLoginModal.value = true
    uni.showToast({
      title: '需要会员登录才能使用此功能',
      icon: 'none',
      duration: 2000
    })
    return false
  }
  return true
}

// 咨询师点击处理
function handleCounselorClick(counselor) {
  if (checkLoginAndShowModal('咨询师服务')) {
    // 这里处理咨询师相关逻辑
    console.log('点击了咨询师:', counselor.name)
  }
}

// 心理测评点击处理
function handleTestClick() {
  if (checkLoginAndShowModal('心理测评')) {
    goTest()
  }
}

// 心理推文点击处理
function handleArticleClick(article) {
  if (checkLoginAndShowModal('心理推文')) {
    // 这里处理推文相关逻辑
    console.log('点击了推文:', article)
  }
}

// 心愿心语点击处理
function handleWishClick() {
  if (checkLoginAndShowModal('心愿心语')) {
    // 这里处理心愿心语相关逻辑
    unreadMessageCount.value = 0
    console.log('点击了心愿心语')
  }
}

// 登录相关函数
function toggleTerms() {
  termsAccepted.value = !termsAccepted.value
}

// 跳转到登录页面
function goToLoginPage() {
  if (!termsAccepted.value) {
    uni.showToast({
      title: '请先同意服务条款',
      icon: 'none',
      duration: 1500
    })
    return
  }
  
  uni.navigateTo({
    url: '/pages/login/login',
    success: () => {
      // 跳转成功后关闭当前登录弹窗
      showLoginModal.value = false
    }
  })
}

function handleBrowse() {
  // 检查是否同意协议
  if (!termsAccepted.value) {
    uni.showToast({
      title: '请先同意服务条款',
      icon: 'none',
      duration: 1280  // 这里控制显示时间，单位是毫秒
    })
    return
  }
  // 同意协议后才能先逛一逛，关闭登录弹窗，但不设置为已登录状态
  // 用户仍然需要登录才能使用各项功能
  showLoginModal.value = false
  isLoggedIn.value = false  // 确保未登录状态
  uni.showToast({
    title: '欢迎访问，使用功能需要会员登录',
    icon: 'none',
    duration: 2000
  })
}

function closeLogin() {
  showLoginModal.value = false
}
</script>

<style scoped>
/* 你可以根据实际需求自定义样式，以下为简化版 */
.bg-gradient { background: linear-gradient(135deg, #fce4ec 0%, #e3f2fd 50%, #ede7f6 100%); min-height: 100vh; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 24rpx; background: rgba(255,255,255,0.8); border-bottom: 1px solid #f8bbd0; }
.slogan { font-size: 32rpx; color: #666; }
.avatar-group { position: relative; display: flex; align-items: center; gap: 12rpx; }
.avatar-img { width: 96rpx; height: 96rpx; border-radius: 50%; border: 2rpx solid #f8bbd0; }
.user-info { display: flex; flex-direction: column; }
.user-nickname { font-size: 24rpx; color: #333; font-weight: 500; }
.main-content { padding: 32rpx 24rpx; }
.section { margin-bottom: 32rpx; }
.section-title { display: flex; align-items: center; gap: 12rpx; font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; }
.badge { background: #fce4ec; color: #d81b60; font-size: 20rpx; border-radius: 8rpx; padding: 2rpx 10rpx; }
.counselor-scroll { width: 100%; height: auto; overflow: hidden; }
.counselor-container { display: flex; flex-direction: column; gap: 16rpx; }
.counselor-card { 
  display: flex; 
  flex-direction: row;
  align-items: center; 
  background: #fff; 
  border-radius: 16rpx; 
  padding: 16rpx; 
  box-shadow: 0 2rpx 8rpx #f8bbd0; 
  width: 100%;
  min-height: 80rpx;
  margin-bottom: 0;
}
.counselor-avatar { width: 64rpx; height: 64rpx; border-radius: 50%; margin-right: 16rpx; }
.counselor-info { flex: 1; text-align: left; }
.counselor-name { font-size: 24rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.level { background: #e3f2fd; color: #1976d2; font-size: 16rpx; border-radius: 6rpx; padding: 2rpx 6rpx; margin-left: 4rpx; }
.counselor-meta { display: flex; flex-wrap: wrap; gap: 8rpx; font-size: 18rpx; color: #666; }
.specialty { background: #c8e6c9; color: #388e3c; border-radius: 6rpx; padding: 2rpx 6rpx; font-size: 16rpx; }
.meta-item { font-size: 16rpx; }
.test-card { background: linear-gradient(90deg, #ab47bc, #ec407a); color: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 32rpx; }
.test-title { font-size: 28rpx; font-weight: bold; }
.test-desc { font-size: 22rpx; color: #f3e5f5; margin-bottom: 12rpx; }
.test-footer { display: flex; align-items: center; justify-content: space-between; }
.test-btn { background: rgba(255,255,255,0.2); color: #fff; border: none; border-radius: 8rpx; padding: 16rpx 22rpx; margin-left: auto; font-size: 30rpx; margin-right: -5rpx; }
.article-list { display: flex; flex-direction: row; gap: 16rpx; }
.article-card { min-width: 200rpx; background: #fff; border-radius: 12rpx; padding: 16rpx; margin-right: 16rpx; }
.article-title { font-size: 22rpx; color: #333; margin-bottom: 8rpx; }
.article-desc { font-size: 18rpx; color: #888; }
.wish-card { background: linear-gradient(90deg, #ffe0b2, #fce4ec); border-radius: 16rpx; padding: 24rpx; margin-bottom: 32rpx; }
.wish-header { display: flex; align-items: center; gap: 8rpx; font-size: 24rpx; color: #ff7043; position: relative; }
.message-badge { 
  min-width: 28rpx; 
  height: 28rpx; 
  background: #e53935; 
  color: #fff; 
  border-radius: 14rpx; 
  font-size: 18rpx; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  position: absolute; 
  right: -32rpx; 
  top: -4rpx;
  padding: 0 6rpx;
  font-weight: bold;
}
.wish-desc { font-size: 20rpx; color: #666; margin: 12rpx 0; }
.wish-btn { width: 100%; background: #fff3e0; color: #ff7043; border: 1rpx solid #ffccbc; border-radius: 8rpx; padding: 12rpx 0; }
.refresh-tip { position: fixed; top: 0; left: 0; right: 0; height: 64rpx; background: #ec407a; color: #fff; display: flex; align-items: center; justify-content: center; transform: translateY(-100%); transition: transform 0.3s; z-index: 100; }
.refresh-tip.show { transform: translateY(0); }
.refresh-btn { position: fixed; bottom: 32rpx; right: 32rpx; width: 96rpx; height: 96rpx; background: #ec407a; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40rpx; box-shadow: 0 4rpx 16rpx #f8bbd0; border: none; }
.icon-heart::before { content: "♥"; color: #ec407a; margin-right: 4rpx; }
.icon-message::before { content: "💬"; color: #42a5f5; margin-right: 4rpx; }
.icon-refresh::before { content: "⟳"; color: #fff; margin-right: 4rpx; }

/* 登录弹窗样式 */
.login-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; }
.login-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); }
.login-content { 
  position: absolute; 
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0; 
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fce4ec 100%); 
  display: flex; 
  flex-direction: column; 
  max-width: 750rpx; 
  margin: 0 auto;
}
.login-header { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 32rpx 24rpx; 
  background: #fff; 
}
.login-title { font-size: 36rpx; font-weight: 500; color: #333; }
.logo-section { 
  flex: 1; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 64rpx 0; 
}
.logo-container { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  text-align: center; 
}
.app-logo { 
  width: 240rpx; 
  height: 240rpx; 
  border-radius: 24rpx; 
  margin-bottom: 32rpx; 
  display: block;
}
.app-name { 
  font-size: 48rpx; 
  font-weight: bold; 
  color: #333; 
  letter-spacing: 4rpx; 
  text-align: center;
}
.login-bottom { padding: 0 48rpx 64rpx; }
.terms-section { 
  display: flex; 
  align-items: flex-start; 
  margin-bottom: 32rpx; 
  gap: 16rpx; 
}
.terms-checkbox { margin-top: 8rpx; }
.terms-text { 
  font-size: 28rpx; 
  color: #666; 
  line-height: 1.5; 
  flex: 1; 
}
.login-btn { 
  width: 100%; 
  background: #ffeb3b; 
  color: #333; 
  font-size: 32rpx; 
  font-weight: 500; 
  border-radius: 48rpx; 
  padding: 32rpx 0; 
  border: none; 
  margin-bottom: 32rpx; 
}
.login-btn:hover { background: #fdd835; }
.browse-btn { 
  width: 100%; 
  background: transparent; 
  color: #666; 
  font-size: 32rpx; 
  border: 2rpx solid #ddd; 
  border-radius: 48rpx; 
  padding: 24rpx 0; 
}
.browse-btn:hover { background: #f5f5f5; }
</style>