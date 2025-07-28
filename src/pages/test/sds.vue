<template>
  <view class="test-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="title">抑郁自评量表（SDS）</text>
    </view>

    <!-- 测评说明 -->
    <view class="instruction-card">
      <view class="instruction-title">
        <text class="icon">📋</text>
        <text>测评说明</text>
      </view>
      <view class="instruction-content">
        <text class="instruction-text">SDS是广泛使用的抑郁症筛查工具，通过20个项目评估您最近一周的抑郁程度，帮助早期发现和评估抑郁症状。</text>
        <view class="instruction-points">
          <text class="point">• 共20个题目，预计用时5-10分钟</text>
          <text class="point">• 请根据最近一周的实际感受如实作答</text>
          <text class="point">• 选择最符合您实际情况的选项</text>
        </view>
      </view>
    </view>

    <!-- 测评内容 -->
    <view v-if="!showResult" class="test-content">
      <!-- 进度条 -->
      <view class="progress-section">
        <view class="progress-info">
          <text>第 {{ currentQuestion + 1 }} 题 / 共 {{ questions.length }} 题</text>
          <text class="progress-percent">{{ Math.round((currentQuestion + 1) / questions.length * 100) }}%</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: (currentQuestion + 1) / questions.length * 100 + '%' }"></view>
        </view>
      </view>

      <!-- 题目 -->
      <view class="question-card">
        <text class="question-text">{{ questions[currentQuestion]?.text }}</text>
        <view class="options">
          <view 
            v-for="(option, index) in options" 
            :key="index"
            class="option-item"
            :class="{ active: answers[currentQuestion] === index + 1 }"
            @click="selectAnswer(index + 1)"
          >
            <text class="option-text">{{ option }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button 
          class="btn btn-secondary" 
          @click="previousQuestion"
          :disabled="currentQuestion === 0"
        >
          上一题
        </button>
        <button 
          class="btn btn-primary" 
          @click="nextQuestion"
          :disabled="!answers[currentQuestion]"
        >
          {{ currentQuestion === questions.length - 1 ? '完成测评' : '下一题' }}
        </button>
      </view>
    </view>

    <!-- 测评结果 -->
    <view v-if="showResult" class="result-section">
      <view class="result-card">
        <view class="result-header">
          <text class="result-icon">📊</text>
          <text class="result-title">测评完成</text>
        </view>
        <view class="result-content">
          <text class="result-desc">您的SDS测评已完成，标准分为 {{ standardScore }} 分</text>
          <view class="result-level">
            <text class="level-label">抑郁程度：</text>
            <text class="level-value" :class="getLevelClass()">{{ getDepressionLevel() }}</text>
          </view>
          <view class="result-interpretation">
            <text class="interpretation-title">结果解释：</text>
            <text class="interpretation-text">{{ getInterpretation() }}</text>
          </view>
          <view class="result-suggestion">
            <text class="suggestion-title">建议：</text>
            <text class="suggestion-text">{{ getSuggestion() }}</text>
          </view>
        </view>
        <view class="result-actions">
          <button class="btn btn-secondary" @click="retakeTest">重新测评</button>
          <button class="btn btn-primary" @click="saveResult">保存结果</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentQuestion = ref(0)
const answers = ref({})
const showResult = ref(false)
const rawScore = ref(0)
const standardScore = ref(0)

// 答题选项
const options = [
  '没有或很少时间',
  '小部分时间',
  '相当多时间',
  '绝大部分或全部时间'
]

// SDS题目
const questions = ref([
  { text: '我感到情绪沮丧，郁闷', reverse: false },
  { text: '我感到早晨心情最好', reverse: true },
  { text: '我要哭或想哭', reverse: false },
  { text: '我夜间睡眠不好', reverse: false },
  { text: '我吃饭像平时一样多', reverse: true },
  { text: '我的性功能正常', reverse: true },
  { text: '我感到体重减轻', reverse: false },
  { text: '我为便秘烦恼', reverse: false },
  { text: '我的心跳比平时快', reverse: false },
  { text: '我无故感到疲劳', reverse: false },
  { text: '我的头脑像往常一样清楚', reverse: true },
  { text: '我做事情像平时一样不感到困难', reverse: true },
  { text: '我坐卧不安，难以保持平静', reverse: false },
  { text: '我对未来感到有希望', reverse: true },
  { text: '我比平时更容易激怒', reverse: false },
  { text: '我觉得决定什么事很容易', reverse: true },
  { text: '我感到自己是有用的和不可缺少的人', reverse: true },
  { text: '我的生活很有意义', reverse: true },
  { text: '假若我死了别人会过得更好', reverse: false },
  { text: '我仍旧喜爱那些我过去喜爱的东西', reverse: true }
])

onMounted(() => {
  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
  }
})

function goBack() {
  if (currentQuestion.value > 0 || showResult.value) {
    uni.showModal({
      title: '确认退出',
      content: '退出将丢失当前测评进度，确定要退出吗？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateBack()
        }
      }
    })
  } else {
    uni.navigateBack()
  }
}

function selectAnswer(answerValue) {
  answers.value[currentQuestion.value] = answerValue
}

function previousQuestion() {
  if (currentQuestion.value > 0) {
    currentQuestion.value--
  }
}

function nextQuestion() {
  if (!answers.value[currentQuestion.value]) {
    uni.showToast({
      title: '请选择答案',
      icon: 'none'
    })
    return
  }

  if (currentQuestion.value < questions.value.length - 1) {
    currentQuestion.value++
  } else {
    // 完成测评
    calculateResult()
  }
}

function calculateResult() {
  let total = 0
  for (let i = 0; i < questions.value.length; i++) {
    const question = questions.value[i]
    const answer = answers.value[i] || 1
    
    // 反向计分题目需要转换分数
    if (question.reverse) {
      total += (5 - answer)
    } else {
      total += answer
    }
  }
  
  rawScore.value = total
  // SDS标准分 = 粗分 × 1.25，四舍五入到整数
  standardScore.value = Math.round(total * 1.25)
  showResult.value = true
  saveResult() // 自动保存结果
}

function getDepressionLevel() {
  const score = standardScore.value
  if (score < 50) {
    return '正常范围'
  } else if (score < 60) {
    return '轻度抑郁'
  } else if (score < 70) {
    return '中度抑郁'
  } else {
    return '重度抑郁'
  }
}

function getLevelClass() {
  const score = standardScore.value
  if (score < 50) {
    return 'level-normal'
  } else if (score < 60) {
    return 'level-mild'
  } else if (score < 70) {
    return 'level-moderate'
  } else {
    return 'level-severe'
  }
}

function getInterpretation() {
  const score = standardScore.value
  if (score < 50) {
    return '您目前的抑郁症状在正常范围内，心理状态较为健康。'
  } else if (score < 60) {
    return '您存在轻度的抑郁症状，可能会感到情绪低落，但日常生活功能基本正常。'
  } else if (score < 70) {
    return '您存在中度的抑郁症状，情绪问题可能已经影响到日常生活和工作。'
  } else {
    return '您存在重度的抑郁症状，严重影响日常生活，建议立即寻求专业帮助。'
  }
}

function getSuggestion() {
  const score = standardScore.value
  if (score < 50) {
    return '保持积极的生活态度，适当运动，维持良好的社交关系。'
  } else if (score < 60) {
    return '建议关注自己的情绪变化，可以通过运动、兴趣爱好等方式调节情绪，必要时咨询心理专家。'
  } else if (score < 70) {
    return '建议尽快寻求心理咨询师的专业帮助，进行心理治疗或药物治疗。'
  } else {
    return '强烈建议立即就医，寻求精神科医生或心理治疗师的专业治疗。'
  }
}

function retakeTest() {
  currentQuestion.value = 0
  answers.value = {}
  showResult.value = false
  rawScore.value = 0
  standardScore.value = 0
}

function saveResult() {
  // 保存测评结果到本地
  const result = {
    testType: 'SDS',
    rawScore: rawScore.value,
    standardScore: standardScore.value,
    level: getDepressionLevel(),
    answers: answers.value,
    date: new Date().toISOString(),
    interpretation: getInterpretation(),
    suggestion: getSuggestion()
  }
  
  const existingResults = uni.getStorageSync('testResults') || []
  existingResults.push(result)
  uni.setStorageSync('testResults', existingResults)
  
  // 设置测评数据的登录时间标识，与当前登录时间同步
  const currentLoginTime = uni.getStorageSync('loginTime')
  if (currentLoginTime) {
    uni.setStorageSync('testDataLoginTime', currentLoginTime)
  }
  
  uni.showToast({
    title: '结果已保存',
    icon: 'success',
    duration: 2000
  })
  
  setTimeout(() => {
    uni.navigateBack()
  }, 2000)
}
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 顶部导航 */
.header {
  display: flex;
  align-items: center;
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
  margin-right: 16rpx;
}

.back-btn .icon {
  font-size: 48rpx;
  color: #333;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

/* 说明卡片 */
.instruction-card {
  background: linear-gradient(135deg, #f8fcff 0%, #e6f4ff 100%);
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  border: 1rpx solid #e6f4ff;
}

.instruction-title {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.instruction-title .icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.instruction-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 24rpx;
}

.instruction-points {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.point {
  font-size: 26rpx;
  color: #888;
  line-height: 1.4;
}

/* 进度条 */
.progress-section {
  padding: 24rpx 32rpx;
  background: #fff;
  margin-bottom: 24rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #666;
}

.progress-percent {
  color: #2196f3;
  font-weight: 600;
}

.progress-bar {
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2196f3, #64b5f6);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

/* 题目卡片 */
.question-card {
  background: linear-gradient(135deg, #f8fcff 0%, #e6f4ff 100%);
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  border: 1rpx solid #e6f4ff;
}

.question-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 32rpx;
  display: block;
  line-height: 1.5;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.option-item {
  padding: 24rpx;
  border: 2rpx solid #e6f4ff;
  border-radius: 12rpx;
  background: #fafcff;
  transition: all 0.2s ease;
}

.option-item.active {
  border-color: #2196f3;
  background: rgba(33, 150, 243, 0.08);
}

.option-text {
  font-size: 28rpx;
  color: #333;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  background: #fff;
  position: sticky;
  bottom: 0;
}

.btn {
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

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:disabled {
  background: #f0f0f0;
  color: #ccc;
}

.btn-primary {
  background: linear-gradient(90deg, #2196f3, #64b5f6);
  color: #fff;
}

.btn-primary:disabled {
  background: #e0e0e0;
  color: #aaa;
}

/* 结果页面 */
.result-section {
  padding: 24rpx;
}

.result-card {
  background: linear-gradient(135deg, #fafcff 0%, #f8fcff 100%);
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
  border: 1rpx solid #e6f4ff;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.result-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.result-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.result-content {
  margin-bottom: 32rpx;
}

.result-desc {
  font-size: 32rpx;
  color: #333;
  text-align: center;
  margin-bottom: 24rpx;
  display: block;
}

.result-level {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.level-label {
  font-size: 28rpx;
  color: #666;
  margin-right: 12rpx;
}

.level-value {
  font-size: 32rpx;
  font-weight: 600;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

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

.result-interpretation,
.result-suggestion {
  margin-bottom: 24rpx;
}

.interpretation-title,
.suggestion-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.interpretation-text,
.suggestion-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  display: block;
}

.result-actions {
  display: flex;
  gap: 24rpx;
}
</style>
