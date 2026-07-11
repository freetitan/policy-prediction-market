# 🚀 快速部署指南

## ⚡ 5分钟部署清单

### 步骤 1: 执行数据库迁移 (2分钟)

1. 打开 Supabase Dashboard
2. 进入项目：https://supabase.com/dashboard/project/peqmnkzptnrhfxqbpecq
3. 点击左侧 **SQL Editor**
4. 点击 **New query**
5. 复制粘贴以下文件内容：`supabase/migrations/006_add_notifications.sql`
6. 点击 **Run** 执行
7. 确认输出显示 "Success. No rows returned"

**验证：**
```sql
-- 检查表是否创建成功
SELECT COUNT(*) FROM notifications;

-- 检查触发器
SELECT tgname FROM pg_trigger 
WHERE tgname LIKE '%notify%';

-- 应该看到3个触发器：
-- - trigger_notify_market_settled
-- - trigger_notify_comment_reply  
-- - trigger_notify_comment_like
```

### 步骤 2: Vercel 自动部署 (3分钟)

代码已推送到 GitHub，Vercel 会自动开始部署。

1. 访问：https://vercel.com/dashboard
2. 找到项目：**policy-prediction-market**
3. 查看部署状态（应该显示 "Building..."）
4. 等待 2-3 分钟直到显示 "Ready"
5. 点击 **Visit** 访问新版本

**预期构建时间：** 2-3 分钟

### 步骤 3: 功能验证 (1分钟)

✅ **搜索功能**
1. 访问首页
2. 在搜索框输入"GDP"
3. 应该看到过滤后的结果

✅ **通知功能**
1. 登录账号
2. 导航栏右上角应该看到 🔔 图标
3. 点击查看通知中心

✅ **投注确认**
1. 进入任意市场
2. 填写投注表单
3. 点击"确认投注"
4. 应该弹出确认对话框

---

## 📋 完整验证清单

### 数据库验证

```sql
-- ✅ 1. 检查表结构
\d notifications

-- ✅ 2. 检查索引
SELECT indexname FROM pg_indexes 
WHERE tablename = 'notifications';

-- ✅ 3. 检查RLS策略
SELECT policyname FROM pg_policies 
WHERE tablename = 'notifications';

-- ✅ 4. 测试创建通知
SELECT create_notification(
  (SELECT id FROM profiles LIMIT 1),
  'system',
  '测试通知',
  '这是一条测试消息',
  '/'
);

-- ✅ 5. 查看刚创建的通知
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 1;

-- ✅ 6. 清理测试通知
DELETE FROM notifications 
WHERE title = '测试通知';
```

### 前端验证

#### 搜索筛选
- [ ] 搜索框可见
- [ ] 输入关键词正确过滤
- [ ] 高级筛选按钮可点击
- [ ] 状态筛选正常工作
- [ ] 排序切换正确
- [ ] 筛选标签显示和删除正常
- [ ] 重置按钮工作
- [ ] 结果数量统计正确

#### 通知系统
- [ ] 铃铛图标显示在导航栏
- [ ] 未读数量徽章正确（初始为0）
- [ ] 点击打开通知列表
- [ ] "暂无通知"提示显示
- [ ] 等待自动通知（需测试）

#### 投注确认
- [ ] 填写投注表单
- [ ] 点击确认按钮
- [ ] 弹窗正确显示
- [ ] 投注信息正确
- [ ] 风险评估显示
- [ ] 取消按钮关闭弹窗
- [ ] 确认按钮提交投注
- [ ] Toast 提示显示

---

## 🧪 测试场景

### 场景 1: 搜索功能完整测试

```
1. 访问首页
2. 在搜索框输入"经济"
   ✅ 应显示所有包含"经济"的市场
3. 点击"高级筛选"
4. 选择状态 = "进行中"
   ✅ 只显示未截止的市场
5. 选择排序 = "即将截止"
   ✅ 市场按截止时间升序排列
6. 点击某个筛选标签的 X
   ✅ 该筛选条件被移除
7. 点击"重置"
   ✅ 所有筛选清空，显示全部市场
```

### 场景 2: 通知系统完整测试

**需要两个账号：**
- 账号A: 主测试账号
- 账号B: 辅助账号

```
1. 账号A登录
2. 进入某个市场详情页
3. 发表一条评论
4. 账号B登录
5. 在同一市场回复账号A的评论
6. 切换回账号A
   ✅ 铃铛应显示 "1" 未读
7. 点击铃铛
   ✅ 看到"收到新回复"通知
8. 点击通知
   ✅ 跳转到市场详情页
   ✅ 通知标记为已读
9. 返回通知中心
   ✅ 未读数变为 0
```

### 场景 3: 投注确认完整测试

```
1. 登录账号（假设余额1000积分）
2. 进入一个活跃市场
3. 选择"是"
4. 输入100积分
5. 点击"确认投注"
   ✅ 弹出确认对话框
6. 检查对话框内容：
   - ✅ 标题显示"确认投注"
   - ✅ 市场标题正确
   - ✅ 方向显示"会发生"（绿色）
   - ✅ 金额显示"100积分"
   - ✅ 概率显示正确
   - ✅ 预期收益计算正确
   - ✅ 风险评估："低风险"（10%余额）
   - ✅ 重要提示列表显示
7. 点击"取消"
   ✅ 对话框关闭，未提交
8. 再次点击"确认投注"
9. 点击"确认投注"（对话框内）
   ✅ 显示"处理中..."
   ✅ Toast显示"投注成功"
   ✅ 对话框关闭
   ✅ 表单重置
   ✅ 余额更新为900
   ✅ 页面刷新显示新投注
```

---

## 🔧 故障排查

### 问题 1: 通知铃铛不显示

**可能原因：**
- 用户未登录
- 组件加载失败
- 数据库迁移未执行

**解决方案：**
```bash
# 1. 检查是否登录
# 2. 检查浏览器控制台错误
# 3. 验证数据库迁移：
SELECT * FROM notifications LIMIT 1;
```

### 问题 2: 通知不自动推送

**可能原因：**
- Realtime 未启用
- RLS 策略问题
- WebSocket 连接失败

**解决方案：**
1. 检查 Supabase Realtime 是否启用
2. 在 Settings → API → Realtime 确认已开启
3. 检查浏览器控制台 WebSocket 连接状态

### 问题 3: 搜索结果不正确

**可能原因：**
- 客户端状态问题
- 缓存问题

**解决方案：**
```bash
# 清除浏览器缓存
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

# 或打开无痕模式测试
```

### 问题 4: 投注确认不弹出

**可能原因：**
- 表单验证失败
- 状态管理问题

**解决方案：**
1. 检查是否选择了方向
2. 检查是否输入了金额
3. 查看浏览器控制台错误

---

## 📊 性能监控

### 关键指标

```javascript
// 在浏览器控制台运行

// 1. 首屏加载时间
performance.timing.loadEventEnd - performance.timing.navigationStart

// 2. 搜索响应时间（在搜索后）
// 应该 < 500ms

// 3. 通知加载时间
// 点击铃铛后应该 < 1s

// 4. 弹窗打开时间
// 应该 < 200ms
```

### Lighthouse 测试

```bash
# 使用 Chrome DevTools
1. F12 打开开发者工具
2. 切换到 Lighthouse 标签
3. 选择 Categories: Performance, Accessibility
4. 点击 Analyze page load
5. 目标分数：
   - Performance: > 90
   - Accessibility: > 95
```

---

## 🎉 部署成功标志

当你看到以下全部 ✅ 时，部署成功：

- ✅ Vercel 部署状态显示 "Ready"
- ✅ 数据库迁移成功执行
- ✅ 搜索框在首页显示
- ✅ 通知铃铛在导航栏显示
- ✅ 投注确认弹窗正常工作
- ✅ 无控制台错误
- ✅ 所有测试场景通过

---

## 📞 需要帮助？

如果遇到问题：

1. **检查文档**
   - [IMPROVEMENTS_PHASE1.md](./IMPROVEMENTS_PHASE1.md)
   - [平台介绍.md](./平台介绍.md)

2. **查看日志**
   - Vercel 部署日志
   - 浏览器控制台
   - Supabase 日志

3. **回滚方案**
   ```bash
   # 如果需要回滚到上一版本
   git revert HEAD
   git push origin main
   ```

4. **联系支持**
   - GitHub Issues
   - 项目管理员

---

**祝部署顺利！** 🎊

*最后更新：2026年7月11日*
