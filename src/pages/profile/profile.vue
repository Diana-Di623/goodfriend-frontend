
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
            :src="userInfo.avatar || 'http://127.0.0.1:8080/static/user/avatars/default.jpg'" 
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

      <!-- 兴趣爱好 -->
      <view class="form-item">
        <text class="label">兴趣爱好📝</text>
        <textarea
          v-model="userInfo.hobbies"
          class="textarea-field"
          placeholder="简单介绍一下自己..."
          maxlength="200"
        />
      </view>

      <!-- 咨询方式 -->
      <view class="form-item" v-if="userInfo.consultationMethods && userInfo.consultationMethods.length > 0">
        <text class="label consultant-info-label">咨询方式💬</text>
        <view class="consultation-methods-field">
          <text class="consultation-methods-text">{{ userInfo.consultationMethods.join('、') }}</text>
        </view>
      </view>

      <!-- 可用时间 -->
      <view class="form-item" v-if="userInfo.availability">
        <text class="label consultant-info-label">可用时间⏰</text>
        <view class="availability-field">
          <text class="availability-text">{{ userInfo.availability }}</text>
        </view>
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
        <!-- 咨询师申请状态按钮 -->
        <button class="action-btn status-btn" @click="showApplicationDetails">
          <text class="action-icon">📋</text>
          <text class="action-text">咨询师申请状态</text>

        </button>
        
        <button class="action-btn counselor-btn" @click="applyCounselor">
          <text class="action-icon">👨‍⚕️</text>
          <text class="action-text">申请成为咨询师</text>
        </button>
        
        <button class="action-btn logout-btn" @click="handleLogout">
          <text class="action-icon">🚪</text>
          <text class="action-text">退出登录</text>
        </button>
      </view>
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
    <view class="nav-item" @click="goMyAppointments">
      <text class="nav-icon">📅</text>
      <text class="nav-label">我的预约</text>
    </view>
    <view class="nav-item">
      <text class="nav-icon">👤</text>
      <text class="nav-label">个人中心</text>
    </view>
  </view>
    <!-- 申请咨询师弹窗 -->
    <view v-if="showCounselorModal" class="counselor-modal">
      <view class="modal-overlay" @click="closeCounselorModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">申请成为咨询师</text>
          <view class="close-btn" @click="closeCounselorModal">✕</view>
        </view>
        
        <scroll-view scroll-y class="modal-body">
          <view class="form-group">
            <text class="form-label">真实姓名 *</text>
            <input 
              v-model="counselorApplication.realName"
              class="form-input"
              placeholder="请输入真实姓名"
              maxlength="20"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">身份证号 *</text>
            <input 
              v-model="counselorApplication.idCard"
              class="form-input"
              placeholder="请输入身份证号"
              maxlength="18"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">手机号码 *</text>
            <input 
              v-model="counselorApplication.phone"
              class="form-input"
              placeholder="请输入手机号码"
              type="number"
              maxlength="11"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">学历 *</text>
            <picker 
              mode="selector" 
              :range="educationOptions"
              :value="counselorApplication.educationIndex"
              @change="onEducationChange"
            >
              <view class="picker-input">
                <text :class="{ placeholder: counselorApplication.educationIndex === -1 }">
                  {{ counselorApplication.educationIndex !== -1 ? educationOptions[counselorApplication.educationIndex] : '请选择学历' }}
                </text>
              </view>
            </picker>
          </view>
          
          <view class="form-group">
            <text class="form-label">毕业院校 *</text>
            <input 
              v-model="counselorApplication.university"
              class="form-input"
              placeholder="请输入毕业院校"
              maxlength="50"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">所学专业 *</text>
            <input 
              v-model="counselorApplication.major"
              class="form-input"
              placeholder="请输入所学专业"
              maxlength="50"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">执业证书编号</text>
            <input 
              v-model="counselorApplication.licenseNumber"
              class="form-input"
              placeholder="如有心理咨询师证书请填写"
              maxlength="30"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">工作经验（年） *</text>
            <input 
              v-model="counselorApplication.experience"
              class="form-input"
              placeholder="请输入工作经验年数"
              type="number"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">擅长领域 *</text>
            <view class="specialty-grid">
              <view 
                v-for="specialty in specialtyOptions"
                :key="specialty"
                class="specialty-item"
                :class="{ active: counselorApplication.specialties.includes(specialty) }"
                @click="toggleSpecialty(specialty)"
              >
                <text class="specialty-text">{{ specialty }}</text>
              </view>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">个人简介 *</text>
            <textarea
              v-model="counselorApplication.bio"
              class="form-textarea"
              placeholder="请简要介绍您的专业背景、工作经验和咨询理念（100-500字）"
              maxlength="500"
            />
            <text class="char-count">{{ counselorApplication.bio.length }}/500</text>
          </view>
          
          <view class="form-group">
            <text class="form-label">申请理由 *</text>
            <textarea
              v-model="counselorApplication.reason"
              class="form-textarea"
              placeholder="请说明您申请成为平台咨询师的理由和目标"
              maxlength="300"
            />
            <text class="char-count">{{ counselorApplication.reason.length }}/300</text>
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeCounselorModal">取消</button>
          <button class="submit-btn" @click="submitCounselorApplication">提交申请</button>
        </view>
      </view>
    </view>

    <!-- 头像选择弹窗 -->
    <view v-if="showAvatarModal" class="avatar-modal">
      <view class="modal-overlay" @click="closeAvatarModal"></view>
      <view class="modal-content avatar-modal-content">
        <view class="modal-header">
          <text class="modal-title">选择头像</text>
          <view class="close-btn" @click="closeAvatarModal">✕</view>
        </view>
        
        <scroll-view scroll-y class="modal-body" enhanced="true" show-scrollbar="true">
          <view class="avatar-options">
            <view class="avatar-option-section">
              <text class="section-title">请选择头像 (共{{ availableAvatars.length }}个)</text>
              <view class="avatar-grid" v-if="availableAvatars.length > 0">
                <view 
                  v-for="avatar in availableAvatars"
                  :key="avatar.id"
                  class="avatar-option"
                  :class="{ active: selectedAvatarUrl === avatar.url }"
                  @click="selectAvatar(avatar.url)"
                >
                  <image 
                    :src="avatar.url" 
                    class="avatar-preview"
                    mode="aspectFill"
                    @error="(e) => onAvatarLoadError(e, avatar)"
                    @load="onAvatarLoad"
                    show-loading
                  />
                  <view v-if="selectedAvatarUrl === avatar.url" class="avatar-check">
                    <text class="check-icon">✓</text>
                  </view>
                </view>
              </view>
              
              <view v-else class="loading-avatars">
                <view class="loading-spinner-small">
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                </view>
                <text>正在加载头像选项...</text>
              </view>
            </view>
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeAvatarModal">取消</button>
          <button 
            class="submit-btn" 
            @click="confirmAvatarSelection" 
            :disabled="!selectedAvatarUrl"
            :class="{ disabled: !selectedAvatarUrl }"
          >
            确认选择
          </button>
        </view>
      </view>
    </view>

    <!-- 申请状态详情弹窗 -->
    <view v-if="showApplicationStatus" class="application-status-modal">
      <view class="modal-overlay" @click="closeApplicationStatus"></view>
      <view class="modal-content application-status-content">
        <view class="modal-header">
          <text class="modal-title">咨询师申请状态</text>
          <view class="close-btn" @click="closeApplicationStatus">✕</view>
        </view>
        
        <scroll-view scroll-y class="modal-body">
          <view v-if="applicationStatus" class="application-details">
            <!-- 审核通过的特殊显示 -->
            <view v-if="applicationStatus.status === 'APPROVED' && !applicationStatus.name" class="approved-content">
              <view class="approved-icon">🎉</view>
              <view class="approved-title">恭喜！申请已通过</view>
              <view class="approved-text">
                您的咨询师申请已通过审核，现在您可以开始提供咨询服务了。
              </view>
            </view>
            
            <!-- 正常申请记录显示 -->
            <view v-else>
              <!-- 基本信息 -->
              <view class="info-section">
                <!-- 申请编号已隐藏，不再显示 -->
                <view v-if="applicationStatus.name" class="info-row">
                    <text class="info-label">申请人:</text>
                    <text class="info-value">{{ applicationStatus.name }}</text>
                </view>
                <view v-if="applicationStatus.phone" class="info-row">
                    <text class="info-label">手机号:</text>
                    <text class="info-value">{{ applicationStatus.phone }}</text>
                </view>
                <view v-if="applicationStatus.education" class="info-row">
                    <text class="info-label">学历:</text>
                    <text class="info-value">{{ applicationStatus.education }}</text>
                </view>
                <view v-if="applicationStatus.university" class="info-row">
                    <text class="info-label">学校:</text>
                    <text class="info-value">{{ applicationStatus.university }}</text>
                </view>
                <view v-if="applicationStatus.major" class="info-row">
                    <text class="info-label">专业:</text>
                    <text class="info-value">{{ applicationStatus.major }}</text>
                </view>
                <view v-if="applicationStatus.experienceYears" class="info-row">
                    <text class="info-label">工作年限:</text>
                    <text class="info-value">{{ applicationStatus.experienceYears }}年</text>
                </view>
                <view v-if="applicationStatus.specialty" class="info-row">
                    <text class="info-label">专长领域:</text>
                    <text class="info-value">{{ applicationStatus.specialty?.join(', ') || '无' }}</text>
                </view>
              </view>
            
            <!-- 申请状态 -->
            <view class="status-section">
              <view class="status-header">
                <text class="status-label">申请状态:</text>
                <text class="status-value" :class="applicationStatus.status.toLowerCase()">
                  {{ applicationStatus.status === 'PENDING' ? '等待审核' : 
                      applicationStatus.status === 'APPROVED' ? '审核通过' : 
                      applicationStatus.status === 'REJECTED' ? '审核失败' : applicationStatus.status }}
                </text>
              </view>
              
              <!-- 审核意见 -->
              <view v-if="applicationStatus.reviewComment" class="review-section">
                <text class="review-label">{{ applicationStatus.status === 'REJECTED' ? '拒绝原因:' : '审核意见:' }}</text>
                <view class="review-comment">
                  <text>{{ applicationStatus.reviewComment }}</text>
                </view>
              </view>
              
              <view v-if="applicationStatus.createdAt" class="apply-time">
                  <text class="time-label">申请时间:</text>
                  <text class="time-value">{{ new Date(applicationStatus.createdAt).toLocaleString() }}</text>
              </view>
            </view>
            </view>
          </view>
          
          <!-- 没有申请记录时的内容 -->
          <view v-else class="no-application-content">
            <view class="no-application-icon">📝</view>
            <view class="no-application-title">暂无咨询师申请记录</view>
            <view class="no-application-text">
              您还没有提交过咨询师申请。如需成为咨询师，请通过相关渠道提交申请。
            </view>
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <button class="confirm-btn" @click="closeApplicationStatus">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { GENDER_OPTIONS, REGION_OPTIONS, BIRTHDAY_CONFIG,unreadMessageCount , isValidGender, isValidBirthday, calculateAge} from '@/utils/constants.js'
import { userAPI, counselorAPI,BASE_URL} from '@/utils/api.js'
import {handleWishClick,goHome,goTestResults,goMyAppointments,isUserInfoComplete} from '@/utils/page-turning.js'

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
  hobbies: '',
  selectedAvatarFile: '', // 保存选中的头像文件名，用于后端提交
  consultationMethods: [], // 咨询方式
  availability: '' // 可用时间
})

// 头像选择相关
const showAvatarModal = ref(false)
const availableAvatars = ref([])
const selectedAvatarUrl = ref('')

// 申请咨询师相关
const showCounselorModal = ref(false)
const counselorApplication = ref({
  realName: '',
  idCard: '',
  phone: '',
  educationIndex: -1,
  university: '',
  major: '',
  licenseNumber: '',
  experience: '',
  specialties: [],
  bio: '',
  reason: ''
})

// 咨询师申请状态相关
const applicationStatus = ref(null) // 申请状态数据
const showApplicationStatus = ref(false) // 是否显示申请状态
const consultantApplicationStatus = ref(null) // 咨询师申请状态标识

// 学历选项
const educationOptions = [
  '高中及以下',
  '大专',
  '本科',
  '硕士',
  '博士'
]

// 擅长领域选项
const specialtyOptions = [
  '焦虑抑郁',
  '情感关系',
  '青少年心理',
  '家庭治疗',
  '职场压力',
  '情绪管理',
  '婚姻咨询',
  '创伤治疗',
  '认知行为',
  '亲子关系',
  '强迫症',
  '睡眠障碍'
]

onMounted(() => {
  loadUserInfo()
})

// 加载用户信息
async function loadUserInfo() {
  try {
    // 先从本地存储加载基本信息
    const storedInfo = uni.getStorageSync('userInfo') || {}
    userInfo.value = {
      avatar: storedInfo.avatar || '',
      nickname: storedInfo.nickname || '',
      gender: storedInfo.gender || '',
      birthday: storedInfo.birthday || '',
      location: storedInfo.location || '',
      customLocation: storedInfo.customLocation || '',
      phone: storedInfo.phone || '',
      hobbies: storedInfo.hobbies || '',
      consultationMethods: storedInfo.consultationMethods || [],
      availability: storedInfo.availability || ''
    }
    
    // 设置地区选择器索引
    if (userInfo.value.location) {
      const regionIndex = REGION_OPTIONS.findIndex(item => item.value === userInfo.value.location)
      if (regionIndex !== -1) {
        selectedRegionIndex.value = regionIndex
      }
    }
    
    // 如果有token，尝试从服务器加载用户信息
    const token = uni.getStorageSync('token')
    if (token) {
      try {
        console.log('从服务器加载用户信息...')
        const response = await userAPI.getUserInfo()
        console.log('服务器返回的用户信息:', response)
        
        if (response) {
          // 更新用户信息
          const serverUserInfo = {
            avatar: response.avatar ? `${BASE_URL}/static/${response.avatar}` : userInfo.value.avatar,
            nickname: response.name || userInfo.value.nickname,
            gender: response.gender === 'MALE' ? '男' : 
                   response.gender === 'FEMALE' ? '女' : 
                   response.gender === 'UNKNOWN' ? '未知' : userInfo.value.gender,
            birthday: response.birthday || userInfo.value.birthday,
            location: response.region || userInfo.value.location,
            customLocation: userInfo.value.customLocation,
            phone: userInfo.value.phone,
            hobbies: response.hobby || userInfo.value.hobbies,
            consultationMethods: response.consultationMethods || userInfo.value.consultationMethods || [],
            availability: response.availability || userInfo.value.availability || ''
          }
          
          userInfo.value = serverUserInfo
          
          // 重新设置地区选择器索引
          if (userInfo.value.location) {
            const regionIndex = REGION_OPTIONS.findIndex(item => item.value === userInfo.value.location)
            if (regionIndex !== -1) {
              selectedRegionIndex.value = regionIndex
            }
          }
          
          // 更新本地存储
          const updatedUserInfo = {
            ...storedInfo,
            ...serverUserInfo,
            age: response.age || storedInfo.age
          }
          uni.setStorageSync('userInfo', updatedUserInfo)
        }
      } catch (error) {
        console.error('从服务器加载用户信息失败:', error)
        // 服务器加载失败时继续使用本地信息
      }
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

// 选择性别
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

// 选择头像
async function chooseAvatar() {
  try {
    showAvatarModal.value = true
    selectedAvatarUrl.value = userInfo.value.avatar || ''
    
    // 每次都重新加载可用头像列表
    console.log('开始加载头像列表...')
    await loadAvailableAvatars()
  } catch (error) {
    console.error('打开头像选择失败:', error)
    uni.showToast({
      title: '加载头像失败',
      icon: 'none'
    })
  }
}

// 加载可用头像列表
async function loadAvailableAvatars() {
  try {
    console.log('开始加载可用头像列表...')
    const response = await userAPI.getAvailableAvatars()
    
    console.log('头像API响应:', response)
    
    // 根据实际API响应格式处理数据
    let avatarList = []
    if (response && response.success && Array.isArray(response.data)) {
      avatarList = response.data
    } else if (Array.isArray(response)) {
      avatarList = response
    } else if (response && Array.isArray(response.data)) {
      avatarList = response.data
    }
    
    // 过滤掉 valid=false 的头像
    avatarList = avatarList.filter(avatar => avatar.valid !== false)
    
    // 处理头像数据，API返回格式为 {name, file}
    availableAvatars.value = avatarList.map((avatar, index) => {
      let filePath = avatar.file
      let avatarUrl = `${BASE_URL}/static/${filePath}`
      let fileName = avatar.name
      return {
        id: avatar.id || `avatar-${index + 1}`,
        url: avatarUrl,
        name: avatar.name || `头像${index + 1}`,
        file: fileName
      }
    })
    
    // 去除重复的头像 (基于URL去重)
    const uniqueAvatars = []
    const seenUrls = new Set()
    
    for (const avatar of availableAvatars.value) {
      if (!seenUrls.has(avatar.url)) {
        seenUrls.add(avatar.url)
        uniqueAvatars.push(avatar)
      }
    }
    
    availableAvatars.value = uniqueAvatars
    
    console.log('头像列表:', availableAvatars.value)
    
    // 如果没有头像数据，提供默认头像
    if (availableAvatars.value.length === 0) {
      availableAvatars.value = [
        {
          id: 'default',
          url: `${BASE_URL}/static/user/avatars/default.jpg`,
          name: '默认头像',
          file: 'default'
        }
      ]
    }
  } catch (error) {
    console.error('加载头像列表失败:', error)
    // 提供默认头像作为备选
    availableAvatars.value = [
      {
        id: 'default',
        url: `${BASE_URL}/static/user/avatars/default.jpg`,
        name: '默认头像',
        file: 'default'
      }
    ]
  }
}

// 选择预设头像
function selectAvatar(avatarUrl) {
  selectedAvatarUrl.value = avatarUrl
}

// 显示申请状态详情
function showApplicationDetails() {
  // 总是显示弹窗，不管是否有申请记录
  console.log('=== 显示申请详情 ===')
  console.log('当前 applicationStatus:', applicationStatus.value)
  console.log('当前 consultantApplicationStatus:', consultantApplicationStatus.value)
  showApplicationStatus.value = true
}

// 关闭申请状态详情
function closeApplicationStatus() {
  showApplicationStatus.value = false
}

// 头像加载错误处理
function onAvatarLoadError(e, avatar) {
  console.error('头像加载失败:', e)
  console.error('图片URL:', e.target?.src || '未知URL')
  console.error('头像信息:', avatar)
  
  // 尝试不同的文件扩展名
  if (e.target && avatar) {
    const currentUrl = e.target.src
    let newUrl = null
    
    // 如果当前URL没有扩展名，尝试添加.jpg
    if (!currentUrl.includes('.jpg') && !currentUrl.includes('.png') && !currentUrl.includes('.jpeg')) {
      newUrl = `${currentUrl}.jpg`
    }
    // 如果是.jpg，尝试.png
    else if (currentUrl.includes('.jpg')) {
      newUrl = currentUrl.replace('.jpg', '.png')
    }
    // 如果是.png，尝试.jpeg
    else if (currentUrl.includes('.png') && !currentUrl.includes('.jpeg')) {
      newUrl = currentUrl.replace('.png', '.jpeg')
    }
    
    // 如果有新的URL可以尝试，并且还没有尝试过这个URL
    if (newUrl && !e.target.hasAttribute('data-retry')) {
      e.target.setAttribute('data-retry', 'true')
      e.target.src = newUrl
      console.log('尝试新的URL:', newUrl)
      return
    }
  }
  
}

// 头像加载成功处理
function onAvatarLoad(e) {
  console.log('头像加载成功:', e.target?.src)
}

// 确认头像选择
async function confirmAvatarSelection() {
  if (!selectedAvatarUrl.value) {
    uni.showToast({
      title: '请选择头像',
      icon: 'none'
    })
    return
  }
  
  try {
    // 查找选中的头像信息
    const selectedAvatar = availableAvatars.value.find(avatar => avatar.url === selectedAvatarUrl.value)
    console.log('选中的头像信息:', selectedAvatar)
    
    if (selectedAvatar && selectedAvatar.file) {
      // 只更新本地显示，不发送后端请求
      userInfo.value.avatar = selectedAvatarUrl.value
      userInfo.value.selectedAvatarFile = selectedAvatar.file // 保存文件名，用于后续保存
      
      console.log('头像已选择，文件名:', selectedAvatar.file)
      console.log('头像URL:', selectedAvatarUrl.value)
      
      closeAvatarModal()
      
      uni.showToast({
        title: '头像已选择',
        icon: 'success'
      })
      
    } else {
      // 直接使用选中的URL
      userInfo.value.avatar = selectedAvatarUrl.value
      closeAvatarModal()
      
      uni.showToast({
        title: '头像已选择',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('选择头像失败:', error)
    uni.showToast({
      title: '选择头像失败',
      icon: 'none'
    })
  }
}

// 关闭头像选择模态框
function closeAvatarModal() {
  showAvatarModal.value = false
  selectedAvatarUrl.value = ''
}

// 保存用户信息
async function saveUserInfo() {
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
  if ( !userInfo.value.location ||
    userInfo.value.location === '请选择所在城市' ||
    userInfo.value.location === '未知'
  ) {
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

  try {
    // 确定最终的地区显示
    const finalLocation = userInfo.value.location === '其他' 
      ? userInfo.value.customLocation 
      : userInfo.value.location
    
    // 计算年龄（用于后续使用）
    const age = calculateAge(userInfo.value.birthday)
    
    // 构造符合后端API格式的数据
    const updateData = {
      name: userInfo.value.nickname,
      age: age,
      gender: userInfo.value.gender === '女' ? 'FEMALE' : 'UNKNOWN',
      region: finalLocation,
      avatar: userInfo.value.selectedAvatarFile,
      birthday: userInfo.value.birthday,
      hobby: userInfo.value.hobbies || ''
    }
    console.log('发送给后端的用户信息:', updateData)
    
    // 调用真实的更新API
    const response = await userAPI.updateUserInfo(updateData)
    
    console.log('后端响应:', response)
    
    // 保存到本地存储
    const updatedUserInfo = {
      ...userInfo.value,
      nickname: updateData.name,
      location: finalLocation,
      age: age,
      detailedInfoCompleted: true,
      updatedAt: new Date().toISOString()
    }
    
    uni.setStorageSync('userInfo', updatedUserInfo)
    
    uni.hideLoading()
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
    
    // 保存成功后重新加载用户信息，但不跳转页面
    setTimeout(() => {
      loadUserInfo()
    }, 1000)
    
  } catch (error) {
    uni.hideLoading()
    console.error('保存用户信息失败:', error)
    
    let errorMessage = '保存失败，请重试'
    if (error.statusCode === 400) {
      errorMessage = '请检查输入信息格式'
    } else if (error.statusCode === 401) {
      errorMessage = '登录已过期，请重新登录'
    } else if (error.data && error.data.message) {
      errorMessage = error.data.message
    }
    
    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    })
  }
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

// 申请咨询师
function applyCounselor() {
  // 检查用户是否已完善个人信息
  const storedUserInfo = uni.getStorageSync('userInfo')
  if (!isUserInfoComplete(storedUserInfo)) {
    uni.showModal({
      title: '请先完善个人信息',
      content: '申请成为咨询师前，请先完善您的个人资料，包括昵称、性别、生日、地区等信息',
      showCancel: false,
      confirmText: '去完善',
      success: (res) => {
        if (res.confirm) {
          // 滚动到页面顶部
          uni.pageScrollTo({
            scrollTop: 0,
            duration: 300
          })
        }
      }
    })
    return
  }

  // 允许多次申请 - 检查当前用户的申请状态
  const currentUser = uni.getStorageSync('userInfo')
  const userId = currentUser?.phone || currentUser?.id || 'unknown'
  const userApplicationKey = `counselorApplication_${userId}`
  
  const existingApplication = uni.getStorageSync(userApplicationKey)
  if (existingApplication && existingApplication.status === 'pending') {
    uni.showModal({
      title: '再次申请',
      content: '检测到您之前已提交过申请。您可以再次提交新的申请，新申请将覆盖之前的申请。',
      showCancel: true,
      cancelText: '取消',
      confirmText: '继续申请',
      success: (res) => {
        if (res.confirm) {
          // 用户选择继续申请，继续执行后续代码
          initializeApplicationForm()
        }
        // 如果用户取消，则不执行任何操作
      }
    })
    return
  }

  // 初始化申请表单
  initializeApplicationForm()
}

// 初始化申请表单的函数
function initializeApplicationForm() {
  counselorApplication.value = {
    realName: '',
    idCard: '',
    phone: userInfo.phone || '',
    educationIndex: -1,
    university: '',
    major: '',
    licenseNumber: '',
    experience: '',
    specialties: [],
    bio: '',
    reason: ''
  }
  
  showCounselorModal.value = true
}

// 关闭申请弹窗
function closeCounselorModal() {
  showCounselorModal.value = false
}

// 学历选择变更
function onEducationChange(e) {
  counselorApplication.value.educationIndex = e.detail.value
}

// 切换擅长领域
function toggleSpecialty(specialty) {
  const specialties = counselorApplication.value.specialties
  const index = specialties.indexOf(specialty)
  if (index > -1) {
    specialties.splice(index, 1)
  } else {
    if (specialties.length < 5) { // 最多选择5个擅长领域
      specialties.push(specialty)
    } else {
      uni.showToast({
        title: '最多选择5个擅长领域',
        icon: 'none'
      })
    }
  }
}

// 提交申请
async function submitCounselorApplication() {
  const app = counselorApplication.value
  
  // 表单验证
  if (!app.realName.trim()) {
    uni.showToast({ title: '请输入真实姓名', icon: 'none' })
    return
  }
  
  if (!app.idCard.trim() || !/^\d{17}[\dX]$/.test(app.idCard)) {
    uni.showToast({ title: '请输入正确的身份证号', icon: 'none' })
    return
  }
  
  if (!app.phone.trim() || !/^1[3-9]\d{9}$/.test(app.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  
  if (app.educationIndex === -1) {
    uni.showToast({ title: '请选择学历', icon: 'none' })
    return
  }
  
  if (!app.university.trim()) {
    uni.showToast({ title: '请输入毕业院校', icon: 'none' })
    return
  }
  
  if (!app.major.trim()) {
    uni.showToast({ title: '请输入所学专业', icon: 'none' })
    return
  }
  
  if (!app.experience || app.experience < 0) {
    uni.showToast({ title: '请输入正确的工作经验年数', icon: 'none' })
    return
  }
  
  if (app.specialties.length === 0) {
    uni.showToast({ title: '请至少选择一个擅长领域', icon: 'none' })
    return
  }
  
  if (!app.bio.trim() || app.bio.length < 100) {
    uni.showToast({ title: '个人简介至少需要100字', icon: 'none' })
    return
  }
  
  if (!app.reason.trim()) {
    uni.showToast({ title: '请填写申请理由', icon: 'none' })
    return
  }

  uni.showLoading({ title: '提交中...' })

  try {
    // 构造符合API格式的申请数据
    const applicationData = {
      name: app.realName,
      idCardNumber: app.idCard,
      phone: app.phone,
      education: educationOptions[app.educationIndex],
      university: app.university,
      major: app.major,
      licenseNumber: app.licenseNumber,
      experienceYears: parseInt(app.experience) || 0,
      specialty: app.specialties,
      bio: app.bio,
      reason: app.reason
    }
    
    // 调用咨询师申请API
    const response = await counselorAPI.applyConsultant(applicationData)
    
    uni.hideLoading()
    
    console.log('咨询师申请API响应:', response)
    
    // 检查响应是否包含错误信息
    if (response && response.message) {
      // 后端返回了业务错误信息
      uni.showToast({
        title: response.message,
        icon: 'none',
        duration: 3000
      })
      return
    }
    
    // API调用成功 - 保存申请数据到本地
    const currentUser = uni.getStorageSync('userInfo')
    const userId = currentUser?.phone || currentUser?.id || Date.now()
    const userApplicationKey = `counselorApplication_${userId}`
    
    const localApplicationData = {
      ...applicationData,
      userId: userId,
      appliedAt: new Date().toISOString(),
      status: 'pending'
    }
    uni.setStorageSync(userApplicationKey, localApplicationData)
    
    uni.showToast({
      title: '申请提交成功',
      icon: 'success'
    })
    
    showCounselorModal.value = false
    
    // 显示后续流程提示
    setTimeout(() => {
      uni.showModal({
        title: '申请已提交',
        content: '您的咨询师申请已提交成功，我们将在3-5个工作日内完成审核，请耐心等待审核结果。',
        showCancel: false,
        confirmText: '知道了'
      })
    }, 1500)
    
  } catch (error) {
    uni.hideLoading()
    console.error('申请咨询师失败:', error)
    
    // 处理不同类型的错误
    let errorMessage = '网络连接失败，请检查网络后重试'
    
    // 优先检查后端返回的具体错误信息
    if (error.data && error.data.message) {
      errorMessage = error.data.message
    } else if (error.statusCode === 400) {
      errorMessage = '申请信息有误，请检查填写内容'
    } else if (error.statusCode === 401) {
      errorMessage = '登录状态已过期，请重新登录'
    }
    
    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    })
  }
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

/* 兴趣爱好区域 label 靠上贴边框 */
.form-item textarea.textarea-field {
  margin-top: 0;
}
/* 删除多余的右花括号，修复 CSS 语法错误 */

.form-item:last-child {
  border-bottom: none;
}

.avatar-item {
    margin-left: 8px;
    white-space: nowrap;
  align-items: flex-start;
}

.label {
  width: 180rpx;
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

/* 咨询方式和可用时间样式 */
.consultation-methods-field {
  flex: 1;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  border: 1rpx solid #e8f4f8;
}

.consultation-methods-text {
  font-size: 28rpx;
  color: #1ba7d0;
  font-weight: 500;
  line-height: 1.4;
}

.availability-field {
  flex: 1;
  background: #fff5f5;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  border: 1rpx solid #ffeaea;
}

.availability-text {
  font-size: 28rpx;
  color: #e74c3c;
  font-weight: 500;
  line-height: 1.4;
}

/* 咨询师信息标签 */
.consultant-info-label {
  color: #1ba7d0;
  font-weight: 600;
  position: relative;
}

.consultant-info-label::after {
  content: '';
  position: absolute;
  bottom: -2rpx;
  left: 0;
  width: 100%;
  height: 2rpx;
  background: linear-gradient(135deg, #1ba7d0, #4bc3b2);
  border-radius: 1rpx;
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
  background: #f8e6c2;
  border: 1rpx solid #f0680d;
  border-radius: 12rpx;
  font-size: 32rpx; /* 更大字体 */
  color: #f0680d;
  transition: all 0.2s;
  transform: scale(0.98);
  font-weight: 500;
  width: 100%;
  box-sizing: border-box;
}
.status-btn{
  background: rgba(255, 193, 7, 0.1);
  border-color: #ffc107;
  color: #ffc107;
}
.logout-btn {
  background: rgba(174, 220, 170, 0.2);
  border-color: #aedcaa;
  color: #4bc3b2;
}

.logout-btn:active {
  background: rgba(174, 220, 170, 0.3);
}

.counselor-btn {
  background: rgba(64, 193, 236, 0.1);
  border-color: #2e69e0;
  color: #2e69e0;
}

.counselor-btn:active {
  background: rgba(236, 64, 122, 0.2);
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
  white-space: nowrap;
  
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
  transition: width 0.2s ease;
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

/* 申请咨询师弹窗样式 */
.counselor-modal {
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
  width: 100%;
  max-width: 800rpx;
  max-height:100vh;
  background: #fff;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  z-index: 10001;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 32rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
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
  width: 100%;
  padding: 0 12px;
  min-height: 400rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  background: #fff;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #ec407a;
}

.picker-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  background: #fff;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.picker-input .placeholder {
  color: #999;
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx 24rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  background: #fff;
  line-height: 1.5;
  box-sizing: border-box;
  resize: none;
}

.form-textarea:focus {
  border-color: #ec407a;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.specialty-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-top: 16rpx;
}

.specialty-item {
  height: 60rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.specialty-item.active {
  border-color: #ec407a;
  background: #ec407a;
}

.specialty-text {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
}

.specialty-item.active .specialty-text {
  color: #fff;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx 40rpx;
  border-top: 1rpx solid #f0f0f0;
}

.cancel-btn {
  flex: 1;
  height: 80rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  background: #fff;
  color: #666;
  font-size: 28rpx;
  font-weight: 500;
}

.cancel-btn:active {
  background: #f5f5f5;
}

.submit-btn {
  flex: 2;
  height: 80rpx;
  background: linear-gradient(135deg, #ec407a, #ab47bc);
  border: none;
  border-radius: 12rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}

.submit-btn:active {
  opacity: 0.8;
}

/* 头像选择模态框样式 */
.avatar-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 95%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-modal-content {
  width: 95%;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.avatar-options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.avatar-option-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.avatar-option-section .section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  padding-bottom: 10rpx;
  border-bottom: 2rpx solid #e0e0e0;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  padding: 10rpx 30rpx;
  width: 100%;
  box-sizing: border-box;
  min-height: 200rpx;
  grid-auto-rows: minmax(120rpx, auto);
}
.avatar-option {
  position: relative;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 90%; /* 调整为90% */
  max-width: 100%;
  box-sizing: border-box;
  background: #f9f9f9;
  margin: 0 auto; /* 居中显示 */
}

.avatar-option:hover {
  border-color: #bbb;
  transform: scale(1.02);
  box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
}

.avatar-option.active {
  border-color: #ec407a;
  border-width: 6rpx;
  transform: scale(1.05);
  box-shadow: 0 0 20rpx rgba(236, 64, 122, 0.4);
  background: #fff;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 45rpx;
  height: 45rpx;
  background: #ec407a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid #fff;
  box-shadow: 0 2rpx 8rpx rgba(236, 64, 122, 0.3);
}

.check-icon {
  color: #fff;
  font-size: 26rpx;
  font-weight: bold;
}

.loading-avatars {
  text-align: center;
  padding: 60rpx 0;
  color: #666;
  font-size: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.loading-spinner-small {
  display: flex;
  gap: 8rpx;
}

.loading-spinner-small .dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #ec407a;
  animation: loading-bounce 1.4s ease-in-out infinite both;
}

.loading-spinner-small .dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-spinner-small .dot:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-spinner-small .dot:nth-child(3) {
  animation-delay: 0s;
}

.submit-btn:disabled,
.submit-btn.disabled {
  background: #ccc !important;
  opacity: 0.6 !important;
  cursor: not-allowed;
}

/* 响应式布局调整 */
@media (max-width: 750rpx) {
  .avatar-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 15rpx;
  }
  
}

@media (max-width: 500rpx) {
  .avatar-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12rpx;
  }
}

/* 申请状态弹窗样式 */
.application-status-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.application-status-content {
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  background: white;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.application-details {
  padding: 20px 0px;
  flex: 1;
}

.info-section {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  padding: 10px 0;
  min-height: 40px;
  box-sizing: border-box;
}

.info-label {
  color: #666;
  font-size: 14px;
  width: 100px;
  margin-bottom: 2px;
}

.info-value {
  color: #333;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  word-break: break-all;
  white-space: pre-line;
  overflow-wrap: break-word;
  text-align: left;
  margin: 0;
  max-width: 100%;
}

.status-section {
  background: #f8f9fa;
  border-radius: 10px;
  margin-right: 20px;
  align-items: center;
  flex:1;
  overflow:hidden;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.status-label {
  color: #666;
  font-size: 14px;
  font-weight: bold;
}

.status-value {
  font-size: 14px;
  font-weight: bold;
  padding: 5px 12px;
  border-radius: 20px;
  color: white;
}

.status-value.pending {
  background-color: #ffc107;
}

.status-value.approved {
  background-color: #28a745;
}

.status-value.rejected {
  background-color: #dc3545;
}

.status-indicator.no-application {
  background-color: transparent;
  color: #e6b200; /* 与主色调一致 */
}

.review-section {
  margin-top: 15px;
}

.review-label {
  color: #666;
  font-size: 14px;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
}

.review-comment {
  background: white;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e9ecef;
  min-height: 60px;
}

.review-comment text {
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.apply-time {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.time-label {
  color: #666;
  font-size: 12px;
}

.time-value {
  color: #999;
  font-size: 12px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: bold;
  min-width: 120px;
}

.no-application-content {
  text-align: center;
  padding: 40px 20px;
}

.no-application-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.no-application-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.no-application-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  max-width: 300px;
  margin: 0 auto;
}

.approved-content {
  text-align: center;
  padding: 40px 20px;
}

.approved-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.approved-title {
  font-size: 20px;
  font-weight: bold;
  color: #28a745;
  margin-bottom: 15px;
}

.approved-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  max-width: 300px;
  margin: 0 auto;

}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0;
  min-height: 40px;
  word-break: break-all;
}

.info-label {
          color: #666;
          font-size: 14px;
          flex-shrink: 0;
          width: 100px;
          line-height: 1.6;
        }
</style>
