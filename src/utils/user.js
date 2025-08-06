// 用户相关工具函数

/**
 * 检查用户信息是否完整
 * @param {Object} userInfo 用户信息对象
 * @returns {Boolean} 是否完整
 */
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

/**
 * 检查用户是否已登录且信息完整
 * @returns {Object} 检查结果 { isLoggedIn, isInfoComplete, userInfo }
 */
export function checkUserStatus() {
  const token = uni.getStorageSync('token')
  const userInfo = uni.getStorageSync('userInfo')
  
  return {
    isLoggedIn: !!token,
    isInfoComplete: isUserInfoComplete(userInfo),
    userInfo: userInfo
  }
}

/**
 * 显示需要完善个人信息的提示
 * @param {String} feature 功能名称
 * @param {Function} callback 确认后的回调函数
 */
export function showIncompleteInfoModal(feature = '此功能', callback = null) {
  uni.showModal({
    title: '请先完善个人信息',
    content: `使用${feature}前，请先完善您的个人资料，包括昵称、性别、生日、地区等信息`,
    showCancel: false,
    confirmText: '去完善',
    success: (res) => {
      if (res.confirm && callback) {
        callback()
      }
    }
  })
}

/**
 * 显示需要登录的提示
 * @param {Function} callback 确认后的回调函数
 */
export function showLoginRequiredToast(callback = null) {
  uni.showToast({
    title: '请先登录',
    icon: 'none',
    duration: 2000
  })
  
  if (callback) {
    setTimeout(callback, 2000)
  }
}

/**
 * 检查并引导用户完善信息或登录
 * @param {String} feature 功能名称
 * @param {Function} successCallback 检查通过后的回调
 * @param {Function} loginCallback 需要登录时的回调
 * @param {Function} incompleteCallback 信息不完整时的回调
 * @returns {Boolean} 是否可以继续操作
 */
export function checkAndGuideUser(feature, successCallback, loginCallback = null, incompleteCallback = null) {
  const { isLoggedIn, isInfoComplete, userInfo } = checkUserStatus()
  
  if (!isLoggedIn) {
    showLoginRequiredToast(loginCallback)
    return false
  }
  
  if (!isInfoComplete) {
    showIncompleteInfoModal(feature, incompleteCallback || (() => {
      // 默认跳转到个人信息页面
      uni.navigateTo({
        url: '/pages/profile/profile'
      })
    }))
    return false
  }
  
  if (successCallback) {
    successCallback(userInfo)
  }
  return true
}
