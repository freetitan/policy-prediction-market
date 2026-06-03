# Metaculus风格高级功能

本文档说明了新增的Metaculus风格预测市场高级功能。

## 🎯 新增功能

### 1. 社区聚合预测 (Community Prediction)

**功能描述：**
- 实时显示市场的概率趋势图表
- 基于所有用户投注的加权平均
- 展示独立预测者数量和总投注量

**技术实现：**
- 新增 `prediction_snapshots` 表记录历史快照
- 每次下注后自动触发快照更新
- 使用 Recharts 绘制趋势图

**使用位置：**
- 市场详情页 (`/market/[id]`)

---

### 2. 用户信誉系统 (Reputation System)

**功能描述：**
- 5个等级：新手 → 进阶 → 高级 → 专家 → 超级预测者
- 基于预测分数(0-100)和预测次数
- 计算Brier分数评估预测准确度

**等级要求：**
| 等级 | 预测分数 | 最少预测数 |
|------|----------|-----------|
| 新手 | <45 | - |
| 进阶 | 45+ | 10+ |
| 高级 | 60+ | 20+ |
| 专家 | 75+ | 50+ |
| 超级预测者 | 90+ | 100+ |

**Brier分数：**
- 范围：0-1，越低越好
- 公式：(预测概率 - 实际结果)²
- 用于客观评估预测质量

**技术实现：**
- 扩展 `profiles` 表新增信誉字段
- 新增 `prediction_records` 表记录详细预测
- 函数 `update_user_reputation()` 自动计算分数

**使用位置：**
- 个人中心页显示详细统计卡片
- 排行榜显示等级徽章
- 用户头像旁显示等级图标

---

### 3. 预测历史追踪 (Prediction History)

**功能描述：**
- 记录市场概率随时间的变化
- 可视化市场情绪演变
- 趋势指示器（上升/下降/平稳）

**技术实现：**
- `prediction_snapshots` 表存储时间序列数据
- 实时订阅(Supabase Realtime)自动更新
- 时间轴图表展示

**使用位置：**
- 市场详情页的趋势图表组件

---

### 4. 增强的排行榜 (Enhanced Leaderboard)

**功能描述：**
- 按预测分数排名（不再只看积分）
- 显示准确率、总预测数、等级
- 前三名特殊高亮

**技术实现：**
- 新视图 `user_statistics` 聚合统计
- 自动计算排名和表现指标

**使用位置：**
- 排行榜页 (`/leaderboard`)

---

## 📊 数据库变更

### 新增表

1. **prediction_snapshots** - 预测快照
```sql
- id: UUID
- market_id: UUID (外键)
- yes_probability: DECIMAL(5,4)
- total_volume: INTEGER
- unique_predictors: INTEGER
- created_at: TIMESTAMPTZ
```

2. **prediction_records** - 预测记录
```sql
- id: UUID
- user_id: UUID (外键)
- market_id: UUID (外键)
- predicted_outcome: BOOLEAN
- confidence: DECIMAL(5,4)
- points_wagered: INTEGER
- points_won: INTEGER
- is_correct: BOOLEAN
- brier_score: DECIMAL(6,4)
- created_at: TIMESTAMPTZ
- resolved_at: TIMESTAMPTZ
```

### 扩展表

**profiles** 新增字段：
- `prediction_score`: DECIMAL(6,2) - 预测分数
- `total_predictions`: INTEGER - 总预测数
- `correct_predictions`: INTEGER - 正确预测数
- `accuracy_rate`: DECIMAL(5,4) - 准确率
- `rank_tier`: TEXT - 等级层级

### 新增视图

1. **market_statistics** - 市场统计
2. **user_statistics** - 用户统计

### 新增函数

1. `update_prediction_snapshot(market_id)` - 更新预测快照
2. `calculate_brier_score(probability, outcome)` - 计算Brier分数
3. `update_user_reputation(user_id)` - 更新用户信誉

---

## 🚀 部署步骤

### 1. 执行数据库迁移

在Supabase Dashboard的SQL编辑器中执行：

```bash
supabase/migrations/004_add_advanced_features.sql
```

或使用Supabase CLI：

```bash
supabase db push
```

### 2. 初始化现有数据

迁移脚本会自动：
- 为现有市场创建初始快照
- 初始化用户信誉字段（默认值）

### 3. 部署前端代码

```bash
git add .
git commit -m "feat: 添加Metaculus风格高级功能"
git push
```

---

## 📁 新增文件

### 组件
- `components/prediction-chart.tsx` - 预测趋势图表
- `components/reputation-badge.tsx` - 用户等级徽章
- `components/user-stats-card.tsx` - 用户统计卡片
- `components/enhanced-leaderboard-table.tsx` - 增强排行榜

### 迁移
- `supabase/migrations/004_add_advanced_features.sql`

### 类型
- 更新 `lib/types.ts` 新增接口

---

## 🎨 UI/UX 改进

1. **预测图表**
   - 使用 Recharts 库
   - 响应式设计
   - 悬停显示详细信息
   - 50%基准线

2. **等级徽章**
   - 5种颜色方案
   - 对应图标
   - Tooltip显示详情

3. **统计卡片**
   - 进度条显示升级进度
   - 核心指标一目了然
   - 升级提示

---

## 🔄 未来优化方向

1. **预测校准**
   - 添加校准曲线图
   - 显示过度自信/不足

2. **历史回测**
   - 用户可查看历史预测表现
   - 按类别分析准确率

3. **社交功能**
   - 关注其他预测者
   - 查看高手的预测

4. **高级分析**
   - 市场相关性分析
   - 预测者风格画像

---

## 📝 注意事项

1. **性能优化**
   - 快照表会随时间增长，建议定期归档
   - 视图查询可能需要索引优化

2. **数据完整性**
   - Brier分数只在市场结算后计算
   - 信誉分数需要手动触发更新（或定时任务）

3. **权限控制**
   - 所有用户可读统计数据
   - 只能修改自己的预测记录

---

## 🐛 已知问题

目前没有已知问题。

---

## 📮 反馈与支持

如有问题或建议，请在GitHub提交Issue。
