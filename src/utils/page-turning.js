
// 首页导航 - 优化版本
export function goHome() {
  // 获取当前页面栈
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  
  // 如果当前就在首页，不需要跳转
  if (currentPage.route === 'pages/index/index') {
    return
  }
  
  // 简单直接的跳转方式，避免复杂的页面栈操作
  uni.navigateTo({
    url: '/pages/index/index',
    fail: () => {
      // 如果navigateTo失败（页面栈满），则用redirectTo
      uni.redirectTo({
        url: '/pages/index/index'
      })
    }
  })
}
export function goAppointments() {
  // 使用reLaunch确保快速跳转，清空页面栈
  uni.reLaunch({
    url: '/pages/counselor/appointments'
  })
}
// 测评跳转 - 优化版本
export function goTest(testType) {
  const testRoutes = {
    'SDS': '/pages/test/sds',
    'SAS': '/pages/test/sas'
  }
  const route = testRoutes[testType]
  
  if (route) {
    // 直接跳转，无延迟
    uni.navigateTo({
      url: route
    })
  } else {
    uni.showToast({
      title: '测评类型错误',
      icon: 'none',
      duration: 1500
    })
  }
}

// 心愿心语导航 - 优化版本
export function handleWishClick() {
  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '需要会员登录才能使用此功能',
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 检查个人信息是否完整
  const storedUserInfo = uni.getStorageSync('userInfo')
  if (!isUserInfoComplete(storedUserInfo)) {
    uni.showModal({
      title: '请先完善个人信息',
      content: '使用心愿心语功能前，请先完善您的个人资料',
      showCancel: false,
      confirmText: '我知道了'
    })
    return
  }

  // 直接跳转，无延迟
  uni.navigateTo({
    url: '/pages/wish/wish'
  })
}

// 测评结果导航 - 优化版本
export function goTestResults() {
  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '需要会员登录才能使用此功能',
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 检查个人信息是否完整
  const storedUserInfo = uni.getStorageSync('userInfo')
  if (!isUserInfoComplete(storedUserInfo)) {
    uni.showModal({
      title: '请先完善个人信息',
      content: '使用测评功能前，请先完善您的个人资料',
      showCancel: false,
      confirmText: '我知道了'
    })
    return
  }

  // 直接跳转，无延迟
  uni.navigateTo({
    url: '/pages/test/results'
  })
}

// 查看我的预约 - 优化版本
export function goMyAppointments() {
  if (checkLoginAndShowModal('我的预约')) {
    // 直接跳转，无延迟
    uni.navigateTo({
      url: '/pages/appointment/appointment'
    })
  }
}

// 个人信息 - 优化版本
export function goProfile() {
  // 检查是否已登录
  const token = uni.getStorageSync('token')
  
  if (!token) {
    // 未登录，直接跳转到登录页面
    uni.navigateTo({
      url: '/pages/login/login'
    })
    return
  }
  
  // 已登录，直接跳转到个人资料页面
  uni.navigateTo({
    url: '/pages/profile/profile'
  })
}

// 返回上一页 - 优化版本
export function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ 
        url: '/pages/index/index' 
      })
    }
  })
}

// 检查用户信息是否完整
export function isUserInfoComplete(userInfo) {
  return !!(
    userInfo &&
    userInfo.nickname &&
    userInfo.nickname.trim() &&
    userInfo.gender &&
    userInfo.birthday &&
    userInfo.location &&
    userInfo.phone
  )
}

// 检查登录状态
function checkLoginAndShowModal(featureName = '该功能') {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: `请先登录后再使用${featureName}`,
      icon: 'none',
      duration: 2000
    })
    return false
  }
  return true
}
