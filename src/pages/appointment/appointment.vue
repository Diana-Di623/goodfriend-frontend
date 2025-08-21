<template>
  <view class="appointment-page">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="header-placeholder"></view>
      <view class="header-title">我的预约</view>
      <view class="header-placeholder"></view>
    </view>

    <!-- 预约列表 -->
    <view class="appointment-list">
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-else-if="appointments.length === 0" class="empty-container">
        <text class="empty-icon">📅</text>
        <text class="empty-text">暂无预约记录</text>
        <text class="empty-tip">去首页预约心理咨询师吧</text>
        <button class="goto-home-btn" @click="goHome">去预约</button>
      </view>
      
      <view v-else>
        <view v-for="appointment in appointments" :key="appointment.id" class="appointment-card">
          <view class="appointment-header">
            <view class="consultant-info">
              <text class="consultant-name">{{ appointment.consultantName }}</text>
              <view class="status-badge" :class="getStatusClass(appointment.status)">
                {{ getStatusText(appointment.status) }}
              </view>
            </view>
            <text class="appointment-id">#{{ appointment.id }}</text>
          </view>
          
          <view class="appointment-time">
            <view class="time-row">
              <text class="time-label">预约时间：</text>
              <text class="time-value">{{ formatTime(appointment.startTime) }} - {{ formatTimeOnly(appointment.endTime) }}</text>
            </view>
            <view class="time-row">
              <text class="time-label">创建时间：</text>
              <text class="time-value">{{ formatDateTime(appointment.createdAt) }}</text>
            </view>
          </view>
          
          <view v-if="appointment.note" class="appointment-note">
            <text class="note-label">备注：</text>
            <text class="note-content">{{ appointment.note }}</text>
          </view>
          
          <view class="appointment-actions">
            <button v-if="appointment.status === 'PENDING'" class="action-btn cancel-btn" @click="cancelAppointment(appointment.id)">
              取消预约
            </button>
            <button v-if="appointment.status === 'CONFIRMED'" class="action-btn contact-btn" @click="contactConsultant(appointment)">
              联系咨询师
            </button>
            <button class="action-btn detail-btn" @click="viewDetails(appointment)">
              查看详情
            </button>
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
      <view class="nav-item" @click="goTestResults">
        <text class="nav-icon">📊</text>
        <text class="nav-label">测评结果</text>
      </view>
      <view class="nav-item">
        <text class="nav-icon">📅</text>
        <text class="nav-label">我的预约</text>
      </view>
      <view class="nav-item" @click="goProfile">
        <text class="nav-icon">👤</text>
        <text class="nav-label">个人中心</text>
      </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { unreadMessageCount } from '@/utils/constants.js'
import { appointmentAPI } from '@/utils/api.js'
import { goHome, goTestResults, handleWishClick, goProfile } from '@/utils/page-turning.js'

const appointments = ref([])
const loading = ref(true)

// 页面加载时获取预约列表
onMounted(async () => {
  await loadAppointments()
})

// 加载预约列表
async function loadAppointments() {
  try {
    loading.value = true
    const response = await appointmentAPI.getUserAppointments()
    appointments.value = response || []
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

// 获取状态样式类
function getStatusClass(status) {
  const statusMap = {
    'PENDING': 'status-pending',
    'CONFIRMED': 'status-confirmed',
    'COMPLETED': 'status-completed',
    'CANCELLED': 'status-cancelled'
  }
  return statusMap[status] || 'status-default'
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    'PENDING': '待确认',
    'CONFIRMED': '已确认',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 格式化时间（包含日期）
function formatTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

// 格式化时间（仅时间）
function formatTimeOnly(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 格式化日期时间
function formatDateTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

// 取消预约
async function cancelAppointment(appointmentId) {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消这个预约吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await appointmentAPI.deleteUserAppointments(appointmentId)
          uni.showToast({
            title: '取消成功',
            icon: 'success'
          })
          await loadAppointments() // 重新加载列表
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

// 联系咨询师
function contactConsultant(appointment) {
  uni.showModal({
    title: '联系咨询师',
    content: `联系咨询师 ${appointment.consultantName}`,
    confirmText: '确定',
    success: (res) => {
      if (res.confirm) {
        // 这里可以跳转到聊天页面或拨打电话
        uni.showToast({
          title: '功能开发中',
          icon: 'none'
        })
      }
    }
  })
}

// 查看详情
function viewDetails(appointment) {
  uni.showModal({
    title: '预约详情',
    content: `咨询师：${appointment.consultantName}\n时间：${formatTime(appointment.startTime)} - ${formatTimeOnly(appointment.endTime)}\n状态：${getStatusText(appointment.status)}`,
    showCancel: false
  })
}



</script>

<style scoped>
.appointment-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ecb198 0%, #e2beeb 50%, #b5d9ee 100%);
  padding-bottom: 120rpx;
}

/* 顶部标题 */

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  background: rgba(255,255,255,0.9);
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

.back-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(236, 64, 122, 0.1);
}

.back-icon {
  font-size: 36rpx;
  color: #ec407a;
  font-weight: bold;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  flex: none;
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  margin: auto;
}

.header-placeholder {
  width: 80rpx;
  height: 1px;
  opacity: 0;
}

/* 预约列表 */
.appointment-list {
  padding: 24rpx;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.empty-tip {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 32rpx;
}

.goto-home-btn {
  background: linear-gradient(135deg, #ec407a, #f48fb1);
  color: #fff;
  border: none;
  border-radius: 32rpx;
  padding: 16rpx 48rpx;
  font-size: 28rpx;
}

/* 预约卡片 */
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

.consultant-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.consultant-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.status-pending {
  background: #fff3e0;
  color: #ff9800;
}

.status-confirmed {
  background: #e8f5e8;
  color: #4caf50;
}

.status-completed {
  background: #e3f2fd;
  color: #2196f3;
}

.status-cancelled {
  background: #ffebee;
  color: #f44336;
}

.appointment-id {
  font-size: 24rpx;
  color: #999;
}

.appointment-time {
  margin-bottom: 24rpx;
}

.time-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.time-label {
  font-size: 26rpx;
  color: #666;
  width: 160rpx;
}

.time-value {
  font-size: 26rpx;
  color: #333;
}

.appointment-note {
  background: #f8f9fa;
  padding: 16rpx;
  border-radius: 8rpx;
  margin-bottom: 24rpx;
}

.note-label {
  font-size: 24rpx;
  color: #666;
}

.note-content {
  font-size: 26rpx;
  color: #333;
  margin-left: 8rpx;
}

.appointment-actions {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  border: none;
}

.cancel-btn {
  background: #ffebee;
  color: #f44336;
}

.contact-btn {
  background: #e8f5e8;
  color: #4caf50;
}

.detail-btn {
  background: #e3f2fd;
  color: #2196f3;
}

/* 底部导航栏 */
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
  font-size: 36rpx;
  margin-bottom: 8rpx;
  color: #666;
}

.nav-label {
  font-size: 20rpx;
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
