<template>
  <view class="min-h-screen bg-gradient">
    <!-- 顶部导航区 -->
    <view class="header">
      <view class="slogan">{{ slogans[currentSlogan] }}</view>
    </view>

    <view class="main-content">
      <!-- 专业团队区域 -->
      <view class="section">
        <view class="main-title" style="margin-bottom: 18rpx;">♥ 好朋友心理 ♥</view>
        <view class="section-title">
          <text class="icon-heart"></text>
          <text>专业团队</text>
          <text class="badge">认证心理咨询师在线支持</text>
        </view>
        <view class="counselor-scroll-with-hotline">
          <view class="counselor-container">
            <view v-for="(counselor, idx) in visibleCounselors" :key="counselor.id || idx" class="counselor-card" @click="handleCounselorClick(counselor)">
              <image class="counselor-avatar" :src="counselor.avatar" lazy-load mode="aspectFill" />
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
          <view class="hotline-bar">
            <text class="hotline-title">心理咨询热线</text>
            <view class="hotline-number-vertical">
              <text v-for="(num, i) in hotlineDigits" :key="i" class="hotline-digit">{{ num }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 心理测评模块 -->
      <view class="section">
        <view class="section-title">
          <text class="icon-test">📝</text>
          <text>心理测评</text>
          <text class="badge">专业量表科学评估</text>
        </view>
        <view class="test-cards">
          <view class="test-card sds-card" @click="handleTestClick('SDS')">
            <view class="test-header">
              <view class="test-info">
                <text class="test-name">抑郁自评量表</text>
                <text class="test-code sds-code">SDS</text>
              </view>
            </view>
            <text class="test-desc">评估抑郁程度的经典量表，包含20个项目，帮助识别抑郁症状，科学有效</text>
            <view class="test-meta">
              <text class="test-time">⏱️ 5-10分钟</text>
              <text class="test-users">已有8,420人测试</text>
            </view>
          </view>
          
          <view class="test-card sas-card" @click="handleTestClick('SAS')">
            <view class="test-header">
              <view class="test-info">
                <text class="test-name">焦虑自评量表</text>
                <text class="test-code sas-code">SAS</text>
              </view>
            </view>
            <text class="test-desc">评估焦虑水平的标准量表，包含20个项目，测量焦虑状态和特质，权威准确</text>
            <view class="test-meta">
              <text class="test-time">⏱️ 5-10分钟</text>
              <text class="test-users">已有9,630人测试</text>
            </view>
          </view>
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
    </view>

    <!-- 底部导航栏 -->
    <view class="bottom-nav">
      <view class="nav-item">
        <text class="nav-icon">🏠</text>
        <text class="nav-label">首页</text>
      </view>
      <view class="nav-item" @click="handleWishClick">
        <text class="nav-icon">💭</text>
        <text class="nav-label">心愿心语</text>
        <view v-if="unreadMessageCount > 0" class="nav-badge">
          {{ unreadMessageCount > 99 ? '99+' : unreadMessageCount }}
        </view>
      </view>
      <view class="nav-item" @click="goTestResults">
        <text class="nav-icon">📊</text>
        <text class="nav-label">测评结果</text>
      </view>
      <view class="nav-item" @click="goMyAppointments">
        <text class="nav-icon">📅</text>
        <text class="nav-label">我的预约</text>
      </view>
      <view class="nav-item" @click="goProfile">
        <text class="nav-icon">👤</text>
        <text class="nav-label">个人中心</text>
      </view>
    </view>

    <!-- 下拉刷新提示 -->
    <view class="refresh-tip" :class="{ show: isRefreshing }">
      <text class="icon-refresh"></text>
      有什么麻烦都可以跟好朋友说哟
    </view>

    <!-- 登录弹窗 -->
    <view v-if="showLoginModal" class="login-modal">
      <view class="login-overlay" @click="closeLogin"></view>
      <view class="login-content">
        <!-- 头部 -->
        <view class="login-header">
          <text class="login-title">会员登录</text>
        </view>

        <!-- 底部操作区 -->
        <view class="login-bottom">
          <!-- 用户协议 -->
          <view class="terms-section" @click="toggleTerms">
            <checkbox :checked="termsAccepted" class="terms-checkbox" />
            <text class="terms-text">我同意服务条款与隐私政策</text>
          </view>

          <!-- 登录按钮 -->
          <button class="login-btn" @click="goToLoginPage">
            立即登录
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { counselorAPI,BASE_URL } from '@/utils/api.js'
import { checkAndGuideUser } from '@/utils/user.js'
import {unreadMessageCount }from '@/utils/constants.js'
import { goMyAppointments,handleWishClick,goProfile,goTestResults} from '@/utils/page-turning.js'
import { throttle, runWhenIdle } from '@/utils/performance.js'

const currentSlogan = ref(0)
const isRefreshing = ref(false)
const showLoginModal = ref(false) // 默认不显示登录弹窗
const termsAccepted = ref(false) // 用户协议同意状态
const isLoggedIn = ref(false) // 用户登录状态
const counselorIndex = ref(0) // 当前显示的咨询师起始索引
const currentUserInfo = ref({}) // 当前用户信息


const slogans = [
  '每个情绪都值得被倾听',
  `你今天的心理电量是多少呀？`,
  '专业团队24小时守护',
  '随时随地倾诉心声',
  '让心理咨询更有温度',
  '你的心理健康，我们来守护',
  '倾诉是最好的解药',
  '心理咨询，从这里开始',
  '让心灵不再孤单'
]

const counselors = ref([])

const articles = [
  '焦虑时试试478呼吸法',
  '抑郁知多少',
  '考试焦虑应对指南'
]

// 计算属性：获取当前显示的6个咨询师
const visibleCounselors = computed(() => {
  if (!counselors.value || counselors.value.length === 0) return []
  
  const startIndex = counselorIndex.value
  const result = []
  for (let i = 0; i < 6; i++) {
    const index = (startIndex + i) % counselors.value.length
    result.push(counselors.value[index])
  }
  return result
})

// 热线号码竖排分布
const hotlineNumber = '19988889898'
const hotlineDigits = hotlineNumber.split('')


let interval = null
let scrollInterval = null


onMounted(async () => {
  // 立即检查登录状态 - 优化：使用更快的方式
  const token = uni.getStorageSync('token')
  const userInfo = uni.getStorageSync('userInfo')
  
  isLoggedIn.value = !!(token && userInfo)
  if (userInfo) {
    currentUserInfo.value = userInfo
  }
  
  // 立即启动标语轮播
  interval = setInterval(() => {
    currentSlogan.value = (currentSlogan.value + 1) % slogans.length
  }, 3000)
  
  // 异步加载咨询师数据 - 不阻塞页面渲染
  loadCounselorsAsync()
  
  // 立即启动咨询师切换（即使数据还未加载也不影响）
  scrollInterval = setInterval(() => {
    if (counselors.value && counselors.value.length > 6) {
      counselorIndex.value = (counselorIndex.value + 6) % counselors.value.length
    }
  }, 4000)
})

// 异步加载咨询师数据 - 分离出来避免阻塞
async function loadCounselorsAsync() {
  // 使用 runWhenIdle 在空闲时加载数据
  runWhenIdle(async () => {
    try {
      const res = await counselorAPI.getCounselorList()
      
      if (res && Array.isArray(res)) {
        // 优化：使用更高效的数组操作
        counselors.value = res.map(item => ({
          id: item.id,
          name: item.name,
          level: item.level || '咨询师',
          specialty: Array.isArray(item.specialty) ? item.specialty.join('、') : item.specialty || '心理咨询',
          gender: item.gender === 'UNKNOWN' ? '未知' : (item.gender === 'MALE' ? '男' : item.gender === 'FEMALE' ? '女' : item.gender),
          location: item.location || '未知',
          rating: item.rating || 0,
          avatar: item.avatar ? `${BASE_URL}/static/${item.avatar}` : '/static/logo.png'
        }))
      }
    } catch (error) {
      console.error('获取咨询师列表失败:', error)
      // 加载失败时显示默认数据，确保页面正常显示
      counselors.value = []
    }
  })
}

onUnmounted(() => {
  clearInterval(interval)
  clearInterval(scrollInterval)
})

// 使用节流优化刷新功能
const handleRefresh = throttle(() => {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}, 2000) // 2秒内最多刷新一次

// 咨询师点击处理
function handleCounselorClick(counselor) {
  if (checkLoginAndShowModal('咨询师服务')) {
    // 直接跳转到咨询师详情页面
    uni.navigateTo({
      url: `/pages/counselor/detail?counselorId=${counselor.id}&name=${counselor.name}`
    })
  }
}

// 心理测评点击处理
function handleTestClick(testType) {
  checkAndGuideUser('心理测评功能', () => {
    goTest(testType)
  })
}

// 跳转到测评页面
function goTest(testType) {
  if (testType === 'SDS') {
    uni.navigateTo({
      url: '/pages/test/sds'
    })
  } else if (testType === 'SAS') {
    uni.navigateTo({
      url: '/pages/test/sas'
    })
  }
}

// 心理推文点击处理
function handleArticleClick(article) {
  checkAndGuideUser('心理推文功能', () => {
    // 这里处理推文相关逻辑
    console.log('点击了推文:', article)
    // 临时显示开发中提示
    uni.showToast({
      title: '心理推文功能开发中',
      icon: 'none',
      duration: 2000
    })
  })
}

// 登录相关函数
function toggleTerms() {
  termsAccepted.value = !termsAccepted.value
}
// 检查登录状态的通用函数
function checkLoginAndShowModal(action) {
  // 检查是否有有效的登录token
  const token = uni.getStorageSync('token')
  if (!token || !isLoggedIn.value) {
    showLoginModal.value = true
    return false
  }
  return true
}
function goToLoginPage() {
  if (!termsAccepted.value) {
    uni.showToast({
      title: '请先同意服务条款',
      icon: 'none',
      duration: 1500
    })
    return
  }
  // 跳转到登录页面
  uni.navigateTo({
    url: '/pages/login/login'
  })
}
// 关闭登录弹窗
function closeLogin() {
  showLoginModal.value = false
}
</script>

<style scoped>
/* 你可以根据实际需求自定义样式，以下为简化版 */
.bg-gradient {
  background: linear-gradient(135deg, #ecb198 0%, #e2beeb 50%, #b5d9ee 100%);
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  /* 性能优化：启用硬件加速 */
  transform: translateZ(0);
  will-change: auto;
}
.header { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 24rpx; 
  background: rgba(255,255,255,0.8); 
  border-bottom: 1px solid #f8bbd0;
  /* 性能优化：避免重绘 */
  contain: layout style;
}
.main-title {
  font-size: 54rpx;
  font-weight: 900;
  color: #fffd93;
  letter-spacing: 6rpx;
  margin-bottom: 12rpx;
  text-align: center;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', 'Helvetica Neue', 'sans-serif';
  text-shadow: 0 4rpx 12rpx #f8bbd0, 0 2rpx 0 #fff;
}

.slogan { font-size: 36rpx; color: #666; font-weight: 500; }
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 32rpx 24rpx 160rpx;
  box-sizing: border-box;
}
.section { margin-bottom: 32rpx; }
.section-title { display: flex; align-items: center; gap: 12rpx; font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; }
.badge { background: #fce4ec; color: #d81b60; font-size: 22rpx; border-radius: 8rpx; padding: 4rpx 12rpx; }
.counselor-scroll-with-hotline {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: auto;
  overflow: hidden;
}
.counselor-container {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  flex: 1;
}
.counselor-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx #f8bbd0;
  width: 91%;
  min-height: 80rpx;
  margin-bottom: 0;
  /* 性能优化：启用硬件加速和合成层 */
  transform: translateZ(0);
  will-change: transform;
  contain: layout style;
}
.hotline-bar {
  width: 60rpx;
  min-width: 60rpx;
  background: #fce4ec;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-left: 12rpx;
  box-shadow: 0 2rpx 8rpx #f8bbd0;
  padding: 16rpx 0;
  height: 100%;
  min-height: 420rpx;
}
.hotline-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 40rpx;
  color: #d31158;
  font-weight: bold;
  margin-bottom: 8rpx;
  letter-spacing: 2rpx;
}
.hotline-number-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  height: 100%;
  width: 100%;
  padding: 0;
}
.hotline-digit {
  font-size: 40rpx;
  color: #1976d2;
  font-weight: 700;
  line-height: 1.2;
  width: 100%;
  text-align: center;
}
.counselor-avatar { width: 64rpx; height: 64rpx; border-radius: 50%; margin-right: 24rpx; }
.counselor-info { flex: 1; text-align: left; }
.counselor-name { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.level { background: #e3f2fd; color: #1976d2; font-size: 18rpx; border-radius: 6rpx; padding: 2rpx 6rpx; margin-left: 4rpx; }
.counselor-meta { display: flex; align-items: center; gap: 8rpx; font-size: 20rpx; color: #666; flex-wrap: nowrap; }
.specialty { background: #c8e6c9; color: #388e3c; border-radius: 6rpx; padding: 2rpx 6rpx; font-size: 18rpx; white-space: nowrap; }
.meta-item { font-size: 18rpx; white-space: nowrap; }
/* 心理测评样式 */
.icon-test::before { content: "📝"; color: #9c27b0; margin-right: 4rpx; }
.test-cards { display: flex; flex-direction: column; gap: 16rpx; }
.test-card { 
  background: #fff; 
  border-radius: 16rpx; 
  padding: 24rpx; 
  border: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  min-height: 180rpx;
  display: flex;
  flex-direction: column;
}
.test-card:active { 
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}
.test-header { display: flex; align-items: center; margin-bottom: 12rpx; }
.test-icon { font-size: 36rpx; margin-right: 16rpx; }
.test-info { flex: 1; }
.test-name { 
  font-size: 28rpx; 
  font-weight: 600; 
  color: #333; 
  display: block;
  margin-bottom: 4rpx;
}
.test-code { 
  font-size: 22rpx; 
  color: #9c27b0; 
  background: rgba(156, 39, 176, 0.1);
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
}

/* SDS 浅蓝色主题 */
.sds-card {
  border-left: 6rpx solid #f0f8ff;
  background: linear-gradient(135deg, #f8fcff 0%, #e6f4ff 100%);
}
.sds-code {
  color: #2196f3 !important;
  background: rgba(33, 150, 243, 0.08) !important;
}

/* SAS 橙色主题 */
.sas-card {
  border-left: 6rpx solid #f6f3ee;
  background: linear-gradient(135deg, #fffaf5 0%, #ffe8ce 100%);
}
.sas-code {
  color: #ff9800 !important;
  background: rgba(255, 152, 0, 0.1) !important;
}
.test-desc { 
  font-size: 24rpx; 
  color: #666; 
  line-height: 1.4;
  margin-bottom: 16rpx;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 68rpx;
}
.test-meta { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  font-size: 22rpx;
  color: #888;
}
.test-time { color: #ff9800; }
.test-users { color: #4caf50; }
.article-list { display: flex; flex-direction: row; gap: 16rpx; }
.article-card { min-width: 200rpx; background: #fff; border-radius: 12rpx; padding: 16rpx; margin-right: 16rpx; }
.article-title { font-size: 26rpx; color: #333; margin-bottom: 8rpx; font-weight: 500; }
.article-desc { font-size: 20rpx; color: #888; }
.refresh-tip { position: fixed; top: 0; left: 0; right: 0; height: 64rpx; background: #ec407a; color: #fff; display: flex; align-items: center; justify-content: center; transform: translateY(-100%); transition: transform 0.3s; z-index: 100; }
.refresh-tip.show { transform: translateY(0); }
.icon-heart::before { content: "♥"; color: #ec407a; margin-right: 4rpx; }
.icon-message::before { content: "💬"; color: #42a5f5; margin-right: 4rpx; }
.icon-refresh::before { content: "⟳"; color: #fff; margin-right: 4rpx; }

/* 登录弹窗样式 */
.login-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; }
.login-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); }
.login-content { 
  position: absolute; 
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 520rpx;
  background: #fff; 
  border-radius: 40rpx; 
  display: flex; 
  flex-direction: column; 
}
.login-header { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 32rpx 24rpx 24rpx; 
}
.login-title { font-size: 32rpx; font-weight: 600; color: #333; }
.login-bottom { padding: 20rpx 32rpx 32rpx; }
.terms-section { 
  display: flex; 
  align-items: flex-start; 
  margin-bottom: 20rpx; 
  gap: 18rpx; 
}
.terms-checkbox { margin-top: -10rpx; }
.terms-text { 
  font-size: 24rpx; 
  color: #666; 
  line-height: 1.4; 
  flex: 1; 
}
.login-btn { 
  width: 100%; 
  background: linear-gradient(135deg, #1ba7d0, #4bc3b2); 
  color: #fff; 
  font-size: 32rpx; 
  font-weight: 550; 
  border-radius: 12rpx; 
  padding: 12rpx 0; 
  border: none; 
  margin-bottom: 0; 
  letter-spacing: 1rpx;
}
.login-btn:active { opacity: 0.8; }

/* 底部导航栏样式 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 1000;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  position: relative;
  transition: all 0.2s ease;
}

.nav-item:active {
  background: rgba(236, 64, 122, 0.1);
}

.nav-icon {
  font-size: 36rpx; /* 大号字体 */
  margin-bottom: 8rpx;
  color: #666;
}

.nav-label {
  font-size: 20rpx; /* 小号字体 */
  color: #666;
  text-align: center;
}

.nav-badge {
  position: absolute;
  top: 10rpx;
  right: 20%;
  min-width: 32rpx;
  height: 32rpx;
  background: #e53935;
  color: #fff;
  border-radius: 16rpx;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  font-weight: bold;
}
</style>