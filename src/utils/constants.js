/**
常量
 */
import {ref}from 'vue'
export const unreadMessageCount = ref(15)

// 性别选项 - 提供男女和未知选项来保护隐私
export const GENDER_OPTIONS = [
  { label: '男', value: '男' },
  { label: '女', value: '女' },
  { label: '未知', value: '未知' }
]

// 性别枚举
export const GENDER = {
  MALE: '男',
  FEMALE: '女',
  UNKNOWN: '未知'
}

// 生日相关配置
export const BIRTHDAY_CONFIG = {
  minYear: 1924, // 最小年份 (100岁)
  maxYear: new Date().getFullYear(), // 最大年份 (当前年)
  defaultYear: 1990 // 默认年份
}

// 地区选项（主要城市）
export const REGION_OPTIONS = [
  { label: '北京', value: '北京' },
  { label: '上海', value: '上海' },
  { label: '广州', value: '广州' },
  { label: '深圳', value: '深圳' },
  { label: '杭州', value: '杭州' },
  { label: '成都', value: '成都' },
  { label: '重庆', value: '重庆' },
  { label: '武汉', value: '武汉' },
  { label: '西安', value: '西安' },
  { label: '南京', value: '南京' },
  { label: '天津', value: '天津' },
  { label: '苏州', value: '苏州' },
  { label: '长沙', value: '长沙' },
  { label: '郑州', value: '郑州' },
  { label: '青岛', value: '青岛' },
  { label: '大连', value: '大连' },
  { label: '宁波', value: '宁波' },
  { label: '厦门', value: '厦门' },
  { label: '合肥', value: '合肥' },
  { label: '昆明', value: '昆明' },
  { label: '其他', value: '其他' }
]

// 验证性别是否有效
export function isValidGender(gender) {
  return gender === GENDER.MALE || gender === GENDER.FEMALE || gender === GENDER.UNKNOWN
}

// 获取性别显示文本
export function getGenderLabel(gender) {
  if (gender === GENDER.MALE) return '男'
  if (gender === GENDER.FEMALE) return '女'
  return '未知'
}

// 验证生日是否有效
export function isValidBirthday(birthday) {
  if (!birthday) return false
  const date = new Date(birthday)
  const now = new Date()
  return date <= now && date >= new Date('1924-01-01')
}

// 根据生日计算年龄
export function calculateAge(birthday) {
  if (!birthday) return 0
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

// 根据生日获取年龄段
export function getAgeRangeFromBirthday(birthday) {
  const age = calculateAge(birthday)
  
  if (age < 18) return '未满18岁'
  if (age >= 18 && age <= 25) return '18-25岁'
  if (age >= 26 && age <= 35) return '26-35岁'
  if (age >= 36 && age <= 45) return '36-45岁'
  if (age >= 46 && age <= 55) return '46-55岁'
  if (age >= 56 && age <= 65) return '56-65岁'
  if (age > 65) return '65岁以上'
  
  return '未知'
}

// 验证地区是否有效
export function isValidRegion(region) {
  return REGION_OPTIONS.some(option => option.value === region) || region === '其他'
}
