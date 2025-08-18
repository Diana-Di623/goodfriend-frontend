<template>
  <view class="results-page">
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

    <!-- 最近结果 -->
    <view class="latest-results-section">
      <view class="results-header">
        <text class="page-title">测评结果</text>
      </view>
      
      <!-- 双卡片展示 -->
      <view class="results-grid">
        <!-- SAS 焦虑自评卡片 -->
        <view class="result-card sas-card">
          <view class="card-header">
            <text class="card-title sas-title">SAS 焦虑自评</text>
          </view>
          <view class="card-content">
            <text v-if="latestSasResult" class="score-number sas-score">{{ latestSasResult.score }}</text>
            <text v-else class="score-number sas-score">--</text>
            <view v-if="latestSasResult" class="level-badge" :class="getLevelBadgeColor(latestSasResult.level)">
              <text class="badge-text">{{ latestSasResult.level }}</text>
            </view>
            <view v-else class="level-badge badge-gray">
              <text class="badge-text">暂无数据</text>
            </view>
            <view class="trend-info">
              <text class="trend-icon"></text>
              <text class="trend-text">{{ latestSasResult ? '最新结果' : '暂无测评' }}</text>
            </view>
          </view>
        </view>
        
        <!-- SDS 抑郁自评卡片 -->
        <view class="result-card sds-card">
          <view class="card-header">
            <text class="card-title sds-title">SDS 抑郁自评</text>
          </view>
          <view class="card-content">
            <text v-if="latestSdsResult" class="score-number sds-score">{{ latestSdsResult.score }}</text>
            <text v-else class="score-number sds-score">--</text>
            <view v-if="latestSdsResult" class="level-badge" :class="getLevelBadgeColor(latestSdsResult.level)">
              <text class="badge-text">{{ latestSdsResult.level }}</text>
            </view>
            <view v-else class="level-badge badge-gray">
              <text class="badge-text">暂无数据</text>
            </view>
            <view class="trend-info">
              <text class="trend-icon"></text>
              <text class="trend-text">{{ latestSdsResult ? '最新结果' : '暂无测评' }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 测评时间 -->
      <view v-if="latestSasResult || latestSdsResult" class="assessment-time">
        <text class="time-icon">📅</text>
        <text class="time-text">{{ getLatestDate() }}</text>
        <text class="time-icon">🕐</text>
        <text class="time-text">{{ getLatestTime() }}</text>
      </view>
      <view v-else class="assessment-time">
        <text class="time-icon">💡</text>
        <text class="time-text">完成测评后查看结果</text>
      </view>
      
      <!-- 专业建议 -->
      <view class="suggestion-card">
        <view class="suggestion-header">
          <text class="suggestion-title">专业建议</text>
          <view v-if="latestSasResult || latestSdsResult" class="suggestion-status">
            <text class="status-text">基于您的测评结果</text>
          </view>
        </view>
        <text class="suggestion-content">
          {{ getProfessionalAdvice() }}
        </text>
      </view>
    </view>

    <!-- 分隔线 -->
    <view class="section-divider"></view>

    <!-- 推荐咨询师 -->
    <view class="counselor-section">
      <view class="section-header">
        <text class="section-title">推荐咨询师</text>
      </view>
      
      <view class="counselor-list">
        <!-- 咨询师1 -->
        <view class="counselor-card featured-counselor" @click="gotoCounselorDetail('1')">
          <view class="recommend-reason">
            <text class="reason-text">匹配度95%</text>
          </view>
          <view class="counselor-content">
            <view class="counselor-avatar">
              <text class="avatar-text">李</text>
            </view>
            <view class="counselor-info">
              <view class="counselor-header">
                <text class="counselor-name">李心怡</text>
                <view class="rating-info">
                  <text class="star-icon">⭐</text>
                  <text class="rating-text">4.9</text>
                </view>
              </view>
              <text class="counselor-level">国家二级心理咨询师 · 8年经验</text>
              <text class="counselor-specialty">擅长：焦虑抑郁、情感问题、职场压力</text>
            </view>
          </view>
        </view>
        
        <!-- 咨询师2 -->
        <view class="counselor-card" @click="gotoCounselorDetail('2')">
          <view class="recommend-reason">
            <text class="reason-text">专业对口</text>
          </view>
          <view class="counselor-content">
            <view class="counselor-avatar">
              <text class="avatar-text">王</text>
            </view>
            <view class="counselor-info">
              <view class="counselor-header">
                <text class="counselor-name">王志强</text>
                <view class="rating-info">
                  <text class="star-icon">⭐</text>
                  <text class="rating-text">4.8</text>
                </view>
              </view>
              <text class="counselor-level">国家一级心理咨询师 · 12年经验</text>
              <text class="counselor-specialty">擅长：认知行为疗法、家庭治疗</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 分隔线 -->
    <view class="section-divider"></view>

    <!-- 历史记录 -->
    <view class="history-section">
      <view class="history-header">
        <text class="section-title">历史记录</text>
        <view v-if="historyRecords.length > 0" class="clear-btn" @click="showClearDialog">
          <text class="clear-icon">🗑️</text>
          <text class="clear-text">清空记录</text>
        </view>
      </view>
      
      <view v-if="historyRecords.length === 0" class="empty-state">
        <text class="empty-title">暂无历史记录</text>
        <text class="empty-subtitle">完成测评后，记录将显示在这里</text>
      </view>
      
      <view v-else class="history-list">
        <view
          v-for="(record, index) in historyRecords"
          :key="record.id"
          class="history-item"
          :class="getTypeBgClass(record.type)"
        >
          <view class="history-item-header">
            <view class="type-info">
              <view class="type-badge" :class="getTypeBadgeClass(record.type)">
                <text class="type-text">{{ record.type }}</text>
              </view>
              <text class="type-name">{{ record.typeName }}</text>
            </view>
            <view class="date-time-info">
              <text class="date-icon">📅</text>
              <text class="date-text">{{ record.date }}</text>
              <text class="time-icon">🕐</text>
              <text class="time-text">{{ record.time }}</text>
            </view>
          </view>
          
          <view class="history-item-content">
            <view class="score-info">
              <view class="score-display">
                <text class="score-value" :class="getScoreColorClass(record.score, record.type)">
                  {{ record.score }}
                </text>
                <text class="score-label">分数</text>
              </view>
              <view class="level-display">
                <view class="level-badge" :class="getLevelBadgeColor(record.level)">
                  <text class="level-text">{{ record.level }}</text>
                </view>
                <text class="level-label">等级</text>
              </view>
            </view>
            <view class="detail-btn" @click="viewDetail(record)">
              <text class="detail-text">查看详情</text>
            </view>
          </view>
        </view>
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
      <view class="nav-item">
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
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { testAPI } from '@/utils/api.js'
import {unreadMessageCount }from '@/utils/constants.js'
import {goHome,goProfile,handleWishClick, progressBarWidth,goMyAppointments,isPageLoading,loadingText} from '@/utils/page-turning.js'
// 历史记录数据 - 从localStorage获取实际测评记录
const historyRecords = ref([])
// 最新测评结果
const latestSasResult = ref(null)
const latestSdsResult = ref(null)


// 进度条定时器
let progressTimer = null

// 获取专业建议
function getProfessionalAdvice() {
  const sasScore = latestSasResult.value?.score || 0
  const sdsScore = latestSdsResult.value?.score || 0
  const sasLevel = latestSasResult.value?.level || ''
  const sdsLevel = latestSdsResult.value?.level || ''
  // 如果没有测评数据
  if (!latestSasResult.value && !latestSdsResult.value) {
    return '建议您完成心理测评，以便我们为您提供更精准的专业建议和心理健康指导。'
  }
  
  // 根据分数和等级给出建议
  let advice = ''
  let severity = 0 // 严重程度评分
  
  // 评估焦虑程度 (SAS标准分)
  if (sasScore >= 70) severity += 3      // 重度焦虑
  else if (sasScore >= 60) severity += 2 // 中度焦虑 
  else if (sasScore >= 50) severity += 1 // 轻度焦虑
  
  // 评估抑郁程度 (SDS标准分)
  if (sdsScore >= 73) severity += 3      // 重度抑郁
  else if (sdsScore >= 63) severity += 2 // 中度抑郁
  else if (sdsScore >= 53) severity += 1 // 轻度抑郁
  
  if (severity === 0) {
    advice = '您的心理状态良好！建议继续保持规律作息、适度运动和良好的社交关系。可以尝试冥想、阅读等活动来维持心理健康。'
  } else if (severity <= 2) {
    advice = '您存在轻度的心理压力。建议保持规律作息，进行适度运动如散步、瑜伽等。可以尝试深呼吸、放松训练等缓解技巧。建议与亲友多交流，必要时可咨询心理专业人员。'
  } else if (severity <= 4) {
    advice = '您的测评结果显示存在中度的焦虑或抑郁情绪。建议您及时调整生活方式，保证充足睡眠，避免过度劳累。强烈建议寻求专业心理咨询师的帮助，进行系统的心理干预。'
  } else {
    advice = '您的测评结果显示存在较为严重的心理健康问题。建议您立即寻求专业心理医生或心理咨询师的帮助。同时，请告知家人朋友您的状况，获得更多支持。必要时可考虑药物治疗配合心理治疗。'
  }
  
  // 添加具体症状的建议
  if (sasLevel.includes('重度') || sdsLevel.includes('重度')) {
    advice += '请特别注意：如有自伤或自杀想法，请立即联系心理危机干预热线或前往医院急诊科。'
  }
  
  return advice
}

async function loadHistoryRecords() {
  console.log('开始加载历史记录...')
  try {
    const res = await testAPI.getTestResults()
    console.log('后端返回的数据:', res)
    if (!Array.isArray(res) || res.length === 0) {
      uni.showToast({
        title: '暂无测评结果',
        icon: 'none'
      })
      historyRecords.value = []
      latestSasResult.value = null
      latestSdsResult.value = null
      return
    }
    if (Array.isArray(res)) {
      // 按时间倒序排列
      const sortedResults = res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      historyRecords.value = sortedResults.map((item, index) => {
        const dateObj = new Date(item.createdAt)
        const dateStr = dateObj.toISOString().split('T')[0]
        const timeStr = dateObj.toTimeString().split(' ')[0].slice(0, 5)
        // 本地推断level
        let level = ''
        if (item.testName === 'SAS') {
          if (item.score < 50) level = '正常'
          else if (item.score < 60) level = '轻度焦虑'
          else if (item.score < 70) level = '中度焦虑'
          else level = '重度焦虑'
        } else if (item.testName === 'SDS') {
          if (item.score < 53) level = '正常'
          else if (item.score < 63) level = '轻度抑郁'
          else if (item.score < 73) level = '中度抑郁'
          else level = '重度抑郁'
        }
        const typeName = item.testName === 'SAS' ? '焦虑自评量表' : '抑郁自评量表'
        return {
          id: item.id,
          date: dateStr,
          time: timeStr,
          type: item.testName || 'SAS',
          score: item.score || 0,
          level,
          typeName
        }
      })
      console.log('处理后的历史记录:', historyRecords.value)
      // 更新最新测评结果
      updateLatestResults(historyRecords.value)
    }
  } catch (e) {
    console.error('加载历史记录失败', e)
    uni.showToast({ title: '加载历史记录失败', icon: 'none' })
  }
}

// 更新最新测评结果显示
function updateLatestResults(results) {
  // 找到最新的SAS和SDS结果
  latestSasResult.value = results.find(item => item.type === 'SAS') || null
  latestSdsResult.value = results.find(item => item.type === 'SDS') || null
  
  console.log('更新最新结果:', {
    sasResult: latestSasResult.value,
    sdsResult: latestSdsResult.value,
    totalResults: results.length
  })
}

// 清空历史记录
function clearHistory() {
  historyRecords.value = []
  latestSasResult.value = null
  latestSdsResult.value = null
  
  try {
    uni.removeStorageSync('testResults')
  } catch (error) {
    console.error('清空历史记录失败:', error)
  }
  uni.showToast({ title: '历史记录已清空', icon: 'success' })
}

// 跳转到咨询师详情页
function gotoCounselorDetail(counselorId) {
  console.log('跳转到咨询师详情页，ID:', counselorId)
  uni.navigateTo({ 
    url: `/pages/counselor/detail?id=${counselorId}`,
    fail: (err) => {
      console.error('跳转失败:', err)
      uni.showToast({
        title: '页面跳转失败',
        icon: 'none'
      })
    },
    success: () => {
      console.log('跳转成功')
    }
  })
}

// 获取最新测评日期
function getLatestDate() {
  if (latestSasResult.value && latestSdsResult.value) {
    const sasDate = new Date(`${latestSasResult.value.date} ${latestSasResult.value.time}`)
    const sdsDate = new Date(`${latestSdsResult.value.date} ${latestSdsResult.value.time}`)
    return sasDate >= sdsDate ? latestSasResult.value.date : latestSdsResult.value.date
  }
  if (latestSasResult.value) return latestSasResult.value.date
  if (latestSdsResult.value) return latestSdsResult.value.date
  return ''
}

// 获取最新测评时间
function getLatestTime() {
  if (latestSasResult.value && latestSdsResult.value) {
    const sasDate = new Date(`${latestSasResult.value.date} ${latestSasResult.value.time}`)
    const sdsDate = new Date(`${latestSdsResult.value.date} ${latestSdsResult.value.time}`)
    return sasDate >= sdsDate ? latestSasResult.value.time : latestSdsResult.value.time
  }
  if (latestSasResult.value) return latestSasResult.value.time
  if (latestSdsResult.value) return latestSdsResult.value.time
  return ''
}

// 显示清空确认对话框
function showClearDialog() {
  uni.showModal({
    title: '确认清空历史记录',
    content: '此操作将永久删除所有历史测评记录，无法恢复。您确定要继续吗？',
    success: (res) => {
      if (res.confirm) {
        clearHistory()
      }
    }
  })
}

// 获取分数颜色类名
function getScoreColorClass(score, type) {
  if (type === "SAS") {
    // SAS焦虑自评量表评分标准
    if (score < 50) return "score-green"    // 正常
    if (score < 60) return "score-yellow"   // 轻度焦虑
    if (score < 70) return "score-purple"   // 中度焦虑  
    return "score-red"                      // 重度焦虑
  } else if (type === "SDS") {
    // SDS抑郁自评量表评分标准
    if (score < 53) return "score-green"    // 正常
    if (score < 63) return "score-yellow"   // 轻度抑郁
    if (score < 73) return "score-purple"   // 中度抑郁
    return "score-red"                      // 重度抑郁
  }
  // 默认颜色
  return "score-green"
}

// 获取类型背景类名
function getTypeBgClass(type) {
  return type === "SAS" ? "sas-bg" : "sds-bg"
}

// 获取类型徽章类名
function getTypeBadgeClass(type) {
  return type === "SAS" ? "sas-badge" : "sds-badge"
}

// 获取等级徽章颜色类名
function getLevelBadgeColor(level) {
  if (level === "正常") return "badge-green"
  if (level.includes("轻度")) return "badge-yellow"
  if (level.includes("中度")) return "badge-purple"
  return "badge-red"
}

// 查看详情
function viewDetail(record) {
  uni.showModal({
    title: '测评详情',
    content: `类型: ${record.typeName}\n分数: ${record.score}\n等级: ${record.level}\n时间: ${record.date} ${record.time}`,
    showCancel: false
  })
}
onMounted(() => {
  // 页面加载时获取实际的历史记录
  loadHistoryRecords()
})

// 页面显示时重新加载数据（从其他页面返回时）
onShow(() => {
  loadHistoryRecords()
})

</script>

<style scoped>
.results-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
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

/* 最近结果区域 */
.latest-results-section {
  background: #fff;
  padding: 32rpx;
}

.results-header {
  margin-bottom: 32rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #1f2937;
}

/* 双卡片网格 */
.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32rpx;
  margin-bottom: 32rpx;
}

.result-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.sas-card {
  border: 2rpx solid #ff9800;
  background: linear-gradient(135deg, #fffaf5 0%, #ffe8ce 100%);
}

.sds-card {
  border: 2rpx solid #2196f3;
  background: linear-gradient(135deg, #f8fcff 0%, #e6f4ff 100%);
}

.card-header {
  margin-bottom: 16rpx;
}

.card-title {
  font-size: 24rpx;
  font-weight: 500;
}

.sas-title {
  color: #ff9800;
}

.sds-title {
  color: #2196f3;
}

.card-content {
  text-align: center;
}

.score-number {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
  display: block;
}

.sas-score {
  color: #ff9800;
}

.sds-score {
  color: #2196f3;
}

.level-badge {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.badge-text {
  font-size: 20rpx;
  font-weight: 500;
}

.trend-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.trend-icon {
  font-size: 20rpx;
}

.trend-text {
  font-size: 20rpx;
  color: #6b7280;
}

/* 测评时间 */
.assessment-time {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 32rpx;
  color: #6b7280;
  font-size: 28rpx;
}

.time-icon {
  font-size: 28rpx;
}

/* 专业建议卡片 */
.suggestion-card {
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  border: 2rpx solid #93c5fd;
  border-radius: 16rpx;
  padding: 32rpx;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.suggestion-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1e40af;
}

.suggestion-status {
  background: rgba(30, 64, 175, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.status-text {
  font-size: 20rpx;
  color: #1e40af;
}

.suggestion-content {
  font-size: 26rpx;
  color: #1e3a8a;
  line-height: 1.6;
}

/* 分隔线 */
.section-divider {
  height: 16rpx;
  background: #e5e7eb;
}

/* 咨询师推荐区域 */
.counselor-section {
  background: #fff;
  padding: 32rpx;
}

.section-header {
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1f2937;
}

.counselor-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.counselor-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.counselor-card:active {
  transform: translateY(2rpx);
  box-shadow: 0 1rpx 4rpx rgba(0,0,0,0.1);
}

.featured-counselor {
  border: 2rpx solid #10b981;
}

/* 推荐原因标签 */
.recommend-reason {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: #10b981;
  border-radius: 12rpx;
  padding: 6rpx 16rpx;
}

.reason-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: 500;
}

.counselor-content {
  display: flex;
  gap: 24rpx;
}

.counselor-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #6b7280;
}

.counselor-info {
  flex: 1;
}

.counselor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.counselor-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.star-icon {
  font-size: 24rpx;
}

.rating-text {
  font-size: 26rpx;
  color: #6b7280;
}

.counselor-level {
  font-size: 26rpx;
  color: #6b7280;
  margin-bottom: 8rpx;
}

.counselor-specialty {
  font-size: 24rpx;
  color: #6b7280;
}

/* 历史记录区域 */
.history-section {
  background: #fff;
  padding: 32rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #ef4444;
}

.clear-icon {
  font-size: 24rpx;
}

.clear-text {
  font-size: 26rpx;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 96rpx 0;
}

.empty-title {
  font-size: 28rpx;
  color: #9ca3af;
  margin-bottom: 8rpx;
  display: block;
}

.empty-subtitle {
  font-size: 24rpx;
  color: #6b7280;
}

/* 历史记录列表 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.history-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.05);
}

.sas-bg {
  background: linear-gradient(135deg, #fffaf5 0%, #ffe8ce 100%);
  border: 2rpx solid #ffcc80;
}

.sds-bg {
  background: linear-gradient(135deg, #f8fcff 0%, #e6f4ff 100%);
  border: 2rpx solid #90caf9;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.type-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.type-badge {
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: 500;
}

.sas-badge {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.sds-badge {
  background: rgba(33, 150, 243, 0.08);
  color: #2196f3;
}

.type-name {
  font-size: 26rpx;
  color: #6b7280;
}

.date-time-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #6b7280;
}

.date-icon, .time-icon {
  font-size: 24rpx;
}

.history-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-info {
  display: flex;
  align-items: center;
  gap: 64rpx;
}

.score-display, .level-display {
  text-align: center;
}

.score-value {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 4rpx;
}

.score-green { color: #059669; }
.score-yellow { color: #ffd505; }
.score-purple { color: #a21caf; }
.score-orange { color: #ea580c; }
.score-red { color: #dc2626; }

.score-label, .level-label {
  font-size: 20rpx;
  color: #6b7280;
}

.level-badge {
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  margin-bottom: 4rpx;
  display: inline-block;
}

.level-text {
  font-size: 20rpx;
  font-weight: 500;
}

.badge-green { background: #d1fae5; color: #059669; }
.badge-yellow { background: #fef3c7; color: #d97706; }
.badge-purple { background: #f3e8ff; color: #a21caf; }
.badge-orange { background: #fed7aa; color: #ea580c; }
.badge-red { background: #fecaca; color: #dc2626; }
.badge-gray { background: #f3f4f6; color: #6b7280; }

.detail-btn {
  background: #f9fafb;
  color: #6b7280;
  padding: 16rpx 32rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.detail-text {
  color: #6b7280;
}
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

.nav-item.active {
  background: rgba(236, 64, 122, 0.1);
}

.nav-icon {
  font-size: 36rpx; /* 大号字体 */
  margin-bottom: 8rpx;
  color: #666;
}

.nav-item.active .nav-icon {
  color: #ec407a;
}

.nav-label {
  font-size: 20rpx; /* 小号字体 */
  color: #666;
  text-align: center;
  font-weight: 400;
  letter-spacing: 0.5rpx;
}

.nav-item.active .nav-label {
  color: #ec407a;
  font-weight: 500;
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
