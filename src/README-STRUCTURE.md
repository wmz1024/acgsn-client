# 项目结构说明

## 文件组织

```
src/
├── components/
│   ├── ui/                    # shadcn/ui基础组件
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── dialog.jsx
│   │   ├── input.jsx
│   │   └── label.jsx
│   ├── shared/                # 共享组件
│   │   ├── StepIndicator.jsx  # 步骤指示器
│   │   └── CoreDownloadDialog.jsx # 核心下载对话框
│   ├── OOBE/                  # 首次运行体验
│   │   ├── OOBEWizard.jsx     # OOBE主向导
│   │   └── Steps/             # OOBE步骤组件
│   │       ├── JavaCheck.jsx      # Java环境检查
│   │       ├── DirectorySetup.jsx # 目录创建
│   │       ├── EulaAgreement.jsx  # EULA协议
│   │       └── SetupComplete.jsx  # 设置完成
│   ├── Gaming/                # 游戏平台界面
│   │   └── GamingPlatform.jsx     # 主界面(含核心检测)
│   └── Settings/              # 设置页面模块
│       ├── SettingsPage.jsx       # 设置主页面
│       ├── SettingsSidebar.jsx    # 设置侧边栏
│       ├── PersonalizationSettings.jsx # 个性化设置
│       ├── ComponentSettings.jsx  # 组件管理设置
│       └── AccountSettings.jsx    # 账户设置
├── hooks/                     # 自定义React Hooks
│   ├── useOOBE.js            # OOBE状态管理
│   ├── useSettings.js        # 设置状态管理
│   └── useCore.js            # 核心文件管理
├── utils/                     # 工具函数
│   └── storage.js            # 本地存储工具
├── lib/                       # 第三方库配置
│   └── utils.js              # shadcn/ui工具函数
├── App.jsx                    # 应用路由组件
├── main.jsx                   # 应用入口
└── index.css                  # 全局样式
```

## 组件说明

### App.jsx
- 应用主路由组件
- 检查OOBE状态并切换到对应界面
- 管理主界面和设置页面的导航
- 简洁的加载状态处理

### OOBE模块
- **OOBEWizard**: 统一的向导组件，管理步骤流转
- **Steps/**: 各个设置步骤的独立组件
- **useOOBE**: 所有OOBE相关的状态和逻辑

### Gaming模块
- **GamingPlatform**: 游戏启动器主界面
- 集成核心状态检测和下载功能
- 动态显示游戏启动状态
- 自动弹出核心下载对话框

### Settings模块
- **SettingsPage**: 设置主页面，管理侧边栏和内容区
- **SettingsSidebar**: 左侧导航栏，包含个性化、组件管理和账户选项
- **PersonalizationSettings**: 个性化设置页面（背景、主题等）
- **ComponentSettings**: 组件管理页面（核心文件下载等）
- **AccountSettings**: 账户设置页面（用户信息、安全等）
- **useSettings**: 设置相关的状态管理

### 核心管理模块（新增）
- **useCore**: 核心文件状态管理hook
- **CoreDownloadDialog**: 核心下载对话框组件
- **核心检测**: 自动检测核心文件存在性
- **进度追踪**: 实时显示下载进度
- **错误处理**: 完善的错误提示和重试机制

### 工具模块
- **storage**: 统一的本地存储接口
- **shared**: 可复用的UI组件

## 页面导航

应用现在支持以下页面：

1. **OOBE向导** (`OOBEWizard`)
   - 首次运行时显示
   - 完成后跳转到主界面

2. **游戏主界面** (`GamingPlatform`)
   - 默认页面
   - 自动检测核心状态
   - 点击设置按钮跳转到设置页面
   - 核心未安装时自动弹出下载对话框

3. **设置页面** (`SettingsPage`)
   - 独立的全屏设置界面
   - 左侧导航栏，右侧内容区
   - 支持多个设置分类

## 核心管理功能

### 核心检测
- **自动检测**: 应用启动时自动检测核心文件
- **状态显示**: 主界面实时显示核心状态
- **智能提示**: 未安装时显示警告图标和提示文字

### 核心下载
- **下载源**: https://static.v0.net.cn/cmcl.jar
- **存储位置**: Documents/acgsnetwork/core/cmcl.jar
- **进度跟踪**: 实时显示下载进度和传输速度
- **错误处理**: 网络错误时提供重试选项

### 用户体验
- **主界面集成**: 核心状态直接显示在游戏启动卡片中
- **弹窗下载**: 核心缺失时自动弹出下载对话框
- **设置管理**: 可在设置页面的组件管理中重新下载
- **状态同步**: 下载完成后自动更新所有相关界面

## 设置模块特色

### 侧边栏导航
- **个性化**: 背景图片、主题、显示效果
- **组件管理**: 核心文件、Mod加载器、资源包管理
- **账户**: 用户信息、安全设置、隐私选项

### 个性化设置
- 背景图片URL自定义
- 实时预览功能
- 重置为默认选项
- 主题切换（即将推出）
- 显示效果开关（即将推出）

### 组件管理设置（新增）
- **核心状态**: 显示核心文件安装状态和详细信息
- **核心下载**: 支持下载和重新下载核心文件
- **存储信息**: 显示组件文件占用的存储空间
- **其他组件**: 预留Mod加载器、资源包等功能
- **实时刷新**: 支持手动刷新核心状态

### 账户设置
- 用户信息编辑
- 密码和安全设置
- 账户操作（退出、删除等）
- 隐私控制选项

## Tauri后端功能

### 核心管理API
```rust
// 检查核心文件是否存在
check_core_exists() -> CoreStatus

// 下载核心文件（带进度事件）
download_core(window: Window) -> String

// 获取核心文件路径
get_core_path() -> String
```

### 数据结构
```rust
// 核心状态
struct CoreStatus {
    exists: bool,
    path: Option<String>,
    size: Option<u64>,
}

// 下载进度
struct DownloadProgress {
    downloaded: u64,
    total: Option<u64>,
    percentage: f64,
}
```

## 开发指南

### 添加新的OOBE步骤
1. 在 `src/components/OOBE/Steps/` 创建新组件
2. 在 `useOOBE.js` 中添加相应状态和逻辑
3. 在 `OOBEWizard.jsx` 中添加路由

### 添加新的设置分类
1. 在 `src/components/Settings/` 创建新的设置组件
2. 在 `SettingsSidebar.jsx` 中添加菜单项
3. 在 `SettingsPage.jsx` 中添加路由
4. 根据需要在对应hook中添加状态

### 添加新的组件管理功能
1. 在 `useCore.js` 中添加新的状态和方法
2. 在 `ComponentSettings.jsx` 中添加UI界面
3. 在Tauri后端添加对应的API接口
4. 更新相关的状态检测逻辑

### 添加新的设置选项
1. 在对应的设置组件中添加UI
2. 在相关hook中添加状态管理
3. 在 `storage.js` 中添加持久化逻辑

### 添加新的主界面功能
1. 在 `src/components/Gaming/` 创建新组件
2. 在 `GamingPlatform.jsx` 中集成
3. 根据需要创建对应的hooks

## 状态管理

项目使用React Hooks进行状态管理：
- 每个功能模块有独立的自定义Hook
- 通过props传递数据，保持组件纯净
- 使用localStorage持久化用户设置
- App.jsx管理页面级路由状态
- useCore hook管理核心文件相关状态

## 新增功能亮点

✨ **智能核心检测**: 应用启动时自动检测核心文件状态
✨ **无缝下载体验**: 缺失核心时自动弹出下载对话框
✨ **实时进度追踪**: 下载过程中实时显示进度和传输信息
✨ **双重管理入口**: 主界面和设置页面都可以管理核心
✨ **状态同步**: 所有相关界面实时同步核心状态
✨ **错误恢复**: 完善的错误处理和重试机制
✨ **存储管理**: 显示组件文件占用空间，支持清理功能
✨ **扩展性设计**: 预留其他游戏组件管理功能 