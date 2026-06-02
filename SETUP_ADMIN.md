# 管理员后台设置指南

## 🎉 管理员后台已部署完成！

管理员后台系统已成功创建并部署到 Vercel。现在你可以按照以下步骤开始使用。

## 📋 快速开始（3个步骤）

### 步骤 1: 添加自己为管理员

1. 访问 Supabase Dashboard: https://supabase.com/dashboard
2. 选择你的项目：**peqmnkzptnrhfxqbpecq**
3. 点击左侧菜单 **"SQL Editor"**
4. 点击 **"New query"**
5. 复制以下 SQL 代码，**替换邮箱地址**为你的实际邮箱：

```sql
-- 添加管理员（替换邮箱地址！）
INSERT INTO admins (user_id, username, role)
SELECT 
    id,
    COALESCE(display_name, 'Admin'),
    'super_admin'
FROM profiles
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- 验证是否添加成功
SELECT 
    a.id,
    a.username,
    a.role,
    a.active,
    p.email,
    p.display_name
FROM admins a
JOIN profiles p ON a.user_id = p.id
WHERE p.email = 'your-email@example.com';
```

6. 点击 **"Run"** 执行
7. 查看输出结果，确认添加成功

### 步骤 2: 访问管理员后台

1. 确保你已登录网站账号
2. 访问：**https://policy-prediction-market.vercel.app/admin**
3. 你将看到管理员控制台界面
4. 导航栏会自动显示"管理"链接（带盾牌图标）

### 步骤 3: 开始管理

现在你可以：
- ✅ 查看平台统计数据
- ✅ 创建、编辑、结算市场
- ✅ 添加和管理验证者
- ✅ 查看和管理用户
- ✅ 调整用户积分

## 📚 功能概览

### 🎯 管理员控制台主界面

访问 `/admin` 后，你会看到：

1. **统计面板**（顶部四个卡片）
   - 总市场数
   - 活跃市场数
   - 总用户数
   - 总积分池

2. **三个管理标签页**
   - **市场管理**：管理所有预测市场
   - **验证者管理**：管理市场验证者
   - **用户管理**：管理平台用户

### 📊 市场管理

**创建市场：**
- 点击"创建市场"按钮
- 填写标题、描述、分类、结束日期
- 系统自动记录创建者

**编辑市场：**
- 仅能编辑未结算的市场
- 可修改所有基本信息

**结算市场：**
- 两种结算方式：
  1. **验证者投票**（推荐）：让验证者投票决定结果
  2. **手动结算**：管理员直接点击"结算为是/否"按钮
- 结算后自动分配奖励
- 结算不可撤销，请谨慎操作

### 👥 验证者管理

**添加验证者：**
1. 点击"添加验证者"
2. 输入用户邮箱
3. 点击"搜索"
4. 确认后添加

**管理验证者：**
- 查看声誉分数
- 停用/激活验证者
- 查看验证历史

**声誉系统：**
- 正确验证：+10 分
- 错误验证：-5 分
- 初始声誉：100 分

### 🧑‍💼 用户管理

**查看用户：**
- 搜索功能：按昵称或邮箱
- 排序选项：按积分或注册时间

**调整积分：**
1. 点击"调整积分"
2. 选择操作：增加/减少/设置
3. 输入数量和原因
4. 预览后确认

**查看投注记录：**
- 点击"查看投注"
- 显示所有投注详情
- 包含胜负结果

## 🔧 高级操作

### 使用 SQL 直接操作

项目包含两个 SQL 参考文件：

1. **`add-admin.sql`**
   - 添加管理员的 SQL 脚本
   - 包含验证步骤

2. **`admin-operations.sql`**
   - 所有常用管理操作的 SQL
   - 包含统计查询
   - 包含数据清理脚本

### 查看操作日志

所有管理操作都会记录在 `admin_logs` 表中：

```sql
-- 查看最近的操作
SELECT 
    al.action,
    al.details,
    al.created_at,
    a.username,
    p.email
FROM admin_logs al
JOIN admins a ON al.admin_id = a.id
JOIN profiles p ON a.user_id = p.id
ORDER BY al.created_at DESC
LIMIT 20;
```

## ⚠️ 重要提醒

### 结算市场
- ⚠️ 结算操作不可撤销
- ⚠️ 确保根据实际情况准确结算
- ⚠️ 建议优先使用验证者投票系统

### 调整积分
- ⚠️ 调整积分会影响用户资产
- ⚠️ 建议填写详细原因
- ⚠️ 所有操作都有日志记录

### 账号安全
- 🔒 不要分享管理员密码
- 🔒 定期更换密码
- 🔒 操作前仔细确认

## 📖 完整文档

详细使用说明请查看：**`ADMIN_GUIDE.md`**

包含：
- 详细的功能说明
- 最佳实践建议
- 常见问题解答
- 故障排除指南

## 🚀 项目链接

- **网站**: https://policy-prediction-market.vercel.app
- **管理后台**: https://policy-prediction-market.vercel.app/admin
- **验证者页面**: https://policy-prediction-market.vercel.app/verify
- **GitHub**: https://github.com/freetitan/policy-prediction-market
- **Supabase**: https://supabase.com/dashboard/project/peqmnkzptnrhfxqbpecq

## ❓ 遇到问题？

### 看不到"管理"链接？
1. 确认已添加为管理员
2. 检查 `active` 字段为 `true`
3. 刷新页面或重新登录

### 无法访问管理页面？
1. 确认已登录账号
2. 检查邮箱是否正确
3. 查看浏览器控制台错误

### 功能出现错误？
1. 查看浏览器控制台
2. 检查 Supabase 日志
3. 查阅 `ADMIN_GUIDE.md`

## 🎊 祝贺！

你现在拥有完整的管理员后台系统，可以轻松管理整个预测市场平台！

---

**技术栈**
- Next.js 16 + React 19
- Supabase (PostgreSQL + Auth)
- Tailwind CSS + shadcn/ui
- TypeScript
