<template>
  <view class="counselor-detail">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载中...</text>
    </view>
      <!-- 顶部导航 -->
      <view class="header">
        <view class="back-btn" @click="goBack">
          <text class="icon">←</text>
        </view>
      </view>

    <!-- 咨询师头像 -->
    <view class="profile-image-section">
      <image class="profile-image" :src="counselor.avatar || '/static/logo.png'" mode="aspectFill" />
      
      <!-- 服务保障横幅 -->
      <view class="guarantee-banner">
        <view class="guarantee-item">
          <text class="guarantee-icon">🛡️</text>
          <text>免费退款</text>
        </view>
        <view class="guarantee-item">
          <text class="guarantee-icon">🛡️</text>
          <text>严选咨询师</text>
        </view>
        <view class="guarantee-item">
          <text class="guarantee-icon">🛡️</text>
          <text>隐私保障</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 咨询师信息 -->
    <view class="profile-info">
      <view class="name-price">
        <text class="name">{{ counselor.name }}</text>
        <view class="price">
          <text class="price-number">{{ counselor.price }}</text>
          <text class="price-unit">元/节起</text>
        </view>
      </view>

      <view class="credentials">
        <text v-for="(credential, index) in (counselor.credentials || [])" :key="index" class="credential">
          {{ credential }}
        </text>
      </view>

      <view class="location-availability">
        <view class="location">
          <text class="icon">📍</text>
          <text>{{ counselor.location || '未知地区' }}</text>
        </view>
      </view>

      <view class="service-badge">
        <text class="icon">🛡️</text>
        <text>服务经验 | 2025年通过年审 ›</text>
      </view>
    </view>

    <!-- 统计数据 -->
    <view class="statistics-card">
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-number">{{ counselor.stats?.caseHours || 0 }}</text>
          <text class="stat-label">个案时长</text>
          <text class="stat-unit">小时</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ counselor.stats?.experience || 0 }}</text>
          <text class="stat-label">从业年限</text>
          <text class="stat-unit">年</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ counselor.stats?.trainingHours || 0 }}</text>
          <text class="stat-label">受训时长</text>
          <text class="stat-unit">小时</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ counselor.stats?.supervisionHours || 0 }}</text>
          <text class="stat-label">督导时长</text>
          <text class="stat-unit">小时</text>
        </view>
      </view>
    </view>

    <!-- 个人简介 -->
    <view v-if="counselor.bio" class="profile-section">
      <view class="section-header">
        <text class="section-title">个人简介</text>
      </view>
      <view class="bio-content">
        <text class="bio-text">{{ counselor.bio }}</text>
      </view>
    </view>

    <!-- 咨询方式 -->
    <view v-if="counselor.consultationMethods && counselor.consultationMethods.length > 0" class="profile-section">
      <view class="section-header">
        <text class="section-title">咨询方式</text>
      </view>
      <view class="consultation-methods">
        <view 
          v-for="(method, index) in counselor.consultationMethods"
          :key="index"
          class="method-item"
        >
          <text class="method-text">{{ method }}</text>
        </view>
      </view>
    </view>

    <!-- 时间安排 -->
    <view v-if="counselor.availability" class="profile-section">
      <view class="section-header">
        <text class="section-title">时间安排</text>
      </view>
      <view class="availability-content">
        <view class="availability-item">
          <text class="availability-icon">🕐</text>
          <text class="availability-text">{{ counselor.availability }}</text>
        </view>
      </view>
    </view>

    <!-- 教育背景 -->
    <view v-if="counselor.educationList && counselor.educationList.length > 0" class="profile-section">
      <view class="section-header">
        <text class="section-title">教育背景</text>
      </view>
      <view class="education-list">
        <view 
          v-for="(education, index) in counselor.educationList"
          :key="index"
          class="education-item"
        >
          <view class="education-header">
            <view class="education-degree-section">
              <text class="education-degree">{{ education.degree }}</text>
              <text class="education-year">{{ education.year }}</text>
            </view>
            <view class="education-icon">🎓</view>
          </view>
          <view class="education-details">
            <text class="education-school">{{ education.school }}</text>
            <text class="education-major">{{ education.major }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 工作经历 -->
    <view v-if="counselor.experienceList && counselor.experienceList.length > 0" class="profile-section">
      <view class="section-header">
        <text class="section-title">工作经历</text>
      </view>
      <view class="experience-list">
        <view 
          v-for="(exp, index) in counselor.experienceList"
          :key="index"
          class="experience-item"
        >
          <view class="experience-header">
            <view class="experience-company-section">
              <text class="experience-company">{{ exp.company }}</text>
              <text class="experience-duration">{{ exp.duration }}</text>
            </view>
            <view class="experience-icon">💼</view>
          </view>
          <view class="experience-details">
            <text class="experience-position">{{ exp.position }}</text>
            <text class="experience-description">{{ exp.description }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 执业资质 -->
    <view v-if="counselor.certificatesList && counselor.certificatesList.length > 0" class="profile-section">
      <view class="section-header">
        <text class="section-title">执业资质</text>
      </view>
      <view class="certificates-list">
        <view 
          v-for="(cert, index) in counselor.certificatesList"
          :key="index"
          class="certificate-item"
        >
          <view class="certificate-header">
            <view class="certificate-name-section">
              <text class="certificate-name">{{ cert.name }}</text>
              <text class="certificate-issuer">{{ cert.issuer }}</text>
            </view>
            <view class="certificate-icon">📜</view>
          </view>
          <view class="certificate-details">
            <text class="certificate-number">证书编号：{{ cert.number }}</text>
            <text class="certificate-date">获得时间：{{ cert.date }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 咨询感受 -->
    <view class="consultation-topics">
      <view class="section-header">
        <text class="section-title">咨询感受</text>
        <view class="view-all" @click="viewAllTopics">
          <text>{{ showAllTopics ? '收起 ˄' : '查看全部 ›' }}</text>
        </view>
      </view>

      <view class="topics-grid">
        <view v-for="(topic, index) in (showAllTopics ? (counselor.topics || []) : (counselor.topics || []).slice(0, 6))" :key="index" class="topic-item">
          <text class="topic-name">{{ topic.name }}</text>
          <text class="topic-count">{{ topic.count }}</text>
        </view>
      </view>
    </view>

    <!-- 用户评价 -->
    <view class="reviews-section">
      <view v-for="(review, index) in (counselor.reviews || [])" :key="index" class="review-card">
        <view class="review-header">
          <view class="user-info">
            <view class="avatar">
              <text>{{ review.avatar }}</text>
            </view>
            <text class="username">{{ review.username }}</text>
            <text class="condition">{{ review.condition }}</text>
          </view>
          <text class="date">{{ review.date }}</text>
        </view>
        <text class="review-content">
          {{ expandedReviews.has(index) && review.fullContent ? review.fullContent : review.content }}
        </text>
        <text v-if="review.expandable" class="expand-btn" @click="toggleReviewExpand(index)">
          {{ expandedReviews.has(index) ? '收起 ˄' : '展开 ˅' }}
        </text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <button class="action-btn secondary" style="flex: 1;" disabled>
        <text style="font-size: 25rpx;">服务热线：1998983938</text>
      </button>
      <button class="action-btn primary" @click="makeAppointment">
        立即预约
      </button>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-spacer"></view>

    <!-- 预约模态框 -->
    <view v-if="showAppointmentModal" class="appointment-modal-overlay" @click="cancelAppointment">
      <view class="appointment-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">预约咨询</text>
          <text class="modal-close" @click="cancelAppointment">×</text>
        </view>
        
        <view class="modal-content">
          <view class="form-section">
            <text class="form-label">开始时间</text>
            <view class="datetime-row">
              <picker mode="date" :value="appointmentData.startDate" @change="(e) => appointmentData.startDate = e.detail.value" class="date-picker">
                <view class="picker-input">
                  <text>{{ appointmentData.startDate || '选择咨询日期' }}</text>
                </view>
              </picker>
              <picker mode="time" :value="appointmentData.startTime" @change="(e) => appointmentData.startTime = e.detail.value" class="time-picker">
                <view class="picker-input">
                  <text>{{ appointmentData.startTime || '选择开始时间' }}</text>
                </view>
              </picker>
            </view>
          </view>
          
          <view class="form-section">
            <text class="form-label">咨询时长</text>
            <picker 
              mode="selector" 
              :range="durationOptions.map(item => item.label)"
              :value="durationOptions.findIndex(item => item.value === appointmentData.duration)"
              @change="(e) => appointmentData.duration = durationOptions[e.detail.value].value"
              class="duration-picker"
            >
              <view class="picker-input">
                <text>{{ durationOptions.find(item => item.value === appointmentData.duration)?.label || '选择时长' }}</text>
              </view>
            </picker>
          </view>
          
          <view v-if="counselor.availability" class="form-section">
            <text class="form-label">咨询师工作时间</text>
            <view class="availability-info">
              <text class="availability-text">{{ counselor.availability }}</text>
            </view>
          </view>
          
          <view class="form-section">
            <text class="form-label">备注</text>
            <textarea 
              v-model="appointmentData.note" 
              class="note-input" 
              placeholder="请输入预约备注（可选）"
              maxlength="200"
            ></textarea>
          </view>
        </view>
        
        <view class="modal-actions">
          <button class="cancel-btn" @click="cancelAppointment">取消</button>
          <button 
            class="confirm-btn" 
            @click="confirmAppointment"
            :disabled="isSubmittingAppointment"
          >
            {{ isSubmittingAppointment ? '提交中...' : '确认预约' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { counselorAPI, userAPI, BASE_URL } from '@/utils/api.js'
import { goBack} from '@/utils/page-turning.js'

const showAllTopics = ref(false)
const expandedReviews = ref(new Set()) // 管理展开的评论
const counselor = ref({})
const loading = ref(false)

// 预约相关数据
const showAppointmentModal = ref(false)
const appointmentData = ref({
  startDate: '',
  startTime: '',
  duration: 30, // 默认30分钟
  note: ''
})
const isSubmittingAppointment = ref(false)

// 时长选项（30分钟为单位）
const durationOptions = [
  { value: 30, label: '30分钟' },
  { value: 60, label: '1小时' },
  { value: 90, label: '1.5小时' },
  { value: 120, label: '2小时' },
  { value: 150, label: '2.5小时' },
  { value: 180, label: '3小时' },
  { value: 210, label: '3.5小时' },
  { value: 240, label: '4小时' },
  { value: 270, label: '4.5小时' },
  { value: 300, label: '5小时' },
  { value: 330, label: '5.5小时' },
  { value: 360, label: '6小时' }
]

onMounted(async () => {
  loading.value = true
  console.log('=== 开始加载咨询师详情 ===')
  
  try {
    // 获取当前页面参数id
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options
    const id = options.id || options.counselorId || options.name
    console.log('获取到的咨询师ID:', id)
    console.log('页面参数:', options)
    
    // 获取所有咨询师
    console.log('开始获取咨询师列表...')
    const list = await counselorAPI.getCounselorList()

    // 查找对应咨询师
    const found = Array.isArray(list) ? list.find(item => {
      return String(item.id) === String(id)
    }) : null
    
    console.log('找到的咨询师:', found)
    
    if (found) {
      counselor.value = {
        id: found.id,
        name: found.name || '咨询师',
        avatar: `${BASE_URL}/static/${found.avatar || `user/avatars/default.jpg`}`,
        price: found.pricePerHour || found.price || 0,
        location: found.location || '未知地区',
        bio: found.bio || '',
        credentials: found.credentials || [],
        consultationMethods: found.consultationMethods || [],
        availability: found.availability || '',
        educationList: found.educationList || [],
        experienceList: found.experienceList || [],
        certificatesList: found.certificationList || [],
        stats: {
          caseHours: found.consultationHours || 0,
          experience: found.experienceYears || 0,
          trainingHours: found.trainingHours || 0,
          supervisionHours: found.supervisionHours || 0
        },
        topics: found.specialty || [],
        reviews: found.reviews || []
      }
      console.log('咨询师详情加载成功:', counselor.value)
    } 
    else {
      console.log('未找到对应咨询师')
    }
  } catch (e) {
    console.error('加载咨询师详情失败:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})

function makeAppointment() {
  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  // 显示预约模态框
  showAppointmentModal.value = true
}

function viewAllTopics() {
  // 切换显示所有咨询感受主题的状态
  showAllTopics.value = !showAllTopics.value
  
  uni.showToast({
    title: showAllTopics.value ? '已展开全部' : '已收起',
    icon: 'success',
    duration: 1000
  })
}

function toggleReviewExpand(reviewIndex) {
  // 切换评论展开状态
  if (expandedReviews.value.has(reviewIndex)) {
    expandedReviews.value.delete(reviewIndex)
  } else {
    expandedReviews.value.add(reviewIndex)
  }
  
  // 触发响应式更新
  expandedReviews.value = new Set(expandedReviews.value)
}

// 取消预约
function cancelAppointment() {
  showAppointmentModal.value = false
  // 重置表单数据
  appointmentData.value = {
    startDate: '',
    startTime: '',
    duration: 30,
    note: ''
  }
}

// 验证时间是否在咨询师工作范围内
function isTimeInWorkingHours(startTime, endTime) {
  if (!counselor.value.availability) {
    return true // 如果没有工作时间限制，默认通过
  }
  
  // 这里可以根据 availability 字符串解析工作时间
  // 示例：解析 "周一至周五 9:00-18:00，周末 10:00-16:00"
  const startDateTime = new Date(`${appointmentData.value.startDate} ${startTime}`)
  const endDateTime = new Date(`${appointmentData.value.startDate} ${endTime}`)
  const dayOfWeek = startDateTime.getDay() // 0=周日, 1=周一, ..., 6=周六
  
  // 简单验证：工作日 9:00-18:00，周末 10:00-16:00
  if (dayOfWeek >= 1 && dayOfWeek <= 5) { // 周一到周五
    const startHour = startDateTime.getHours()
    const endHour = endDateTime.getHours()
    return startHour >= 9 && endHour <= 18
  } else { // 周末
    const startHour = startDateTime.getHours()
    const endHour = endDateTime.getHours()
    return startHour >= 10 && endHour <= 16
  }
}

// 计算结束时间
function calculateEndTime(startTime, durationMinutes) {
  const [hours, minutes] = startTime.split(':').map(Number)
  const startDate = new Date()
  startDate.setHours(hours, minutes, 0, 0)
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000)
  return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`
}

// 确认预约
async function confirmAppointment() {
  // 表单验证
  if (!appointmentData.value.startDate || !appointmentData.value.startTime) {
    uni.showToast({
      title: '请选择开始时间',
      icon: 'none'
    })
    return
  }
  // 禁止预约过去的日期
  const now = new Date()
  const selectedDateTime = new Date(`${appointmentData.value.startDate} ${appointmentData.value.startTime}:00`)
  if (selectedDateTime < now) {
    uni.showToast({
      title: '不能预约已过去的时间',
      icon: 'none'
    })
    return
  }
  // 计算结束时间
  const endTime = calculateEndTime(appointmentData.value.startTime, appointmentData.value.duration)
  
  // 验证时间是否在工作范围内
  if (!isTimeInWorkingHours(appointmentData.value.startTime, endTime)) {
    uni.showToast({
      title: '选择的时间不在咨询师工作时间范围内',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  // 构造请求数据
  const requestData = {
    consultantId: parseInt(counselor.value.id),
    startTime: `${appointmentData.value.startDate} ${appointmentData.value.startTime}:00`,
    endTime: `${appointmentData.value.startDate} ${endTime}:00`,
    note: appointmentData.value.note || ''
  }
  
  console.log('预约请求数据:', requestData)
  
  isSubmittingAppointment.value = true
  
  try {
    const response = await userAPI.createAppointment(requestData)
    console.log('预约响应:', response)
    
    uni.showToast({
      title: '预约成功',
      icon: 'success'
    })
    
    // 关闭模态框并重置数据
    cancelAppointment()
    
  } catch (error) {
    console.error('预约失败:', error)
    uni.showToast({
      title: '预约失败，请稍后重试',
      icon: 'none'
    })
  } finally {
    isSubmittingAppointment.value = false
  }
}
</script>

<style scoped>
.counselor-detail {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #e0e0e0;
  border-top: 6rpx solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 32rpx;
  background: #fff;
  font-size: 28rpx;
  color: #333;
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

/* 顶部导航 */
.header {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  cursor: pointer;
}

.back-btn .icon {
  font-size: 48rpx;
  color: #333;
}

/* 头像区域 */
.profile-image-section {
  position: relative;
}

.profile-image {
  width: 100%;
  height: 512rpx;
  background: linear-gradient(180deg, #f0f0f0 0%, #e0e0e0 100%);
}

.guarantee-banner {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, #fff3cd, #ffeaa7);
  padding: 16rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48rpx;
  font-size: 28rpx;
}

.guarantee-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.guarantee-icon {
  color: #28a745;
}

.arrow {
  font-size: 32rpx;
  color: #666;
}

/* 咨询师信息 */
.profile-info {
  background: #fff;
  padding: 32rpx;
}

.name-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.name {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

.price {
  text-align: right;
}

.price-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #ff6b35;
}

.price-unit {
  font-size: 28rpx;
  color: #999;
}

.credentials {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
  font-size: 28rpx;
  color: #666;
}

.credential {
  margin-right: 16rpx;
}

.location-availability {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  font-size: 28rpx;
}

.location {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.location .icon {
  font-size: 32rpx;
  color: #999;
}

.service-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #ff6b35;
}

/* 统计数据 */
.statistics-card {
  background: #fff;
  margin: 32rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32rpx;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 4rpx;
}

.stat-unit {
  font-size: 24rpx;
  color: #ccc;
}

/* 咨询感受 */
.consultation-topics {
  background: #fff;
  margin: 32rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
}

.view-all {
  font-size: 28rpx;
  color: #007aff;
  cursor: pointer;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  transition: background-color 0.2s;
}

.view-all:hover {
  background-color: rgba(0, 122, 255, 0.1);
}

.view-all:active {
  background-color: rgba(0, 122, 255, 0.2);
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  transition: all 0.3s ease;
}

.topic-item {
  background: #f8f9fa;
  padding: 24rpx;
  border-radius: 12rpx;
  text-align: center;
}

.topic-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.topic-count {
  font-size: 24rpx;
  color: #999;
}

/* 用户评价 */
.reviews-section {
  padding: 0 32rpx;
  margin-bottom: 32rpx;
}

.review-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #e3f2fd;
  color: #1976d2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
}

.username {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.condition {
  font-size: 24rpx;
  color: #666;
  background: #f0f0f0;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.date {
  font-size: 24rpx;
  color: #999;
}

.review-content {
  font-size: 30rpx;
  line-height: 1.6;
  color: #333;
  margin-bottom: 16rpx;
}

.expand-btn {
  font-size: 28rpx;
  color: #007aff;
  cursor: pointer;
}

/* 新增部分样式 */
.profile-section {
  background: #fff;
  margin: 32rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.bio-content {
  padding: 24rpx 0;
}

.bio-text {
  font-size: 30rpx;
  line-height: 1.6;
  color: #333;
}

/* 咨询方式样式 */
.consultation-methods {
  margin-top: 24rpx;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 12rpx;
}

.method-icon {
  font-size: 32rpx;
  color: #007aff;
}

.method-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

/* 时间安排样式 */
.availability-content {
  margin-top: 24rpx;
}

.availability-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
}

.availability-icon {
  font-size: 32rpx;
  color: #28a745;
}

.availability-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.5;
}

/* 教育背景样式 */
.education-list {
  margin-top: 24rpx;
}

.education-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.education-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.education-degree-section {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.education-degree {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.education-year {
  font-size: 26rpx;
  color: #666;
}

.education-icon {
  font-size: 40rpx;
}

.education-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.education-school {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.education-major {
  font-size: 26rpx;
  color: #666;
}

/* 工作经历样式 */
.experience-list {
  margin-top: 24rpx;
}

.experience-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.experience-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.experience-company-section {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.experience-company {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.experience-duration {
  font-size: 26rpx;
  color: #666;
}

.experience-icon {
  font-size: 40rpx;
}

.experience-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.experience-position {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.experience-description {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

/* 执业资质样式 */
.certificates-list {
  margin-top: 24rpx;
}

.certificate-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.certificate-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.certificate-name-section {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.certificate-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.certificate-issuer {
  font-size: 26rpx;
  color: #666;
}

.certificate-icon {
  font-size: 40rpx;
}

.certificate-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.certificate-number,
.certificate-date {
  font-size: 26rpx;
  color: #666;
}

.condition {
  font-size: 24rpx;
  color: #999;
}

.date {
  font-size: 24rpx;
  color: #ccc;
}

.review-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.expand-btn {
  font-size: 28rpx;
  color: #007aff;
  cursor: pointer;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  transition: background-color 0.2s;
  display: inline-block;
  margin-top: 8rpx;
}

.expand-btn:hover {
  background-color: rgba(0, 122, 255, 0.1);
}

.expand-btn:active {
  background-color: rgba(0, 122, 255, 0.2);
}

/* 底部操作栏 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1rpx solid #eee;
  padding: 32rpx;
  display: flex;
  gap: 24rpx;
  z-index: 1000;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.action-btn.secondary {
  background: transparent;
  color: #333;
  border: 2rpx solid #ddd;
}

.action-btn.primary {
  background: #007aff;
  color: #fff;
}

.action-btn.primary:active {
  opacity: 0.8;
}

.action-btn .icon {
  font-size: 32rpx;
}

/* 底部占位 */
.bottom-spacer {
  height: 160rpx;
}

/* 预约模态框样式 */
.appointment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 32rpx;
}

.appointment-modal {
  background: #fff;
  border-radius: 16rpx;
  width: 100%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 48rpx;
  color: #999;
  cursor: pointer;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  padding: 32rpx;
}

.form-section {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.datetime-row {
  display: flex;
  gap: 16rpx;
}

.date-picker,
.time-picker,
.duration-picker {
  flex: 1;
}

.picker-input {
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
  border-radius: 8rpx;
  padding: 20rpx 16rpx;
  font-size: 28rpx;
  color: #333;
}

.picker-input text {
  color: #333;
}

.availability-info {
  background: #e8f4f8;
  border: 1rpx solid #bee5eb;
  border-radius: 8rpx;
  padding: 16rpx;
}

.availability-text {
  font-size: 26rpx;
  color: #0c5460;
  line-height: 1.4;
}

.note-input {
  width: 100%;
  min-height: 120rpx;
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
  border-radius: 8rpx;
  padding: 16rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 32rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
}

.confirm-btn {
  background: #007aff;
  color: #fff;
}

.confirm-btn:disabled {
  background: #ccc;
  color: #999;
}
</style>