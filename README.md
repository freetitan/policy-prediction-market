# 政策预测市场平台

基于积分制的公共政策预测市场，用集体智慧预测政策走向。

## 🌟 功能特性

- 📊 **预测市场**：9大政策分类，实时概率更新
- 💰 **积分系统**：新用户注册送1000积分
- 🎯 **双向投注**：支持"是"/"否"两个方向
- 🏆 **排行榜**：根据积分排名
- 🔐 **用户认证**：基于 Supabase Auth
- 📱 **响应式设计**：完美支持移动端

## 🛠️ 技术栈

- **前端**: Next.js 16 + React 19 + TypeScript
- **UI**: Tailwind CSS 4 + Radix UI + Lucide Icons
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **部署**: Vercel
- **包管理**: pnpm

## 🚀 快速开始

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/freetitan/policy-prediction-market.git
cd policy-prediction-market
```

2. **安装依赖**
```bash
pnpm install
```

3. **配置环境变量**
```bash
cp .env.local.example .env.local
# 编辑 .env.local 填入你的 Supabase 配置
```

4. **启动开发服务器**
```bash
pnpm dev
```

访问 http://localhost:3000

### 部署到生产环境

详细部署步骤请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── auth/              # 认证相关页面
│   ├── market/[id]/       # 市场详情页
│   ├── leaderboard/       # 排行榜
│   ├── profile/           # 个人资料
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── market-card.tsx   # 市场卡片
│   ├── bet-form.tsx      # 投注表单
│   └── navbar.tsx        # 导航栏
├── lib/                   # 工具库
│   ├── supabase/         # Supabase 客户端
│   ├── types.ts          # TypeScript 类型
│   └── utils.ts          # 工具函数
└── hooks/                 # 自定义 Hooks
```

## 🗄️ 数据库结构

### 表结构

- **profiles**: 用户资料（id, display_name, points）
- **markets**: 预测市场（title, category, yes_pool, no_pool, end_date）
- **bets**: 投注记录（user_id, market_id, amount, position）

### 存储过程

- **place_bet()**: 处理投注逻辑（扣除积分、更新池子、记录投注）

## 🎯 核心功能

### 市场分类

- 环境政策
- 能源政策
- 劳动政策
- 金融政策
- 科技政策
- 税收政策
- 医疗政策
- 教育政策

### 投注机制

- 最低投注：10积分
- 概率计算：基于 yes_pool 和 no_pool 动态计算
- 回报计算：根据池子比例计算预期收益
- 结算规则：市场截止后由管理员标记结果

## 📝 开发命令

```bash
pnpm dev      # 启动开发服务器
pnpm build    # 构建生产版本
pnpm start    # 启动生产服务器
pnpm lint     # 运行 ESLint
```

## 🔐 环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

## 📄 许可证

本项目仅供学习研究使用，不构成任何投资建议。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请通过 GitHub Issues 联系。

---

Made with ❤️ using Next.js and Supabase
