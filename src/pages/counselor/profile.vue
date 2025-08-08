<template>
  <view class="counselor-profile-page">
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

    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <view class="nav-left"></view>
        <text class="title">个人简历</text>
        <view class="nav-right">
          <text class="counselor-badge">咨询师</text>
        </view>
      </view>
    </view>

    <!-- 个人资料卡片 -->
    <view class="profile-card">
      <view class="profile-header">
        <view class="avatar-section" @click="chooseAvatar">
          <image 
            :src="counselorInfo.avatar || '/static/logo.png'" 
            class="avatar-image"
          />
          <text class="change-text">点击更换</text>
        </view>
        <view class="basic-info">
          <view class="name-section">
            <text class="counselor-name">{{ counselorInfo.realName || '咨询师姓名' }}</text>
            <text class="edit-btn" @click="editName">编辑信息</text>
          </view>
          <text class="counselor-title">{{ counselorInfo.title || '心理咨询师' }}</text>
          <view class="location-info">
            <text class="location-icon">📍</text>
            <text class="location-text">{{ counselorInfo.location || '所在地区' }}</text>
          </view>
          <view class="rating-info">
            <view class="star-rating">
              <text 
                v-for="i in 5" 
                :key="i" 
                class="star" 
                :class="{ filled: i <= Math.floor(parseFloat(counselorInfo.rating || '5.0')) }"
              >⭐</text>
              <text class="rating-number">{{ counselorInfo.rating || '5.0' }}</text>
            </view>
            <text class="experience">{{ counselorInfo.experience || '0' }}年经验</text>
          </view>
        </view>
      </view>
      
      <view class="specialties-section">
        <view class="specialties-header">
          <text class="section-label">专业统计</text>
          <text class="edit-btn" @click="editStats">编辑</text>
        </view>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-number">{{ counselorInfo.stats?.caseHours || 0 }}</text>
            <text class="stat-label">个案时长(小时)</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ counselorInfo.experience || 0 }}</text>
            <text class="stat-label">从业年限</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ counselorInfo.stats?.trainingHours || 0 }}</text>
            <text class="stat-label">受训时长(小时)</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ counselorInfo.stats?.supervisionHours || 0 }}</text>
            <text class="stat-label">督导时长(小时)</text>
          </view>
        </view>
      </view>
      
      <view class="specialties-section">
        <view class="specialties-header">
          <text class="section-label">擅长领域</text>
          <text class="edit-btn" @click="editSpecialties">编辑</text>
        </view>
        <view class="specialties-list">
          <text 
            v-for="specialty in counselorInfo.specialties"
            :key="specialty"
            class="specialty-tag"
          >
            {{ specialty }}
          </text>
        </view>
      </view>
    </view>

    <!-- 个人简介 -->
    <view class="info-section">
      <view class="section-header">
        <text class="section-title">个人简介</text>
        <text class="edit-btn" @click="editBio">编辑</text>
      </view>
      <view class="bio-content">
        <text class="bio-text">{{ counselorInfo.bio || '请完善个人简介...' }}</text>
      </view>
    </view>

    <!-- 咨询设置 -->
    <view class="info-section">
      <view class="section-header">
        <text class="section-title">咨询设置</text>
        <text class="edit-btn" @click="editConsultationSettings">编辑</text>
      </view>
      <view class="consultation-settings">
        <view class="setting-item">
          <text class="setting-label">咨询费用</text>
          <text class="setting-value">¥{{ counselorInfo.hourlyRate || '200' }}/小时</text>
        </view>
        <view class="setting-item">
          <text class="setting-label">咨询方式</text>
          <text class="setting-value">{{ counselorInfo.consultationMethods?.join('、') || '面对面、视频、电话' }}</text>
        </view>
        <view class="setting-item">
          <text class="setting-label">接诊时间</text>
          <text class="setting-value">{{ counselorInfo.availableTime || '周一至周五 9:00-18:00' }}</text>
        </view>
      </view>
    </view>

    <!-- 教育背景 -->
    <view class="info-section">
      <view class="section-header">
        <text class="section-title">教育背景</text>
        <text class="edit-btn" @click="editEducation">编辑</text>
      </view>
      <view class="education-list">
        <view 
          v-for="(education, index) in counselorInfo.educationList"
          :key="index"
          class="education-item"
        >
          <view class="education-header">
            <view class="education-degree-section">
              <text class="education-degree">{{ education.degree }}</text>
              <text class="education-year">{{ education.year }}</text>
            </view>
            <view class="education-icon">🎓</view>
          </view>
          <view class="education-details">
            <text class="education-school">{{ education.school }}</text>
            <text class="education-major">{{ education.major }}</text>
          </view>
        </view>
        <view v-if="counselorInfo.educationList.length === 0" class="empty-state">
          <text class="empty-text">暂无教育背景信息</text>
        </view>
      </view>
    </view>

    <!-- 工作经历 -->
    <view class="info-section">
      <view class="section-header">
        <text class="section-title">工作经历</text>
        <text class="edit-btn" @click="editExperience">编辑</text>
      </view>
      <view class="experience-list">
        <view 
          v-for="(exp, index) in counselorInfo.experienceList"
          :key="index"
          class="experience-item"
        >
          <view class="experience-header">
            <view class="experience-company-section">
              <text class="experience-company">{{ exp.company }}</text>
              <text class="experience-duration">{{ exp.duration }}</text>
            </view>
            <view class="experience-icon">💼</view>
          </view>
          <view class="experience-details">
            <text class="experience-position">{{ exp.position }}</text>
            <text class="experience-description">{{ exp.description }}</text>
          </view>
        </view>
        <view v-if="counselorInfo.experienceList.length === 0" class="empty-state">
          <text class="empty-text">暂无工作经历信息</text>
        </view>
      </view>
    </view>

    <!-- 执业资质 -->
    <view class="info-section">
      <view class="section-header">
        <text class="section-title">执业资质</text>
        <text class="edit-btn" @click="editCertificates">编辑</text>
      </view>
      <view class="certificates-list">
        <view 
          v-for="(cert, index) in counselorInfo.certificates"
          :key="index"
          class="certificate-item"
        >
          <view class="certificate-header">
            <view class="certificate-name-section">
              <text class="certificate-name">{{ cert.name }}</text>
              <text class="certificate-date">{{ cert.date }}</text>
            </view>
            <view class="certificate-icon">📜</view>
          </view>
          <view class="certificate-details">
            <text class="certificate-number">证书编号：{{ cert.number }}</text>
            <text class="certificate-issuer">发证机构：{{ cert.issuer }}</text>
          </view>
        </view>
        <view v-if="counselorInfo.certificates.length === 0" class="empty-state">
          <text class="empty-text">暂无资质证书信息</text>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <view class="bottom-nav">
      <view class="nav-item" @click="goAppointments">
        <text class="nav-icon">📅</text>
        <text class="nav-label">我的预约</text>
      </view>
      <view class="nav-item active">
        <text class="nav-icon">👨‍⚕️</text>
        <text class="nav-label">个人简历</text>
      </view>
    </view>

    <!-- 编辑个人简介弹窗 -->
    <view v-if="showBioModal" class="edit-modal">
      <view class="modal-overlay" @click="closeBioModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">编辑个人简介</text>
          <view class="close-btn" @click="closeBioModal">✕</view>
        </view>
        <view class="modal-body">
          <textarea
            v-model="editingBio"
            class="bio-textarea"
            placeholder="请介绍您的专业背景、咨询理念和工作经验..."
            maxlength="500"
          />
          <text class="char-count">{{ editingBio.length }}/500</text>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeBioModal">取消</button>
          <button class="save-btn" @click="saveBio">保存</button>
        </view>
      </view>
    </view>

    <!-- 编辑基本信息弹窗 -->
    <view v-if="showNameModal" class="edit-modal">
      <view class="modal-overlay" @click="closeNameModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">编辑基本信息</text>
          <view class="close-btn" @click="closeNameModal">✕</view>
        </view>
        <view class="modal-body">
          <view class="setting-group">
            <text class="setting-label">真实姓名</text>
            <input v-model="editingName" placeholder="请输入真实姓名" class="edit-input" maxlength="20" />
          </view>
          <view class="setting-group">
            <text class="setting-label">所在地区</text>
            <input v-model="editingLocation" placeholder="请输入所在地区（如：北京·朝阳）" class="edit-input" maxlength="30" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeNameModal">取消</button>
          <button class="save-btn" @click="saveName">保存</button>
        </view>
      </view>
    </view>

    <!-- 编辑教育背景弹窗 -->
    <view v-if="showEducationModal" class="edit-modal">
      <view class="modal-overlay" @click="closeEducationModal"></view>
      <view class="modal-content large-modal">
        <view class="modal-header">
          <text class="modal-title">编辑教育背景</text>
          <view class="close-btn" @click="closeEducationModal">✕</view>
        </view>
        <scroll-view scroll-y class="modal-body-scroll">
          <view class="edit-list">
            <view 
              v-for="(education, index) in editingEducation"
              :key="index"
              class="edit-item"
            >
              <view class="item-header">
                <text class="item-title">教育经历 {{ index + 1 }}</text>
                <view class="remove-btn" @click="removeEducation(index)">删除</view>
              </view>
              <view class="specialty-edit-item">
                <input v-model="education.degree" placeholder="学历（如：本科、硕士）" class="edit-input" />
              </view>
              <view class="specialty-edit-item">
                <input v-model="education.school" placeholder="学校名称" class="edit-input" />
              </view>
              <view class="specialty-edit-item">
                <input v-model="education.major" placeholder="专业" class="edit-input" />
              </view>
              <view class="specialty-edit-item">
                <input v-model="education.year" placeholder="时间（如：2018-2022）" class="edit-input" />
              </view>
            </view>
            <view class="add-btn" @click="addEducation">+ 添加教育经历</view>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeEducationModal">取消</button>
          <button class="save-btn" @click="saveEducation">保存</button>
        </view>
      </view>
    </view>

    <!-- 编辑工作经历弹窗 -->
    <view v-if="showExperienceModal" class="edit-modal">
      <view class="modal-overlay" @click="closeExperienceModal"></view>
      <view class="modal-content large-modal">
        <view class="modal-header">
          <text class="modal-title">编辑工作经历</text>
          <view class="close-btn" @click="closeExperienceModal">✕</view>
        </view>
        <scroll-view scroll-y class="modal-body-scroll">
          <view class="edit-list">
            <view 
              v-for="(experience, index) in editingExperience"
              :key="index"
              class="edit-item"
            >
              <view class="item-header">
                <text class="item-title">工作经历 {{ index + 1 }}</text>
                <view class="remove-btn" @click="removeExperience(index)">删除</view>
              </view>
              <view class="specialty-edit-item">
                <input v-model="experience.company" placeholder="公司名称" class="edit-input" />
              </view>
              <view class="specialty-edit-item">
                <input v-model="experience.position" placeholder="职位" class="edit-input" />
              </view>
              <view class="specialty-edit-item">
                <input v-model="experience.duration" placeholder="工作时间" class="edit-input" />
              </view>
              <view class="specialty-edit-item">
                <textarea v-model="experience.description" placeholder="工作描述" class="edit-textarea" />
              </view>
            </view>
            <view class="add-btn" @click="addExperience">+ 添加工作经历</view>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeExperienceModal">取消</button>
          <button class="save-btn" @click="saveExperience">保存</button>
        </view>
      </view>
    </view>

    <!-- 编辑执业资质弹窗 -->
    <view v-if="showCertificatesModal" class="edit-modal">
      <view class="modal-overlay" @click="closeCertificatesModal"></view>
      <view class="modal-content large-modal">
        <view class="modal-header">
          <text class="modal-title">编辑执业资质</text>
          <view class="close-btn" @click="closeCertificatesModal">✕</view>
        </view>
        <scroll-view scroll-y class="modal-body-scroll">
          <view class="edit-list">
            <view 
              v-for="(certificate, index) in editingCertificates"
              :key="index"
              class="edit-item"
            >
              <view class="item-header">
                <text class="item-title">证书 {{ index + 1 }}</text>
                <view class="remove-btn" @click="removeCertificate(index)">删除</view>
              </view>
              <view class="specialty-edit-item">
                <input v-model="certificate.name" placeholder="证书名称" class="edit-input" />
              </view>
              <view class="specialty-edit-item">
                <input v-model="certificate.number" placeholder="证书编号" class="edit-input" />
              </view>
              <view class="specialty-edit-item">
                <input v-model="certificate.issuer" placeholder="发证机构" class="edit-input" />
              </view>
              <view class="specialty-edit-item">
                <input v-model="certificate.date" placeholder="获证时间" class="edit-input" />
              </view>
            </view>
            <view class="add-btn" @click="addCertificate">+ 添加证书</view>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeCertificatesModal">取消</button>
          <button class="save-btn" @click="saveCertificates">保存</button>
        </view>
      </view>
    </view>

    <!-- 编辑咨询设置弹窗 -->
    <view v-if="showSettingsModal" class="edit-modal">
      <view class="modal-overlay" @click="closeSettingsModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">编辑咨询设置</text>
          <view class="close-btn" @click="closeSettingsModal">✕</view>
        </view>
        <view class="modal-body">
          <view class="setting-group">
            <text class="setting-label">咨询费用（元/小时）</text>
            <input v-model="editingSettings.hourlyRate" type="number" placeholder="请输入费用" class="edit-input" />
          </view>
          <view class="setting-group">
            <text class="setting-label">咨询方式</text>
            <view class="method-options">
              <view 
                v-for="method in ['面对面', '视频咨询', '电话咨询']"
                :key="method"
                class="method-option"
                :class="{ active: editingSettings.consultationMethods?.includes(method) }"
                @click="toggleMethod(method)"
              >
                <text class="method-text">{{ method }}</text>
              </view>
            </view>
          </view>
          <view class="setting-group">
            <text class="setting-label">接诊时间</text>
            <input v-model="editingSettings.availableTime" placeholder="请输入接诊时间" class="edit-input" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeSettingsModal">取消</button>
          <button class="save-btn" @click="saveSettings">保存</button>
        </view>
      </view>
    </view>

    <!-- 编辑擅长领域弹窗 -->
    <view v-if="showSpecialtiesModal" class="edit-modal">
      <view class="modal-overlay" @click="closeSpecialtiesModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">编辑擅长领域</text>
          <view class="close-btn" @click="closeSpecialtiesModal">✕</view>
        </view>
        <view class="modal-body">
          <view class="setting-group">
            <text class="setting-label">选择擅长领域</text>
            <view class="specialty-options">
              <view 
                v-for="specialty in availableSpecialties"
                :key="specialty"
                class="specialty-option"
                :class="{ active: editingSpecialties.includes(specialty) }"
                @click="toggleSpecialty(specialty)"
              >
                <text class="specialty-text">{{ specialty }}</text>
              </view>
            </view>
          </view>
          <view class="setting-group">
            <text class="setting-label">自定义擅长领域</text>
            <view class="edit-list">
              <view 
                v-for="(customSpecialty, index) in editingCustomSpecialties"
                :key="index"
                class="specialty-edit-item"
              >
                <input 
                  v-model="editingCustomSpecialties[index]" 
                  placeholder="请输入自定义擅长领域" 
                  class="edit-input" 
                />
                <view class="remove-btn-small" @click="removeCustomSpecialty(index)">✕</view>
              </view>
              <view class="add-btn-small" @click="addCustomSpecialty">+ 添加自定义领域</view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeSpecialtiesModal">取消</button>
          <button class="save-btn" @click="saveSpecialties">保存</button>
        </view>
      </view>
    </view>

    <!-- 编辑公开展示设置弹窗 -->
    <view v-if="showPublicModal" class="edit-modal">
      <view class="modal-overlay" @click="closePublicModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">编辑公开展示设置</text>
          <view class="close-btn" @click="closePublicModal">✕</view>
        </view>
        <view class="modal-body">
          <view class="setting-group">
            <text class="setting-label">所在地区</text>
            <input v-model="editingPublicSettings.location" placeholder="请输入所在地区（如：北京·朝阳）" class="edit-input" />
          </view>
          <view class="setting-group">
            <text class="setting-label">咨询师级别</text>
            <view class="method-options">
              <view 
                v-for="level in ['助理咨询师', '咨询师', '资深咨询师', '专家咨询师']"
                :key="level"
                class="method-option"
                :class="{ active: editingPublicSettings.level === level }"
                @click="editingPublicSettings.level = level"
              >
                <text class="method-text">{{ level }}</text>
              </view>
            </view>
          </view>
          <view class="setting-group">
            <text class="setting-label">性别</text>
            <view class="method-options">
              <view 
                v-for="gender in ['男', '女']"
                :key="gender"
                class="method-option"
                :class="{ active: editingPublicSettings.gender === gender }"
                @click="editingPublicSettings.gender = gender"
              >
                <text class="method-text">{{ gender }}</text>
              </view>
            </view>
          </view>
          <view class="setting-group">
            <text class="setting-label">个案时长（小时）</text>
            <input v-model="editingPublicSettings.caseHours" type="number" placeholder="请输入个案时长" class="edit-input" />
          </view>
          <view class="setting-group">
            <text class="setting-label">受训时长（小时）</text>
            <input v-model="editingPublicSettings.trainingHours" type="number" placeholder="请输入受训时长" class="edit-input" />
          </view>
          <view class="setting-group">
            <text class="setting-label">督导时长（小时）</text>
            <input v-model="editingPublicSettings.supervisionHours" type="number" placeholder="请输入督导时长" class="edit-input" />
          </view>
        </view>
      </view>
    </view>

    <!-- 编辑专业统计弹窗 -->
    <view v-if="showStatsModal" class="edit-modal">
      <view class="modal-overlay" @click="closeStatsModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">编辑专业统计</text>
          <view class="close-btn" @click="closeStatsModal">✕</view>
        </view>
        <view class="modal-body">
          <view class="setting-group">
            <text class="setting-label">个案时长（小时）</text>
            <input v-model="editingStats.caseHours" type="number" placeholder="请输入个案时长" class="edit-input" />
          </view>
          <view class="setting-group">
            <text class="setting-label">从业年限</text>
            <input v-model="editingStats.experienceYears" type="number" placeholder="请输入从业年限" class="edit-input" />
          </view>
          <view class="setting-group">
            <text class="setting-label">受训时长（小时）</text>
            <input v-model="editingStats.trainingHours" type="number" placeholder="请输入受训时长" class="edit-input" />
          </view>
          <view class="setting-group">
            <text class="setting-label">督导时长（小时）</text>
            <input v-model="editingStats.supervisionHours" type="number" placeholder="请输入督导时长" class="edit-input" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeStatsModal">取消</button>
          <button class="save-btn" @click="saveStats">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 进度条相关
const isPageLoading = ref(false)
const progressBarWidth = ref(0)
const loadingText = ref('加载中...')

// 进度条定时器
let progressTimer = null

// 编辑弹窗状态
const showBioModal = ref(false)
const editingBio = ref('')
const showNameModal = ref(false)
const editingName = ref('')
const editingLocation = ref('')

// 其他编辑弹窗状态
const showEducationModal = ref(false)
const showExperienceModal = ref(false)
const showCertificatesModal = ref(false)
const showSettingsModal = ref(false)
const showSpecialtiesModal = ref(false)
const showStatsModal = ref(false)

// 编辑数据
const editingEducation = ref([])
const editingExperience = ref([])
const editingCertificates = ref([])
const editingSettings = ref({})
const editingSpecialties = ref([])
const editingCustomSpecialties = ref([])
const editingStats = ref({})

// 可选择的擅长领域
const availableSpecialties = ref([
  '焦虑抑郁', '情感关系', '职场压力', '亲子教育', '婚姻家庭',
  '人际关系', '学业压力', '情绪管理', '性格完善', '创伤康复',
  '强迫障碍', '恐惧症', '睡眠障碍', '成瘾行为', '青少年心理',
  '老年心理', '女性心理', '危机干预', '心理评估', '认知行为治疗'
])

// 咨询师信息
const counselorInfo = ref({
  // 基础信息
  avatar: '',
  realName: '',
  name: '', // 用户端显示的姓名，与 realName 保持一致
  title: '心理咨询师',
  rating: '5.0',
  experience: '3',
  price: 300, // 咨询费用，与 hourlyRate 保持一致
  location: '北京·朝阳', // 地区信息
  level: '资深咨询师', // 咨询师级别
  gender: '女', // 性别
  
  // 专业信息
  specialties: ['焦虑抑郁', '情感关系', '职场压力'],
  credentials: ['心理学硕士', '国家三级心理咨询师', '认知行为疗法师'], // 资质证书简化显示
  bio: '我是一名专业的心理咨询师，拥有3年的临床咨询经验。擅长处理焦虑、抑郁、情感问题等心理困扰。秉承人本主义咨询理念，致力于为每一位来访者提供温暖、专业的心理支持。',
  
  // 详细履历
  educationList: [
    {
      degree: '硕士',
      school: '北京师范大学',
      major: '应用心理学',
      year: '2018-2021'
    },
    {
      degree: '本科',
      school: '华东师范大学',
      major: '心理学',
      year: '2014-2018'
    }
  ],
  experienceList: [
    {
      company: '北京心理健康中心',
      position: '心理咨询师',
      duration: '2021年至今',
      description: '负责个体心理咨询，主要处理焦虑、抑郁、人际关系等问题'
    }
  ],
  certificates: [
    {
      name: '国家三级心理咨询师',
      number: 'XL202100001',
      issuer: '中国心理学会',
      date: '2021年06月'
    }
  ],
  
  // 统计数据
  stats: {
    caseHours: 1200, // 个案时长
    experience: 3, // 从业年限（与 experience 字段同步）
    trainingHours: 300, // 受训时长
    supervisionHours: 120 // 督导时长
  },
  
  // 咨询设置
  hourlyRate: '300',
  consultationMethods: ['面对面', '视频咨询', '电话咨询'],
  availableTime: '周一至周五 9:00-18:00，周末 10:00-16:00',
  
  // 用户端显示数据
  topics: [ // 咨询感受/擅长领域统计
    { name: '焦虑抑郁', count: 45 },
    { name: '情感关系', count: 32 },
    { name: '职场压力', count: 28 },
    { name: '人际关系', count: 20 },
    { name: '情绪管理', count: 15 },
    { name: '学业压力', count: 12 }
  ],
  reviews: [] // 用户评价，由系统管理
})

onMounted(() => {
  loadCounselorInfo()
})

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

// 加载咨询师信息
function loadCounselorInfo() {
  showLoadingWithProgress(800, '加载个人信息...')
  
  // 尝试从本地存储加载咨询师申请信息
  try {
    const currentUser = uni.getStorageSync('userInfo')
    const userId = currentUser?.phone || currentUser?.id || 'unknown'
    const userApplicationKey = `counselorApplication_${userId}`
    
    const application = uni.getStorageSync(userApplicationKey)
    if (application) {
      counselorInfo.value = {
        ...counselorInfo.value,
        realName: application.realName || counselorInfo.value.realName,
        specialties: application.specialties || counselorInfo.value.specialties,
        bio: application.bio || counselorInfo.value.bio,
        experience: application.experience || counselorInfo.value.experience,
        educationList: application.university ? [{
          degree: application.education,
          school: application.university,
          major: application.major,
          year: application.graduationYear || '毕业年份'
        }] : counselorInfo.value.educationList
      }
    }
  } catch (error) {
    console.error('加载咨询师信息失败:', error)
  }
}

// 选择头像
function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      counselorInfo.value.avatar = res.tempFilePaths[0]
      saveCounselorInfo()
    },
    fail: (error) => {
      console.error('选择头像失败:', error)
    }
  })
}

// 编辑个人简介
function editBio() {
  editingBio.value = counselorInfo.value.bio
  showBioModal.value = true
}

// 编辑姓名
function editName() {
  editingName.value = counselorInfo.value.realName || ''
  editingLocation.value = counselorInfo.value.location || ''
  showNameModal.value = true
}

// 关闭简介编辑弹窗
function closeBioModal() {
  showBioModal.value = false
}

// 关闭姓名编辑弹窗
function closeNameModal() {
  showNameModal.value = false
}

// 保存个人简介
function saveBio() {
  // 验证个人简介不能为空
  if (!editingBio.value.trim()) {
    uni.showToast({
      title: '请填写个人简介',
      icon: 'none'
    })
    return
  }
  
  counselorInfo.value.bio = editingBio.value
  saveCounselorInfo()
  showBioModal.value = false
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })
}

// 保存姓名和地址
function saveName() {
  // 验证姓名不能为空
  if (!editingName.value.trim()) {
    uni.showToast({
      title: '请填写真实姓名',
      icon: 'none'
    })
    return
  }
  
  // 验证姓名长度
  if (editingName.value.trim().length < 2) {
    uni.showToast({
      title: '姓名至少需要2个字符',
      icon: 'none'
    })
    return
  }
  
  // 验证地址不能为空
  if (!editingLocation.value.trim()) {
    uni.showToast({
      title: '请填写所在地区',
      icon: 'none'
    })
    return
  }
  
  counselorInfo.value.realName = editingName.value.trim()
  // 同步到用户端显示字段
  counselorInfo.value.name = editingName.value.trim()
  counselorInfo.value.location = editingLocation.value.trim()
  
  saveCounselorInfo()
  showNameModal.value = false
  uni.showToast({
    title: '基本信息保存成功',
    icon: 'success'
  })
}

// 关闭其他编辑弹窗
function closeEducationModal() {
  showEducationModal.value = false
}

function closeExperienceModal() {
  showExperienceModal.value = false
}

function closeCertificatesModal() {
  showCertificatesModal.value = false
}

function closeSettingsModal() {
  showSettingsModal.value = false
}

function closeSpecialtiesModal() {
  showSpecialtiesModal.value = false
}

function closeStatsModal() {
  showStatsModal.value = false
}

function closePublicModal() {
  showPublicModal.value = false
}

// 保存其他信息
function saveEducation() {
  // 验证必填字段
  for (let i = 0; i < editingEducation.value.length; i++) {
    const education = editingEducation.value[i]
    if (!education.degree.trim() || !education.school.trim() || !education.major.trim() || !education.year.trim()) {
      uni.showToast({
        title: `教育经历${i + 1}信息不完整`,
        icon: 'none'
      })
      return
    }
  }
  
  counselorInfo.value.educationList = editingEducation.value
  saveCounselorInfo()
  showEducationModal.value = false
  uni.showToast({
    title: '教育背景保存成功',
    icon: 'success'
  })
}

function saveExperience() {
  // 验证必填字段
  for (let i = 0; i < editingExperience.value.length; i++) {
    const experience = editingExperience.value[i]
    if (!experience.company.trim() || !experience.position.trim() || !experience.duration.trim()) {
      uni.showToast({
        title: `工作经历${i + 1}信息不完整`,
        icon: 'none'
      })
      return
    }
  }
  
  counselorInfo.value.experienceList = editingExperience.value
  saveCounselorInfo()
  showExperienceModal.value = false
  uni.showToast({
    title: '工作经历保存成功',
    icon: 'success'
  })
}

function saveCertificates() {
  // 验证必填字段
  for (let i = 0; i < editingCertificates.value.length; i++) {
    const certificate = editingCertificates.value[i]
    if (!certificate.name.trim() || !certificate.number.trim() || !certificate.issuer.trim() || !certificate.date.trim()) {
      uni.showToast({
        title: `证书${i + 1}信息不完整`,
        icon: 'none'
      })
      return
    }
  }
  
  counselorInfo.value.certificates = editingCertificates.value
  // 同步更新简化资质信息到用户端
  counselorInfo.value.credentials = editingCertificates.value.map(cert => cert.name)
  
  saveCounselorInfo()
  showCertificatesModal.value = false
  uni.showToast({
    title: '执业资质保存成功',
    icon: 'success'
  })
}

function saveSettings() {
  // 验证必填字段
  if (!editingSettings.value.hourlyRate || !editingSettings.value.availableTime?.trim()) {
    uni.showToast({
      title: '请填写完整的咨询设置信息',
      icon: 'none'
    })
    return
  }
  
  if (!editingSettings.value.consultationMethods || editingSettings.value.consultationMethods.length === 0) {
    uni.showToast({
      title: '请至少选择一种咨询方式',
      icon: 'none'
    })
    return
  }
  
  counselorInfo.value.hourlyRate = editingSettings.value.hourlyRate
  counselorInfo.value.consultationMethods = editingSettings.value.consultationMethods
  counselorInfo.value.availableTime = editingSettings.value.availableTime
  
  // 同步价格到用户端显示字段
  counselorInfo.value.price = parseInt(editingSettings.value.hourlyRate) || 0
  
  saveCounselorInfo()
  showSettingsModal.value = false
  uni.showToast({
    title: '咨询设置保存成功',
    icon: 'success'
  })
}

function saveSpecialties() {
  // 验证必填字段：至少选择一个擅长领域
  const allSpecialties = [
    ...editingSpecialties.value,
    ...editingCustomSpecialties.value.filter(s => s.trim())
  ]
  
  if (allSpecialties.length === 0) {
    uni.showToast({
      title: '请至少选择一个擅长领域',
      icon: 'none'
    })
    return
  }
  
  counselorInfo.value.specialties = allSpecialties
  saveCounselorInfo()
  showSpecialtiesModal.value = false
  uni.showToast({
    title: '擅长领域保存成功',
    icon: 'success'
  })
}

function savePublicSettings() {
  // 验证必填字段
  if (!editingPublicSettings.value.location?.trim()) {
    uni.showToast({
      title: '请填写所在地区',
      icon: 'none'
    })
    return
  }
  
  if (!editingPublicSettings.value.level) {
    uni.showToast({
      title: '请选择咨询师级别',
      icon: 'none'
    })
    return
  }
  
  if (!editingPublicSettings.value.gender) {
    uni.showToast({
      title: '请选择性别',
      icon: 'none'
    })
    return
  }
  
  // 更新咨询师信息
  counselorInfo.value.location = editingPublicSettings.value.location.trim()
  counselorInfo.value.level = editingPublicSettings.value.level
  counselorInfo.value.gender = editingPublicSettings.value.gender
  counselorInfo.value.stats = {
    ...counselorInfo.value.stats,
    caseHours: parseInt(editingPublicSettings.value.caseHours) || 0,
    trainingHours: parseInt(editingPublicSettings.value.trainingHours) || 0,
    supervisionHours: parseInt(editingPublicSettings.value.supervisionHours) || 0,
    experience: parseInt(counselorInfo.value.experience) || 0
  }
  
  // 同步更新相关字段
  counselorInfo.value.name = counselorInfo.value.realName
  counselorInfo.value.price = parseInt(counselorInfo.value.hourlyRate) || 0
  
  // 更新简化资质信息
  counselorInfo.value.credentials = counselorInfo.value.certificates.map(cert => cert.name)
  
  saveCounselorInfo()
  showPublicModal.value = false
  uni.showToast({
    title: '公开展示设置保存成功',
    icon: 'success'
  })
}

function saveStats() {
  // 验证数值有效性
  const caseHours = parseInt(editingStats.value.caseHours) || 0
  const experienceYears = parseInt(editingStats.value.experienceYears) || 0
  const trainingHours = parseInt(editingStats.value.trainingHours) || 0
  const supervisionHours = parseInt(editingStats.value.supervisionHours) || 0
  
  if (caseHours < 0 || experienceYears < 0 || trainingHours < 0 || supervisionHours < 0) {
    uni.showToast({
      title: '数值不能为负数',
      icon: 'none'
    })
    return
  }
  
  // 更新统计数据
  counselorInfo.value.stats = {
    ...counselorInfo.value.stats,
    caseHours: caseHours,
    trainingHours: trainingHours,
    supervisionHours: supervisionHours
  }
  
  // 更新从业年限
  counselorInfo.value.experience = experienceYears
  
  saveCounselorInfo()
  showStatsModal.value = false
  uni.showToast({
    title: '专业统计保存成功',
    icon: 'success'
  })
}

// 添加新项目
function addEducation() {
  editingEducation.value.push({
    degree: '',
    school: '',
    major: '',
    year: ''
  })
}

function addExperience() {
  editingExperience.value.push({
    company: '',
    position: '',
    duration: '',
    description: ''
  })
}

function addCertificate() {
  editingCertificates.value.push({
    name: '',
    number: '',
    issuer: '',
    date: ''
  })
}

function addSpecialty() {
  editingSpecialties.value.push('')
}

function addCustomSpecialty() {
  editingCustomSpecialties.value.push('')
}

// 删除项目
function removeEducation(index) {
  editingEducation.value.splice(index, 1)
}

function removeExperience(index) {
  editingExperience.value.splice(index, 1)
}

function removeCertificate(index) {
  editingCertificates.value.splice(index, 1)
}

function removeSpecialty(index) {
  editingSpecialties.value.splice(index, 1)
}

function removeCustomSpecialty(index) {
  editingCustomSpecialties.value.splice(index, 1)
}

// 切换咨询方式
function toggleMethod(method) {
  if (!editingSettings.value.consultationMethods) {
    editingSettings.value.consultationMethods = []
  }
  
  const index = editingSettings.value.consultationMethods.indexOf(method)
  if (index > -1) {
    editingSettings.value.consultationMethods.splice(index, 1)
  } else {
    editingSettings.value.consultationMethods.push(method)
  }
}

// 切换擅长领域
function toggleSpecialty(specialty) {
  const index = editingSpecialties.value.indexOf(specialty)
  if (index > -1) {
    editingSpecialties.value.splice(index, 1)
  } else {
    editingSpecialties.value.push(specialty)
  }
}

// 编辑教育背景
function editEducation() {
  editingEducation.value = JSON.parse(JSON.stringify(counselorInfo.value.educationList))
  showEducationModal.value = true
}

// 编辑工作经历
function editExperience() {
  editingExperience.value = JSON.parse(JSON.stringify(counselorInfo.value.experienceList))
  showExperienceModal.value = true
}

// 编辑执业资质
function editCertificates() {
  editingCertificates.value = JSON.parse(JSON.stringify(counselorInfo.value.certificates))
  showCertificatesModal.value = true
}

// 编辑咨询设置
function editConsultationSettings() {
  editingSettings.value = {
    hourlyRate: counselorInfo.value.hourlyRate,
    consultationMethods: [...(counselorInfo.value.consultationMethods || [])],
    availableTime: counselorInfo.value.availableTime
  }
  showSettingsModal.value = true
}

// 编辑擅长领域
function editSpecialties() {
  // 分离预设领域和自定义领域
  const presetSpecialties = counselorInfo.value.specialties.filter(s => 
    availableSpecialties.value.includes(s)
  )
  const customSpecialties = counselorInfo.value.specialties.filter(s => 
    !availableSpecialties.value.includes(s)
  )
  
  editingSpecialties.value = [...presetSpecialties]
  editingCustomSpecialties.value = [...customSpecialties]
  showSpecialtiesModal.value = true
}

// 编辑专业统计
function editStats() {
  editingStats.value = {
    caseHours: counselorInfo.value.stats?.caseHours || 0,
    experienceYears: counselorInfo.value.experience || 0,
    trainingHours: counselorInfo.value.stats?.trainingHours || 0,
    supervisionHours: counselorInfo.value.stats?.supervisionHours || 0
  }
  showStatsModal.value = true
}

// 保存咨询师信息
function saveCounselorInfo() {
  try {
    // 确保数据同步
    const syncedInfo = {
      ...counselorInfo.value,
      name: counselorInfo.value.realName, // 同步姓名
      price: parseInt(counselorInfo.value.hourlyRate) || 0, // 同步价格
      credentials: counselorInfo.value.certificates.map(cert => cert.name), // 同步简化资质
      stats: {
        ...counselorInfo.value.stats,
        experience: parseInt(counselorInfo.value.experience) || 0
      }
    }
    
    // 保存到咨询师端
    uni.setStorageSync('counselorProfile', syncedInfo)
    
    // 同步到用户端可访问的数据库
    const userSideData = {
      [syncedInfo.realName]: {
        name: syncedInfo.realName,
        price: syncedInfo.price,
        avatar: syncedInfo.avatar,
        location: syncedInfo.location,
        level: syncedInfo.level,
        specialty: syncedInfo.specialties[0] || '心理咨询', // 主要专长
        gender: syncedInfo.gender,
        rating: parseFloat(syncedInfo.rating) || 5.0,
        credentials: syncedInfo.credentials,
        stats: syncedInfo.stats,
        topics: syncedInfo.specialties.map((specialty, index) => ({
          name: specialty,
          count: Math.max(1, 50 - index * 8) // 模拟案例数量
        })),
        reviews: syncedInfo.reviews || []
      }
    }
    
    // 获取现有的咨询师数据库并更新
    let existingDatabase = {}
    try {
      existingDatabase = uni.getStorageSync('counselorDatabase') || {}
    } catch (error) {
      console.log('获取现有数据库失败，创建新数据库')
    }
    
    // 合并数据
    const updatedDatabase = {
      ...existingDatabase,
      ...userSideData
    }
    
    // 保存更新后的数据库
    uni.setStorageSync('counselorDatabase', updatedDatabase)
    
    console.log('咨询师信息已同步到用户端数据库')
  } catch (error) {
    console.error('保存咨询师信息失败:', error)
  }
}

// 跳转到预约管理
function goAppointments() {
  uni.navigateTo({
    url: '/pages/counselor/appointments'
  })
}
</script>

<style scoped>
.counselor-profile-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 120rpx;
}

.header {
  background: #fff;
  padding: 44rpx 16rpx 20rpx;
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

.profile-card {
  margin: 16rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 32rpx;
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

.basic-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.name-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.counselor-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.counselor-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.location-icon {
  font-size: 24rpx;
  color: #666;
}

.location-text {
  font-size: 24rpx;
  color: #666;
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.star-rating {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.star {
  font-size: 20rpx;
  color: #e0e0e0;
  transition: color 0.3s;
}

.star.filled {
  color: #ff9800;
}

.rating-number {
  font-size: 24rpx;
  color: #ff9800;
  margin-left: 8rpx;
}

.rating {
  font-size: 24rpx;
  color: #ff9800;
}

.experience {
  font-size: 24rpx;
  color: #666;
}

.specialties-section {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 24rpx;
}

.specialties-section:first-child {
  border-top: none;
  padding-top: 0;
}

.specialties-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-label {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
}

.specialties-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.specialty-tag {
  background: rgba(236, 64, 122, 0.1);
  color: #ec407a;
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  border: 1rpx solid rgba(236, 64, 122, 0.2);
}

/* 统计数据网格样式 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  background: linear-gradient(135deg, #f8f9fa, #e3f2fd);
  border-radius: 12rpx;
  padding: 24rpx;
  margin-top: 8rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8rpx;
}

.stat-number {
  font-size: 40rpx;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #666;
  font-weight: 500;
}

.info-section {
  margin: 24rpx 16rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
  overflow: hidden;
  word-wrap: break-word;
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

.edit-btn {
  font-size: 24rpx;
  color: #ec407a;
  padding: 12rpx 20rpx;
  border: 1rpx solid #ec407a;
  border-radius: 20rpx;
  background: rgba(236, 64, 122, 0.05);
  min-width: 80rpx;
  text-align: center;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.edit-btn:active {
  background: rgba(236, 64, 122, 0.15);
  transform: scale(0.95);
}

.bio-content {
  background: #f8f9fa;
  padding: 24rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.bio-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.education-list, .experience-list, .certificates-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.education-item, .experience-item, .certificate-item {
  background: #f8f9fa;
  padding: 32rpx;
  border-radius: 16rpx;
  border-left: 6rpx solid #ec407a;
  position: relative;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  overflow: hidden;
  word-wrap: break-word;
}

.education-header, .experience-header, .certificate-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.education-details, .experience-details, .certificate-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 8rpx;
}

.education-degree-section, .experience-company-section, .certificate-name-section {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.education-icon, .experience-icon, .certificate-icon {
  font-size: 32rpx;
  opacity: 0.8;
}

.education-degree, .experience-company, .certificate-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.education-school, .experience-position, .certificate-number {
  font-size: 28rpx;
  color: #34495e;
  font-weight: 600;
  margin-bottom: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.education-major, .education-year, .experience-duration, .experience-description, .certificate-issuer, .certificate-date {
  font-size: 26rpx;
  color: #7f8c8d;
  margin-bottom: 0;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: break-word;
}

.education-year, .experience-duration, .certificate-date {
  background: linear-gradient(135deg, #ec407a, #ab47bc);
  color: #fff;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
  margin-bottom: 0;
}

.education-major {
  color: #5d6d7e;
  font-style: italic;
  margin-top: 0;
}

.experience-description {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
  margin-top: 4rpx;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

.certificate-number, .certificate-issuer {
  color: #5d6d7e;
  margin-top: 0;
}

.consultation-settings {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.consultation-settings, .public-settings {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 28rpx;
  color: #666;
}

.setting-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-align: right;
  max-width: 60%;
}

.empty-state {
  display: flex;
  justify-content: center;
  padding: 40rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
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

/* 编辑弹窗样式 */
.edit-modal {
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
  width: 98%;
  max-width: 800rpx;
  max-height: 80vh;
  background: #fff;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  z-index: 10001;
  overflow: hidden;
  margin: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 20rpx 16rpx;
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
  padding: 30rpx 20rpx;
  flex: 1;
  overflow-y: auto;
  max-height: calc(80vh - 200rpx);
  display: flex;
  flex-direction: column;
}

.bio-textarea {
  width: 95%;
  min-height: 200rpx;
  padding: 24rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  background: #fff;
  line-height: 1.5;
  box-sizing: border-box;
  resize: none;
  margin-left: auto;
  margin-right: auto;
  display: block;
}

.bio-textarea:focus {
  border-color: #ec407a;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 16rpx 20rpx 30rpx;
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

.save-btn {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(135deg, #ec407a, #ab47bc);
  border: none;
  border-radius: 12rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}

.save-btn:active {
  opacity: 0.8;
}

/* 大型弹窗样式 */
.large-modal {
  width: 95%;
  max-width: 780rpx;
  max-height: 80vh;
  margin: 10vh auto;
  overflow: hidden;
}

/* 小屏幕适配 */
@media screen and (max-width: 750rpx) {
  .large-modal {
    width: 94%;
    max-width: 720rpx;
    margin: 8vh auto;
  }
}

@media screen and (max-width: 600rpx) {
  .large-modal {
    width: 96%;
    max-width: 680rpx;
    margin: 6vh auto;
  }
}

.modal-body-scroll {
  flex: 1;
  padding: 30rpx 20rpx;
  max-height: 60vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 小屏幕下调整模态框内边距 */
@media screen and (max-width: 600rpx) {
  .modal-content {
    width: 98%;
    max-width: 750rpx;
  }
  
  .modal-body {
    padding: 20rpx 16rpx;
  }
  
  .modal-body-scroll {
    padding: 20rpx 16rpx;
  }
  
  .modal-header {
    padding: 24rpx 20rpx 16rpx;
  }
  
  .modal-footer {
    padding: 16rpx 20rpx 24rpx;
  }
}

/* 编辑列表样式 */
.edit-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  width: 100%;
  box-sizing: border-box;
}

.edit-item {
  background: #f8f9fa;
  padding: 40rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e8e8e8;
  width: 95%;
  box-sizing: border-box;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.remove-btn {
  color: #ff4757;
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border: 1rpx solid #ff4757;
  border-radius: 20rpx;
  background: #fff;
}

.remove-btn:active {
  background: #ff4757;
  color: #fff;
}

.edit-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  background: #fff;
  box-sizing: border-box;
}

.edit-input:focus {
  border-color: #ec407a;
}

.edit-textarea {
  width: 93%;
  min-height: 120rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  background: #fff;
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
  display: block;
  resize: none;
  line-height: 1.5;
}

.edit-textarea:focus {
  border-color: #ec407a;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  background: linear-gradient(135deg, rgba(236, 64, 122, 0.1), rgba(171, 71, 188, 0.1));
  border: 2rpx dashed #ec407a;
  border-radius: 12rpx;
  color: #ec407a;
  font-size: 28rpx;
  font-weight: 500;
}

.add-btn:active {
  background: linear-gradient(135deg, rgba(236, 64, 122, 0.2), rgba(171, 71, 188, 0.2));
}

/* 设置分组样式 */
.setting-group {
  margin-bottom: 32rpx;
}

.setting-group .setting-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
  display: block;
}

.method-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.method-option {
  padding: 16rpx 24rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 25rpx;
  background: #fff;
  transition: all 0.3s;
}

.method-option.active {
  border-color: #ec407a;
  background: rgba(236, 64, 122, 0.1);
}

.method-text {
  font-size: 26rpx;
  color: #666;
}

.method-option.active .method-text {
  color: #ec407a;
  font-weight: 500;
}

/* 擅长领域编辑样式 */
.specialty-edit-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  width: 100%;
  box-sizing: border-box;
}

.specialty-edit-item .edit-input {
  flex: 1;
  margin-bottom: 0;
  width: auto;
  margin-left: 0;
  margin-right: 0;
}

.specialty-edit-item .edit-textarea {
  flex: 1;
  margin-bottom: 0;
  width: auto;
  margin-left: 0;
  margin-right: 0;
}

.remove-btn-small {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #ff4757;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
}

.remove-btn-small:active {
  background: #ff3742;
}

/* 擅长领域选择样式 */
.specialty-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.specialty-option {
  padding: 16rpx 24rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 25rpx;
  background: #fff;
  transition: all 0.3s;
}

.specialty-option.active {
  border-color: #ec407a;
  background: rgba(236, 64, 122, 0.1);
}

.specialty-text {
  font-size: 26rpx;
  color: #666;
}

.specialty-option.active .specialty-text {
  color: #ec407a;
  font-weight: 500;
}

.add-btn-small {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60rpx;
  background: linear-gradient(135deg, rgba(236, 64, 122, 0.1), rgba(171, 71, 188, 0.1));
  border: 2rpx dashed #ec407a;
  border-radius: 12rpx;
  color: #ec407a;
  font-size: 24rpx;
  font-weight: 500;
}

/* 模态框内容居中 */
.modal-content .modal-title {
  text-align: center;
}

.modal-content .edit-input,
.modal-content textarea {
  text-align: left;
}

.modal-content label,
.modal-content .form-label {
  text-align: left;
  display: block;
  margin-bottom: 16rpx;
}

.add-btn-small:active {
  background: linear-gradient(135deg, rgba(236, 64, 122, 0.2), rgba(171, 71, 188, 0.2));
}
</style>
