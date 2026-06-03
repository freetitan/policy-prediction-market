# 政策预测市场平台

基于积分制的公共政策预测市场平台。用户可以对未来政策事件进行预测投注，通过验证者投票机制结算市场。

## 🚀 在线访问

- **网站首页**：https://policy-prediction-market.vercel.app
- **管理后台**：https://policy-prediction-market.vercel.app/admin
- **验证者页面**：https://policy-prediction-market.vercel.app/verify

## 🛠️ 技术栈

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Supabase (PostgreSQL + Auth)
- Vercel 部署

## ⚡ 快速开始

### 本地开发

```bash
# 安装依赖
pnpm install

# 复制环境变量
cp .env.local.example .env.local
# 填写 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

### 数据库初始化

在 Supabase SQL Editor 执行 `一键设置管理员.sql`

## 📚 文档

- **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)** - 管理员使用手册
- **[项目开发记录.md](./项目开发记录.md)** - 完整的开发文档和技术细节

## ✨ 核心功能

### 用户功能
- 📧 邮箱注册登录
- 💰 积分系统（新用户赠送 1000 积分）
- 📊 市场浏览和投注
- 🏆 排行榜查看
- 👤 个人中心

### 验证者功能
- ⚖️ 市场验证投票
- 📝 提交证据链接
- ⭐ 声誉积分系统

### 管理员功能
- 🎯 创建和编辑市场
- 🔧 手动结算市场
- 👥 用户管理（查看、调整积分）
- 🛡️ 验证者管理
- 📈 平台数据统计

## 🗂️ 项目结构

```
├── app/                  # Next.js 页面
│   ├── admin/           # 管理后台
│   ├── auth/            # 认证页面
│   ├── market/[id]/     # 市场详情
│   └── verify/          # 验证者页面
├── components/          # React 组件
│   ├── admin/          # 管理员组件
│   └── ui/             # UI 组件库
├── lib/                # 工具库
│   └── supabase/       # Supabase 客户端
└── 一键设置管理员.sql   # 数据库初始化脚本
```

## 📦 构建部署

```bash
pnpm build  # 构建生产版本
pnpm start  # 启动生产服务器
```

## 📝 License

MIT

---

**管理员邮箱**：unimaster@gmail.com
