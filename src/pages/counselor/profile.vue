<template>
  <view class="counselor-profile-page">

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
    <view class="profile-card" :key="`profile-${forceUpdateKey}`">
      <view class="profile-header">
        <view class="avatar-section" @click="chooseAvatar">
          <image 
            :src="counselorInfo.avatar || '/static/logo.png'" 
            class="avatar-image"
            @error="handleAvatarError"
            @load="handleAvatarLoad"
          />
          <text class="change-text">点击更换</text>
        </view>
        <view class="basic-info">
          <view class="name-section">
            <text class="counselor-name">{{ counselorInfo.realName || '咨询师姓名' }}</text>
            <text class="edit-btn" @click="editPublicSettings">编辑信息</text>
          </view>
          <text class="counselor-title">{{ counselorInfo.title || '心理咨询师' }}</text>
          <view class="location-info">
            <text class="location-icon">📍</text>
            <text class="location-text">{{ counselorInfo.location || '所在地区' }}</text>
          </view>
          <view class="gender-info">
            <text class="gender-icon">👤</text>
            <text class="gender-text">{{ getGenderDisplay(counselorInfo.gender) }}</text>
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
        <view class="stats-grid" :key="statsForceUpdate">
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
    <view class="info-section" :key="`settings-${forceUpdateKey}`">
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
      <view class="nav-item" @click="goMyAppointments">
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
            <text class="setting-label">姓名</text>
            <input v-model="editingPublicSettings.name" placeholder="请输入真实姓名" class="edit-input" />
          </view>
          <view class="setting-group">
            <text class="setting-label">所在地区</text>
            <input v-model="editingPublicSettings.location" placeholder="请输入所在地区（如：北京·朝阳）" class="edit-input" />
          </view>
          <view class="setting-group">
            <text class="setting-label">性别</text>
            <view class="method-options">
              <view 
                v-for="genderOption in genderOptions"
                :key="genderOption.value"
                class="method-option"
                :class="{ active: editingPublicSettings.gender === genderOption.value }"
                @click="editingPublicSettings.gender = genderOption.value"
              >
                <text class="method-text">{{ genderOption.label }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closePublicModal">取消</button>
          <button class="save-btn" @click="savePublicSettings">保存</button>
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
import API from '@/utils/api.js'
import { goMyAppointments } from '@/utils/page-turning.js'


// 强制更新标志
const forceUpdateKey = ref(0)
const statsForceUpdate = ref(0)

// 性别选项定义
const genderOptions = ref([
  { value: 'UNKNOWN', label: '未设置' },
  { value: 'FEMALE', label: '女' },
  { value: 'MALE', label: '男' }
])

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
const showPublicModal = ref(false)

// 编辑数据
const editingEducation = ref([])
const editingExperience = ref([])
const editingCertificates = ref([])
const editingSettings = ref({})
const editingSpecialties = ref([])
const editingCustomSpecialties = ref([])
const editingStats = ref({})
const editingPublicSettings = ref({})

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
  location: ' ', // 地区信息
  gender: 'FEMALE', // 性别 - 使用后端期望的格式
  
  // 专业信息
  specialties: [],
  credentials: [], // 资质证书简化显示
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

// 辅助函数：获取性别显示文本
function getGenderDisplay(gender) {
  const genderMap = {
    'MALE': '男',
    'FEMALE': '女',
    'UNKNOWN': '未设置'
  }
  return genderMap[gender] || '未设置'
}

// 加载咨询师信息
async function loadCounselorInfo() {
  try {
    // 首先尝试从后端API获取咨询师信息
    console.log('正在从API加载咨询师信息...')
    const response = await API.counselorAPI.getConsultantProfile()
    
    if (response && response.success !== false) {
      console.log('API返回的咨询师信息:', response)
      
      // 将API返回的数据映射到counselorInfo
      if (response.data || response.id) {
        const data = response.data || response
        
        // 处理头像URL
        const rawAvatarUrl = data.avatar || data.avatarUrl || data.photo || data.profilePicture
        const processedAvatarUrl = rawAvatarUrl ? API.processAvatarUrl(rawAvatarUrl) : counselorInfo.value.avatar
        
        counselorInfo.value = {
          ...counselorInfo.value,
          realName: data.realName || data.name || counselorInfo.value.realName,
          title: data.title || counselorInfo.value.title,
          location: data.location || data.address || counselorInfo.value.location,
          specialties: data.specialties || data.specialty || counselorInfo.value.specialties,
          bio: data.bio || data.description || counselorInfo.value.bio,
          avatar: processedAvatarUrl,
          phone: data.phone || counselorInfo.value.phone,
          email: data.email || counselorInfo.value.email,
          experienceYears: data.experienceYears || data.experience || counselorInfo.value.experienceYears,
          rating: data.rating || counselorInfo.value.rating,
          consultationCount: data.consultationCount || counselorInfo.value.consultationCount,
          gender: data.gender || counselorInfo.value.gender || 'UNKNOWN', // 添加性别字段映射
          certificates: data.certificates || data.certificationList || counselorInfo.value.certificates,
          educationList: data.educationList || data.education || counselorInfo.value.educationList,
          experienceList: data.experienceList || data.experience || counselorInfo.value.experienceList,
          // 🆕 添加价格字段映射
          hourlyRate: data.pricePerHour || data.hourlyRate || counselorInfo.value.hourlyRate,
          price: data.pricePerHour || data.hourlyRate || counselorInfo.value.price,
          // 🆕 添加咨询方式和时间字段映射
          consultationMethods: data.consultationMethods || counselorInfo.value.consultationMethods,
          availableTime: data.availability || data.availableTime || counselorInfo.value.availableTime,
          availability: data.availability || data.availableTime || counselorInfo.value.availability,
          // 🆕 添加统计数据映射 - 正确处理0值
          stats: {
            ...counselorInfo.value.stats,
            caseHours: typeof data.consultationCount === 'number' ? data.consultationCount : (typeof data.caseHours === 'number' ? data.caseHours : (counselorInfo.value.stats?.caseHours || 0)),
            experience: typeof data.experienceYears === 'number' ? data.experienceYears : (typeof data.experience === 'number' ? data.experience : (counselorInfo.value.stats?.experience || 0)),
            trainingHours: typeof data.trainingHours === 'number' ? data.trainingHours : (counselorInfo.value.stats?.trainingHours || 0),
            supervisionHours: typeof data.supervisionHours === 'number' ? data.supervisionHours : (counselorInfo.value.stats?.supervisionHours || 0)
          },
          // 确保顶级字段也正确映射0值
          experience: typeof data.experienceYears === 'number' ? data.experienceYears : (typeof data.experience === 'number' ? data.experience : (counselorInfo.value.experience || 0)),
          consultationCount: typeof data.consultationCount === 'number' ? data.consultationCount : (typeof data.caseHours === 'number' ? data.caseHours : (counselorInfo.value.consultationCount || 0))
        }
        
        console.log('更新后的咨询师信息:', counselorInfo.value)
        console.log('头像信息检查:')
        console.log('- API原始头像字段:', {
          avatar: data.avatar,
          avatarUrl: data.avatarUrl,
          photo: data.photo,
          profilePicture: data.profilePicture
        })
        console.log('- 价格字段检查:', {
          pricePerHour: data.pricePerHour,
          hourlyRate: data.hourlyRate,
          最终hourlyRate: counselorInfo.value.hourlyRate,
          最终price: counselorInfo.value.price
        })
        console.log('- 统计数据字段检查:', {
          consultationCount: data.consultationCount,
          experienceYears: data.experienceYears,
          trainingHours: data.trainingHours,
          supervisionHours: data.supervisionHours,
          最终stats: counselorInfo.value.stats
        })
        console.log('- 原始头像路径:', rawAvatarUrl)
        console.log('- 处理后的头像URL:', processedAvatarUrl)
        console.log('- 最终使用的头像URL:', counselorInfo.value.avatar)
        return
      }
    }
  } catch (error) {
    console.error('从API加载咨询师信息失败:', error)
    console.log('尝试从本地存储加载信息...')
  }
  
  // 如果API调用失败，则从本地存储加载咨询师申请信息作为备选
  try {
    const currentUser = uni.getStorageSync('userInfo')
    const userId = currentUser?.phone || currentUser?.id || 'unknown'
    const userApplicationKey = `counselorApplication_${userId}`
    
    const application = uni.getStorageSync(userApplicationKey)
    if (application) {
      console.log('从本地存储加载的信息:', application)
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
    console.error('从本地存储加载咨询师信息失败:', error)
  }
}

// 头像加载错误处理
function handleAvatarError(event) {
  console.log('头像加载失败:', event)
  console.log('当前头像URL:', counselorInfo.value.avatar)
  
  // 如果当前头像不是默认头像，尝试使用默认头像
  if (counselorInfo.value.avatar !== '/static/logo.png') {
    console.log('尝试使用默认头像')
    counselorInfo.value.avatar = '/static/logo.png'
  }
}

// 头像加载成功处理
function handleAvatarLoad(event) {
  console.log('头像加载成功:', counselorInfo.value.avatar)
}

// 选择头像
function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res) => {
      const filePath = res.tempFilePaths[0]
      console.log('选择的头像文件:', filePath)
      
      // 显示加载状态
      uni.showLoading({
        title: '上传头像中...'
      })
      
      try {
        // 调用头像上传API
        const uploadResponse = await API.counselorAPI.uploadConsultantAvatar(filePath)
        console.log('头像上传成功:', uploadResponse)
        
        // 更新头像显示 - 处理多种响应格式
        let newAvatarUrl = null
        
        console.log('=== 头像上传响应处理 ===')
        console.log('完整响应对象:', uploadResponse)
        
        if (uploadResponse.data && uploadResponse.data.avatarUrl) {
          newAvatarUrl = uploadResponse.data.avatarUrl
          console.log('从data.avatarUrl获取:', newAvatarUrl)
        } else if (uploadResponse.data && uploadResponse.data.avatar) {
          newAvatarUrl = uploadResponse.data.avatar
          console.log('从data.avatar获取:', newAvatarUrl)
        } else if (uploadResponse.avatarUrl) {
          newAvatarUrl = uploadResponse.avatarUrl
          console.log('从avatarUrl获取:', newAvatarUrl)
        } else if (uploadResponse.avatar) {
          newAvatarUrl = uploadResponse.avatar
          console.log('从avatar获取:', newAvatarUrl)
        } else if (uploadResponse.url) {
          newAvatarUrl = uploadResponse.url
          console.log('从url获取:', newAvatarUrl)
        } else if (uploadResponse.data && uploadResponse.data.url) {
          newAvatarUrl = uploadResponse.data.url
          console.log('从data.url获取:', newAvatarUrl)
        }
        
        console.log('提取的头像URL:', newAvatarUrl)
        
        if (newAvatarUrl) {
          // 使用API.processAvatarUrl处理返回的头像URL
          counselorInfo.value.avatar = API.processAvatarUrl(newAvatarUrl)
          console.log('使用服务器返回的头像URL:', newAvatarUrl)
          console.log('处理后的头像URL:', counselorInfo.value.avatar)
        } else {
          // 如果API没有返回新的URL，但上传成功，暂时使用本地路径
          counselorInfo.value.avatar = filePath
          console.log('服务器未返回头像URL，使用本地路径:', filePath)
        }
        console.log('===========================')
        
        uni.hideLoading()
        uni.showToast({
          title: '头像上传成功',
          icon: 'success'
        })
        
        // 保存更新后的咨询师信息到服务器
        console.log('头像上传成功，正在保存信息到服务器...')
        try {
          await saveCounselorInfo()
          console.log('咨询师信息已保存到服务器')
        } catch (saveError) {
          console.error('保存咨询师信息失败:', saveError)
          // 即使保存失败，头像上传仍然成功，所以不显示错误
        }
        
      } catch (error) {
        console.error('头像上传失败:', error)
        uni.hideLoading()
        
        // 显示错误信息
        let errorMessage = '头像上传失败'
        if (error.data) {
          try {
            const errorData = typeof error.data === 'string' ? JSON.parse(error.data) : error.data
            errorMessage = errorData.message || errorMessage
          } catch (e) {
            // 解析失败，使用默认错误信息
          }
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'error',
          duration: 2000
        })
      }
    },
    fail: (error) => {
      console.error('选择头像失败:', error)
      uni.showToast({
        title: '选择头像失败',
        icon: 'error'
      })
    }
  })
}

// 编辑个人简介
function editBio() {
  editingBio.value = counselorInfo.value.bio
  showBioModal.value = true
}

// 编辑公开展示设置
function editPublicSettings() {
  editingPublicSettings.value = {
    name: counselorInfo.value.realName || counselorInfo.value.name || '',
    location: counselorInfo.value.location || '',
    gender: counselorInfo.value.gender || 'UNKNOWN'
  }
  showPublicModal.value = true
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
  
  // 异步保存并更新UI
  saveCounselorInfo().then(() => {
    showBioModal.value = false
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  }).catch(error => {
    console.error('保存失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    })
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
  
  // 异步保存并更新UI
  saveCounselorInfo().then(() => {
    showNameModal.value = false
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  }).catch(error => {
    console.error('保存失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    })
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
    
    // 安全的字段检查，避免 undefined 错误
    const degree = education.degree || ''
    const school = education.school || ''
    const major = education.major || ''
    const year = education.year || ''
    
    if (!degree.trim() || !school.trim() || !major.trim() || !year.trim()) {
      uni.showToast({
        title: `教育经历${i + 1}信息不完整`,
        icon: 'none'
      })
      return
    }
  }
  
  counselorInfo.value.educationList = editingEducation.value
  
  // 异步保存并更新UI
  saveCounselorInfo().then(() => {
    showEducationModal.value = false
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  }).catch(error => {
    console.error('保存失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    })
  })
}

function saveExperience() {
  // 验证必填字段
  for (let i = 0; i < editingExperience.value.length; i++) {
    const experience = editingExperience.value[i]
    
    // 安全的字段检查，避免 undefined 错误
    const company = experience.company || ''
    const position = experience.position || ''
    const duration = experience.duration || ''
    
    if (!company.trim() || !position.trim() || !duration.trim()) {
      uni.showToast({
        title: `工作经历${i + 1}信息不完整`,
        icon: 'none'
      })
      return
    }
  }
  
  counselorInfo.value.experienceList = editingExperience.value
  
  // 异步保存并更新UI
  saveCounselorInfo().then(() => {
    showExperienceModal.value = false
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  }).catch(error => {
    console.error('保存失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    })
  })
}

function saveCertificates() {
  // 验证必填字段
  for (let i = 0; i < editingCertificates.value.length; i++) {
    const certificate = editingCertificates.value[i]
    
    // 安全的字段检查，避免 undefined 错误
    const name = certificate.name || ''
    const number = certificate.number || ''
    const issuer = certificate.issuer || ''
    const date = certificate.date || ''
    
    if (!name.trim() || !number.trim() || !issuer.trim() || !date.trim()) {
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
  
  // 异步保存并更新UI
  saveCounselorInfo().then(() => {
    showCertificatesModal.value = false
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  }).catch(error => {
    console.error('保存失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    })
  })
}

function saveSettings() {
  // 验证必填字段
  const availableTime = editingSettings.value.availableTime || ''
  if (!editingSettings.value.hourlyRate || !availableTime.trim()) {
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
  counselorInfo.value.availability = editingSettings.value.availableTime  // API字段兼容
  
  // 同步价格到用户端显示字段
  counselorInfo.value.price = parseInt(editingSettings.value.hourlyRate) || 0
  
  // 异步保存并更新UI
  saveCounselorInfo().then(() => {
    showSettingsModal.value = false
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  }).catch(error => {
    console.error('保存失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    })
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
    title: '保存成功',
    icon: 'success'
  })
}

function savePublicSettings() {
  // 验证必填字段
  if (!editingPublicSettings.value.name?.trim()) {
    uni.showToast({
      title: '请填写姓名',
      icon: 'none'
    })
    return
  }
  
  if (!editingPublicSettings.value.location?.trim()) {
    uni.showToast({
      title: '请填写所在地区',
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
  
  
  counselorInfo.value.realName = editingPublicSettings.value.name.trim()
  counselorInfo.value.name = editingPublicSettings.value.name.trim()
  counselorInfo.value.location = editingPublicSettings.value.location.trim()
  counselorInfo.value.gender = editingPublicSettings.value.gender
  
  // 异步保存并更新UI
  saveCounselorInfo().then(() => {
    showPublicModal.value = false
    // 强制更新UI显示
    forceUpdateKey.value++
    console.log('基本信息保存成功，强制更新UI:', forceUpdateKey.value)
    uni.showToast({
      title: '基本信息保存成功',
      icon: 'success'
    })
  }).catch(error => {
    console.error('保存失败:', error)
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'error'
    })
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
    experience: experienceYears,  // 确保experience字段也更新
    trainingHours: trainingHours,
    supervisionHours: supervisionHours
  }
  
  // 更新从业年限
  counselorInfo.value.experience = experienceYears
  counselorInfo.value.experienceYears = experienceYears
  
  // 异步保存并更新UI
  saveCounselorInfo().then(() => {
    showStatsModal.value = false
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  }).catch(error => {
    console.error('保存失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    })
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
  // 安全地复制教育列表，确保所有字段都有默认值
  editingEducation.value = counselorInfo.value.educationList.map(education => ({
    degree: education.degree || '',
    school: education.school || '',
    major: education.major || '',
    year: education.year || education.time || ''
  }))
  showEducationModal.value = true
}

// 编辑工作经历
function editExperience() {
  // 安全地复制经历列表，确保所有字段都有默认值
  editingExperience.value = counselorInfo.value.experienceList.map(experience => ({
    company: experience.company || '',
    position: experience.position || '',
    duration: experience.duration || '',
    description: experience.description || ''
  }))
  showExperienceModal.value = true
}

// 编辑执业资质
function editCertificates() {
  // 安全地复制证书列表，确保所有字段都有默认值
  editingCertificates.value = counselorInfo.value.certificates.map(certificate => ({
    name: certificate.name || '',
    number: certificate.number || '',
    issuer: certificate.issuer || '',
    date: certificate.date || ''
  }))
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
    caseHours: typeof counselorInfo.value.stats?.caseHours === 'number' ? counselorInfo.value.stats.caseHours : 0,
    experienceYears: typeof counselorInfo.value.experience === 'number' ? counselorInfo.value.experience : 0,
    trainingHours: typeof counselorInfo.value.stats?.trainingHours === 'number' ? counselorInfo.value.stats.trainingHours : 0,
    supervisionHours: typeof counselorInfo.value.stats?.supervisionHours === 'number' ? counselorInfo.value.stats.supervisionHours : 0
  }
  showStatsModal.value = true
}

// 保存咨询师信息
async function saveCounselorInfo() {
  try {
    // 获取当前用户信息
    const currentUser = uni.getStorageSync('userInfo')
    if (!currentUser) {
      throw new Error('用户信息不存在，请重新登录')
    }

    // 准备API数据格式 - 确保与标准格式完全匹配，正确处理0值
    const apiData = {
      name: (counselorInfo.value.realName || counselorInfo.value.name || '').toString(),
      gender: counselorInfo.value.gender || 'UNKNOWN',
      location: (counselorInfo.value.location || '').toString(),
      specialty: Array.isArray(counselorInfo.value.specialties) ? counselorInfo.value.specialties : [],
      experienceYears: typeof counselorInfo.value.stats?.experience === 'number' ? counselorInfo.value.stats.experience : 
                      (typeof counselorInfo.value.experienceYears === 'number' ? counselorInfo.value.experienceYears : 
                      (typeof counselorInfo.value.experience === 'number' ? counselorInfo.value.experience : 0)),
      consultationCount: typeof counselorInfo.value.stats?.caseHours === 'number' ? counselorInfo.value.stats.caseHours : 
                        (typeof counselorInfo.value.consultationCount === 'number' ? counselorInfo.value.consultationCount : 0),
      trainingHours: typeof counselorInfo.value.stats?.trainingHours === 'number' ? counselorInfo.value.stats.trainingHours : 0,
      supervisionHours: typeof counselorInfo.value.stats?.supervisionHours === 'number' ? counselorInfo.value.stats.supervisionHours : 0,
      bio: (counselorInfo.value.bio || '').toString(),
      consultationMethods: Array.isArray(counselorInfo.value.consultationMethods) ? counselorInfo.value.consultationMethods : [],
      availability: (counselorInfo.value.availableTime || counselorInfo.value.availability || '').toString(),
      pricePerHour: typeof counselorInfo.value.hourlyRate === 'number' ? counselorInfo.value.hourlyRate : 
                   (typeof counselorInfo.value.price === 'number' ? counselorInfo.value.price : 0),
      gender: counselorInfo.value.gender || 'UNKNOWN', // 添加性别字段
      educationList: Array.isArray(counselorInfo.value.educationList) 
        ? counselorInfo.value.educationList.map(edu => ({
            degree: (edu?.degree || '').toString(),
            school: (edu?.school || '').toString(),
            major: (edu?.major || '').toString(),
            time: (edu?.year || edu?.time || '').toString()
          })) 
        : [],
      experienceList: Array.isArray(counselorInfo.value.experienceList) 
        ? counselorInfo.value.experienceList.map(exp => ({
            company: (exp?.company || '').toString(),
            position: (exp?.position || '').toString(),
            duration: (exp?.duration || '').toString(),
            description: (exp?.description || '').toString()
          })) 
        : [],
      certificationList: Array.isArray(counselorInfo.value.certificates) && counselorInfo.value.certificates.length > 0
        ? counselorInfo.value.certificates.map(cert => ({
            name: (cert?.name || '').toString(),
            number: (cert?.number || '').toString(),
            issuer: (cert?.issuer || '').toString(),
            date: (cert?.date || '').toString()
          })) 
        : []
    }
    // 验证必填字段
    if (!apiData.name) {
      throw new Error('咨询师姓名不能为空')
    }

    // 打印实际发送的数据用于调试
    console.log('=== 发送到API的数据 ===')
    console.log(JSON.stringify(apiData, null, 2))
    console.log('数据大小:', JSON.stringify(apiData).length, '字符')

    // 调用API更新咨询师信息
    console.log('开始调用API...')
    const response = await API.counselorAPI.updateConsultant(apiData)

    console.log('咨询师信息已同步到服务器:', response)

    // 🆕 保存成功后重新从API加载最新数据
    console.log('=== 重新加载最新数据 ===')
    try {
      const latestResponse = await API.counselorAPI.getConsultantProfile()
      if (latestResponse && (latestResponse.data || latestResponse.id)) {
        const latestData = latestResponse.data || latestResponse
        
        // 处理最新的头像URL
        const rawAvatarUrl = latestData.avatar || latestData.avatarUrl || latestData.photo || latestData.profilePicture
        const processedAvatarUrl = rawAvatarUrl ? API.processAvatarUrl(rawAvatarUrl) : counselorInfo.value.avatar
        
        // 更新所有字段为最新数据
        counselorInfo.value = {
          ...counselorInfo.value,
          realName: latestData.realName || latestData.name || counselorInfo.value.realName,
          name: latestData.realName || latestData.name || counselorInfo.value.name,
          title: latestData.title || counselorInfo.value.title,
          location: latestData.location || latestData.address || counselorInfo.value.location,
          specialties: latestData.specialties || latestData.specialty || counselorInfo.value.specialties,
          bio: latestData.bio || latestData.description || counselorInfo.value.bio,
          avatar: processedAvatarUrl,
          phone: latestData.phone || counselorInfo.value.phone,
          email: latestData.email || counselorInfo.value.email,
          experienceYears: latestData.experienceYears || latestData.experience || counselorInfo.value.experienceYears,
          rating: latestData.rating || counselorInfo.value.rating,
          consultationCount: latestData.consultationCount || counselorInfo.value.consultationCount,
          certificates: latestData.certificates || latestData.certificationList || counselorInfo.value.certificates,
          educationList: latestData.educationList || latestData.education || counselorInfo.value.educationList,
          experienceList: latestData.experienceList || latestData.experience || counselorInfo.value.experienceList,
          consultationMethods: latestData.consultationMethods || counselorInfo.value.consultationMethods,
          availableTime: latestData.availability || latestData.availableTime || counselorInfo.value.availableTime,
          hourlyRate: latestData.pricePerHour || latestData.hourlyRate || counselorInfo.value.hourlyRate,
          price: latestData.pricePerHour || latestData.hourlyRate || counselorInfo.value.price,
          gender: latestData.gender || counselorInfo.value.gender || 'UNKNOWN', // 添加性别字段映射
          // 更新统计数据 - 确保正确映射所有字段
          stats: {
            ...counselorInfo.value.stats,
            caseHours: latestData.consultationCount || latestData.caseHours || counselorInfo.value.stats?.caseHours || 0,
            experience: latestData.experienceYears || latestData.experience || counselorInfo.value.stats?.experience || 0,
            trainingHours: latestData.trainingHours || counselorInfo.value.stats?.trainingHours || 0,
            supervisionHours: latestData.supervisionHours || counselorInfo.value.stats?.supervisionHours || 0
          },
          // 确保顶级字段也正确映射
          experience: latestData.experienceYears || latestData.experience || counselorInfo.value.experience || 0,
          consultationCount: latestData.consultationCount || latestData.caseHours || counselorInfo.value.consultationCount || 0
        }
        
        console.log('前端数据已更新为最新版本:', counselorInfo.value)
        console.log('=== 重新加载后的价格检查 ===')
        console.log('- API返回的价格字段:', {
          pricePerHour: latestData.pricePerHour,
          hourlyRate: latestData.hourlyRate
        })
        console.log('- 更新后的前端价格:', {
          hourlyRate: counselorInfo.value.hourlyRate,
          price: counselorInfo.value.price
        })
        console.log('===========================')
        
        // 🆕 强制触发界面重新渲染
        forceUpdateKey.value++
        statsForceUpdate.value++
        console.log('强制更新界面，key:', forceUpdateKey.value, 'stats:', statsForceUpdate.value)
      }
    } catch (reloadError) {
      console.error('重新加载最新数据失败:', reloadError)
      // 即使重新加载失败，保存操作仍然成功
    }
    console.log('==============================')

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
    
    // 详细错误日志
    if (error.response) {
      console.error('API响应错误:', error.response)
      console.error('状态码:', error.response.status)
      console.error('错误数据:', error.response.data)
    } else if (error.request) {
      console.error('请求错误:', error.request)
    } else {
      console.error('其他错误:', error.message)
    }
    
    // 显示错误提示
    const errorMessage = error.response?.data?.message || error.message || '保存失败，请重试'
    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    })
  }
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

.gender-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.gender-icon {
  font-size: 24rpx;
  color: #666;
}

.gender-text {
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
