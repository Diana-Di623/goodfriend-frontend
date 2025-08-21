<template>
  <view class="appointments-page">

    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <view class="nav-left"></view>
        <text class="title">我的预约</text>
        <view class="nav-right">
          <text class="counselor-badge">咨询师</text>
        </view>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-section">
      <view class="stats-container">
        <view class="stat-item">
          <text class="stat-number">{{ todayAppointments }}</text>
          <text class="stat-label">今日预约</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ weekAppointments }}</text>
          <text class="stat-label">本周预约</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ totalAppointments }}</text>
          <text class="stat-label">累计咨询</text>
        </view>
      </view>
    </view>

    <!-- 预约列表 -->
    <view class="appointments-section">
      <view class="section-header">
        <text class="section-title">预约列表</text>
        <view class="filter-tabs">
          <view 
            v-for="filter in filterOptions"
            :key="filter.value"
            class="filter-tab"
            :class="{ active: currentFilter === filter.value }"
            @click="switchFilter(filter.value)"
          >
            <text class="filter-text">{{ filter.label }}</text>
          </view>
        </view>
      </view>

      <scroll-view scroll-y class="appointments-list">
        <view v-if="filteredAppointments.length === 0" class="empty-state">
          <text class="empty-icon">📅</text>
          <text class="empty-text">暂无{{ getCurrentFilterLabel() }}预约</text>
        </view>
        
        <view 
          v-for="appointment in filteredAppointments"
          :key="appointment.id"
          class="appointment-card"
          @click="viewAppointmentDetail(appointment)"
        >
          <view class="appointment-header">
            <view class="user-info">
              <image 
                :src="appointment.userAvatar || '/static/logo.png'" 
                class="user-avatar"
              />
              <view class="user-details">
                <text class="user-name">预约 #{{ appointment.id }}</text>
                <text class="user-tag">咨询师：{{ appointment.consultantName }}</text>
              </view>
            </view>
            <view class="appointment-status" :class="appointment.status">
              <text class="status-text">{{ getStatusText(appointment.status) }}</text>
            </view>
          </view>
          
          <view class="appointment-info">
            <view class="info-row">
              <text class="info-icon">📅</text>
              <text class="info-text">{{ formatDate(appointment.startTime) }} {{ formatTimeRange(appointment.startTime, appointment.endTime) }}</text>
            </view>
            <view class="info-row">
              <text class="info-icon">💭</text>
              <text class="info-text">{{ appointment.note || '无备注' }}</text>
            </view>
            <view class="info-row">
              <text class="info-icon">⏱️</text>
              <text class="info-text">{{ appointment.duration }}分钟</text>
            </view>
          </view>

          <view class="appointment-actions">
            <button 
              v-if="appointment.status === 'PENDING'"
              class="action-btn confirm-btn"
              @click.stop="confirmAppointment(appointment.id)"
            >
              确认接诊
            </button>
            <button 
              v-if="appointment.status === 'PENDING' || appointment.status === 'CONFIRMED'"
              class="action-btn cancel-btn"
              @click.stop="cancelAppointment(appointment.id)"
            >
              取消预约
            </button>
            <button 
              class="action-btn detail-btn"
              @click.stop="viewAppointmentDetail(appointment)"
            >
              查看详情
            </button>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 底部导航栏 -->
    <view class="bottom-nav">
      <view class="nav-item active">
        <text class="nav-icon">📅</text>
        <text class="nav-label">我的预约</text>
      </view>
      <view class="nav-item" @click="goCounselorProfile">
        <text class="nav-icon">👨‍⚕️</text>
        <text class="nav-label">个人简历</text>
      </view>
    </view>

    <!-- 预约详情弹窗 -->
    <view v-if="showDetailModal" class="detail-modal">
      <view class="modal-overlay" @click="closeDetailModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">预约详情</text>
          <view class="close-btn" @click="closeDetailModal">✕</view>
        </view>
        
        <scroll-view scroll-y class="modal-body">
          <view class="detail-section">
            <text class="section-title">用户信息</text>
            <view class="user-profile">
              <image 
                :src="selectedAppointment?.userAvatar || '/static/logo.png'" 
                class="profile-avatar"
              />
              <view class="profile-info">
                <text class="profile-name">预约 #{{ selectedAppointment?.id }}</text>
                <text class="profile-details">咨询师：{{ selectedAppointment?.consultantName }}</text>
                <text class="profile-phone">创建时间：{{ formatDate(selectedAppointment?.createdAt) }}</text>
              </view>
            </view>
          </view>

          <view class="detail-section">
            <text class="section-title">预约信息</text>
            <view class="detail-item">
              <text class="detail-label">预约时间</text>
              <text class="detail-value">{{ formatDate(selectedAppointment?.startTime) }} {{ formatTimeRange(selectedAppointment?.startTime, selectedAppointment?.endTime) }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">问题描述</text>
              <text class="detail-value">{{ selectedAppointment?.note || '无备注' }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">预约状态</text>
              <text class="detail-value">{{ getStatusText(selectedAppointment?.status) }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">咨询方式</text>
              <text class="detail-value">{{ selectedAppointment?.method }}</text>
            </view>
          </view>

          <view class="detail-section" v-if="selectedAppointment?.testResults?.length > 0">
            <text class="section-title">近期测评结果</text>
            <view 
              v-for="result in selectedAppointment.testResults"
              :key="result.id"
              class="test-result-item"
            >
              <view class="test-header">
                <text class="test-name">{{ result.testName }}</text>
                <text class="test-date">{{ formatDate(result.createdAt) }}</text>
              </view>
              <text class="test-score">得分：{{ result.score }}</text>
            </view>
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <button class="modal-btn cancel-modal-btn" @click="closeDetailModal">关闭</button>
          <button 
            v-if="selectedAppointment?.status === 'PENDING'"
            class="modal-btn confirm-btn"
            @click="confirmAppointment(selectedAppointment.id)"
          >
            确认接诊
          </button>
          <button 
            v-if="selectedAppointment?.status === 'PENDING' || selectedAppointment?.status === 'CONFIRMED'"
            class="modal-btn cancel-appointment-btn"
            @click="cancelAppointment(selectedAppointment.id)"
          >
            取消预约
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { counselorAPI } from '@/utils/api.js'

// 过滤选项
const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已完成', value: 'completed' }
]

const currentFilter = ref('all')

// 预约详情弹窗
const showDetailModal = ref(false)
const selectedAppointment = ref(null)

// 模拟预约数据
const appointments = ref([])
const loading = ref(false)

// 统计数据
const todayAppointments = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return appointments.value.filter(apt => {
    if (!apt.startTime) return false
    const appointmentDate = new Date(apt.startTime).toISOString().split('T')[0]
    return appointmentDate === today
  }).length
})

const weekAppointments = computed(() => {
  const today = new Date()
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
  
  return appointments.value.filter(apt => {
    if (!apt.startTime) return false
    const aptDate = new Date(apt.startTime)
    return aptDate >= weekStart && aptDate <= weekEnd
  }).length
})

const totalAppointments = computed(() => {
  return appointments.value.filter(apt => apt.status === 'COMPLETED').length
})

// 过滤后的预约列表
const filteredAppointments = computed(() => {
  if (currentFilter.value === 'all') {
    return appointments.value
  }
  // 映射过滤器值到API状态
  const statusMap = {
    'pending': 'PENDING',
    'confirmed': 'CONFIRMED', 
    'completed': 'COMPLETED',
    'cancelled': 'CANCELLED'
  }
  const apiStatus = statusMap[currentFilter.value] || currentFilter.value.toUpperCase()
  return appointments.value.filter(apt => apt.status === apiStatus)
})

onMounted(() => {
  loadAppointments()
})

// 加载预约数据
async function loadAppointments() {
  try {
    loading.value = true
    const response = await counselorAPI.listMyAppointments()
    appointments.value = response || []
    console.log('咨询师预约列表:', appointments.value)
  } catch (error) {
    console.error('获取预约列表失败:', error)
    uni.showToast({
      title: '获取预约列表失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 切换过滤器
function switchFilter(filter) {
  currentFilter.value = filter
}

// 获取当前过滤器标签
function getCurrentFilterLabel() {
  const current = filterOptions.find(opt => opt.value === currentFilter.value)
  return current ? current.label : '全部'
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    'PENDING': '待确认',
    'CONFIRMED': '已确认',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

// 格式化时间
function formatTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 格式化日期
function formatDate(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}-${day}`
}

// 格式化时间段
function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return ''
  return `${formatTime(startTime)}-${formatTime(endTime)}`
}

// 确认预约
async function confirmAppointment(appointmentId) {
  uni.showModal({
    title: '确认接诊',
    content: '确定要接诊这个预约吗？',
    success: async (res) => {
      if (res) {
        try {
          await counselorAPI.confirmMyAppointments(appointmentId)
          // 更新本地状态
          const appointment = appointments.value.find(apt => apt.id === appointmentId)
          if (appointment) {
            appointment.status = 'CONFIRMED'
          }
          uni.showToast({
            title: '预约已确认',
            icon: 'success'
          })
          closeDetailModal()
          // 重新加载数据，确保和后端同步
          await loadAppointments()
        } catch (error) {
          console.error('确认预约失败:', error)
          uni.showToast({
            title: '确认失败',
            icon: 'none'
          })
        }
      }
    }
  })
}
// 取消预约
function cancelAppointment(appointmentId) {
  uni.showModal({
    title: '取消预约',
    content: '', // 不要正文内容
    editable: true,
    placeholderText: '请输入取消原因', // 只用placeholder
    success: async (res) => {
      if (res.confirm) {
        const reason = res.content || '咨询师取消'
        try {
          await counselorAPI.cancelMyAppointments(appointmentId, reason)
          // 更新本地状态
          const appointment = appointments.value.find(apt => apt.id === appointmentId)
          if (appointment) {
            appointment.status = 'CANCELLED'
          }
          uni.showToast({
            title: '预约已取消',
            icon: 'success'
          })
          closeDetailModal()
          // 重新加载数据
          await loadAppointments()
        } catch (error) {
          console.error('取消预约失败:', error)
          uni.showToast({
            title: '取消失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 查看预约详情
function viewAppointmentDetail(appointment) {
  selectedAppointment.value = appointment
  showDetailModal.value = true
}

// 关闭详情弹窗
function closeDetailModal() {
  showDetailModal.value = false
  selectedAppointment.value = null
}

// 跳转到咨询师个人简历
function goCounselorProfile() {
  uni.navigateTo({
    url: '/pages/counselor/profile'
  })
}
</script>

<style scoped>
.appointments-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 120rpx;
}

.header {
  background: #fff;
  padding: 44rpx 32rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  width: 100rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
}

.nav-right {
  width: 100rpx;
  display: flex;
  justify-content: flex-end;
}

.counselor-badge {
  background: linear-gradient(135deg, #ec407a, #ab47bc);
  color: #fff;
  font-size: 20rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-weight: 500;
}

.stats-section {
  padding: 32rpx;
}

.stats-container {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 48rpx;
  font-weight: 700;
  color: #ec407a;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.appointments-section {
  flex: 1;
  padding: 0 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.filter-tabs {
  display: flex;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 4rpx;
}

.filter-tab {
  padding: 12rpx 24rpx;
  border-radius: 6rpx;
  transition: all 0.3s;
}

.filter-tab.active {
  background: #ec407a;
}

.filter-text {
  font-size: 24rpx;
  color: #666;
}

.filter-tab.active .filter-text {
  color: #fff;
}

.appointments-list {
  max-height: 60vh;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 32rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.appointment-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.appointment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 24rpx;
  background: #f0f0f0;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.user-tag {
  font-size: 24rpx;
  color: #666;
}

.appointment-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.appointment-status.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ff9800;
}

.appointment-status.confirmed {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.appointment-status.completed {
  background: rgba(96, 125, 139, 0.2);
  color: #607d8b;
}

.appointment-info {
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.info-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
  width: 32rpx;
}

.info-text {
  font-size: 28rpx;
  color: #666;
}

.appointment-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  height: 64rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

.confirm-btn {
  background: #4caf50;
  color: #fff;
}

.cancel-btn {
  background: #ec407a;
  color: #fff;
}

.detail-btn {
  background: #f2c912;
  color: #fff;
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
  font-size: 36rpx;
  margin-bottom: 8rpx;
  color: #666;
}

.nav-item.active .nav-icon {
  color: #ec407a;
}

.nav-label {
  font-size: 20rpx;
  color: #666;
  text-align: center;
  font-weight: 400;
}

.nav-item.active .nav-label {
  color: #ec407a;
  font-weight: 500;
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

/* 预约详情弹窗样式 */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  width: 95%;
  max-width: 750rpx;
  max-height: 95vh;
  background: #fff;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  z-index: 10001;
  margin: 20rpx;
  box-sizing: border-box;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 28rpx 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
  box-sizing: border-box;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #999;
  cursor: pointer;
}

.close-btn:active {
  background: #e5e5e5;
}

.modal-body {
  flex: 1;
  padding: 28rpx;
  max-height: 75vh;
  overflow-y: auto;
  box-sizing: border-box;
}

.detail-section {
  margin-bottom: 40rpx;
}

.detail-section:last-child {
  margin-bottom: 20rpx;
}

.detail-section .section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  padding-bottom: 8rpx;
  border-bottom: 2rpx solid #ec407a;
  display: inline-block;
}

.user-profile {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 12rpx;
  box-sizing: border-box;
  margin: 0;
}

.profile-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 24rpx;
  background: #e9ecef;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.profile-details {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.profile-phone {
  font-size: 24rpx;
  color: #666;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  min-height: 60rpx;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  width: 180rpx;
  font-size: 28rpx;
  color: #666;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  word-wrap: break-word;
  word-break: break-all;
}

.problem-description {
  font-size: 28rpx;
  line-height: 1.8;
  color: #333;
  background: #f8f9fa;
  padding: 28rpx;
  border-radius: 12rpx;
  word-wrap: break-word;
  white-space: pre-wrap;
  min-height: 120rpx;
  max-height: none;
  box-sizing: border-box;
  margin: 0;
}

.test-result-item {
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  box-sizing: border-box;
}

.test-result-item:last-child {
  margin-bottom: 0;
}

.test-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.test-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.test-date {
  font-size: 24rpx;
  color: #666;
}

.test-score {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.test-level {
  font-size: 28rpx;
  font-weight: 500;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  display: inline-block;
}

.test-level.normal {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.test-level.mild {
  background: rgba(255, 193, 7, 0.2);
  color: #ff9800;
}

.test-level.moderate {
  background: rgba(255, 152, 0, 0.2);
  color: #ff5722;
}

.test-level.severe {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 28rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
  box-sizing: border-box;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:active {
  background: #e9ecef;
}

.confirm-btn {
  background: #4caf50;
  color: #fff;
}

.confirm-btn:active {
  opacity: 0.8;
}

.cancel-btn {
  background: #ec407a;
  color: #fff;
}

.cancel-btn:active {
  opacity: 0.8;
}

.cancel-appointment-btn {
  background: #ff5722;
  color: #fff;
}

.cancel-appointment-btn:active {
  opacity: 0.8;
}

.cancel-modal-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-modal-btn:active {
  background: #e9ecef;
}
</style>
