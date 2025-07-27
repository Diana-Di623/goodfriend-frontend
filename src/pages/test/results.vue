<template>
  <view class="results-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="title">测评结果</text>
    </view>

    <!-- 测评历史概览 -->
    <view class="overview-section">
      <view class="overview-card">
        <view class="overview-header">
          <text class="overview-title">测评历史概览</text>
          <text class="overview-count">共 {{ testResults.length }} 次测评</text>
        </view>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-number">{{ sdsCount }}</text>
            <text class="stat-label">SDS抑郁测评</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ sasCount }}</text>
            <text class="stat-label">SAS焦虑测评</text>
          </view>
        </view>
      </view>
    </view>


    <!-- 最新结果 -->
    <view class="latest-section" v-if="latestResult">
      <view class="latest-card">
        <view class="latest-header">
          <text class="latest-title">最新测评结果</text>
          <text class="latest-date">{{ formatDate(latestResult.date) }}</text>
        </view>
        <view class="latest-content">
          <view class="latest-score">
            <text class="score-type">{{ latestResult.testType }}</text>
            <text class="score-value">{{ latestResult.standardScore }}分</text>
            <text class="score-level" :class="getLevelClass(latestResult.standardScore, latestResult.testType)">
              {{ latestResult.level }}
// 咨询师卡片点击事件，跳转到详情页并传递参数
function handleCounselorClick(counselor) {
  const query = Object.entries(counselor)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  uni.navigateTo({
    url: `/pages/counselor/detail?${query}`
  });
}
            </text>
          </view>
          <text class="latest-interpretation">{{ latestResult.interpretation }}</text>
        </view>
      </view>
    </view>

    <!-- 推荐咨询师 -->
    <view class="counselor-section">
      <view class="counselor-header">
        <text class="counselor-title">推荐咨询师</text>
        <text class="counselor-subtitle">基于您的测评结果为您推荐</text>
      </view>
      <view class="counselor-list">
        <view 
          v-for="(counselor, index) in recommendedCounselors" 
          :key="index"
          class="counselor-card"
          @click="handleCounselorClick(counselor)"
        >
          <image class="counselor-avatar" :src="counselor.avatar" />
          <view class="counselor-info">
            <view class="counselor-name">{{ counselor.name }}</view>
            <view class="counselor-level">{{ counselor.level }}</view>
            <view class="counselor-specialty">擅长：{{ counselor.specialty }}</view>
            <view class="counselor-meta">
              <text class="meta-item">{{ counselor.gender }}</text>
              <text class="meta-item">{{ counselor.location }}</text>
              <text class="meta-item">⭐{{ counselor.rating }}</text>
            </view>
          </view>
          <view class="match-badge">
            <text class="match-text">{{ counselor.matchReason }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 历史记录 -->
    <view class="history-section">
      <view class="history-header">
        <text class="history-title">历史记录</text>
      </view>
      <view class="history-list">
        <view 
          v-for="(result, index) in displayResults" 
          :key="index"
          class="history-item"
          @click="viewResult(result)"
        >
          <view class="history-main">
            <view class="history-type">{{ result.testType }}</view>
            <view class="history-score">{{ result.standardScore }}分</view>
            <view class="history-level" :class="getLevelClass(result.standardScore, result.testType)">
              {{ result.level }}
            </view>
          </view>
          <view class="history-date">{{ formatDate(result.date) }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const testResults = ref([])
const selectedType = ref('all')
const latestResult = ref(null)
const chartContext = ref(null)

// 计算统计数据
const sdsCount = computed(() => {
  return testResults.value.filter(r => r.testType === 'SDS').length
})

const sasCount = computed(() => {
  return testResults.value.filter(r => r.testType === 'SAS').length
})

// 根据筛选条件显示结果
const displayResults = computed(() => {
  if (selectedType.value === 'all') {
    return testResults.value.slice().reverse()
  }
  return testResults.value.filter(r => r.testType === selectedType.value).slice().reverse()
})

// 推荐咨询师
const recommendedCounselors = ref([
  {
    name: '张雨萌',
    level: '专家咨询师',
    specialty: '青少年心理',
    gender: '女',
    location: '广州',
    rating: 5.0,
    avatar: '/static/logo.png',
    matchReason: '专业匹配'
  },
  {
    name: '李心怡',
    level: '高级咨询师',
    specialty: '家庭治疗',
    gender: '女',
    location: '北京',
    rating: 4.9,
    avatar: '/static/logo.png',
    matchReason: '好评推荐'
  },
  {
    name: '王明轩',
    level: '资深咨询师',
    specialty: '情感关系',
    gender: '男',
    location: '上海',
    rating: 4.8,
    avatar: '/static/logo.png',
    matchReason: '经验丰富'
  }
])

onMounted(() => {
  loadTestResults()
  if (testResults.value.length > 0) {
    latestResult.value = testResults.value[testResults.value.length - 1]
    drawChart()
  }
})

function loadTestResults() {
  const results = uni.getStorageSync('testResults') || []
  testResults.value = results.sort((a, b) => new Date(a.date) - new Date(b.date))
}

function drawChart() {
  const query = uni.createSelectorQuery()
  query.select('#trendChart').fields({ node: true, size: true }).exec((res) => {
    if (res[0]) {
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      
      const dpr = uni.getSystemInfoSync().pixelRatio
      canvas.width = res[0].width * dpr
      canvas.height = res[0].height * dpr
      ctx.scale(dpr, dpr)
      
      drawTrendChart(ctx, res[0].width, res[0].height)
    }
  })
}

function drawTrendChart(ctx, width, height) {
  const filteredData = selectedType.value === 'all' 
    ? testResults.value 
    : testResults.value.filter(r => r.testType === selectedType.value)
  
  if (filteredData.length === 0) return
  
  // 清空画布
  ctx.clearRect(0, 0, width, height)
  
  // 设置边距
  const margin = { top: 20, right: 20, bottom: 40, left: 40 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom
  
  // ...绘制网格线等图表内容...
}
</script>

<style scoped>
.results-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 120rpx;
}

/* 顶部导航 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
}

.back-btn .icon {
  font-size: 48rpx;
  color: #333;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
  margin-left: -80rpx; /* 补偿左侧按钮的宽度 */
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
}

.clear-text {
  font-size: 28rpx;
  color: #f44336;
}

/* 概览卡片 */
.overview-section {
  padding: 24rpx;
}

.overview-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.overview-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.overview-count {
  font-size: 26rpx;
  color: #666;
} 

.stats-grid {
  display: flex;
  gap: 32rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.stat-number {
  display: block;
  font-size: 48rpx;
  font-weight: 600;
  color: #2196f3;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

/* 图表卡片 */
.chart-section {
  padding: 0 24rpx 24rpx;
}

.chart-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.chart-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.chart-filters {
  display: flex;
  gap: 16rpx;
}

.filter-btn {
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  color: #666;
  background: #f5f5f5;
  border-radius: 20rpx;
  transition: all 0.2s;
}

.filter-btn.active {
  color: #fff;
  background: #2196f3;
}

.chart-container {
  height: 400rpx;
  position: relative;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

/* 最新结果 */
.latest-section {
  padding: 0 24rpx 24rpx;
}

.latest-card {
  background: linear-gradient(135deg, #f8fcff 0%, #e6f4ff 100%);
  border-radius: 16rpx;
  padding: 32rpx;
  border: 1rpx solid #e6f4ff;
}

.latest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.latest-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.latest-date {
  font-size: 24rpx;
  color: #666;
}

.latest-score {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.score-type {
  font-size: 28rpx;
  font-weight: 600;
  color: #2196f3;
}

.score-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.score-level {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.latest-interpretation {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

/* 推荐咨询师 */
.counselor-section {
  padding: 0 24rpx 24rpx;
}

.counselor-header {
  margin-bottom: 16rpx;
}

.counselor-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.counselor-subtitle {
  font-size: 24rpx;
  color: #666;
}

.counselor-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.counselor-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  position: relative;
}

.counselor-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.counselor-info {
  flex: 1;
}

.counselor-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.counselor-level {
  font-size: 24rpx;
  color: #2196f3;
  margin-bottom: 8rpx;
}

.counselor-specialty {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.counselor-meta {
  display: flex;
  gap: 16rpx;
  font-size: 22rpx;
  color: #888;
}

.match-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: #4caf50;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.match-text {
  font-size: 20rpx;
  color: #fff;
}

/* 历史记录 */
.history-section {
  padding: 0 24rpx;
}

.history-header {
  margin-bottom: 16rpx;
}

.history-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 1rpx 4rpx rgba(0,0,0,0.05);
}

.history-main {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.history-type {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
}

.history-score {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.history-level {
  padding: 4rpx 8rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  font-weight: 500;
}

.history-date {
  font-size: 22rpx;
  color: #888;
}

/* 等级颜色 */
.level-normal {
  background: #e8f5e8;
  color: #4caf50;
}

.level-mild {
  background: #fff3e0;
  color: #ff9800;
}

.level-moderate {
  background: #ffebee;
  color: #f44336;
}

.level-severe {
  background: #fce4ec;
  color: #e91e63;
}
</style>
