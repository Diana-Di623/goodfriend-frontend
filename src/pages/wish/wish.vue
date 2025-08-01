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
      <text class="loading-text">{{ loadingText }}</text>
    </view>

    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-content">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <view class="header-title">心愿心语</view>
        <view class="header-subtitle">🌸 树洞时光 🌸</view>
      </view>
    </view>

    <!-- 引导区域 -->
    <view class="guide-section">
      <view class="guide-card">
        <view class="guide-content">
          <text class="guide-text">✨ 在这里，你可以安全地分享内心的声音</text>
          <text class="guide-subtext">无论是今天的小确幸，还是心中的小烦恼</text>
          <text class="guide-subtext">都有人在这里倾听，陪伴你度过每一个时刻 💕</text>
        </view>
      </view>
    </view>

    <!-- 评论列表 -->
    <view class="comments-section">
      <!-- 加载状态 -->
      <view v-if="isLoading && comments.length === 0" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 评论列表 -->
      <view v-for="(comment, index) in comments" :key="comment.id" class="comment-card">
        <!-- 引用的评论 -->
        <view v-if="comment.quotedComment" class="quoted-comment">
          <view class="quote-header">
            <text class="quote-icon">💬</text>
            <text class="quote-user">引用 {{ comment.quotedComment.user }}：</text>
          </view>
          <text class="quote-content">{{ comment.quotedComment.content }}</text>
        </view>

        <view class="comment-main">
          <view class="user-avatar" @click="handleAvatarClick(comment.user)">
            <image v-if="!comment.user.isAnonymous && comment.user.avatar" :src="comment.user.avatar" class="avatar-img" />
            <view v-else class="anonymous-avatar">
              <text class="avatar-text">{{ comment.user.isAnonymous ? '匿' : (comment.user.name || '我').charAt(0) }}</text>
            </view>
          </view>

          <view class="comment-content">
            <view class="comment-header">
              <text class="username">{{ comment.user.isAnonymous ? '匿名用户' : comment.user.name }}</text>
              <text class="comment-time">{{ comment.time }}</text>
            </view>

            <text class="comment-text">{{ comment.content }}</text>

            <view class="comment-actions">
              <view class="action-left">
                <view class="action-btn" @click="handleLike(comment.id)" :class="{ 'liked': comment.isLiked }">
                  <text class="action-icon">👍</text>
                  <text class="action-text">{{ comment.likes }}</text>
                </view>

                <view class="action-btn" @click="handleQuote(comment)">
                  <text class="action-icon">💬</text>
                  <text class="action-text">引用</text>
                </view>
              </view>

              <view class="action-btn">
                <text class="action-icon">⋯</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载更多状态 -->
      <view v-if="isLoading && comments.length > 0" class="load-more-container">
        <view class="loading-spinner-small"></view>
        <text class="load-more-text">加载更多...</text>
      </view>
      
      <!-- 没有更多数据 -->
      <view v-if="!hasMore && comments.length > 0" class="no-more-container">
        <text class="no-more-text">~ 没有更多了 ~</text>
      </view>
      
      <!-- 空状态 -->
      <view v-if="!isLoading && comments.length === 0" class="empty-container">
        <text class="empty-icon">💭</text>
        <text class="empty-text">还没有心语分享</text>
        <text class="empty-subtext">成为第一个分享心情的人吧</text>
      </view>
    </view>

    <!-- 输入区域 -->
    <view class="input-section">
      <!-- 引用预览 -->
      <view v-if="quotedComment" class="quote-preview">
        <view class="quote-preview-content">
          <text class="quote-preview-icon">💬</text>
          <text class="quote-preview-text">
            引用 {{ quotedComment.user.name }}：{{ getQuotePreview(quotedComment.content) }}
          </text>
        </view>
        <view class="quote-close" @click="clearQuote">
          <text class="close-icon">×</text>
        </view>
      </view>

      <view class="input-container">
        <!-- 匿名发布选项 -->
        <view class="anonymous-option">
          <view class="anonymous-toggle" @click="toggleAnonymous" :class="{ 'active': isAnonymous }">
            <text class="anonymous-icon">{{ isAnonymous ? '🎭' : '👤' }}</text>
            <text class="anonymous-text">{{ isAnonymous ? '匿名' : '实名' }}</text>
          </view>
        </view>

        <view class="input-wrapper">
          <textarea 
            v-model="inputText" 
            class="comment-input" 
            placeholder="分享你的心情，说说今天发生的事情..."
            :auto-height="true"
            :maxlength="500"
            @confirm="handleSubmit"
          />
        </view>

        <view class="input-actions">
          <view class="emoji-btn" @click="toggleEmojiPicker">
            <text class="emoji-icon">😊</text>
          </view>

          <view class="send-btn" @click="handleSubmit" :class="{ 'disabled': !inputText.trim() }">
            <text class="send-icon">➤</text>
          </view>
        </view>
      </view>

      <!-- 表情选择器 -->
      <view v-if="showEmojiPicker" class="emoji-picker">
        <view class="emoji-grid">
          <view 
            v-for="(emoji, index) in emojis" 
            :key="index" 
            class="emoji-item" 
            @click="insertEmoji(emoji)"
          >
            <text class="emoji-text">{{ emoji }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder"></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { storageUtils, wishAPI } from '@/utils/api.js'

// 数据定义
const comments = ref([])
const inputText = ref('')
const showEmojiPicker = ref(false)
const quotedComment = ref(null)
const isLoading = ref(false)
const page = ref(1)
const hasMore = ref(true)
const isAnonymous = ref(false) // 匿名发布状态
const isPageLoading = ref(false) // 全局页面加载状态
const progressBarWidth = ref(0) // 加载进度条宽度百分比
const loadingText = ref('加载中...') // 加载文本

// 进度条定时器
let progressTimer = null
// 匿名切换方法
function toggleAnonymous() {
  isAnonymous.value = !isAnonymous.value
}

// 封装全局 loading 动画启动
function showLoadingWithProgress(duration = 500, text = '加载中...') {
  isPageLoading.value = true
  progressBarWidth.value = 0
  loadingText.value = text
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

// 初始化默认数据
const defaultComments = [
  {
    id: 1,
    user: {
      name: "小雨滴",
      avatar: "/static/logo.png",
      isAnonymous: false,
    },
    content: "今天终于鼓起勇气跟喜欢的人表白了，虽然被拒绝了，但是心里反而轻松了很多。至少不用再纠结了，可以重新开始了 💪",
    time: "2分钟前",
    likes: 12,
    isLiked: false,
  },
  {
    id: 2,
    user: {
      name: "匿名用户",
      avatar: "/static/logo.png",
      isAnonymous: true,
    },
    content: "工作压力好大，每天都觉得喘不过气来。但是看到大家都在努力，我也要加油！",
    time: "5分钟前",
    likes: 8,
    isLiked: true,
    quotedComment: {
      user: "阳光小熊",
      content: "我们都要相信，困难只是暂时的，美好的日子在前方等着我们 🌈",
    },
  },
  {
    id: 3,
    user: {
      name: "星星点灯",
      avatar: "/static/logo.png",
      isAnonymous: false,
    },
    content: "今天妈妈做了我最爱吃的红烧肉，突然觉得世界都变得温暖了。有时候幸福就是这么简单 ❤️",
    time: "10分钟前",
    likes: 25,
    isLiked: false,
  },
  {
    id: 4,
    user: {
      name: "匿名用户",
      avatar: "/static/logo.png",
      isAnonymous: true,
    },
    content: "失眠了好多天，脑子里总是胡思乱想。希望明天会是更好的一天...",
    time: "15分钟前",
    likes: 6,
    isLiked: false,
  },
]

const emojis = [
  "😊", "😢", "😍", "🥺", "😭", "😤", "🤗", "😴", 
  "🌈", "💪", "❤️", "💔", "🌟", "🌙", "☀️", "🍀", 
  "🎉", "🎈", "🌸", "🌺", "🦋", "🐱", "🐶", "🐻"
]

// 方法定义
function goBack() {
  // 显示进度条加载动画
  showLoadingWithProgress(800, '正在返回...')
  
  setTimeout(() => {
    uni.navigateBack()
  }, 800)
}

// 加载心愿心语列表
async function loadWishList(refresh = false) {
  if (isLoading.value) return
  
  if (refresh) {
    page.value = 1
    hasMore.value = true
  }

  isLoading.value = true

  try {
    // 优先从本地加载
    const localWishList = storageUtils.getWishList()
    if (localWishList.length > 0 && !refresh) {
      comments.value = localWishList
      return
    }

    // 尝试从API加载
    const result = await wishAPI.getWishList(page.value, 20)
    
    if (refresh) {
      comments.value = result.data || []
    } else {
      comments.value = [...comments.value, ...(result.data || [])]
    }
    
    hasMore.value = result.hasMore || false
    page.value++
    
    // 保存到本地
    storageUtils.saveWishList(comments.value)
    
  } catch (error) {
    console.log('加载心愿心语失败，使用默认数据:', error)
    
    // 如果API失败，使用默认数据或本地数据
    const localWishList = storageUtils.getWishList()
    if (localWishList.length > 0) {
      comments.value = localWishList
    } else {
      comments.value = defaultComments
      storageUtils.saveWishList(defaultComments)
    }
  } finally {
    isLoading.value = false
  }
}

function handleLike(commentId) {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    const oldIsLiked = comment.isLiked
    comment.isLiked = !comment.isLiked
    comment.likes = comment.isLiked ? comment.likes + 1 : comment.likes - 1

    // 更新本地存储
    storageUtils.updateWishInLocal(commentId, {
      isLiked: comment.isLiked,
      likes: comment.likes
    })

    // 尝试同步到服务器
    wishAPI.toggleLike(commentId).catch(() => {
      // 如果失败，回滚本地状态
      comment.isLiked = oldIsLiked
      comment.likes = oldIsLiked ? comment.likes + 1 : comment.likes - 1
      uni.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none'
      })
    })
  }
}

function handleQuote(comment) {
  quotedComment.value = comment
  showEmojiPicker.value = false
}

function clearQuote() {
  quotedComment.value = null
}

function getQuotePreview(content) {
  return content.length > 30 ? content.slice(0, 30) + '...' : content
}

function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value
}

function insertEmoji(emoji) {
  inputText.value += emoji
  showEmojiPicker.value = false
}

// 获取当前用户信息
function getCurrentUser() {
  const userInfo = uni.getStorageSync('userInfo')
  return userInfo || {
    name: "我",
    avatar: "/static/logo.png",
    isAnonymous: false,
    joinDate: "2024-01-01"
  }
}

// 头像点击处理
function handleAvatarClick(user) {
  if (!user.isAnonymous) {
    showUserProfile(user)
  }
}

// 显示用户资料卡片
function showUserProfile(user) {
  uni.showModal({
    title: '用户资料',
    content: `昵称：${user.name}\n加入时间：${user.joinDate || '2024-01-01'}`,
    showCancel: false,
    confirmText: '知道了'
  })
}

// 生成时间字符串
function getTimeString() {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

async function handleSubmit() {
  if (!inputText.value.trim()) return

  const currentUser = getCurrentUser()
  const newComment = {
    id: Date.now(),
    user: {
      ...currentUser,
      isAnonymous: isAnonymous.value // 使用匿名发布状态
    },
    content: inputText.value.trim(),
    time: "刚刚",
    likes: 0,
    isLiked: false,
    quotedComment: quotedComment.value ? {
      user: quotedComment.value.user.name,
      content: quotedComment.value.content,
    } : undefined,
  }

  // 立即添加到本地列表
  comments.value.unshift(newComment)
  storageUtils.addWishToLocal(newComment)

  // 清空输入
  const tempContent = inputText.value
  const tempQuoted = quotedComment.value
  inputText.value = ''
  quotedComment.value = null
  showEmojiPicker.value = false

  uni.showToast({
    title: '发布成功',
    icon: 'success',
    duration: 1500
  })

  // 尝试同步到服务器
  try {
    await wishAPI.publishWish(tempContent, tempQuoted?.id)
  } catch (error) {
    console.log('发布到服务器失败:', error)
    // 本地已保存，不影响用户体验
  }
}

onMounted(() => {
  console.log('心愿心语页面加载完成')
  loadWishList(true)
})

onShow(() => {
  // 页面显示时刷新数据
  loadWishList(true)
})

// 页面生命周期函数
onPullDownRefresh(() => {
  loadWishList(true).finally(() => {
    uni.stopPullDownRefresh()
  })
})

onReachBottom(() => {
  if (hasMore.value && !isLoading.value) {
    loadWishList(false)
  }
})
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8f5e8 100%);
  min-height: 100vh;
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

/* 头部样式 */
.header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  border-bottom: 2rpx solid #f8bbd0;
  padding: 60rpx 24rpx 24rpx;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 12rpx;
  border-radius: 50%;
  background: rgba(236, 64, 122, 0.1);
}

.back-icon {
  font-size: 36rpx;
  color: #ec407a;
  font-weight: bold;
}

.header-title {
  font-size: 48rpx;
  font-weight: 900;
  background: linear-gradient(135deg, #ec407a, #ab47bc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 8rpx;
}

.header-subtitle {
  font-size: 32rpx;
  color: #666;
  font-weight: 500;
}

/* 引导区域 */
.guide-section {
  padding: 24rpx;
}

.guide-card {
  background: linear-gradient(135deg, #fce4ec, #f3e5f5);
  border: 2rpx solid #f8bbd0;
  border-radius: 24rpx;
  padding: 32rpx;
}

.guide-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.guide-text {
  color: #444;
  font-size: 28rpx;
  line-height: 1.5;
  font-weight: 500;
}

.guide-subtext {
  color: #666;
  font-size: 24rpx;
  line-height: 1.4;
}

/* 评论区域 */
.comments-section {
  padding: 0 24rpx 200rpx;
}

.comment-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  border: 2rpx solid #f8bbd0;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  padding: 32rpx;
  transition: all 0.3s ease;
}

.comment-card:hover {
  box-shadow: 0 8rpx 24rpx rgba(236, 64, 122, 0.15);
}

/* 引用评论样式 */
.quoted-comment {
  background: #f5f5f5;
  border-left: 8rpx solid #ec407a;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
}

.quote-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.quote-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.quote-user {
  font-size: 22rpx;
  color: #666;
}

.quote-content {
  font-size: 24rpx;
  color: #444;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 评论主体 */
.comment-main {
  display: flex;
  gap: 24rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.anonymous-avatar {
  width: 100%;
  height: 100%;
  background: #ec407a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 50%;
}

.avatar-text {
  font-size: 28rpx;
  font-weight: bold;
  color: white;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.username {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.comment-time {
  font-size: 22rpx;
  color: #999;
}

.comment-text {
  font-size: 28rpx;
  color: #444;
  line-height: 1.6;
  margin-bottom: 24rpx;
}

/* 评论操作 */
.comment-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.action-left {
  display: flex;
  gap: 32rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  background: rgba(236, 64, 122, 0.05);
  transition: all 0.3s ease;
}

.action-btn.liked {
  background: rgba(236, 64, 122, 0.1);
  color: #ec407a;
}

.action-icon {
  font-size: 24rpx;
}

.action-text {
  font-size: 22rpx;
  color: #666;
}

.action-btn.liked .action-text {
  color: #ec407a;
  font-weight: 600;
}

/* 输入区域 */
.input-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-top: 2rpx solid #f8bbd0;
  padding: 24rpx;
  z-index: 200;
}

/* 引用预览 */
.quote-preview {
  background: #fce4ec;
  border: 2rpx solid #f8bbd0;
  border-radius: 16rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quote-preview-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.quote-preview-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.quote-preview-text {
  font-size: 22rpx;
  color: #666;
  flex: 1;
}

.quote-close {
  padding: 8rpx;
  border-radius: 50%;
  background: rgba(236, 64, 122, 0.1);
}

.close-icon {
  font-size: 32rpx;
  color: #ec407a;
  font-weight: bold;
}

/* 输入容器 */
.input-container {
  display: flex;
  align-items: flex-end;
  gap: 16rpx;
}

/* 匿名发布选项 */
.anonymous-option {
  margin-bottom: 16rpx;
}

.anonymous-toggle {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
  background: rgba(236, 64, 122, 0.1);
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.anonymous-toggle.active {
  background: linear-gradient(135deg, #ec407a, #ab47bc);
  color: white;
}

.anonymous-toggle:active {
  transform: scale(0.98);
}

.anonymous-icon {
  font-size: 24rpx;
}

.anonymous-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #666;
}

.anonymous-toggle.active .anonymous-text {
  color: white;
}

.input-wrapper {
  flex: 1;
  background: #f5f5f5;
  border-radius: 24rpx;
  padding: 16rpx 20rpx;
  border: 2rpx solid #e0e0e0;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #ec407a;
  background: #fff;
}

.comment-input {
  width: 100%;
  min-height: 64rpx;
  max-height: 200rpx;
  background: transparent;
  border: none;
  outline: none;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  resize: none;
}

.input-actions {
  display: flex;
  gap: 12rpx;
}

.emoji-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(236, 64, 122, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.emoji-btn:active {
  background: rgba(236, 64, 122, 0.2);
  transform: scale(0.95);
}

.emoji-icon {
  font-size: 32rpx;
}

.send-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec407a, #ab47bc);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.send-btn.disabled {
  opacity: 0.5;
  background: #ccc;
}

.send-btn:not(.disabled):active {
  transform: scale(0.95);
}

.send-icon {
  font-size: 28rpx;
  color: white;
  font-weight: bold;
}

/* 表情选择器 */
.emoji-picker {
  background: #fff;
  border: 2rpx solid #f8bbd0;
  border-radius: 16rpx;
  padding: 16rpx;
  margin-top: 16rpx;
  max-height: 300rpx;
  overflow-y: auto;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8rpx;
}

.emoji-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  background: rgba(236, 64, 122, 0.05);
  transition: all 0.3s ease;
}

.emoji-item:active {
  background: rgba(236, 64, 122, 0.15);
  transform: scale(0.95);
}

.emoji-text {
  font-size: 32rpx;
}

/* 底部占位 */
.bottom-placeholder {
  height: 200rpx;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid #ec407a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 加载更多状态 */
.load-more-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  gap: 16rpx;
}

.loading-spinner-small {
  width: 32rpx;
  height: 32rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #ec407a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.load-more-text {
  font-size: 24rpx;
  color: #888;
}

/* 没有更多数据 */
.no-more-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.no-more-text {
  font-size: 24rpx;
  color: #ccc;
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.empty-subtext {
  font-size: 24rpx;
  color: #999;
}

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
  .header-title {
    font-size: 40rpx;
  }
  
  .header-subtitle {
    font-size: 28rpx;
  }
  
  .comment-card {
    padding: 24rpx;
  }
  
  .input-section {
    padding: 16rpx;
  }
}
</style>
