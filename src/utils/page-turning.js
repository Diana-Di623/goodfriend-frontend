
import { ref } from 'vue'
export const isPageLoading = ref(false)
export const progressBarWidth = ref(0)
export const loadingText = ref('加载中...')
let progressTimer = null// 封装全局 loading 动画启动
// 封装全局 loading 动画启动
export function showLoadingWithProgress(duration = 500, text = '加载中...', callback) {
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
                if (typeof callback === 'function') callback()
            }
        }, 16)
    }, 30)
}
export function goBrowse() {
    uni.setStorageSync('showHomeLoading', true)
    uni.reLaunch({
        url: '/pages/index/index'
    })
}
// 首页导航
export function goHome() {
    // 检查登录状态
    const token = uni.getStorageSync('token')
    if (!token) {
        uni.showToast({
            title: '请先登录',
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
            content: '使用完整功能前，请先完善您的个人资料，包括昵称、性别、生日、地区等信息',
            showCancel: false,
            confirmText: '我知道了'
        })
        return
    }

    // 显示进度条加载动画
    showLoadingWithProgress(800, '正在跳转首页...')
    setTimeout(() => {
        // 设置标志，避免首页重复加载
        uni.setStorageSync('skipHomeLoading', true)
        uni.reLaunch({
            url: '/pages/index/index'
        })
    }, 800)
}

export function goTest(testType) {
    // 根据测评类型跳转到对应页面
    const testRoutes = {
        'SDS': '/pages/test/sds',
        'SAS': '/pages/test/sas'
    }
    const route = testRoutes[testType]
    const testNames = {
        'SDS': '抑郁自评量表',
        'SAS': '焦虑自评量表'
    }
    showLoadingWithProgress(1200, `正在打开${testNames[testType]}...`)
    setTimeout(() => {
        if (route) {
            uni.navigateTo({
                url: route,
            })
        } else {
            isPageLoading.value = false
            uni.showToast({
                title: '测评类型错误',
                icon: 'none',
                duration: 1500
            })
        }
    }, 500)
}

// 心愿心语导航
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

    // 显示进度条加载动画
    showLoadingWithProgress(1000, '正在打开心愿心语...')

    setTimeout(() => {
        uni.navigateTo({
            url: '/pages/wish/wish'
        })
    }, 1000)
}

// 测评结果导航
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

    // 显示进度条加载动画
    showLoadingWithProgress(1000, '正在加载测评结果...')

    setTimeout(() => {
        uni.navigateTo({
            url: '/pages/test/results'
        })
    }, 1000)
}

//查看我的预约
export function goMyAppointments() {
    if (checkLoginAndShowModal('我的预约')) {
        showLoadingWithProgress(1000, '正在查看我的预约...')
        setTimeout(() => {
            uni.navigateTo({
                url: '/pages/appointment/appointment'
            })
        }, 1000)
    }
}

//个人信息
export function goProfile() {
    // 检查是否已登录
    const token = uni.getStorageSync('token')
    showLoadingWithProgress(1000, '正在打开个人中心...')
    setTimeout(() => {
        if (!token) {
            // 未登录，跳转到登录页面
            uni.navigateTo({
                url: '/pages/login/login',
                // 不再手动关闭 loading，由动画控制
            })
            return
        }
        console.log('QWQ')
        // 已登录，直接跳转到个人资料页面
        uni.navigateTo({
            url: '/pages/profile/profile',
        })
    }, 500)
}
export function goBack() {
    uni.navigateBack({
        fail: () => {
            uni.switchTab({ url: '/pages/index/index' })
        }
    })
}

///////////////////////////////////////////////////
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
