# 静态资源目录

## tabBar图标

在此目录下创建 `tabbar` 文件夹，并放置以下图标文件（尺寸建议 81px × 81px）：

```
static/tabbar/
├── home.png           # 首页图标（未选中）
├── home-active.png   # 首页图标（选中）
├── job.png           # 岗位探索图标（未选中）
├── job-active.png   # 岗位探索图标（选中）
├── profile.png       # 学生画像图标（未选中）
├── profile-active.png # 学生画像图标（选中）
├── career.png        # 职业规划图标（未选中）
├── career-active.png # 职业规划图标（选中）
├── user.png          # 个人中心图标（未选中）
└── user-active.png  # 个人中心图标（选中）
```

## 图标获取方式

1. 可以从 iconfont、iconpark 等图标库下载
2. 或者使用在线图标生成工具
3. 也可以暂时注释掉 pages.json 中的 tabBar 配置
