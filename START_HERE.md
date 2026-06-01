# 🚀 开始部署你的政策预测市场

欢迎！这是一个完整的预测市场平台，现在让我们把它部署到互联网上。

---

## 📚 文档导航

根据你的需求选择合适的文档：

### 🎯 我想快速部署（推荐新手）
👉 阅读 **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)**
- 图文并茂的详细步骤
- 预计耗时：5-10 分钟
- 完全免费

### ✅ 我想按清单逐步完成
👉 阅读 **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)**
- 可打印的检查清单
- 每一步都有验证方法
- 适合团队协作

### 📖 我想了解完整技术细节
👉 阅读 **[DEPLOYMENT.md](./DEPLOYMENT.md)**
- 完整的部署文档
- 包含故障排除
- 适合有经验的开发者

### 🗄️ 我需要数据库初始化脚本
👉 使用 **[supabase-init.sql](./supabase-init.sql)**
- 完整的 SQL 初始化脚本
- 包含示例数据
- 直接在 Supabase SQL Editor 中运行

---

## ⚡ 3分钟快速开始

### 第一步：推送代码到 GitHub

**最简单方法**：使用 GitHub Desktop
1. 下载：https://desktop.github.com/
2. 登录 GitHub 账号
3. 添加此项目文件夹
4. 点击 "Push origin"

✅ **验证**：访问 https://github.com/freetitan/policy-prediction-market 能看到代码

---

### 第二步：部署到 Vercel

1. 访问：https://vercel.com
2. 用 GitHub 登录
3. 导入 `policy-prediction-market` 项目
4. 添加环境变量（先用占位符）：
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://placeholder.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = placeholder
   ```
5. 点击 "Deploy"

✅ **验证**：获得一个 `.vercel.app` 域名

---

### 第三步：创建 Supabase 数据库

1. 访问：https://supabase.com
2. 用 GitHub 登录
3. 创建新项目（选择 Tokyo 或 Singapore 区域）
4. 进入 SQL Editor
5. 复制粘贴 `supabase-init.sql` 的全部内容
6. 点击 "Run"

✅ **验证**：在 Table Editor 看到 3 个表和 8 条市场数据

---

### 第四步：连接数据库

1. 在 Supabase 获取 API 密钥（Settings → API）
2. 回到 Vercel 更新环境变量
3. 重新部署

✅ **验证**：访问网站能看到市场列表

---

### 第五步：配置认证

在 Supabase Authentication → URL Configuration 添加：
- Site URL: `https://你的域名.vercel.app`
- Redirect URL: `https://你的域名.vercel.app/auth/callback`

✅ **验证**：能注册新用户并获得 1000 积分

---

## 🎉 完成！

现在你可以：
- ✅ 注册用户
- ✅ 参与预测
- ✅ 查看排行榜
- ✅ 分享给朋友

---

## 📊 项目信息

**技术栈**：
- 前端：Next.js 16 + React 19 + TypeScript
- UI：Tailwind CSS 4 + Radix UI
- 数据库：Supabase (PostgreSQL)
- 部署：Vercel

**功能特性**：
- 📊 9大政策分类预测市场
- 💰 积分制投注系统
- 🏆 实时排行榜
- 🔐 用户认证
- 📱 响应式设计

**免费额度**：
- Vercel：100GB 带宽/月
- Supabase：500MB 数据库 + 5GB 带宽/月
- 支持约 10 万 PV/月

---

## 🔗 重要链接

- **GitHub 仓库**：https://github.com/freetitan/policy-prediction-market
- **Vercel 部署**：https://vercel.com/dashboard
- **Supabase 控制台**：https://supabase.com/dashboard

---

## ❓ 需要帮助？

### 常见问题

**Q: 部署失败怎么办？**
A: 查看 Vercel 部署日志，通常是环境变量配置错误

**Q: 注册后没有积分？**
A: 检查 Supabase 触发器是否创建成功

**Q: 投注失败？**
A: 检查 `place_bet` 函数是否创建成功

**Q: 认证回调失败？**
A: 检查 Supabase Redirect URLs 配置是否正确

### 获取支持

- 📖 查看详细文档：[DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 提交 Issue：https://github.com/freetitan/policy-prediction-market/issues
- 📧 Vercel 文档：https://vercel.com/docs
- 📧 Supabase 文档：https://supabase.com/docs

---

## 🚀 下一步

部署成功后，你可以：

1. **自定义域名**
   - 在 Vercel Settings → Domains 添加

2. **添加更多市场**
   - 在 Supabase Table Editor 的 markets 表中添加

3. **邀请用户**
   - 分享你的网站链接

4. **监控数据**
   - Vercel Analytics（已集成）
   - Supabase Dashboard

5. **功能扩展**
   - 添加管理员后台
   - 实现自动结算
   - 添加社交分享

---

## 📝 许可证

本项目仅供学习研究使用，不构成任何投资建议。

---

**准备好了吗？开始部署吧！** 🎉

选择一个文档开始：
- 🎯 [快速部署指南](./QUICK_DEPLOY.md)
- ✅ [部署检查清单](./DEPLOY_CHECKLIST.md)
- 📖 [完整部署文档](./DEPLOYMENT.md)
