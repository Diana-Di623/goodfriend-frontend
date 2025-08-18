// API 工具函数
export const BASE_URL = 'http://127.0.0.1:8080'

function processAvatarUrl(avatarPath) {
  if (!avatarPath) return ''
  // 如果已经是完整URL，直接返回
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath
  }
  const imageExtensions = ['.png', '.jpg']
  const hasImageExtension = imageExtensions.some(ext => avatarPath.toLowerCase().includes(ext))
  
  if (avatarPath.includes('tmp/') && hasImageExtension) {
    console.log('检测到临时路径格式，进行转换')
    // 提取文件名部分
    const fileName = avatarPath.split('/').pop()
    const convertedPath = BASE_URL + '/consultant/avatars/' + fileName
    console.log('转换后路径:', convertedPath)
    return convertedPath
  }
  
  // 如果路径格式是 "consultant/avatars/xxx.png"，说明是标准相对路径
  if (avatarPath.startsWith('consultant/avatars/')) {
    console.log('检测到标准相对路径格式')
    const fullPath = BASE_URL + '/static/' + avatarPath
    console.log('拼接后路径:', fullPath)
    return fullPath
  }
}

// 智能导航函数：自动管理页面栈
function smartNavigate(options) {
  return new Promise((resolve, reject) => {
    // 获取当前页面栈
    const pages = getCurrentPages()
    console.log('当前页面栈长度:', pages.length)
    
    // 如果页面栈接近限制（8个以上），使用redirectTo
    if (pages.length >= 8) {
      console.log('页面栈过深，使用redirectTo')
      uni.redirectTo({
        ...options,
        success: resolve,
        fail: reject
      })
    } else {
      console.log('正常导航，使用navigateTo')
      uni.navigateTo({
        ...options,
        success: resolve,
        fail: reject
      })
    }
  })
}

function no_head_request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    const requestConfig = {
      url: BASE_URL + url,
      method: options.method || 'GET',
      data: options.data || {},
    }


    // 打印请求详细信息
    console.log('=== API请求详情 ===')
    console.log('完整URL:', requestConfig.url)
    console.log('请求方法:', requestConfig.method)
    console.log('Token信息:', token ? `Bearer ${token.substring(0, 20)}...` : '无Token')
    console.log('请求数据:', JSON.stringify(requestConfig.data, null, 2))
    console.log('==================')

    uni.request({
      ...requestConfig,
      success: (res) => {
        // 打印响应信息
        console.log('=== API响应详情 ===')
        console.log('响应状态码:', res.statusCode)
        console.log('响应头:', JSON.stringify(res.header, null, 2))
        console.log('响应数据:', JSON.stringify(res.data, null, 2))
        console.log('==================')

        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: (error) => {
        // 打印错误信息
        console.log('=== API请求失败 ===')
        console.log('错误信息:', JSON.stringify(error, null, 2))
        console.log('请求URL:', requestConfig.url)
        console.log('==================')
        reject(error)
      }
    })
  })
}
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    const requestConfig = {
      url: BASE_URL + url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      }
    }
 
    
    // 打印请求详细信息
    console.log('=== API请求详情 ===')
    console.log('完整URL:', requestConfig.url)
    console.log('请求方法:', requestConfig.method)
    console.log('Token信息:', token ? `Bearer ${token.substring(0, 20)}...` : '无Token')
    console.log('请求头:', JSON.stringify(requestConfig.header, null, 2))
    console.log('请求数据:', JSON.stringify(requestConfig.data, null, 2))
    console.log('==================')
    
    uni.request({
      ...requestConfig,
      success: (res) => {
        // 打印响应信息
        console.log('=== API响应详情 ===')
        console.log('响应状态码:', res.statusCode)
        console.log('响应头:', JSON.stringify(res.header, null, 2))
        console.log('响应数据:', JSON.stringify(res.data, null, 2))
        console.log('==================')
        
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: (error) => {
        // 打印错误信息
        console.log('=== API请求失败 ===')
        console.log('错误信息:', JSON.stringify(error, null, 2))
        console.log('请求URL:', requestConfig.url)
        console.log('==================')
        reject(error)
      }
    })
  })
}

// 心愿心语相关API
export const wishAPI = {
  // 获取心愿心语列表
  getWishList(page = 1, limit = 20) {
    return request(`/wish/list?page=${page}&limit=${limit}`)
  },
  
  // 发布心愿心语
  publishWish(content, quotedId = null) {
    return request('/wish/publish', {
      method: 'POST',
      data: { content, quotedId }
    })
  },
  
  // 点赞/取消点赞
  toggleLike(wishId) {
    return request('/wish/like', {
      method: 'POST',
      data: { wishId }
    })
  },
  
  // 删除心愿心语
  deleteWish(wishId) {
    return request(`/wish/${wishId}`, {
      method: 'DELETE'
    })
  }
}

// 用户相关API
export const userAPI = {
  // 发送验证码
  sendVerificationCode(phone, role = 'USER') {
    return request('/api/auth/send-code', {
      method: 'POST',
      data: { phone, role }
    })
  },
  
  // 用户登录 - 支持手机号验证码登录
  login(phone, code, role = 'USER') {
    return request('/api/auth/login', {
      method: 'POST',
      data: { phone, code, role }
    })
  },
  
  // 咨询师登录
  consultantLogin(phone, code) {
    return request('/api/auth/login', {
      method: 'POST',
      data: { phone, code, role: 'CONSULTANT' }
    })
  },
  
  // 用户注册
  register(userInfo) {
    return request('/user/register', {
      method: 'POST',
      data: userInfo
    })
  },
  
  // 获取用户信息
  getUserInfo() {
    return request('/api/user/profile')
  },
  
  // 更新用户信息
  updateUserInfo(userInfo) {
    return request('/api/user/update', {
      method: 'PUT',
      data: userInfo
    })
  },
  
  // 获取可用头像列表
  getAvailableAvatars() {
    return request('/api/user/avatars', {
      method: 'GET'
    })
  },
  
  // 创建预约
  createAppointment(appointmentData) {
    return request('/api/user/appointments', {
      method: 'POST',
      data: appointmentData
    })
  },
  
  // 获取用户预约列表
  getUserAppointments() {
    return request('/api/user/appointments', {
      method: 'GET'
    })
  }
}

// 测评相关API
export const testAPI = {
  //保存测试结果
  postSaveTestResult(testResult) {
    return request('/api/user/tests', {
      method: 'POST',
      data: testResult

    })
  },
  
  // 获取测评结果
  getTestResults( ) {
    return request('/api/user/tests', {
      method: 'GET',
    })
  },
  
  // 获取测评历史
  getTestHistory(testType) {
    return request(`/test/history?type=${testType}`)
  }
}

// 咨询师相关API
export const counselorAPI = {
  // 获取咨询师列表
  getCounselorList() {
    return no_head_request('/api/consultant/all',{
      method: 'GET'
    })
  },
  
  // 获取咨询师详情
  getCounselorDetail(counselorId) {
    return request(`/counselor/${counselorId}`)
  },
  
  // 预约咨询
  bookConsultation(counselorId, time) {
    return request('/counselor/book', {
      method: 'POST',
      data: { counselorId, time }
    })
  },
  
  // 申请成为咨询师
  applyConsultant(applicationData) {
    return request('/api/user/consultant/apply', {
      method: 'POST',
      data: applicationData
    })
  },
  
  // 更新咨询师信息
  updateConsultant(consultantData) {
    return request('/api/consultant/update', {
      method: 'PUT',
      data: consultantData
    })
  },
  
  // 获取当前咨询师信息
  getConsultantProfile() {
    return request('/api/consultant/profile', {
      method: 'GET'
    })
  },
  
  // 上传咨询师头像
  uploadConsultantAvatar(filePath) {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync('token') || ''
      
      console.log('=== 头像上传请求 ===')
      console.log('文件路径:', filePath)
      console.log('Token信息:', token ? `Bearer ${token.substring(0, 20)}...` : '无Token')
  console.log('API地址:', BASE_URL + '/api/consultant/avatar')
      console.log('==================')
      
      uni.uploadFile({
  url: BASE_URL + '/api/consultant/avatar',
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          console.log('=== 头像上传响应 ===')
          console.log('响应状态码:', res.statusCode)
          console.log('响应数据原始:', res.data)
          console.log('响应数据类型:', typeof res.data)
          console.log('响应数据长度:', res.data ? res.data.length : 0)
          console.log('==================')
          
          if (res.statusCode === 200) {
            // 检查响应数据是否为空
            if (!res.data || res.data.trim() === '') {
              console.log('服务器返回空响应，但状态码为200，认为上传成功')
              resolve({
                success: true,
                message: '上传成功',
                avatarUrl: null // 可能需要从其他地方获取新的头像URL
              })
              return
            }
            
            try {
              const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
              resolve(data)
            } catch (error) {
              console.error('解析响应数据失败:', error)
              console.log('尝试直接返回原始响应数据')
              // 如果解析失败，但状态码是200，仍然认为成功
              resolve({
                success: true,
                message: '上传成功',
                originalData: res.data
              })
            }
          } else {
            reject({
              statusCode: res.statusCode,
              data: res.data
            })
          }
        },
        fail: (error) => {
          console.log('=== 头像上传失败 ===')
          console.error('上传错误:', error)
          console.log('==================')
          reject(error)
        }
      })
    })
  },
  
  // 获取咨询师申请反馈
  getConsultantApplications() {
    return request('/api/user/consultant/applications', {
      method: 'GET'
    })
  }
}

// 本地存储工具
export const storageUtils = {
  // 存储心愿心语到本地
  saveWishList(wishList) {
    uni.setStorageSync('wishList', wishList)
  },
  
  // 从本地获取心愿心语
  getWishList() {
    return uni.getStorageSync('wishList') || []
  },
  
  // 添加新的心愿心语到本地
  addWishToLocal(wish) {
    const wishList = this.getWishList()
    wishList.unshift(wish)
    this.saveWishList(wishList)
  },
  
  // 更新本地心愿心语
  updateWishInLocal(wishId, updates) {
    const wishList = this.getWishList()
    const index = wishList.findIndex(wish => wish.id === wishId)
    if (index !== -1) {
      wishList[index] = { ...wishList[index], ...updates }
      this.saveWishList(wishList)
    }
  }
}

export default {
  wishAPI,
  userAPI,
  testAPI,
  counselorAPI,
  storageUtils,
  processAvatarUrl,
  smartNavigate
}