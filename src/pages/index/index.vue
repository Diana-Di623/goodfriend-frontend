<template>
  <view class="min-h-screen bg-gradient">
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
      <text class="loading-text">加载中...</text>
    </view>

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
      <view class="nav-item" @click="goHome">
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

const currentSlogan = ref(0)
const hasNewMessage = ref(true)
const unreadMessageCount = ref(15) // 未读消息数量
const isRefreshing = ref(false)
const scrollTop = ref(0) // 竖向滚动位置
const currentPage = ref(0) // 当前页
const showLoginModal = ref(false) // 默认不显示登录弹窗
const termsAccepted = ref(false) // 用户协议同意状态
const isLoggedIn = ref(false) // 用户登录状态
const counselorIndex = ref(0) // 当前显示的咨询师起始索引
const currentUserInfo = ref({}) // 当前用户信息
const isPageLoading = ref(true) // 全局页面加载状态
const progressBarWidth = ref(0) // 加载进度条宽度百分比

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

// 计算属性：获取当前显示的6个咨询师
const visibleCounselors = computed(() => {
  const startIndex = counselorIndex.value
  const result = []
  for (let i = 0; i < 6; i++) {
    const index = (startIndex + i) % counselors.length
    result.push(counselors[index])
  }
  return result
})

// 热线号码竖排分布
const hotlineNumber = '19988889898'
const hotlineDigits = hotlineNumber.split('')


let interval = null
let scrollInterval = null
let progressTimer = null

// 封装全局 loading 动画启动
function showLoadingWithProgress(duration = 3000) {
  isPageLoading.value = true
  progressBarWidth.value = 0
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

onMounted(() => {
  showLoadingWithProgress(3000)
  // 检查登录状态
  const token = uni.getStorageSync('token')
  const userInfo = uni.getStorageSync('userInfo')
  
  if (token && userInfo) {
    isLoggedIn.value = true
    currentUserInfo.value = userInfo
  } else {
    isLoggedIn.value = false
  }
  
  // 标语轮播
  interval = setInterval(() => {
    currentSlogan.value = (currentSlogan.value + 1) % slogans.length
  }, 3000)
  
  // 咨询师列表自动切换（每4秒切换到下一组6个咨询师）
  scrollInterval = setInterval(() => {
    counselorIndex.value = (counselorIndex.value + 6) % counselors.length
  }, 4000)
})

onUnmounted(() => {
  clearInterval(interval)
  clearInterval(scrollInterval)
  if (progressTimer) clearInterval(progressTimer)
})

function handleRefresh() {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}


// 首页导航 
function goHome() {
  showLoadingWithProgress(1000)
  setTimeout(() => {
    uni.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  }, 500)
}

function goProfile() {
  // 检查是否已登录
  const token = uni.getStorageSync('token')
  showLoadingWithProgress(1200)
  setTimeout(() => {
    if (!token) {
      // 未登录，跳转到登录页面
      uni.navigateTo({
        url: '/pages/login/login',
        // 不再手动关闭 loading，由动画控制
      })
      return
    }
    // 已登录，直接跳转到个人资料页面
    uni.navigateTo({
      url: '/pages/profile/profile',
    })
  }, 500)
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
function goTest(testType) {
  // 根据测评类型跳转到对应页面
  const testRoutes = {
    'SDS': '/pages/test/sds', 
    'SAS': '/pages/test/sas'
  }
  const route = testRoutes[testType]
  showLoadingWithProgress(1200)
  setTimeout(() => {
    if (route) {
      uni.navigateTo({
        url: route,
        // 不再手动关闭 loading，由动画控制
        fail: () => {
          isPageLoading.value = false
          // 如果页面不存在，显示开发中提示
          uni.showToast({
            title: `${testType}测评开发中，敬请期待`,
            icon: 'none',
            duration: 2000
          })
        }
      })
    } else {
      isPageLoading.value = false
      uni.showToast({
        title: '测评类型错误',
        icon: 'none',
        duration: 1500
      })
    }
  }, 500)
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

// 咨询师点击处理
function handleCounselorClick(counselor) {
  if (checkLoginAndShowModal('咨询师服务')) {
    // 跳转到咨询师详情页面
    uni.navigateTo({
      url: `/pages/counselor/detail?counselorId=${counselor.name}&name=${counselor.name}`
    })
  }
}

// 心理测评点击处理
function handleTestClick(testType) {
  if (checkLoginAndShowModal('心理测评')) {
    goTest(testType)
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

// 测评结果点击处理
function goTestResults() {
  if (checkLoginAndShowModal('测评结果')) {
    showLoadingWithProgress(1200)
    // 等待进度条动画结束后再跳转
    const unwatch = watch(isPageLoading, (val) => {
      if (!val) {
        unwatch()
        uni.navigateTo({
          url: '/pages/test/results',
        })
      }
    })
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

// 关闭登录弹窗
function closeLogin() {
  showLoginModal.value = false
}
</script>

<style scoped>
/* 你可以根据实际需求自定义样式，以下为简化版 */
.bg-gradient { background: linear-gradient(135deg, #ecb198 0%, #e2beeb 50%, #b5d9ee 100%); min-height: 100vh; }
.header { display: flex; align-items: center; justify-content: center; padding: 24rpx; background: rgba(255,255,255,0.8); border-bottom: 1px solid #f8bbd0; }
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

.global-loading-mask {
  position: fixed;
  z-index: 2000;
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(255,255,255,0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.loading-progress-bar-wrap-bottom {
  position: absolute;
  left: 0;
  bottom: 38rpx;
  width: 100vw;
  height: 24rpx;
  background: transparent;
  z-index: 2100;
}
.loading-progress-bar-info {
  position: absolute;
  left: 0;
  bottom: 62rpx;
  width: 100vw;
  display: flex;
  justify-content: center;
  z-index: 2101;
}
.loading-progress-text {
  font-size: 22rpx;
  color: #b48be7;
  font-weight: 600;
  background: rgba(255,255,255,0.85);
  border-radius: 8rpx;
  padding: 2rpx 16rpx;
  letter-spacing: 2rpx;
}
.loading-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff97c3 0%, #cc01ff 100%);
  border-radius: 20rpx;
  transition: width 0.18s linear;
}
.loading-logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 24rpx;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 16rpx #f8bbd0;
}
.loading-title {
  font-size: 38rpx;
  font-weight: 700;
  color: #222;
  letter-spacing: 4rpx;
  margin-bottom: 18rpx;
  text-align: center;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', 'Helvetica Neue', 'sans-serif';
  text-shadow: 0 2rpx 8rpx #f7f1f3, 0 1rpx 0 #fff;
}
.loading-spinner {
  display: flex;
  gap: 16rpx;
  margin-bottom: 18rpx;
}
.loading-spinner .dot {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffb6d5 0%, #fffd93 100%);
  animation: loading-bounce 1s infinite alternate;
}
.loading-spinner .dot:nth-child(2) {
  animation-delay: 0.2s;
}
.loading-spinner .dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes loading-bounce {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-18rpx); opacity: 0.5; }
}
.loading-text {
  font-size: 28rpx;
  color: #ff7a7a;
  letter-spacing: 2rpx;
  font-weight: 600;
}
.slogan { font-size: 36rpx; color: #666; font-weight: 500; }
.main-content { padding: 32rpx 24rpx 160rpx; } /* 增加底部间距避免被导航栏遮挡 */
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
  color: #d81b60;
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