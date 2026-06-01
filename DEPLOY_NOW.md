# 🚀 立即部署 - 跟我一起操作

代码已成功推送到 GitHub！现在让我们完成剩余步骤。

---

## ✅ 第一步：代码推送 - 已完成！

✅ 代码已推送到：https://github.com/freetitan/policy-prediction-market

验证：访问上面的链接，你应该能看到所有新文件。

---

## 📋 第二步：Vercel 部署（需要你操作）

### 1. 登录 Vercel

🔗 点击打开：https://vercel.com

- 点击右上角 **"Sign Up"** 或 **"Log In"**
- 选择 **"Continue with GitHub"**
- 授权 Vercel 访问你的 GitHub

### 2. 导入项目

- 点击 **"Add New..."** → **"Project"**
- 在仓库列表中找到 **`policy-prediction-market`**
- 点击 **"Import"**

### 3. 配置环境变量

在 **"Environment Variables"** 部分，点击展开并添加：

**变量 1：**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://placeholder.supabase.co
```

**变量 2：**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: placeholder-key-will-update-later
```

> 💡 这些是占位符，稍后会更新为真实值

### 4. 开始部署

- 点击 **"Deploy"** 按钮
- 等待 2-3 分钟构建完成
- 看到 "Congratulations!" 表示成功

### 5. 记录你的网站地址

部署成功后，你会看到类似这样的 URL：

```
https://policy-prediction-market-xxxxx.vercel.app
```

**📝 请把这个 URL 记下来，后面会用到！**

---

## 🗄️ 第三步：创建 Supabase 数据库（需要你操作）

### 1. 登录 Supabase

🔗 点击打开：https://supabase.com

- 点击 **"Start your project"**
- 选择 **"Sign in with GitHub"**
- 授权 Supabase 访问

### 2. 创建新项目

- 点击 **"New Project"**
- 填写信息：
  - **Name**: `policy-prediction-market`
  - **Database Password**: 设置一个强密码
    - 建议：至少12位，包含大小写字母、数字、符号
    - **⚠️ 重要：请把密码保存到安全的地方！**
  - **Region**: 选择 **`Northeast Asia (Tokyo)`** 或 **`Southeast Asia (Singapore)`**
- 点击 **"Create new project"**
- ⏳ 等待 2-3 分钟项目初始化（会显示进度条）

### 3. 执行数据库初始化脚本

项目创建完成后：

1. 在左侧菜单点击 **"SQL Editor"**
2. 点击 **"New query"**
3. 打开项目文件夹中的 **`supabase-init.sql`** 文件
4. 复制文件的**全部内容**（Ctrl+A 全选，Ctrl+C 复制）
5. 粘贴到 Supabase 的 SQL Editor 中（Ctrl+V）
6. 点击右下角的 **"Run"** 按钮（或按 Ctrl+Enter）
7. 等待执行完成

**验证是否成功：**
- 看到 **"Success. No rows returned"** 表示成功
- 点击左侧 **"Table Editor"**
- 应该能看到 3 个表：`profiles`, `markets`, `bets`
- 点击 `markets` 表，应该能看到 8 条示例数据

### 4. 获取 API 密钥

1. 在左侧菜单点击 **"Settings"** → **"API"**
2. 找到并复制以下两个值：

**Project URL**（在 "Project URL" 部分）：
```
https://xxxxxxxxxxxxx.supabase.co
```

**anon public key**（在 "Project API keys" 部分，标记为 "anon public"）：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```
（这是一个很长的字符串）

**📝 请把这两个值保存到记事本，马上要用！**

---

## 🔄 第四步：更新 Vercel 环境变量（需要你操作）

### 1. 回到 Vercel Dashboard

🔗 访问：https://vercel.com/dashboard

### 2. 进入项目设置

- 点击你的项目 **`policy-prediction-market`**
- 点击顶部的 **"Settings"** 标签
- 点击左侧的 **"Environment Variables"**

### 3. 更新环境变量

找到之前创建的两个变量，点击右侧的 **"Edit"** 按钮：

**更新变量 1：**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: 粘贴你的 Supabase Project URL
- 点击 **"Save"**

**更新变量 2：**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: 粘贴你的 Supabase anon public key
- 点击 **"Save"**

### 4. 重新部署

- 点击顶部的 **"Deployments"** 标签
- 找到最新的部署（第一行）
- 点击右侧的 **"..."** 菜单
- 选择 **"Redeploy"**
- 在弹出窗口中点击 **"Redeploy"** 确认
- ⏳ 等待 1-2 分钟重新部署完成
- 看到状态变为 **"Ready"**（绿色）表示成功

---

## 🔐 第五步：配置 Supabase 认证（需要你操作）

### 1. 回到 Supabase Dashboard

🔗 访问：https://supabase.com/dashboard

### 2. 配置回调 URL

- 选择你的项目 **`policy-prediction-market`**
- 点击左侧 **"Authentication"** → **"URL Configuration"**

### 3. 填写 URL

**Site URL**：
```
https://你的vercel域名.vercel.app
```
（替换为你在第二步记录的 Vercel URL）

**Redirect URLs**：
- 点击 **"Add URL"** 按钮
- 输入：
```
https://你的vercel域名.vercel.app/auth/callback
```
（注意末尾加上 `/auth/callback`）

- 点击 **"Save"**

---

## 🧪 第六步：测试你的网站！

### 1. 访问你的网站

🔗 打开你的 Vercel URL：`https://你的域名.vercel.app`

### 2. 测试基础功能

✅ **首页测试**
- 能看到 "用集体智慧预测政策走向" 标题
- 能看到 4 个统计卡片（预测市场、活跃用户等）
- 能看到 8 个市场卡片

✅ **市场详情测试**
- 点击任意市场卡片
- 能看到市场详情页
- 能看到概率进度条
- 能看到 "参与预测" 表单

### 3. 测试用户注册

1. 点击右上角 **"注册"** 按钮
2. 填写邮箱和密码（密码至少 6 位）
3. 点击 **"注册"**
4. 检查邮箱（包括垃圾邮件文件夹）
5. 点击邮件中的 **"Confirm your mail"** 链接
6. 自动跳转回网站
7. 右上角应该显示你的邮箱地址

### 4. 测试积分系统

1. 点击右上角的邮箱地址 → **"个人资料"**
2. 应该能看到 **1000 积分**（新用户奖励）

### 5. 测试投注功能

1. 回到首页，点击任意市场
2. 在 "参与预测" 表单中：
   - 选择 **"是"** 或 **"否"**
   - 输入积分数量（如 **50**）
   - 点击 **"确认投注"**
3. 投注成功后：
   - 积分应该减少 50
   - 在 "我的投注" 区域能看到记录
   - 市场概率应该有变化

### 6. 测试排行榜

1. 点击顶部导航的 **"排行榜"**
2. 应该能看到用户列表
3. 你的账号应该在列表中

---

## 🎉 完成！

如果以上所有测试都通过了，恭喜你成功部署了政策预测市场平台！

### 📊 你现在拥有：

✅ 一个完整的预测市场网站  
✅ 用户注册登录系统  
✅ 8 个示例预测市场  
✅ 实时概率更新  
✅ 积分投注系统  
✅ 排行榜功能  
✅ 完全免费的云服务  

### 🔗 重要链接（请保存）

- **你的网站**：https://你的域名.vercel.app
- **Vercel 管理**：https://vercel.com/dashboard
- **Supabase 管理**：https://supabase.com/dashboard
- **GitHub 仓库**：https://github.com/freetitan/policy-prediction-market

---

## 🚀 下一步可以做什么？

### 1. 分享你的网站
- 复制网站链接分享给朋友
- 邀请他们注册并参与预测

### 2. 添加更多市场
- 登录 Supabase Dashboard
- 进入 Table Editor → markets 表
- 点击 "Insert row" 添加新市场

### 3. 自定义域名（可选）
- 在 Vercel Settings → Domains
- 添加你自己的域名

### 4. 监控数据
- Vercel Dashboard → Analytics（查看访问量）
- Supabase Dashboard → Table Editor（查看数据）

---

## ❓ 遇到问题？

### 常见问题

**Q: 网站显示 "Internal Server Error"**
- 检查 Vercel 环境变量是否正确填写
- 确保 Supabase 项目状态为 "Active"
- 在 Vercel Deployments 查看错误日志

**Q: 注册后没有收到邮件**
- 检查垃圾邮件文件夹
- Supabase 免费版每小时限制 3 封邮件
- 可以在 Supabase Authentication → Users 手动确认用户

**Q: 注册后没有 1000 积分**
- 在 Supabase SQL Editor 运行：
  ```sql
  SELECT * FROM profiles;
  ```
- 检查触发器是否创建成功

**Q: 投注失败**
- 检查 `place_bet` 函数是否创建成功
- 在 Supabase Database → Functions 查看

**Q: 认证回调失败**
- 检查 Supabase Redirect URLs 是否正确
- 确保 URL 完全匹配（包括 https://）

### 获取帮助

- 📖 查看完整文档：[DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 提交 Issue：https://github.com/freetitan/policy-prediction-market/issues

---

**现在开始部署吧！** 🎯

按照上面的步骤一步步操作，大约 15 分钟就能完成！
