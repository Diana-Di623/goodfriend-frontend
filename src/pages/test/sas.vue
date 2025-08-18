
<template>
  <view class="test-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="title">焦虑自评量表（SAS）</text>
    </view>

    <!-- 测评说明 -->
    <view class="instruction-card">
      <view class="instruction-title">
        <text class="icon">📋</text>
        <text>测评说明</text>
      </view>
      <view class="instruction-content">
        <text class="instruction-text">SAS是评估焦虑状态的经典量表，通过20个项目测量您最近一周的焦虑程度，帮助识别和评估焦虑症状的严重程度。</text>
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
          <text class="result-desc">您的SAS测评已完成，标准分为 {{ standardScore }} 分</text>
          <view class="result-level">
            <text class="level-label">焦虑程度：</text>
            <text class="level-value" :class="getLevelClass()">{{ getAnxietyLevel() }}</text>
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
            <button
              class="btn btn-primary"
              @click="saveResult"
              :disabled="saving"
            >保存结果</button>
          </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { testAPI } from '@/utils/api.js'

const currentQuestion = ref(0)
const answers = ref({})
const showResult = ref(false)
const rawScore = ref(0)
const standardScore = ref(0)
const saving = ref(false) // 新增：保存中状态

// 答题选项
const options = [
  '没有或很少时间',
  '小部分时间',
  '相当多时间',
  '绝大部分或全部时间'
]

// SAS题目
const questions = ref([
  { text: '我觉得比平常容易紧张或着急', reverse: false },
  { text: '我无缘无故地感到害怕', reverse: false },
  { text: '我容易心里烦乱或觉得惊恐', reverse: false },
  { text: '我觉得我可能将要发疯', reverse: false },
  { text: '我觉得一切都很好，也不会有什么不幸发生', reverse: true },
  { text: '我手脚发抖打颤', reverse: false },
  { text: '我因为头痛、颈痛和背痛而苦恼', reverse: false },
  { text: '我感觉容易衰弱和疲乏', reverse: false },
  { text: '我觉得心平气和，并且容易安静坐着', reverse: true },
  { text: '我觉得心跳得很快', reverse: false },
  { text: '我因为一阵阵头晕而苦恼', reverse: false },
  { text: '我有晕倒发作，或觉得要晕倒似的', reverse: false },
  { text: '我吸气呼气都感到很容易', reverse: true },
  { text: '我的手脚麻木和刺痛', reverse: false },
  { text: '我因为胃痛和消化不良而苦恼', reverse: false },
  { text: '我常常要小便', reverse: false },
  { text: '我的手脚常常是干燥温暖的', reverse: true },
  { text: '我脸红发热', reverse: false },
  { text: '我容易入睡并且一夜睡得很好', reverse: true },
  { text: '我作恶梦', reverse: false }
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
  // SAS标准分 = 粗分 × 1.25，四舍五入到整数
  standardScore.value = Math.round(total * 1.25)
  showResult.value = true
}

function getAnxietyLevel() {
  const score = standardScore.value
  if (score < 50) {
    return '正常范围'
  } else if (score < 60) {
    return '轻度焦虑'
  } else if (score < 70) {
    return '中度焦虑'
  } else {
    return '重度焦虑'
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
    return '您目前的焦虑水平在正常范围内，心理状态比较稳定。'
  } else if (score < 60) {
    return '您存在轻度的焦虑症状，可能会感到紧张不安，但不会严重影响日常生活。'
  } else if (score < 70) {
    return '您存在中度的焦虑症状，焦虑情绪可能影响到日常生活和工作效率。'
  } else {
    return '您存在重度的焦虑症状，严重影响日常生活，建议立即寻求专业帮助。'
  }
}

function getSuggestion() {
  const score = standardScore.value
  if (score < 50) {
    return '保持良好的生活习惯，适当运动，学习放松技巧来维持心理健康。'
  } else if (score < 60) {
    return '建议学习一些放松技巧，如深呼吸、冥想等，适当调整生活节奏，必要时咨询心理专家。'
  } else if (score < 70) {
    return '建议尽快寻求心理咨询师的专业帮助，学习焦虑管理技巧，考虑心理治疗。'
  } else {
    return '强烈建议立即就医，寻求精神科医生或心理治疗师的专业治疗，可能需要药物治疗。'
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
  if (saving.value) return // 防止重复点击
  saving.value = true
  // 保存测评结果到本地
  const result = {
    testType: 'SAS',
    rawScore: rawScore.value,
    standardScore: standardScore.value,
    level: getAnxietyLevel(),
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
  // 只传 testName 和 score 给后端
  testAPI.postSaveTestResult({
    testName: 'SAS',
    score: standardScore.value
  }).then(() => {
    uni.showToast({
      title: '结果已保存',
      icon: 'success',
      duration: 1000
    })
  }).catch(() => {
    uni.showToast({
      title: '保存失败',
      icon: 'none',
      duration: 1000
    })
  })
  
  setTimeout(() => {
    uni.navigateTo({
      url: '/pages/test/results'
    })
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
  background: linear-gradient(135deg, #fff8f0 0%, #ffebdc 100%);
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  border: 1rpx solid #ffe0cc;
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
  color: #ff9800;
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
  background: linear-gradient(90deg, #ff9800, #ffc107);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

/* 题目卡片 */
.question-card {
  background: linear-gradient(135deg, #fffaf5 0%, #fff5eb 100%);
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  border: 1rpx solid #ffebdc;
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
  border: 2rpx solid #ffe0cc;
  border-radius: 12rpx;
  background: #fffcf8;
  transition: all 0.2s ease;
}

.option-item.active {
  border-color: #ff9800;
  background: rgba(255, 152, 0, 0.15);
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
  background: linear-gradient(90deg, #ff9800, #ffc107);
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
  background: linear-gradient(135deg, #fff8f2 0%, #ffede5 100%);
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
  border: 1rpx solid #ffd6bf;
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
