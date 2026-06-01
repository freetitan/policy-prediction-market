# ✅ 部署检查清单

按顺序完成以下步骤，打勾表示已完成。

---

## 📋 第一步：推送代码到 GitHub

- [ ] 已安装 GitHub Desktop 或配置了 Git 认证
- [ ] 代码已成功推送到 `https://github.com/freetitan/policy-prediction-market`
- [ ] 在 GitHub 网页上能看到最新的代码（包括 README.md）

**验证方法**：访问 https://github.com/freetitan/policy-prediction-market

---

## 🚀 第二步：Vercel 部署

- [ ] 已访问 https://vercel.com 并用 GitHub 登录
- [ ] 已导入 `policy-prediction-market` 项目
- [ ] 已添加环境变量（可先用占位符）：
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] 首次部署已完成
- [ ] 已记录 Vercel 部署 URL：`https://__________________.vercel.app`

**验证方法**：访问你的 Vercel URL，应该能看到页面（可能显示错误，正常）

---

## 🗄️ 第三步：Supabase 数据库

- [ ] 已访问 https://supabase.com 并用 GitHub 登录
- [ ] 已创建新项目 `policy-prediction-market`
- [ ] 已选择区域：Tokyo 或 Singapore
- [ ] 已设置数据库密码并保存
- [ ] 项目状态显示为 "Active"（绿色）
- [ ] 已在 SQL Editor 执行完整的初始化脚本
- [ ] 执行结果显示 "Success"
- [ ] 在 Table Editor 中能看到 3 个表：`profiles`, `markets`, `bets`
- [ ] 在 `markets` 表中能看到 5 条示例数据

**验证方法**：
1. 点击左侧 "Table Editor"
2. 选择 "markets" 表
3. 应该能看到 5 个预测市场

---

## 🔑 第四步：获取 API 密钥

- [ ] 已进入 Supabase Settings → API
- [ ] 已复制 Project URL：`https://__________________.supabase.co`
- [ ] 已复制 anon public key（很长的字符串）
- [ ] 已保存到安全的地方（记事本或密码管理器）

---

## 🔄 第五步：更新 Vercel 环境变量

- [ ] 已回到 Vercel Dashboard
- [ ] 已进入项目 Settings → Environment Variables
- [ ] 已更新 `NEXT_PUBLIC_SUPABASE_URL` 为真实值
- [ ] 已更新 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 为真实值
- [ ] 已点击 Save
- [ ] 已在 Deployments 页面点击 "Redeploy"
- [ ] 重新部署已完成（状态显示 "Ready"）

**验证方法**：在 Vercel Deployments 页面，最新部署状态为绿色 "Ready"

---

## 🔐 第六步：配置 Supabase 认证

- [ ] 已回到 Supabase Dashboard
- [ ] 已进入 Authentication → URL Configuration
- [ ] 已设置 Site URL 为你的 Vercel URL
- [ ] 已添加 Redirect URL：`https://你的域名.vercel.app/auth/callback`
- [ ] 已点击 Save

---

## 🧪 第七步：功能测试

### 基础功能
- [ ] 访问网站首页能正常加载
- [ ] 能看到 5 个示例市场卡片
- [ ] 点击市场卡片能进入详情页
- [ ] 详情页显示概率和积分池

### 用户注册
- [ ] 点击右上角 "注册" 按钮
- [ ] 填写邮箱和密码
- [ ] 能收到验证邮件（检查垃圾邮件文件夹）
- [ ] 点击邮件中的验证链接
- [ ] 成功跳转回网站
- [ ] 右上角显示用户邮箱
- [ ] 点击 "个人资料" 能看到 1000 积分

### 投注功能
- [ ] 进入任意市场详情页
- [ ] 能看到 "参与预测" 表单
- [ ] 选择 "是" 或 "否"
- [ ] 输入积分数量（如 50）
- [ ] 点击 "确认投注"
- [ ] 投注成功，积分减少
- [ ] 在 "我的投注" 区域能看到记录
- [ ] 市场概率已更新

### 排行榜
- [ ] 点击顶部导航 "排行榜"
- [ ] 能看到用户列表
- [ ] 显示积分和排名

---

## 🎉 完成！

如果以上所有项目都打勾了，恭喜你成功部署了政策预测市场平台！

---

## 📊 部署信息记录

**项目信息**：
- GitHub 仓库：https://github.com/freetitan/policy-prediction-market
- Vercel URL：https://__________________.vercel.app
- Supabase URL：https://__________________.supabase.co

**账号信息**（请妥善保管）：
- Supabase 数据库密码：________________
- Supabase anon key：已保存在 Vercel 环境变量

**部署时间**：____年____月____日

---

## 🔧 后续维护

### 定期检查
- [ ] 每周检查 Vercel 部署状态
- [ ] 每月检查 Supabase 用量（免费版有限制）
- [ ] 定期备份重要数据

### 功能扩展
- [ ] 添加更多预测市场
- [ ] 自定义域名
- [ ] 添加管理员后台
- [ ] 实现市场结算功能

---

## ❓ 遇到问题？

参考详细文档：
- 快速部署：[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
- 完整文档：[DEPLOYMENT.md](./DEPLOYMENT.md)

或访问官方文档：
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
