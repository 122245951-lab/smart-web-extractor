# Smart Web Extractor — Figma 交互设计优化规范

> 本文档为 Figma 直接导入而设计，详细定义了每个组件的设计 Token、布局参数与交互行为。

---

## 1. 整体布局规格

| 参数 | 值 |
|------|-----|
| 画板尺寸 | 1280 × 760 px |
| 背景色 | #14142B (深色模式背景), #F8F9FC (工作区背景) |
| 圆角 | 20px (最外层容器) |
| 阴影 | 0 30px 80px rgba(0,0,0,0.6) |

**布局结构 (从左到右):**
- 浏览器模拟区 (flex: 1) | 悬浮触发球 (44px) | AI 面板 (420px)

---

## 2. Design Tokens

### 2.1 色彩

```
// 主色
Primary:        #4F46E5  →  640px.indigo.600
Primary-Light:  #6366F1  →  indigo-500
Primary-Dark:   #4338CA  →  indigo-700
Primary-Bg:     #EEF2FF  →  indigo-50

// 中性色 (从浅到深)
Surface:        #F8FAFC  →  slate-50
Card-Bg:        #FFFFFF
Border-Light:   #F1F5F9  →  slate-100
Border:         #E2E8F0  →  slate-200
Text-Secondary: #94A3B8  →  slate-400
Text-Body:      #475569  →  slate-600
Text-Headline:  #1E293B  →  slate-800
Text-Heading:   #0F172A  →  slate-900

// 语义色
Success:        #22C55E  →  green-500
Warning:        #F59E0B  →  amber-500
Error:          #EF4444  →  red-500
Secure-Badge:   #16A34A  →  green-600

// AD 过滤栏
Ad-Bar-Bg:      linear-gradient(135deg, #EEF2FF, #E0E7FF)
Ad-Bar-Text:    #3730A3
Ad-Highlight-Border: #EF4444
Ad-Highlight-Bg:     #FEF2F2
```

### 2.2 字体

```
Font-Family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
Letter-Spacing: -0.01em ~ 0.02em  (视字号微调)

// Type Ramp
H1:     28px / 800 / 1.25  → 页面标题
H2:     14px / 700 / 1.3   → 面板分组标题
H3:     13px / 700 / 1.4   → 卡片标题
Body:   15px / 400 / 1.75  → 正文阅读
Caption: 12px / 500 / 1.5  → 辅助标注
Small:  10px / 600 / 1.4   → 标签/脚注
Micro:   9px / 700 / 1.2   → Badge / 极简标注
```

### 2.3 间距

```
4px / 8px / 12px / 16px / 20px / 24px / 32px / 40px
网格基准: 4px
```

### 2.4 圆角

```
XS:  4px   → Badge / 最小标签
SM:  6px   → 小控件
MD:  8px   → 按钮/输入框
LG:  12px  → 卡片/面板
XL:  16px  → 大卡片
2XL: 20px  → 最外层容器/URL 栏
```

### 2.5 阴影

```
Card:      0 1px 3px rgba(0,0,0,0.06)
Dropdown:  0 4px 12px rgba(79,70,229,0.3)
Panel:     -8px 0 30px rgba(0,0,0,0.04)
Trigger:   -4px 0 20px rgba(79,70,229,0.3)
Modal:     0 30px 80px rgba(0,0,0,0.6)
```

---

## 3. 组件设计规格

### 3.1 Titlebar (浏览器顶栏)

| 属性 | 值 |
|------|-----|
| 高度 | 48px |
| 背景 | rgba(255,255,255,0.85) + backdrop-filter blur(20px) |
| 内边距 | 12px 20px |
| 底部边框 | 1px solid rgba(0,0,0,0.04) |

**子组件:**
- **Traffic Lights**: 3个 12px 圆点, gap 8px, 色值 #FF5F57 / #FEBC2E / #28C840, hover scale(1.2)
- **导航箭头**: 字体图标 16px, 灰色 #8E8EA0, 禁用态 opacity 0.3
- **Tab 切换组**: 背景 rgba(0,0,0,0.03), padding 3px, border-radius 10px, gap 2px
  - Tab 按钮: padding 6px 14px, font 12px/500, border-radius 8px
  - Active 态: bg #fff, color #4F46E5, font-weight 600, box-shadow
- **URL 地址栏**: 最大宽 420px, 背景 rgba(0,0,0,0.04), border-radius 20px, padding 6px 16px
  - Focus 态: border-color #4F46E5 + 3px 光圈
  
### 3.2 AD Filter Bar

| 属性 | 值 |
|------|-----|
| 高度 | 40px |
| 背景 | gradient(135deg, #EEF2FF, #E0E7FF) |
| 内边距 | 8px 20px |

- **Toggle Group**: bg #fff, padding 2px, border-radius 8px, gap 4px
  - 按钮: padding 5px 12px, font 11px/500
  - Active: bg #4F46E5, color #fff, box-shadow

### 3.3 Edge Trigger (悬浮触发球)

| 属性 | 值 |
|------|-----|
| 定位 | absolute, right 0, top 50%, translateY(-50%) |
| 尺寸 | 44 × 120px (hover: 52 × 120px) |
| 背景 | gradient(180deg, #4F46E5, #6366F1) |
| 圆角 | 12px 0 0 12px |
| 阴影 | -4px 0 20px rgba(79,70,229,0.3) |
| 动画 | cubic-bezier(0.34, 1.56, 0.64, 1), 0.3s |

### 3.4 AI Panel (右侧抽屉)

| 属性 | 值 |
|------|-----|
| 宽度 | 420px |
| 背景 | #FFFFFF |
| 左边框 | 1px solid rgba(0,0,0,0.04) |
| 阴影 | -8px 0 30px rgba(0,0,0,0.04) |
| 入场动画 | cubic-bezier(0.16, 1, 0.3, 1), 0.35s, 从右滑入 |

**子组件:**
- **Panel Header**: padding 16px 20px, border-bottom 1px solid #F1F5F9
  - Brand Icon: 30×30, gradient(135deg, #4F46E5, #6366F1), border-radius 8px
  - Title: 13px/700/#1E293B, Subtitle: 10px/#94A3B8
- **Panel Tabs**: padding 8px 16px, gap 4px, border-bottom
  - Active 态: bg #EEF2FF, color #4F46E5, 底部 2px 滑动指示器
- **Summary Card**: bg #F8FAFC, border-radius 12px, padding 16px, border 1px solid #F1F5F9
- **Template Grid**: 2列网格, gap 6px
  - 按钮: bg #F8FAFC, border 1px solid #E2E8F0, border-radius 8px, padding 8px 10px
  - Active: border #4F46E5, bg #EEF2FF, box-shadow 0 0 0 1px
- **Chat Input**: padding 12px 20px, border-top 1px solid #F1F5F9
  - Input wrap: bg #F8FAFC, border-radius 12px, gap 8px
  - Focus: border-color #4F46E5 + 光圈

---

## 4. 交互动画规格

### 4.1 面板滑入
```
Easing: cubic-bezier(0.16, 1, 0.3, 1)  // 弹簧风格缓出
Duration: 350ms
Property: transform translateX
State: 100% → 0%
```

### 4.2 按钮反馈
```
Hover: translateY(-1px), box-shadow 增强
Active: translateY(0)
Transition: all 0.2s
```

### 4.3 触发球展开
```
Easing: cubic-bezier(0.34, 1.56, 0.64, 1)  // 弹性
Duration: 300ms
Property: width 44px → 52px
```

### 4.4 Tab 指示器滑动
```
Position: absolute bottom -8px, left 50%, transform translateX(-50%)
Width: 20px, height: 2px, bg: #4F46E5
Transition: all 0.2s
```

---

## 5. Figma 构建步骤

### 5.1 创建文件
1. 新建 Figma Design 文件 (1920×1080 或自定义 1280×760)
2. 设置网格: 4px 网格 (Grid style: Columns, 12列, gutter 16px)

### 5.2 建立 Design Tokens
1. **Local Variables → Color**: 创建所有色彩 token
2. **Local Variables → Number**: 创建 spacing / radius token
3. **Text Styles**: 创建 Type Ramp (6 个层级)
4. **Effect Styles**: 创建 5 种阴影效果

### 5.3 构建组件
1. **Titlebar 组件**: Frame (100% × 48px) → TrafficLights + NavArrows + TabBar + URLBar
2. **AdBar 组件**: Frame (100% × 40px) → Toggle group
3. **EdgeTrigger 组件**: Frame (44 × 120px) → Icon + Label + Arrow
4. **PanelHeader 组件**: Frame (420 × 56px) → Brand + CloseBtn
5. **PanelTabs 组件**: Frame (420 × 40px) → 4 tab buttons
6. **SummaryCard 组件**: Frame (380 × auto) → Content auto-layout
7. **ChatInput 组件**: Frame (420 × 56px) → Input + SendBtn
8. **PrimaryButton 组件**: Auto-layout → gradient fill + shadow
9. **SecondaryButton 组件**: Auto-layout → border + bg

### 5.4 组合页面
1. 最外层 Frame: 1280 × 760, rounded 20px, bg #14142B
2. Browser Zone: Auto-layout, flex: 1
3. 插入 Titlebar → AdBar → Viewport → StatusBar
4. EdgeTrigger: 绝对定位在 browser-zone 右侧边缘
5. AI Panel: 420w × 760h, 在右侧
6. PanelHeader → PanelTabs → PanelContent → ChatInput

---

## 6. 响应式适配建议

| 断点 | Browser Zone | AI Panel |
|------|-------------|----------|
| > 1200px | flex: 1 (全宽) | 420px 固定 |
| 900-1200px | flex: 1 | 380px 固定 |
| < 900px | 100% 全宽 | 100% 全宽 (覆盖模式) |

---

## 7. Figma 文件参考

如需直接生成 Figma 文件，请使用以下命令：
```
/figma-create-new-file design "Smart Web Extractor — 优化交互设计"
```

然后按上述 5.3-5.4 步骤逐一构建各组件并组合为完整页面。
