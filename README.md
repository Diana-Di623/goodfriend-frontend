# 好朋友心理 - 前端应用

一个基于 uni-app 的心理健康服务应用，支持多平台部署（H5、小程序、APP）。

## 项目简介

好朋友心理是一款专注于心理健康的移动应用，提供专业的心理咨询服务、心理测评、心理文章阅读以及心愿心语社区功能。

## 主要功能

- 🔐 **用户认证**: 手机号验证码登录
- 👥 **专业团队**: 认证心理咨询师在线支持
- 📊 **心理测评**: 5分钟快速心理状态评估
- 📖 **心理推文**: 专业心理健康文章阅读
- 💭 **心愿心语**: 情感分享与倾听社区
- 👤 **个人中心**: 用户档案管理

## 技术栈

- **框架**: uni-app (Vue 3 + Vite)
- **UI**: 原生组件 + 自定义样式
- **状态管理**: Composition API
- **网络请求**: uni.request (内置)
- **存储**: uni.getStorageSync / uni.setStorageSync

## API接口说明

### 基础配置

```javascript
// API基础配置
const API_BASE_URL = 'https://api.goodfriend.com'
const API_VERSION = '/v1'
```

## 已完成模块的API接口

### 1. 用户认证相关接口 ✅

#### 1.1 发送验证码
```http
POST /api/v1/auth/send-code
Content-Type: application/json

{
  "phone": "13800138000"
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "验证码发送成功",
  "data": {
    "expire_time": 300
  }
}
```

#### 1.2 手机号登录
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "123456",
  "terms_accepted": true
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user_info": {
      "id": 12345,
      "phone": "13800138000",
      "nickname": "用户8000",
      "avatar": "",
      "created_at": "2025-07-22T00:00:00Z"
    }
  }
}
```

#### 1.3 token验证并获取用户信息
```http
GET /api/v1/auth/verify
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "code": 200,
  "message": "验证成功",
  "data": {
    "id": 12345,
    "phone": "13800138000",
    "nickname": "用户8000",
    "avatar": "",
    "created_at": "2025-07-22T00:00:00Z"
  }
}
```

### 2. 咨询师相关接口 ✅

#### 2.1 获取咨询师列表
```http
GET /api/v1/counselors?page=1&limit=12
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "王明轩",
        "level": "资深咨询师",
        "specialty": "情感关系",
        "gender": "男",
        "location": "上海",
        "rating": 4.8,
        "avatar": "https://cdn.goodfriend.com/avatars/wang.jpg",
        "experience_years": 8,
        "consultation_count": 1200,
        "price_per_hour": 300
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 12
  }
}
```

### 3. 心理推文相关接口 ✅

#### 3.1 获取推文列表
```http
GET /api/v1/articles?page=1&limit=10&category=psychology
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "焦虑时试试478呼吸法",
        "summary": "一种简单有效的焦虑缓解技巧",
        "content": "...",
        "author": "张心理师",
        "category": "anxiety",
        "tags": ["焦虑", "呼吸法", "缓解"],
        "cover_image": "https://cdn.goodfriend.com/covers/breathing.jpg",
        "read_count": 1580,
        "like_count": 234,
        "created_at": "2025-07-20T10:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### 4. 心愿心语相关接口 ✅

#### 4.1 获取心愿心语列表
```http
GET /api/v1/wishes?page=1&limit=20&type=public
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "content": "希望今天能有一个好心情",
        "author": {
          "id": 123,
          "nickname": "匿名用户",
          "avatar": ""
        },
        "is_anonymous": true,
        "like_count": 15,
        "reply_count": 3,
        "created_at": "2025-07-22T08:00:00Z"
      }
    ],
    "total": 200,
    "page": 1,
    "limit": 20
  }
}
```

#### 4.2 获取未读消息数量
```http
GET /api/v1/wishes/unread-count
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "unread_count": 15
  }
}
```

### 5. 基础用户信息接口 ✅

> 注：用户信息获取已整合到 `1.3 token验证` 接口中，无需单独调用

## 需要后端支持的API接口

基于已完成的前端模块功能，以下是需要后端提供的API接口：

### 6. 用户信息管理接口 ✅

#### 6.1 更新用户完整信息
```http
PUT /api/v1/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "avatar": "base64_image_string_or_url",
  "nickname": "用户昵称",
  "gender": "男|女",
  "birthday": "1990-01-01",
  "location": "上海",
  "customLocation": "具体城市名(当location为其他时)",
  "bio": "个人简介"
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 12345,
    "phone": "13800138000",
    "nickname": "用户昵称",
    "gender": "男",
    "birthday": "1990-01-01",
    "age": 35,
    "location": "上海",
    "bio": "个人简介",
    "avatar": "https://cdn.goodfriend.com/avatars/user123.jpg",
    "detailedInfoCompleted": true,
    "updatedAt": "2025-07-22T00:00:00Z"
  }
}
```

#### 6.2 头像上传接口
```http
POST /api/v1/user/upload-avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <image_file>
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "avatar_url": "https://cdn.goodfriend.com/avatars/user123.jpg"
  }
}
```
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求频率过高 |
| 500 | 服务器内部错误 |

## 开发环境配置

### 安装依赖
```bash
npm install
```

### 开发模式启动

```bash
# H5端
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# 支付宝小程序
npm run dev:mp-alipay
```

### 生产构建

```bash
# H5端
npm run build:h5

# 微信小程序
npm run build:mp-weixin
```

## 项目结构

```
src/
├── pages/              # 页面文件
│   ├── index/          # 首页
│   ├── login/          # 登录页
│   ├── profile/        # 个人中心
│   │   ├── profile.vue # 个人信息页
│   │   └── complete.vue# 信息完善页
│   └── register/       # 注册页(预留)
├── static/             # 静态资源
│   └── logo.png        # 应用图标
├── utils/              # 工具函数
│   └── constants.js    # 常量配置
├── App.vue             # 根组件
├── main.js             # 入口文件
├── pages.json          # 页面配置
├── manifest.json       # 应用配置
└── uni.scss           # 全局样式
```

## API接口总结
```

## 后端开发建议

### 数据库表设计建议

```sql
-- 用户表
users (id, phone, nickname, gender, birthday, location, bio, avatar, created_at, updated_at)

-- 咨询师表  
counselors (id, name, level, specialty, gender, location, rating, avatar, experience_years, consultation_count, price_per_hour)

-- 文章表
articles (id, title, summary, content, author, category, cover_image, read_count, like_count, created_at)

-- 心愿心语表
wishes (id, user_id, content, is_anonymous, like_count, reply_count, created_at)
```

### 技术栈建议

- **后端框架**：Spring Boot / Node.js Express / Django
- **数据库**：MySQL / PostgreSQL  
- **缓存**：Redis
- **文件存储**：阿里云OSS / 腾讯云COS
- **短信服务**：阿里云SMS / 腾讯云SMS
- **部署**：Docker + Nginx

### 开发优先级建议

1. **第一期**：用户认证模块 (3个接口)
2. **第二期**：基础数据展示 (3个接口：咨询师列表、推文列表、心愿心语列表)  
3. **第三期**：用户信息管理 (3个接口：包括未读消息统计)

## 注意事项

1. ✅ **已完成功能**：用户登录认证、咨询师列表展示、心理推文列表、心愿心语列表显示、个人信息管理
2. 所有需要登录的接口都需要在请求头中携带 `Authorization: Bearer <token>`
3. 验证码在开发环境固定为 `123456`，生产环境会发送真实短信
4. 前端已完成基础页面和交互逻辑，提供后端API接口即可完整运行

## API接口总结

### ✅ 已完成前端界面，需后端支持的接口：

**用户认证模块 (3个接口)**
- `POST /api/v1/auth/send-code` - 发送验证码
- `POST /api/v1/auth/login` - 手机号登录  
- `GET /api/v1/auth/verify` - token验证

**咨询师模块 (1个接口)**
- `GET /api/v1/counselors` - 获取咨询师列表

**心理推文模块 (1个接口)**
- `GET /api/v1/articles` - 获取推文列表

**心愿心语模块 (2个接口)**
- `GET /api/v1/wishes` - 获取心愿心语列表
- `GET /api/v1/wishes/unread-count` - 获取未读消息数量

**用户信息管理 (2个接口)**
- `PUT /api/v1/user/profile` - 更新用户完整信息
- `POST /api/v1/user/upload-avatar` - 头像上传

**总计需要：9个API接口**

### 📊 开发进度统计

- ✅ **前端页面**：100% 完成（登录、首页、个人信息管理）
- ✅ **UI组件**：100% 完成（表单、列表、导航等）
- ✅ **前端逻辑**：90% 完成（基础功能完整，仅需API对接）
- 🚧 **后端API**：0% 完成（需要开发9个基础接口）
- 🚧 **数据库设计**：0% 完成
- 🚧 **部署配置**：0% 完成
