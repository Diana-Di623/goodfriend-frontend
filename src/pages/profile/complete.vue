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
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { REGION_OPTIONS, BIRTHDAY_CONFIG, isValidGender, isValidBirthday, calculateAge } from '@/utils/constants.js'

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
</script>

<style scoped>
.complete-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fce4ec 100%);
}

.header {
  padding: 60rpx 48rpx 40rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
  display: block;
}

.form-section {
  padding: 40rpx 48rpx;
}

.input-group {
  margin-bottom: 32rpx;
}

.input-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  font-weight: 500;
  display: block;
}

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 30rpx;
  background: #fff;
  box-sizing: border-box;
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
  font-size: 30rpx;
  background: #fff;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.picker-field .placeholder {
  color: #999;
}

.picker-arrow {
  color: #999;
  font-size: 24rpx;
  margin-left: 16rpx;
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
  font-size: 30rpx;
  color: #333;
}

.gender-option.active .gender-text {
  color: #42a5f5;
  font-weight: 500;
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
  background: linear-gradient(90deg, #42a5f5, #1976d2);
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 44rpx;
  border: none;
  box-shadow: 0 6rpx 20rpx rgba(66, 165, 245, 0.3);
}

.complete-btn:active {
  background: linear-gradient(90deg, #1976d2, #0d47a1);
}

.skip-btn {
  width: 100%;
  height: 88rpx;
  background: transparent;
  color: #666;
  font-size: 30rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 44rpx;
}

.skip-btn:active {
  background: #f5f5f5;
}
</style>