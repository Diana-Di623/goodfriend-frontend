<template>
  <view class="counselor-detail">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载中...</text>
    </view>
      <!-- 顶部导航 -->
      <view class="header">
        <view class="back-btn" @click="goBack">
          <text class="icon">←</text>
        </view>
      </view>

    <!-- 咨询师头像 -->
    <view class="profile-image-section">
      <image class="profile-image" :src="counselor.avatar" mode="aspectFill" />
      
      <!-- 服务保障横幅 -->
      <view class="guarantee-banner">
        <view class="guarantee-item">
          <text class="guarantee-icon">🛡️</text>
          <text>免费退款</text>
        </view>
        <view class="guarantee-item">
          <text class="guarantee-icon">🛡️</text>
          <text>严选咨询师</text>
        </view>
        <view class="guarantee-item">
          <text class="guarantee-icon">🛡️</text>
          <text>隐私保障</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 咨询师信息 -->
    <view class="profile-info">
      <view class="name-price">
        <text class="name">{{ counselor.name }}</text>
        <view class="price">
          <text class="price-number">{{ counselor.price }}</text>
          <text class="price-unit">元/节起</text>
        </view>
      </view>

      <view class="credentials">
        <text v-for="(credential, index) in counselor.credentials" :key="index" class="credential">
          {{ credential }}
        </text>
      </view>

      <view class="location-availability">
        <view class="location">
          <text class="icon">📍</text>
          <text>{{ counselor.location }}</text>
        </view>
      </view>

      <view class="service-badge">
        <text class="icon">🛡️</text>
        <text>服务经验 | 2025年通过年审 ›</text>
      </view>
    </view>

    <!-- 统计数据 -->
    <view class="statistics-card">
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-number">{{ counselor.stats.caseHours }}</text>
          <text class="stat-label">个案时长</text>
          <text class="stat-unit">小时</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ counselor.stats.experience }}</text>
          <text class="stat-label">从业年限</text>
          <text class="stat-unit">年</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ counselor.stats.trainingHours }}</text>
          <text class="stat-label">受训时长</text>
          <text class="stat-unit">小时</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ counselor.stats.supervisionHours }}</text>
          <text class="stat-label">督导时长</text>
          <text class="stat-unit">小时</text>
        </view>
      </view>
    </view>

    <!-- 咨询感受 -->
    <view class="consultation-topics">
      <view class="section-header">
        <text class="section-title">咨询感受</text>
        <view class="view-all" @click="viewAllTopics">
          <text>{{ showAllTopics ? '收起 ˄' : '查看全部 ›' }}</text>
        </view>
      </view>

      <view class="topics-grid">
        <view v-for="(topic, index) in (showAllTopics ? counselor.topics : counselor.topics?.slice(0, 6))" :key="index" class="topic-item">
          <text class="topic-name">{{ topic.name }}</text>
          <text class="topic-count">{{ topic.count }}</text>
        </view>
      </view>
    </view>

    <!-- 用户评价 -->
    <view class="reviews-section">
      <view v-for="(review, index) in counselor.reviews" :key="index" class="review-card">
        <view class="review-header">
          <view class="user-info">
            <view class="avatar">
              <text>{{ review.avatar }}</text>
            </view>
            <text class="username">{{ review.username }}</text>
            <text class="condition">{{ review.condition }}</text>
          </view>
          <text class="date">{{ review.date }}</text>
        </view>
        <text class="review-content">
          {{ expandedReviews.has(index) && review.fullContent ? review.fullContent : review.content }}
        </text>
        <text v-if="review.expandable" class="expand-btn" @click="toggleReviewExpand(index)">
          {{ expandedReviews.has(index) ? '收起 ˄' : '展开 ˅' }}
        </text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <button class="action-btn secondary" @click="sendMessage">
        <text class="icon">💬</text>
        <text>立即私信</text>
      </button>
      <button class="action-btn primary" @click="makeAppointment">
        立即预约
      </button>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-spacer"></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 咨询师详细数据库
const counselorDatabase = {
  '牢陈头': {
    name: '牢陈头',
    price: 150,
    avatar: '/static/logo.png',
    location: '连州·香江',
    level: '助理咨询师',
    specialty: '焦虑抑郁',
    gender: '男',
    rating: 0.1,
    credentials: ['心理学学士', '初级心理咨询师', '认知行为疗法培训'],
    stats: {
      caseHours: 120,
      experience: 1,
      trainingHours: 80,
      supervisionHours: 30
    },
    topics: [
      { name: '焦虑症', count: 15 },
      { name: '抑郁症', count: 8 },
      { name: '学业压力', count: 12 },
      { name: '人际关系', count: 5 },
      { name: '情绪管理', count: 3 },
      { name: '自我认知', count: 2 },
      { name: '社交恐惧', count: 6 },
      { name: '考试焦虑', count: 4 },
      { name: '失眠问题', count: 3 },
      { name: '拖延症', count: 2 },
      { name: '注意力不集中', count: 3 },
      { name: '适应困难', count: 2 }
    ],
    reviews: [
      {
        avatar: '小',
        username: '小**',
        condition: '焦虑症',
        date: '2025/07/20',
        content: '牢老师很有耐心，虽然经验不是很丰富，但是很认真负责，能感受到他的专业态度。',
        expandable: false
      },
      {
        avatar: '林',
        username: '林**',
        condition: '学业压力',
        date: '2025/07/18',
        content: '第一次咨询心理医生，牢老师很温和，让我感觉很安全，会继续咨询的。',
        expandable: false
      },
      {
        avatar: '陈',
        username: '陈**',
        condition: '社交恐惧',
        date: '2025/07/15',
        content: '牢老师给了我很多实用的建议，虽然改变需要时间...',
        fullContent: '牢老师给了我很多实用的建议，虽然改变需要时间，但我已经看到了希望。在咨询过程中，他耐心地倾听我的困扰，帮助我分析社交恐惧的根源。通过认知行为疗法的技巧，我开始学会挑战自己的负面思维。虽然他还是新人咨询师，但他的专业态度和认真负责的精神让我很感动。',
        expandable: true
      },
      {
        avatar: '张',
        username: '张**',
        condition: '抑郁症',
        date: '2025/07/12',
        content: '感觉牢陈头老师经验确实不够，有些问题他好像也不太懂，建议还是找资深一点的咨询师比较好。',
        expandable: false
      },
      {
        avatar: '李',
        username: '李**',
        condition: '人际关系',
        date: '2025/07/10',
        content: '咨询了几次，感觉效果不明显，可能是刚入行的原因吧，专业度还有待提高。',
        expandable: false
      },
      {
        avatar: '王',
        username: '王**',
        condition: '焦虑症',
        date: '2025/07/08',
        content: '价格便宜但一分钱一分货，感觉就是在聊天...',
        fullContent: '价格便宜但一分钱一分货，感觉就是在聊天，没有专业的治疗方案，浪费时间和金钱。作为一个助理咨询师，牢陈头老师确实缺乏经验，很多时候只是简单地重复我说的话，没有给出实质性的建议。而且经常出现专业知识不足的情况，有些心理学概念他自己都说不清楚。',
        expandable: true
      }
    ]
  },
  '王明轩': {
    name: '王明轩',
    price: 280,
    avatar: '/static/logo.png',
    location: '上海·浦东',
    level: '资深咨询师',
    specialty: '情感关系',
    gender: '男',
    rating: 4.8,
    credentials: ['心理学硕士', '婚姻家庭咨询师', 'EFT情感聚焦疗法师'],
    stats: {
      caseHours: 2800,
      experience: 8,
      trainingHours: 500,
      supervisionHours: 200
    },
    topics: [
      { name: '婚姻关系', count: 180 },
      { name: '情感困扰', count: 120 },
      { name: '亲密关系', count: 95 },
      { name: '分手挽回', count: 60 },
      { name: '家庭冲突', count: 40 },
      { name: '沟通技巧', count: 25 },
      { name: '恋爱困惑', count: 55 },
      { name: '情感创伤', count: 35 },
      { name: '出轨问题', count: 30 },
      { name: '性格不合', count: 45 },
      { name: '信任危机', count: 38 },
      { name: '情绪控制', count: 28 },
      { name: '伴侣选择', count: 20 },
      { name: '异地恋', count: 15 }
    ],
    reviews: [
      {
        avatar: '李',
        username: '李**',
        condition: '婚姻关系',
        date: '2025/07/18',
        content: '王老师非常专业，帮助我和爱人重新找到了沟通的方式，现在我们的关系好了很多。',
        expandable: false
      },
      {
        avatar: '张',
        username: '张**',
        condition: '情感困扰',
        date: '2025/07/15',
        content: '经过几次咨询，我对自己的情感模式有了更深的认识...',
        fullContent: '经过几次咨询，我对自己的情感模式有了更深的认识，王老师的引导很到位。他运用EFT情感聚焦疗法，帮助我识别和理解自己在关系中的情感反应模式。通过角色扮演和情感体验练习，我逐渐学会了如何表达真实的情感需求，不再逃避或压抑自己的感受。这对我未来的恋爱关系有很大帮助。',
        expandable: true
      },
      {
        avatar: '刘',
        username: '刘**',
        condition: '分手挽回',
        date: '2025/07/22',
        content: '王老师帮我分析了分手的原因，虽然最终没有挽回，但我学会了如何更好地爱自己。',
        expandable: false
      },
      {
        avatar: '王',
        username: '王**',
        condition: '亲密关系',
        date: '2025/07/16',
        content: '很专业的咨询师，让我明白了什么是健康的亲密关系，受益匪浅。',
        expandable: false
      },
      {
        avatar: '赵',
        username: '赵**',
        condition: '出轨问题',
        date: '2025/07/14',
        content: '面对伴侣出轨，王老师帮助我冷静分析...',
        fullContent: '面对伴侣出轨，王老师帮助我冷静分析，给了我很多实用的建议和情感支持。最初我情绪完全崩溃，王老师耐心地陪伴我度过了最困难的时期。他帮我理解背叛创伤的心理机制，教会我如何处理愤怒、悲伤和失望等复杂情感。通过几个月的咨询，我重新找回了内心的平静，也对未来的选择有了更清晰的认识。',
        expandable: true
      }
    ]
  },
  '张雨萌': {
    name: '张雨萌',
    price: 320,
    avatar: '/static/logo.png',
    location: '广州·天河',
    level: '专家咨询师',
    specialty: '青少年心理',
    gender: '女',
    rating: 5.0,
    credentials: ['心理学博士', '青少年心理咨询专家', '家庭治疗师'],
    stats: {
      caseHours: 3500,
      experience: 12,
      trainingHours: 800,
      supervisionHours: 300
    },
    topics: [
      { name: '青春期问题', count: 250 },
      { name: '学习压力', count: 180 },
      { name: '亲子关系', count: 150 },
      { name: '厌学情绪', count: 80 },
      { name: '叛逆行为', count: 60 },
      { name: '同伴关系', count: 45 },
      { name: '网络成瘾', count: 70 },
      { name: '早恋问题', count: 40 },
      { name: '自卑心理', count: 55 },
      { name: '完美主义', count: 35 },
      { name: '霸凌问题', count: 25 },
      { name: '身份认同', count: 30 },
      { name: '情绪波动', count: 42 },
      { name: '学业焦虑', count: 65 }
    ],
    reviews: [
      {
        avatar: '妈',
        username: '妈**',
        condition: '亲子关系',
        date: '2025/07/22',
        content: '张老师真的很专业！帮助我们改善了和孩子的关系，现在孩子愿意和我们沟通了。',
        expandable: false
      },
      {
        avatar: '李',
        username: '李**',
        condition: '青春期问题',
        date: '2025/07/20',
        content: '女儿正值青春期，张老师给了我们很多有效的建议，家庭氛围改善了很多。',
        expandable: false
      },
      {
        avatar: '孙',
        username: '孙**',
        condition: '厌学情绪',
        date: '2025/07/19',
        content: '孩子不想上学，张老师耐心地和孩子沟通...',
        fullContent: '孩子不想上学，张老师耐心地和孩子沟通，找到了问题的根源，现在孩子重新燃起了学习兴趣。原来孩子是因为在学校被同学排斥而产生了厌学情绪。张老师不仅帮孩子建立了自信心，还教会了孩子处理人际关系的技巧。同时也指导我们家长如何更好地支持和理解孩子，整个家庭的教育理念都得到了提升。',
        expandable: true
      },
      {
        avatar: '高',
        username: '高**',
        condition: '网络成瘾',
        date: '2025/07/17',
        content: '儿子沉迷游戏，张老师制定了详细的干预方案，现在孩子能够合理控制上网时间了。',
        expandable: false
      }
    ]
  },
  '李心怡': {
    name: '李心怡',
    price: 300,
    avatar: '/static/logo.png',
    location: '北京·朝阳',
    level: '高级咨询师',
    specialty: '家庭治疗',
    gender: '女',
    rating: 4.9,
    credentials: ['心理学硕士', '家庭系统治疗师', '结构式家庭治疗师'],
    stats: {
      caseHours: 2100,
      experience: 7,
      trainingHours: 350,
      supervisionHours: 180
    },
    topics: [
      { name: '家庭关系', count: 180 },
      { name: '亲子沟通', count: 120 },
      { name: '婚姻危机', count: 85 },
      { name: '家庭冲突', count: 60 },
      { name: '教育问题', count: 40 },
      { name: '代际关系', count: 25 },
      { name: '离婚调解', count: 45 },
      { name: '继父母关系', count: 20 },
      { name: '单亲家庭', count: 35 },
      { name: '隔代教育', count: 30 },
      { name: '兄弟姐妹', count: 22 },
      { name: '家暴问题', count: 15 },
      { name: '家庭重组', count: 18 },
      { name: '经济压力', count: 28 }
    ],
    reviews: [
      {
        avatar: '陈',
        username: '陈**',
        condition: '家庭关系',
        date: '2025/07/20',
        content: '李老师帮助我们全家人重新理解了彼此，现在家里的氛围好了很多，孩子也更愿意和我们交流。',
        expandable: false
      },
      {
        avatar: '杨',
        username: '杨**',
        condition: '婚姻危机',
        date: '2025/07/18',
        content: '和丈夫濒临离婚，李老师用家庭治疗的方法...',
        fullContent: '和丈夫濒临离婚，李老师用家庭治疗的方法帮我们找到了问题的核心，现在我们正在努力修复关系。通过结构式家庭治疗，李老师帮助我们看到了家庭系统中存在的问题。她让我们明白，婚姻危机往往不是某一个人的问题，而是整个家庭互动模式的结果。现在我们学会了更有效的沟通方式，也在重新建立彼此的信任。',
        expandable: true
      },
      {
        avatar: '周',
        username: '周**',
        condition: '单亲家庭',
        date: '2025/07/16',
        content: '作为单亲妈妈，李老师教会了我如何更好地平衡工作和照顾孩子，给了我很大的支持。',
        expandable: false
      },
      {
        avatar: '吴',
        username: '吴**',
        condition: '隔代教育',
        date: '2025/07/14',
        content: '婆婆带孩子理念不合，李老师帮助我们建立了有效的沟通机制，现在家庭和谐多了。',
        expandable: false
      }
    ]
  },
  '陈志强': {
    name: '陈志强',
    price: 260,
    avatar: '/static/logo.png',
    location: '深圳·福田',
    level: '资深咨询师',
    specialty: '职场压力',
    gender: '男',
    rating: 4.7,
    credentials: ['心理学硕士', '职业规划师', '压力管理专家'],
    stats: {
      caseHours: 1800,
      experience: 6,
      trainingHours: 280,
      supervisionHours: 150
    },
    topics: [
      { name: '工作压力', count: 200 },
      { name: '职业倦怠', count: 120 },
      { name: '人际关系', count: 90 },
      { name: '职业规划', count: 70 },
      { name: '工作焦虑', count: 50 },
      { name: '团队协作', count: 30 },
      { name: '上司关系', count: 45 },
      { name: '加班困扰', count: 60 },
      { name: '跳槽焦虑', count: 35 },
      { name: '晋升压力', count: 25 },
      { name: '工作生活平衡', count: 40 },
      { name: '同事冲突', count: 32 },
      { name: '职场霸凌', count: 18 },
      { name: '创业压力', count: 22 }
    ],
    reviews: [
      {
        avatar: '刘',
        username: '刘**',
        condition: '工作压力',
        date: '2025/07/19',
        content: '陈老师对职场问题很有见解，帮助我找到了应对工作压力的有效方法。',
        expandable: false
      },
      {
        avatar: '徐',
        username: '徐**',
        condition: '职业倦怠',
        date: '2025/07/17',
        content: '工作了5年感到很疲惫，陈老师帮我重新找到了工作的意义和动力。',
        expandable: false
      },
      {
        avatar: '马',
        username: '马**',
        condition: '上司关系',
        date: '2025/07/15',
        content: '和上司关系紧张，陈老师教了我很多沟通技巧...',
        fullContent: '和上司关系紧张，陈老师教了我很多沟通技巧，现在工作环境改善了不少。之前我总是和上司产生冲突，工作压力特别大。陈老师分析了我的沟通模式，指出了我在职场交往中的盲点。他教会了我如何换位思考，理解上司的工作压力和期望。通过角色扮演练习，我学会了更合适的表达方式，现在和上司的合作更加顺畅。',
        expandable: true
      },
      {
        avatar: '郑',
        username: '郑**',
        condition: '跳槽焦虑',
        date: '2025/07/13',
        content: '想跳槽但又犹豫不决，陈老师帮我做了职业规划分析，现在目标更清晰了。',
        expandable: false
      },
      {
        avatar: '孟',
        username: '孟**',
        condition: '工作生活平衡',
        date: '2025/07/11',
        content: '总是加班没时间陪家人，陈老师给了我很多时间管理的建议，现在生活质量提高了。',
        expandable: false
      }
    ]
  },
  '赵美丽': {
    name: '赵美丽',
    price: 290,
    avatar: '/static/logo.png',
    location: '杭州·西湖',
    level: '专家咨询师',
    specialty: '情绪管理',
    gender: '女',
    rating: 4.8,
    credentials: ['心理学博士', '情绪聚焦治疗师', 'EMDR治疗师'],
    stats: {
      caseHours: 2600,
      experience: 10,
      trainingHours: 600,
      supervisionHours: 250
    },
    topics: [
      { name: '情绪调节', count: 220 },
      { name: '焦虑管理', count: 150 },
      { name: '愤怒控制', count: 80 },
      { name: '抑郁情绪', count: 70 },
      { name: '恐惧症', count: 45 },
      { name: '创伤修复', count: 35 },
      { name: '强迫症', count: 25 },
      { name: '恐慌障碍', count: 30 },
      { name: '情感障碍', count: 40 },
      { name: '自我接纳', count: 55 },
      { name: '压力释放', count: 65 },
      { name: '心理创伤', count: 28 },
      { name: '睡眠障碍', count: 38 },
      { name: '情绪稳定', count: 42 }
    ],
    reviews: [
      {
        avatar: '王',
        username: '王**',
        condition: '情绪调节',
        date: '2025/07/21',
        content: '赵老师教会了我很多情绪管理的技巧，现在我能更好地控制自己的情绪了。',
        expandable: false
      },
      {
        avatar: '田',
        username: '田**',
        condition: '焦虑管理',
        date: '2025/07/19',
        content: '长期焦虑让我很痛苦，赵老师用专业的方法帮我缓解了症状，生活质量大大提高。',
        expandable: false
      },
      {
        avatar: '何',
        username: '何**',
        condition: '愤怒控制',
        date: '2025/07/17',
        content: '我脾气很暴躁，赵老师教了我很多愤怒管理的技巧...',
        fullContent: '我脾气很暴躁，赵老师教了我很多愤怒管理的技巧，现在和家人关系好多了。以前一点小事就会发火，经常和家人吵架，关系很紧张。赵老师运用情绪调节技术，帮我识别愤怒的触发点和身体信号。她教会了我深呼吸、肌肉放松等实用技巧，还帮我建立了情绪日记习惯。现在我能够在愤怒爆发前察觉并控制自己的情绪。',
        expandable: true
      },
      {
        avatar: '金',
        username: '金**',
        condition: '恐慌障碍',
        date: '2025/07/15',
        content: '恐慌发作时很可怕，赵老师的治疗很有效，现在发作频率明显减少了。',
        expandable: false
      },
      {
        avatar: '白',
        username: '白**',
        condition: '睡眠障碍',
        date: '2025/07/13',
        content: '失眠困扰我很久了，赵老师从情绪角度帮我分析，现在睡眠质量好了很多。',
        expandable: false
      }
    ]
  }
}

const counselor = ref({})
const loading = ref(true)
const showAllTopics = ref(false)
const expandedReviews = ref(new Set()) // 管理展开的评论

onMounted(() => {
  // 页面加载时根据传入的咨询师ID或姓名获取详细信息
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  
  console.log('页面参数:', options)
  
  // 优先使用 counselorId，如果没有则使用 name
  const counselorId = options.counselorId || options.name
  
  if (counselorId) {
    getCounselorDetail(counselorId)
  } 
})

function goBack() {
  console.log('返回按钮被点击')
  try {
    uni.navigateBack({
      fail: (err) => {
        console.error('返回失败:', err)
        // 如果没有上一页，则跳转到首页
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }
    })
  } catch (error) {
    console.error('导航出错:', error)
  }
}

function getCounselorDetail(counselorId) {
  console.log('获取咨询师详情:', counselorId)
  loading.value = true
  
  // 模拟网络请求延迟
  setTimeout(() => {
    // 从本地数据库获取咨询师信息
    const counselorData = counselorDatabase[counselorId]
    
    if (counselorData) {
      counselor.value = counselorData
      console.log('成功加载咨询师数据:', counselorData.name)
      
      // 显示成功提示
      uni.showToast({
        title: `已加载${counselorData.name}的资料`,
        icon: 'success',
        duration: 1500
      })
    } else {
      // 如果找不到对应的咨询师，显示错误信息并使用默认数据
      console.warn('未找到咨询师信息:', counselorId)
      
      // 显示可用的咨询师列表
      const availableCounselors = Object.keys(counselorDatabase).join(', ')
      console.log('可用的咨询师:', availableCounselors)
      
      uni.showToast({
        title: '咨询师信息未找到',
        icon: 'none',
        duration: 2000
      })
      
      // 使用默认的第一个咨询师数据
      const firstCounselor = Object.keys(counselorDatabase)[0]
      counselor.value = counselorDatabase[firstCounselor] || {
        name: '咨询师',
        price: 0,
        avatar: '/static/logo.png',
        location: '未知',
        credentials: [],
        stats: { caseHours: 0, experience: 0, trainingHours: 0, supervisionHours: 0 },
        topics: [],
        reviews: []
      }
    }
    
    loading.value = false
  }, 300) // 300ms 延迟模拟加载过程
}

function sendMessage() {
  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  uni.showToast({
    title: '发送私信',
    icon: 'success'
  })
}

function makeAppointment() {
  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  uni.showToast({
    title: '立即预约',
    icon: 'success'
  })
}

function viewAllTopics() {
  // 切换显示所有咨询感受主题的状态
  showAllTopics.value = !showAllTopics.value
  
  uni.showToast({
    title: showAllTopics.value ? '已展开全部' : '已收起',
    icon: 'success',
    duration: 1000
  })
}

function toggleReviewExpand(reviewIndex) {
  // 切换评论展开状态
  if (expandedReviews.value.has(reviewIndex)) {
    expandedReviews.value.delete(reviewIndex)
  } else {
    expandedReviews.value.add(reviewIndex)
  }
  
  // 触发响应式更新
  expandedReviews.value = new Set(expandedReviews.value)
}
</script>

<style scoped>
.counselor-detail {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #e0e0e0;
  border-top: 6rpx solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 32rpx;
  background: #fff;
  font-size: 28rpx;
  color: #333;
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

/* 顶部导航 */
.header {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  cursor: pointer;
}

.back-btn .icon {
  font-size: 48rpx;
  color: #333;
}

/* 头像区域 */
.profile-image-section {
  position: relative;
}

.profile-image {
  width: 100%;
  height: 512rpx;
  background: linear-gradient(180deg, #f0f0f0 0%, #e0e0e0 100%);
}

.guarantee-banner {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, #fff3cd, #ffeaa7);
  padding: 16rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48rpx;
  font-size: 28rpx;
}

.guarantee-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.guarantee-icon {
  color: #28a745;
}

.arrow {
  font-size: 32rpx;
  color: #666;
}

/* 咨询师信息 */
.profile-info {
  background: #fff;
  padding: 32rpx;
}

.name-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.name {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

.price {
  text-align: right;
}

.price-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #ff6b35;
}

.price-unit {
  font-size: 28rpx;
  color: #999;
}

.credentials {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
  font-size: 28rpx;
  color: #666;
}

.credential {
  margin-right: 16rpx;
}

.location-availability {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  font-size: 28rpx;
}

.location {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.location .icon {
  font-size: 32rpx;
  color: #999;
}

.service-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #ff6b35;
}

/* 统计数据 */
.statistics-card {
  background: #fff;
  margin: 32rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32rpx;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 4rpx;
}

.stat-unit {
  font-size: 24rpx;
  color: #ccc;
}

/* 咨询感受 */
.consultation-topics {
  background: #fff;
  margin: 32rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
}

.view-all {
  font-size: 28rpx;
  color: #007aff;
  cursor: pointer;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  transition: background-color 0.2s;
}

.view-all:hover {
  background-color: rgba(0, 122, 255, 0.1);
}

.view-all:active {
  background-color: rgba(0, 122, 255, 0.2);
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  transition: all 0.3s ease;
}

.topic-item {
  background: #f8f9fa;
  padding: 24rpx;
  border-radius: 12rpx;
  text-align: center;
}

.topic-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.topic-count {
  font-size: 24rpx;
  color: #999;
}

/* 用户评价 */
.reviews-section {
  padding: 0 32rpx;
  margin-bottom: 32rpx;
}

.review-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #e3f2fd;
  color: #1976d2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
}

.username {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.condition {
  font-size: 24rpx;
  color: #999;
}

.date {
  font-size: 24rpx;
  color: #ccc;
}

.review-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.expand-btn {
  font-size: 28rpx;
  color: #007aff;
  cursor: pointer;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  transition: background-color 0.2s;
  display: inline-block;
  margin-top: 8rpx;
}

.expand-btn:hover {
  background-color: rgba(0, 122, 255, 0.1);
}

.expand-btn:active {
  background-color: rgba(0, 122, 255, 0.2);
}

/* 底部操作栏 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1rpx solid #eee;
  padding: 32rpx;
  display: flex;
  gap: 24rpx;
  z-index: 1000;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.action-btn.secondary {
  background: transparent;
  color: #333;
  border: 2rpx solid #ddd;
}

.action-btn.primary {
  background: #007aff;
  color: #fff;
}

.action-btn.primary:active {
  opacity: 0.8;
}

.action-btn .icon {
  font-size: 32rpx;
}

/* 底部占位 */
.bottom-spacer {
  height: 160rpx;
}
</style>