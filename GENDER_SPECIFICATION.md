# 个人信息性别选项规范

## 需求
个人信息中的性别选项只提供男女，不提供其他选项。

## 实现方案

### 1. 常量定义
在 `src/utils/constants.js` 中定义性别相关常量：
```javascript
// 性别选项 - 只提供男女两个选项
export const GENDER_OPTIONS = [
  { label: '男', value: '男' },
  { label: '女', value: '女' }
]

// 性别枚举
export const GENDER = {
  MALE: '男',
  FEMALE: '女'
}

// 验证函数
export function isValidGender(gender) {
  return gender === GENDER.MALE || gender === GENDER.FEMALE
}
```

### 2. 个人信息页面
在 `src/pages/profile/profile.vue` 中实现：
- 性别选择使用两个选项按钮，只能选择"男"或"女"
- 保存时强制验证性别必须是有效值
- UI设计直观清晰，显示当前选中状态

### 3. 数据验证
- 使用 `isValidGender()` 函数验证所有性别输入
- 保存时检查性别字段必填且有效
- 与现有咨询师数据保持一致（使用中文"男"/"女"）

## 关键特性
✅ **严格限制**: 只提供男女两个选项  
✅ **数据验证**: 强制验证性别字段的有效性  
✅ **一致性**: 与现有数据格式保持统一  
✅ **用户友好**: 清晰的UI界面和交互体验

## 相关文件
- `src/utils/constants.js` - 性别常量定义
- `src/pages/profile/profile.vue` - 个人信息页面
- `src/pages.json` - 路由配置