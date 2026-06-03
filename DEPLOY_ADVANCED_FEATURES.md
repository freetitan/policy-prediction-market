# 🚀 Metaculus风格功能部署指南

## 快速部署步骤

### 第一步：执行数据库迁移

1. 打开 Supabase Dashboard
2. 进入你的项目
3. 点击 **SQL Editor**
4. 创建新查询
5. 复制 `supabase/migrations/004_add_advanced_features.sql` 的完整内容
6. 粘贴并点击 **Run**

✅ 成功后会看到 "Success. No rows returned"

### 第二步：推送代码到服务器

```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "feat: 实现Metaculus风格高级功能

- 添加社区聚合预测和趋势图表
- 实现用户信誉系统(5等级)
- 添加预测历史追踪
- 增强排行榜功能
- 新增Brier分数计算"

# 推送到远程
git push origin main
```

### 第三步：验证部署

部署完成后，访问以下页面验证功能：

1. **市场详情页** (`/market/[id]`)
   - ✅ 查看预测趋势图表
   - ✅ 确认实时更新
   
2. **个人中心** (`/profile`)
   - ✅ 查看用户统计卡片
   - ✅ 确认等级徽章显示
   
3. **排行榜** (`/leaderboard`)
   - ✅ 查看增强的排行榜
   - ✅ 确认预测分数显示

---

## 🎯 新功能详细说明

### 1. 社区预测趋势图 📈

**位置：** 市场详情页

**特性：**
- 实时概率变化图表
- 显示独立预测者数量
- 趋势指示器（↑↓→）
- 悬停查看历史详情

### 2. 用户信誉系统 ⭐

**等级体系：**
- 🌟 新手 (0-44分)
- ⚡ 进阶 (45+分, 10+预测)
- 🏆 高级 (60+分, 20+预测)  
- 🥇 专家 (75+分, 50+预测)
- ✨ 超级预测者 (90+分, 100+预测)

**计算方式：**
- 预测分数 = 准确率×50 + (1-Brier分数)×50
- 自动根据历史表现更新

### 3. 预测历史追踪 📊

**功能：**
- 记录每次下注后的市场状态
- 绘制概率时间序列图
- 实时更新（WebSocket）

### 4. 增强排行榜 🏅

**改进：**
- 按预测分数排名（非仅积分）
- 显示等级、准确率、预测数
- 前三名金银铜牌标识

---

## 📦 新增文件清单

### 数据库
- ✅ `supabase/migrations/004_add_advanced_features.sql`

### 组件
- ✅ `components/prediction-chart.tsx`
- ✅ `components/reputation-badge.tsx`
- ✅ `components/user-stats-card.tsx`
- ✅ `components/enhanced-leaderboard-table.tsx`

### 页面更新
- ✅ `app/market/[id]/page.tsx`
- ✅ `app/profile/page.tsx`
- ✅ `app/leaderboard/page.tsx`

### 类型定义
- ✅ `lib/types.ts` (扩展)

### 文档
- ✅ `METACULUS_FEATURES.md`
- ✅ `DEPLOY_ADVANCED_FEATURES.md`

---

## 🔧 故障排查

### 问题1：图表不显示

**可能原因：**
- 没有历史快照数据

**解决方法：**
1. 进行一次投注触发快照创建
2. 或在SQL编辑器执行：
```sql
SELECT update_prediction_snapshot(market_id) 
FROM markets LIMIT 10;
```

### 问题2：等级显示为"新手"

**原因：**
- 信誉分数需要有已结算的市场

**说明：**
- 这是正常的，需要管理员结算市场后才会计算
- 可以手动运行：
```sql
SELECT update_user_reputation(user_id) 
FROM profiles;
```

### 问题3：趋势图加载慢

**优化：**
- 限制快照查询数量（已默认100条）
- 添加数据库索引（迁移中已包含）

---

## 📊 数据库表概览

### 新表

1. **prediction_snapshots** (预测快照)
   - 存储市场概率历史
   - 自动触发更新

2. **prediction_records** (预测记录)
   - 详细预测信息
   - 用于计算Brier分数

### 扩展表

**profiles** 新增：
- prediction_score (预测分数)
- total_predictions (总预测数)
- correct_predictions (正确数)
- accuracy_rate (准确率)
- rank_tier (等级)

### 新视图

1. **market_statistics** - 市场实时统计
2. **user_statistics** - 用户综合统计

---

## 🎨 UI截图说明

### 预测趋势图
- 显示概率变化曲线
- 50%基准线
- 时间轴
- 实时数据点

### 等级徽章
- 5种颜色渐变
- 对应图标
- 悬停显示详情

### 用户统计卡
- 预测分数进度
- 准确率展示
- 升级进度条

---

## ✅ 部署检查清单

- [ ] 数据库迁移执行成功
- [ ] 代码推送到GitHub
- [ ] Vercel/部署平台自动构建完成
- [ ] 访问生产环境验证功能
- [ ] 市场详情页图表正常显示
- [ ] 个人中心统计卡正常
- [ ] 排行榜显示等级徽章
- [ ] 测试进行一次投注
- [ ] 确认快照自动创建

---

## 🎉 完成！

所有Metaculus风格功能已成功部署！

**下一步建议：**
1. 邀请用户测试新功能
2. 收集反馈
3. 监控性能指标
4. 考虑添加更多分析功能

需要帮助？查看 `METACULUS_FEATURES.md` 了解详细技术文档。
