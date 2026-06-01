# 🚀 部署指南

## 第一步：部署到 Vercel

### 方式一：通过 GitHub 自动部署（推荐）

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 点击 "Sign Up" 或 "Log In"
   - 选择 "Continue with GitHub" 登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 找到仓库 `freetitan/policy-prediction-market`
   - 点击 "Import"

3. **配置环境变量**
   在 "Environment Variables" 部分添加（暂时使用占位符）：
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
   ```
   
4. **部署**
   - 点击 "Deploy"
   - 等待 2-3 分钟完成构建
   - 记录你的部署 URL（如：https://your-app.vercel.app）

---

## 第二步：配置 Supabase 数据库

### 1. 创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 "Start your project" → "Sign In with GitHub"
3. 点击 "New Project"
4. 填写信息：
   - Name: `policy-prediction-market`
   - Database Password: 设置一个强密码（记住它！）
   - Region: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`
5. 点击 "Create new project"（等待 2-3 分钟）

### 2. 创建数据库表

1. 在 Supabase Dashboard，点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制粘贴以下 SQL 并点击 "Run"：

```sql
-- 1. 创建用户资料表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  points INTEGER DEFAULT 1000 CHECK (points >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建市场表
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  outcome BOOLEAN,
  yes_pool INTEGER DEFAULT 0 CHECK (yes_pool >= 0),
  no_pool INTEGER DEFAULT 0 CHECK (no_pool >= 0),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建投注表
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount >= 10),
  position BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 创建索引提升性能
CREATE INDEX idx_markets_category ON markets(category);
CREATE INDEX idx_markets_end_date ON markets(end_date);
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_market_id ON bets(market_id);

-- 5. 创建投注存储过程
CREATE OR REPLACE FUNCTION place_bet(
  p_user_id UUID,
  p_market_id UUID,
  p_amount INTEGER,
  p_position BOOLEAN
) RETURNS VOID AS $$
DECLARE
  v_market_resolved BOOLEAN;
  v_market_end_date TIMESTAMPTZ;
BEGIN
  -- 检查市场状态
  SELECT resolved, end_date INTO v_market_resolved, v_market_end_date
  FROM markets WHERE id = p_market_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '市场不存在';
  END IF;
  
  IF v_market_resolved THEN
    RAISE EXCEPTION '市场已结算';
  END IF;
  
  IF v_market_end_date < NOW() THEN
    RAISE EXCEPTION '市场已截止';
  END IF;
  
  -- 扣除用户积分
  UPDATE profiles 
  SET points = points - p_amount 
  WHERE id = p_user_id AND points >= p_amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '积分不足';
  END IF;
  
  -- 更新市场池
  IF p_position THEN
    UPDATE markets SET yes_pool = yes_pool + p_amount WHERE id = p_market_id;
  ELSE
    UPDATE markets SET no_pool = no_pool + p_amount WHERE id = p_market_id;
  END IF;
  
  -- 记录投注
  INSERT INTO bets (user_id, market_id, amount, position)
  VALUES (p_user_id, p_market_id, p_amount, p_position);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 创建新用户自动创建资料的触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, points)
  VALUES (NEW.id, NEW.email, 1000);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. 启用行级安全（RLS）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- 8. 创建安全策略
-- 市场：所有人可读
CREATE POLICY "任何人可查看市场" ON markets
  FOR SELECT USING (true);

-- 市场：认证用户可创建
CREATE POLICY "认证用户可创建市场" ON markets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- 资料：用户可查看所有资料（排行榜需要）
CREATE POLICY "任何人可查看资料" ON profiles
  FOR SELECT USING (true);

-- 资料：用户只能更新自己的资料
CREATE POLICY "用户可更新自己的资料" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 投注：用户可查看所有投注
CREATE POLICY "任何人可查看投注" ON bets
  FOR SELECT USING (true);

-- 投注：通过存储过程创建（已设置 SECURITY DEFINER）
CREATE POLICY "认证用户可创建投注" ON bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 3. 插入示例数据（可选）

```sql
-- 插入示例市场
INSERT INTO markets (title, description, category, end_date) VALUES
('2027年中国是否会实施碳税？', '预测中国是否会在2027年底前正式实施全国性碳税政策', '环境政策', '2027-12-31 23:59:59+08'),
('2026年新能源汽车补贴是否延续？', '预测2026年新能源汽车购置补贴政策是否会延续', '能源政策', '2026-06-30 23:59:59+08'),
('2027年是否会推行四天工作制试点？', '预测是否会有省份或城市在2027年推行四天工作制试点', '劳动政策', '2027-12-31 23:59:59+08'),
('2026年房贷利率是否会降至3%以下？', '预测2026年首套房贷款利率是否会降至3%以下', '金融政策', '2026-12-31 23:59:59+08'),
('2027年是否会对AI大模型实施许可制？', '预测中国是否会在2027年对大型AI模型实施许可证管理', '科技政策', '2027-06-30 23:59:59+08');
```

### 4. 获取 API 密钥

1. 在 Supabase Dashboard，点击左侧 "Settings" → "API"
2. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 第三步：更新 Vercel 环境变量

1. 回到 Vercel Dashboard
2. 选择你的项目 → "Settings" → "Environment Variables"
3. 编辑之前的环境变量，填入真实值：
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. 点击 "Save"
5. 前往 "Deployments" → 点击最新部署右侧的 "..." → "Redeploy"

---

## 第四步：配置 Supabase 认证回调

1. 在 Supabase Dashboard，点击 "Authentication" → "URL Configuration"
2. 填写：
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: 添加 `https://your-app.vercel.app/auth/callback`
3. 点击 "Save"

---

## 第五步：配置邮件认证（可选）

### 使用 Supabase 内置邮件服务（开发用）
默认已启用，但有发送限制（每小时3封）

### 使用自定义 SMTP（生产环境推荐）
1. 在 Supabase Dashboard → "Settings" → "Auth"
2. 找到 "SMTP Settings"
3. 配置你的邮件服务（如 Gmail、SendGrid、阿里云邮件）

---

## ✅ 完成！

访问你的 Vercel 部署 URL，应该可以看到：
- ✅ 首页显示示例市场
- ✅ 可以注册新用户（获得1000积分）
- ✅ 可以登录并投注
- ✅ 查看排行榜

---

## 🔧 常见问题

### 1. 部署失败
- 检查 `pnpm-lock.yaml` 是否存在
- 确保 Node.js 版本 >= 18

### 2. 数据库连接失败
- 检查环境变量是否正确
- 确保 Supabase 项目状态为 "Active"

### 3. 认证回调失败
- 检查 Supabase 的 Redirect URLs 配置
- 确保 URL 完全匹配（包括 https://）

### 4. 投注失败
- 检查 SQL 中的 `place_bet` 函数是否创建成功
- 查看 Supabase Dashboard → "Database" → "Functions"

---

## 📊 监控和维护

### Vercel
- 查看部署日志：Dashboard → Deployments → 点击部署
- 查看运行日志：Dashboard → Logs

### Supabase
- 查看数据库：Dashboard → Table Editor
- 查看 API 日志：Dashboard → Logs
- 监控用量：Dashboard → Settings → Usage

---

## 🚀 后续优化

1. **自定义域名**：Vercel Settings → Domains
2. **启用分析**：已集成 Vercel Analytics
3. **性能优化**：启用 Vercel Edge Functions
4. **备份数据**：Supabase 自动每日备份（免费版保留7天）

---

需要帮助？查看官方文档：
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
