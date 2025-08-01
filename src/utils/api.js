// API 工具函数
const BASE_URL = 'https://api.goodfriend-psychology.com'

// 通用请求函数
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': uni.getStorageSync('token') || '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: reject
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
  // 用户登录
  login(username, password) {
    return request('/user/login', {
      method: 'POST',
      data: { username, password }
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
    return request('/user/info')
  },
  
  // 更新用户信息
  updateUserInfo(userInfo) {
    return request('/user/update', {
      method: 'PUT',
      data: userInfo
    })
  }
}

// 测评相关API
export const testAPI = {
  // 提交测评结果
  submitTest(testType, answers, score) {
    return request('/test/submit', {
      method: 'POST',
      data: { testType, answers, score }
    })
  },
  
  // 获取测评结果
  getTestResults() {
    return request('/test/results')
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
    return request('/counselor/list')
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
  storageUtils
}