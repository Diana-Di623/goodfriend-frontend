<template>
  <view class="profile-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <view class="nav-left"></view>
        <text class="title">个人信息</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 个人信息表单 -->
    <view class="form-container">
      <!-- 头像 -->
      <view class="form-item avatar-item">
        <text class="label">头像</text>
        <view class="avatar-section" @click="chooseAvatar">
          <image 
            :src="userInfo.avatar || '/static/logo.png'" 
            class="avatar-image"
          />
          <text class="change-text">点击更换</text>
        </view>
      </view>

      <!-- 昵称 -->
      <view class="form-item">
        <text class="label">昵称😊</text>
        <input 
          v-model="userInfo.nickname"
          class="input-field"
          placeholder="请输入昵称"
          maxlength="20"
        />
      </view>

      <!-- 性别选择 - 提供男女和未知选项来保护隐私 -->
      <view class="form-item">
        <text class="label">性别👫</text>
        <view class="gender-container">
          <view 
            v-for="option in genderOptions"
            :key="option.value"
            class="gender-option"
            :class="{ active: userInfo.gender === option.value }"
            @click="selectGender(option.value)"
          >
            <text class="gender-text">{{ option.label }}</text>
          </view>
        </view>
      </view>

      <!-- 生日 -->
      <view class="form-item">
        <text class="label">生日🎂</text>
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
          </view>
        </picker>
      </view>

      <!-- 所在地区 -->
      <view class="form-item">
        <text class="label">所在地区📍</text>
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
          </view>
        </picker>
      </view>

      <!-- 自定义地区输入（当选择"其他"时显示） -->
      <view class="form-item" v-if="userInfo.location === '其他'">
        <text class="label">具体城市🏙️</text>
        <input 
          v-model="userInfo.customLocation"
          class="input-field"
          placeholder="请输入具体城市"
          maxlength="20"
        />
      </view>

      <!-- 手机号（只读） -->
      <view class="form-item">
        <text class="label">手机号📱</text>
        <view class="readonly-field">
          <text class="readonly-text">{{ userInfo.phone || '未绑定' }}</text>
        </view>
      </view>

      <!-- 个人简介 -->
      <view class="form-item">
        <text class="label">个人简介📝</text>
        <textarea
          v-model="userInfo.bio"
          class="textarea-field"
          placeholder="简单介绍一下自己..."
          maxlength="200"
        />
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <button class="save-btn" @click="saveUserInfo">保存</button>
    </view>

    <!-- 账户操作区域 -->
    <view class="action-section">
      <view class="section-title">账户操作</view>
      <view class="action-buttons">
        
        <button class="action-btn logout-btn" @click="handleLogout">
          <text class="action-icon">🚪</text>
          <text class="action-text">退出登录</text>
        </button>
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
      <view class="nav-item active">
        <text class="nav-icon">👤</text>
        <text class="nav-label">个人中心</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { GENDER_OPTIONS, REGION_OPTIONS, BIRTHDAY_CONFIG, isValidGender, isValidBirthday, calculateAge, getGenderLabel } from '@/utils/constants.js'

// 未读消息数量
const unreadMessageCount = ref(15)

// 性别选项
const genderOptions = GENDER_OPTIONS

// 生日选择器配置
const birthdayConfig = {
  start: `${BIRTHDAY_CONFIG.minYear}-01-01`,
  end: `${BIRTHDAY_CONFIG.maxYear}-12-31`
}

// 地区选择器数据  
const regionLabels = REGION_OPTIONS.map(item => item.label)
const selectedRegionIndex = ref(-1)

// 用户信息
const userInfo = ref({
  avatar: '',
  nickname: '',
  gender: '', // 只能是 '男' 或 '女'
  birthday: '', // 生日
  location: '', // 所在地区
  customLocation: '', // 自定义地区（当选择"其他"时）
  phone: '',
  bio: ''
})

onMounted(() => {
  loadUserInfo()
})

// 加载用户信息
function loadUserInfo() {
  try {
    const storedInfo = uni.getStorageSync('userInfo') || {}
    userInfo.value = {
      avatar: storedInfo.avatar || '',
      nickname: storedInfo.nickname || '',
      gender: storedInfo.gender || '',
      birthday: storedInfo.birthday || '',
      location: storedInfo.location || '',
      customLocation: storedInfo.customLocation || '',
      phone: storedInfo.phone || '',
      bio: storedInfo.bio || ''
    }
    
    // 设置地区选择器索引
    if (userInfo.value.location) {
      const regionIndex = REGION_OPTIONS.findIndex(item => item.value === userInfo.value.location)
      if (regionIndex !== -1) {
        selectedRegionIndex.value = regionIndex
      }
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

// 选择性别 - 严格限制为男女两个选项
function selectGender(gender) {
  if (isValidGender(gender)) {
    userInfo.value.gender = gender
  }
}

// 生日变更
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

// 首页导航
function goHome() {
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

// 心愿心语导航
function handleWishClick() {
  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '需要会员登录才能使用此功能',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  // 这里处理心愿心语相关逻辑
  uni.showToast({
    title: '心愿心语功能开发中',
    icon: 'none',
    duration: 2000
  })
}

// 测评结果导航
function goTestResults() {
  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '需要会员登录才能使用此功能',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  uni.navigateTo({
    url: '/pages/test/results'
  })
}

// 选择头像
function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      userInfo.value.avatar = res.tempFilePaths[0]
    },
    fail: (error) => {
      console.error('选择头像失败:', error)
    }
  })
}

// 保存用户信息
function saveUserInfo() {
  // 验证必填字段
  if (!userInfo.value.nickname.trim()) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none'
    })
    return
  }

  // 验证性别（必须选择男或女）
  if (!isValidGender(userInfo.value.gender)) {
    uni.showToast({
      title: '请选择性别',
      icon: 'none'
    })
    return
  }

  // 验证生日
  if (!userInfo.value.birthday) {
    uni.showToast({
      title: '请选择生日',
      icon: 'none'
    })
    return
  }

  if (!isValidBirthday(userInfo.value.birthday)) {
    uni.showToast({
      title: '请选择有效的生日',
      icon: 'none'
    })
    return
  }

  // 验证地区
  if (!userInfo.value.location) {
    uni.showToast({
      title: '请选择所在地区',
      icon: 'none'
    })
    return
  }

  // 如果选择了"其他"，验证自定义地区输入
  if (userInfo.value.location === '其他' && !userInfo.value.customLocation.trim()) {
    uni.showToast({
      title: '请输入具体城市',
      icon: 'none'
    })
    return
  }

  uni.showLoading({
    title: '保存中...'
  })

  // 模拟保存过程
  setTimeout(() => {
    try {
      // 确定最终的地区显示
      const finalLocation = userInfo.value.location === '其他' 
        ? userInfo.value.customLocation 
        : userInfo.value.location
      
      // 计算年龄（用于后续使用）
      const age = calculateAge(userInfo.value.birthday)
      
      // 获取现有信息并添加详细信息完成标记
      const updatedUserInfo = {
        ...userInfo.value,
        location: finalLocation, // 使用处理后的地区
        age: age, // 根据生日计算的年龄
        detailedInfoCompleted: true,  // 标记详细信息已完成
        updatedAt: new Date().toISOString()
      }
      
      // 保存到本地存储
      uni.setStorageSync('userInfo', updatedUserInfo)
      
      uni.hideLoading()
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      // 延迟跳转到首页
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }, 1500)
    } catch (error) {
      uni.hideLoading()
      uni.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
      console.error('保存用户信息失败:', error)
    }
  }, 1000)
}

// 修改密码
function changePassword() {
  uni.showToast({
    title: '功能开发中，敬请期待',
    icon: 'none',
    duration: 2000
  })
}

// 隐私设置
function privacySettings() {
  uni.showToast({
    title: '功能开发中，敬请期待',
    icon: 'none',
    duration: 2000
  })
}

// 账户安全
function accountSecurity() {
  uni.showToast({
    title: '功能开发中，敬请期待',
    icon: 'none',
    duration: 2000
  })
}

// 退出登录
function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？退出后需要重新登录才能使用完整功能。',
    confirmText: '退出',
    cancelText: '取消',
    confirmColor: '#ec407a',
    success: (res) => {
      if (res.confirm) {
        // 清除登录信息
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        
        uni.showToast({
          title: '已退出登录',
          icon: 'success',
          duration: 1500
        })
        
        // 跳转到首页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }, 1500)
      }
    }
  })
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 120rpx; /* 为底部导航栏留出空间 */
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
  display: flex;
  align-items: center;
  gap: 8rpx;
  cursor: pointer;
  padding: 8rpx;
  border-radius: 8rpx;
  transition: background-color 0.2s;
}

.nav-left:active {
  background: rgba(0, 0, 0, 0.05);
}

.back-icon {
  font-size: 32rpx;
  color: #42a5f5;
  font-weight: bold;
}

.back-text {
  font-size: 24rpx;
  color: #42a5f5;
}

.nav-right {
  width: 100rpx; /* 占位，保持标题居中 */
}

.title {
  font-size: 36rpx; /* 大号字体 */
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
  letter-spacing: 1rpx;
}

.form-container {
  margin-top: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  margin: 20rpx 32rpx;
  overflow: hidden;
}

.form-item {
  padding: 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
  display: flex;
  align-items: center;
}

.form-item:last-child {
  border-bottom: none;
}

.avatar-item {
  align-items: flex-start;
}

.label {
  width: 140rpx;
  font-size: 28rpx; /* 中号字体 */
  color: #333;
  font-weight: 500;
  letter-spacing: 0.5rpx;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #f0f0f0;
  margin-bottom: 16rpx;
}

.change-text {
  font-size: 24rpx;
  color: #ec407a;
}

.input-field {
  flex: 1;
  font-size: 28rpx; /* 中号字体 */
  color: #333;
  background: transparent;
  padding: 0;
  margin: 0;
  font-weight: 400;
}

/* 性别选择样式 */
.gender-container {
  flex: 1;
  display: flex;
  gap: 24rpx;
}

.gender-option {
  flex: 1;
  height: 64rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: all 0.2s;
}

.gender-option.active {
  border-color: #ec407a;
  background: #ec407a;
}

.gender-text {
  font-size: 28rpx; /* 中号字体 */
  color: #666;
  font-weight: 500;
  letter-spacing: 0.5rpx;
}

.gender-option.active .gender-text {
  color: #fff;
}

.picker-field {
  flex: 1;
  font-size: 28rpx; /* 中号字体 */
  color: #333;
  height: 64rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  padding: 0 24rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 400;
}

.placeholder {
  color: #999;
}

.readonly-field {
  flex: 1;
}

.readonly-text {
  font-size: 28rpx; /* 中号字体 */
  color: #999;
  font-weight: 400;
}

.textarea-field {
  flex: 1;
  min-height: 120rpx;
  font-size: 28rpx; /* 中号字体 */
  color: #333;
  background: transparent;
  padding: 0;
  margin: 0;
  font-weight: 400;
  line-height: 1.5;
}

.save-section {
  padding: 40rpx 32rpx;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #1ba7d0, #4bc3b2);
  color: #fff;
  border: none;
  border-radius: 16rpx;
  font-size: 36rpx; /* 大号字体 */
  font-weight: 600;
  letter-spacing: 1rpx;
}

.save-btn:active {
  opacity: 0.8;
}

.action-section {
  padding: 40rpx 48rpx;
  background: #fff;
  margin: 20rpx 16rpx;
  border-radius: 16rpx;
}

.section-title {
  font-size: 36rpx; /* 大号字体 */
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  letter-spacing: 0.5rpx;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 32rpx 48rpx;
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 32rpx; /* 更大字体 */
  color: #333;
  transition: all 0.2s;
  font-weight: 500;
  width: 100%;
  box-sizing: border-box;
}

.action-btn:active {
  background: #e9ecef;
  transform: scale(0.98);
}

.logout-btn {
  background: rgba(174, 220, 170, 0.2);
  border-color: #aedcaa;
  color: #4bc3b2;
}

.logout-btn:active {
  background: rgba(174, 220, 170, 0.3);
}

.action-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
  width: 48rpx;
  text-align: center;
}

.action-text {
  flex: 1;
  font-weight: 600;
  letter-spacing: 1rpx;
  font-size: 32rpx;
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
