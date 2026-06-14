# 职业规划系统 - 小程序端

基于AI的大学生职业规划智能体 - Uni-APP小程序版本

## 项目简介

这是电脑端项目转换为Uni-APP小程序的版本，使用Vue3 + Uni-APP技术栈，支持多平台发布（微信小程序、H5、App等）

## 项目结构

```
app端/
├── pages/              # 页面目录
│   ├── login/        # 登录页
│   ├── index/       # 首页
│   ├── job-explore/  # 岗位探索
│   ├── student-profile/ # 学生画像
│   ├── career-plan/  # 职业规划
│   └── user-center/  # 个人中心
├── static/           # 静态资源
├── components/       # 公共组件
├── api/            # API接口
│   ├── user.js     # 用户相关API
│   ├── job.js      # 岗位相关API
│   └── student.js # 学生画像API
├── stores/         # 状态管理
│   └── user.js     # 用户状态
├── utils/          # 工具类
│   └── request.js   # 请求封装
├── App.vue         # 应用入口
├── main.js         # 主入口文件
├── manifest.json    # 应用配置
├── pages.json      # 页面路由配置
└── package.json   # 项目依赖
```

## 功能模块

### 1. 登录/注册
- 用户名密码登录
- 验证码验证
- 用户注册

### 2. 首页
- 欢迎页面
- 快捷入口导航
- 功能特点展示

### 3. 岗位探索
- 岗位列表展示
- 搜索功能
- 筛选功能
- 岗位详情

### 4. 学生画像
- 个人信息展示
- 画像进度
- 能力雷达图
- 简历上传

### 5. 职业规划
- 推荐路径
- 发展阶段
- 技能提升建议

### 6. 个人中心
- 个人信息
- 我的申请
- 我的收藏
- 设置
- 退出登录

## 技术栈

- **框架**: Uni-APP (Vue 3)
- **状态管理**: 自定义Store
- **网络请求**: uni.request封装
- **UI组件**: Uni-APP内置组件

## 开发指南

### 环境要求

- HBuilderX 3.0+
- 微信开发者工具（用于微信小程序开发）
- Node.js 14+

### 开发步骤

1. **使用HBuilderX打开项目**
   ```
   文件 -> 打开目录 -> 选择app端文件夹
   ```

2. **配置manifest.json**
   - 配置小程序appid
   - 配置各平台特有设置

3. **运行项目**
   - H5: 运行 -> 运行到浏览器 -> Chrome
   - 微信小程序: 运行 -> 运行到小程序模拟器 -> 微信开发者工具

### 注意事项

1. **后端API地址**
   - 默认后端地址为 `http://localhost:8000`
   - 如需修改，请编辑 `utils/request.js` 中的 `BASE_URL`

2. **tabBar图标**
   - 需要在 `static/tabbar/` 目录下放置图标文件
   - 图标尺寸建议 81px * 81px

3. **验证码功能**
   - 确保后端验证码接口正常运行
   - 验证码图片通过base64方式显示

## 与电脑端的区别

| 功能 | 电脑端 | 小程序端 |
|------|---------|----------|
| 页面布局 | 侧边栏导航 | 底部tabBar |
| 网络请求 | axios | uni.request |
| 本地存储 | localStorage | uni.storage |
| 路由 | vue-router | uni.navigateTo |
| 图表 | ECharts | 待实现 |
| 悬浮窗 | 有 | 待实现 |

## 后续优化建议

1. **图表库选型
   - 使用 uCharts (qiun-data-charts
   - 或使用 ECharts for 小程序版

2. **状态管理
   - 可引入 Pinia 或 Vuex
   - 当前使用简单的状态管理

3. **UI组件库**
   - 可引入 uView UI
   - 或使用 Vant Weapp

4. **性能优化**
   - 图片懒加载
   - 列表虚拟滚动
   - 分包加载

## 许可证

MIT License
