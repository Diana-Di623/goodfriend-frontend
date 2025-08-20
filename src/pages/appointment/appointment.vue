<template>
  <view class="appointment-page">
    </view>
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
import {unreadMessageCount }from '@/utils/constants.js'
import {goHome, goTestResults, handleWishClick,goProfile} from '@/utils/page-turning.js'
</script>

<style scoped>
/*底部导航栏*/ 
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