// 页面性能优化工具函数

/**
 * 防抖函数 - 避免频繁触发事件
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数 - 控制函数执行频率
 */
export function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 图片预加载
 */
export function preloadImages(imageUrls) {
  return Promise.all(
    imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(url)
        img.onerror = () => reject(url)
        img.src = url
      })
    })
  )
}

/**
 * 页面快速跳转 - 优化版本
 */
export function fastNavigate(url, options = {}) {
  const defaultOptions = {
    success: () => {},
    fail: () => {},
    complete: () => {}
  }
  
  const mergedOptions = { ...defaultOptions, ...options, url }
  
  // 使用 requestAnimationFrame 确保在下一帧执行
  requestAnimationFrame(() => {
    uni.navigateTo(mergedOptions)
  })
}

/**
 * 批量设置存储 - 减少存储操作次数
 */
export function setBatchStorage(data) {
  Object.keys(data).forEach(key => {
    uni.setStorageSync(key, data[key])
  })
}

/**
 * 页面可见性检测
 */
export function onPageVisible(callback) {
  // 使用页面生命周期优化
  return {
    onShow: callback,
    onHide: () => {}
  }
}

/**
 * 延迟执行 - 使用 requestIdleCallback 的备用方案
 */
export function runWhenIdle(callback, timeout = 5000) {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(callback, { timeout })
  } else {
    setTimeout(callback, 0)
  }
}

/**
 * 组件懒加载
 */
export function lazyLoad(condition, component) {
  return condition ? component : null
}
