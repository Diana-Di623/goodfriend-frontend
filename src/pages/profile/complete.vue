<template>
  <view class="complete-page">
    <!-- 头部 -->
    <view class="header">
      <text class="title">完善个人信息</text>
      <text class="subtitle">为了提供更好的服务，请完善您的个人信息</text>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <!-- 昵称输入 -->
      <view class="input-group">
        <view class="input-label">昵称</view>
        <input 
          v-model="userInfo.nickname" 
          placeholder="请输入昵称" 
          class="form-input"
          maxlength="20"
        />
      </view>

      <!-- 性别选择 -->
      <view class="input-group">
        <view class="input-label">性别</view>
        <view class="gender-container">
          <view 
            class="gender-option" 
            :class="{ active: userInfo.gender === '男' }"
            @click="selectGender('男')"
          >
            <text class="gender-text">男</text>
          </view>
          <view 
            class="gender-option" 
            :class="{ active: userInfo.gender === '女' }"
            @click="selectGender('女')"
          >
            <text class="gender-text">女</text>
          </view>
          <view 
            class="gender-option" 
            :class="{ active: userInfo.gender === '未知' }"
            @click="selectGender('未知')"
          >
            <text class="gender-text">未知</text>
          </view>
        </view>
      </view>

      <!-- 生日选择 -->
      <view class="input-group">
        <view class="input-label">生日</view>
        <picker 
          mode="date" 
          :value="userInfo.birthday"
          :start="birthdayConfig.start"
          :end="birthdayConfig.end"
          @change="onBirthdayChange"
        >
          <view class="picker-field">
            <text :class="{ placeholder: !userInfo.birthday }">
              {{ userInfo.birthday || '请选择生日' }}
            </text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>

      <!-- 所在地区 -->
      <view class="input-group">
        <view class="input-label">所在地区</view>
        <picker 
          mode="selector" 
          :range="regionLabels"
          :value="selectedRegionIndex"
          @change="onRegionChange"
        >
          <view class="picker-field">
            <text :class="{ placeholder: !userInfo.location }">
              {{ userInfo.location || '请选择所在城市' }}
            </text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>

      <!-- 自定义地区输入（当选择"其他"时显示） -->
      <view class="input-group" v-if="userInfo.location === '其他'">
        <view class="input-label">请输入具体城市</view>
        <input 
          v-model="userInfo.customLocation" 
          placeholder="请输入您所在的城市" 
          class="form-input"
          maxlength="20"
        />
      </view>

      <!-- 职业 -->
      <view class="input-group">
        <view class="input-label">职业</view>
        <input 
          v-model="userInfo.occupation" 
          placeholder="请输入您的职业" 
          class="form-input"
          maxlength="30"
        />
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-section">
      <button class="complete-btn" @click="completeProfile">
        完成
      </button>
      <button class="skip-btn" @click="skipProfile">
        暂时跳过
      </button>
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
      <view class="nav-item" @click="goMyAppointments">
        <text class="nav-icon">📅</text>
        <text class="nav-label">我的预约</text>
      </view>
      <view class="nav-item">
        <text class="nav-icon">👤</text>
        <text class="nav-label">个人中心</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { REGION_OPTIONS, BIRTHDAY_CONFIG, isValidGender, isValidBirthday, calculateAge } from '@/utils/constants.js'
import {goHome,handleWishClick,goTestResults,goMyAppointments} from '@/utils/page-turning.js'

const userInfo = ref({
  nickname: '',
  gender: '',
  birthday: '',
  location: '',
  customLocation: '',
  occupation: ''
})

// 生日选择器配置
const birthdayConfig = {
  start: `${BIRTHDAY_CONFIG.minYear}-01-01`,
  end: `${BIRTHDAY_CONFIG.maxYear}-12-31`
}

// 地区选择器数据  
const regionLabels = REGION_OPTIONS.map(item => item.label)
const selectedRegionIndex = ref(-1)

onMounted(() => {
  // 预填充已有的用户信息
  const existingUserInfo = uni.getStorageSync('userInfo') || {}
  if (existingUserInfo.nickname) {
    userInfo.value.nickname = existingUserInfo.nickname
  }
  if (existingUserInfo.gender) {
    userInfo.value.gender = existingUserInfo.gender
  }
  if (existingUserInfo.birthday) {
    userInfo.value.birthday = existingUserInfo.birthday
  }
  if (existingUserInfo.location) {
    userInfo.value.location = existingUserInfo.location
    // 设置地区选择器的索引
    const regionIndex = REGION_OPTIONS.findIndex(item => item.value === existingUserInfo.location)
    if (regionIndex !== -1) {
      selectedRegionIndex.value = regionIndex
    }
  }
  if (existingUserInfo.customLocation) {
    userInfo.value.customLocation = existingUserInfo.customLocation
  }
  if (existingUserInfo.occupation) {
    userInfo.value.occupation = existingUserInfo.occupation
  }
})

// 选择性别
function selectGender(gender) {
  if (isValidGender(gender)) {
    userInfo.value.gender = gender
  }
}

// 生日选择变更
function onBirthdayChange(e) {
  userInfo.value.birthday = e.detail.value
}

// 地区选择变更
function onRegionChange(e) {
  const index = e.detail.value
  selectedRegionIndex.value = index
  userInfo.value.location = REGION_OPTIONS[index].value
  
  // 如果不是选择"其他"，清空自定义地区
  if (userInfo.value.location !== '其他') {
    userInfo.value.customLocation = ''
  }
}

// 完成个人信息填写
async function completeProfile() {
  // 基础验证
  if (!userInfo.value.nickname.trim()) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none',
      duration: 1500
    })
    return
  }

  if (!userInfo.value.gender) {
    uni.showToast({
      title: '请选择性别',
      icon: 'none',
      duration: 1500
    })
    return
  }

  if (!userInfo.value.birthday) {
    uni.showToast({
      title: '请选择生日',
      icon: 'none',
      duration: 1500
    })
    return
  }

  if (!isValidBirthday(userInfo.value.birthday)) {
    uni.showToast({
      title: '请选择有效的生日',
      icon: 'none',
      duration: 1500
    })
    return
  }

  if (!userInfo.value.location) {
    uni.showToast({
      title: '请选择所在地区',
      icon: 'none',
      duration: 1500
    })
    return
  }

  // 如果选择了"其他"，验证自定义地区输入
  if (userInfo.value.location === '其他' && !userInfo.value.customLocation.trim()) {
    uni.showToast({
      title: '请输入具体城市',
      icon: 'none',
      duration: 1500
    })
    return
  }

  if (!userInfo.value.occupation.trim()) {
    uni.showToast({
      title: '请输入职业',
      icon: 'none',
      duration: 1500
    })
    return
  }

  uni.showLoading({
    title: '保存中...'
  })

  // 模拟API调用
  setTimeout(() => {
    uni.hideLoading()
    
    // 获取现有用户信息
    const existingUserInfo = uni.getStorageSync('userInfo') || {}
    
    // 确定最终的地区显示
    const finalLocation = userInfo.value.location === '其他' 
      ? userInfo.value.customLocation 
      : userInfo.value.location
    
    // 计算年龄（用于后续使用）
    const age = calculateAge(userInfo.value.birthday)
    
    // 更新用户信息
    const updatedUserInfo = {
      ...existingUserInfo,
      nickname: userInfo.value.nickname,
      gender: userInfo.value.gender,
      birthday: userInfo.value.birthday,
      age: age, // 根据生日计算的年龄
      location: finalLocation,
      customLocation: userInfo.value.customLocation,
      occupation: userInfo.value.occupation,
      basicInfoCompleted: true,  // 标记基本信息已完成
      updatedAt: new Date().toISOString()
    }
    
    // 保存到本地存储
    uni.setStorageSync('userInfo', updatedUserInfo)

    uni.showToast({
      title: '个人信息保存成功',
      icon: 'success',
      duration: 1500
    })

    // 延迟跳转到详细信息页面
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/profile/profile'
      })
    }, 1500)
  }, 1000)
}

// 跳过个人信息填写
function skipProfile() {
  uni.showModal({
    title: '提示',
    content: '跳过个人信息填写可能会影响为您提供个性化服务，确定要跳过吗？',
    success: (res) => {
      if (res.confirm) {
        uni.reLaunch({
          url: '/pages/profile/profile'
        })
      }
    }
  })
}
  // 这里处理心愿心语相关逻辑
  uni.showToast({
    title: '心愿心语功能开发中',
    icon: 'none',
    duration: 2000
  })

</script>

<style scoped>
.complete-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fce4ec 100%);
  padding-bottom: 120rpx; /* 为底部导航栏留出空间 */
}

.header {
  padding: 60rpx 48rpx 40rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
}

.title {
  font-size: 36rpx; /* 大号字体 */
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
  letter-spacing: 1rpx;
}

.subtitle {
  font-size: 28rpx; /* 中号字体 */
  color: #666;
  line-height: 1.5;
  display: block;
  font-weight: 400;
}

.form-section {
  padding: 40rpx 48rpx;
}

.input-group {
  margin-bottom: 32rpx;
}

.input-label {
  font-size: 28rpx; /* 中号字体 */
  color: #333;
  margin-bottom: 12rpx;
  font-weight: 500;
  display: block;
  letter-spacing: 0.5rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 28rpx; /* 中号字体 */
  background: #fff;
  box-sizing: border-box;
  color: #333;
  font-weight: 400;
}

.form-input:focus {
  border-color: #42a5f5;
  outline: none;
}

.picker-field {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 28rpx; /* 中号字体 */
  background: #fff;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #333;
  font-weight: 400;
}

.picker-field .placeholder {
  color: #999;
  font-weight: 400;
}

.picker-arrow {
  color: #999;
  font-size: 20rpx; /* 小号字体 */
  margin-left: 16rpx;
  font-weight: 400;
}

.gender-container {
  display: flex;
  gap: 20rpx;
}

.gender-option {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.gender-option.active {
  border-color: #42a5f5;
  background: #e3f2fd;
}

.gender-text {
  font-size: 28rpx; /* 中号字体 */
  color: #333;
  font-weight: 500;
  letter-spacing: 0.5rpx;
}

.gender-option.active .gender-text {
  color: #42a5f5;
  font-weight: 600;
}

.bottom-section {
  padding: 20rpx 48rpx 60rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.complete-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(90deg, #1ba7d0, #4bc3b2);
  color: #fff;
  font-size: 36rpx; /* 大号字体 */
  font-weight: 600;
  border-radius: 44rpx;
  border: none;
  box-shadow: 0 6rpx 20rpx rgba(27, 167, 208, 0.3);
  letter-spacing: 1rpx;
}

.complete-btn:active {
  background: linear-gradient(90deg, #4bc3b2, #1ba7d0);
}

.skip-btn {
  width: 100%;
  height: 88rpx;
  background: transparent;
  color: #aedcaa;
  font-size: 28rpx; /* 中号字体 */
  font-weight: 500;
  border: 2rpx solid #aedcaa;
  border-radius: 44rpx;
  letter-spacing: 0.5rpx;
}

.skip-btn:active {
  background: rgba(174, 220, 170, 0.2);
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
</style>