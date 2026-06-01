# ⚡ 5分钟快速部署指南

## 🎯 部署步骤总览

1. ✅ 推送代码到 GitHub（需要先配置 Git 认证）
2. ✅ 在 Vercel 导入项目
3. ✅ 创建 Supabase 数据库
4. ✅ 配置环境变量
5. ✅ 完成！

---

## 第一步：推送代码到 GitHub

### 方式一：使用 GitHub Desktop（推荐，最简单）

1. 下载安装 GitHub Desktop: https://desktop.github.com/
2. 打开 GitHub Desktop，登录你的 GitHub 账号
3. 点击 "Add" → "Add Existing Repository"
4. 选择项目文件夹：`C:\Users\norsky\Downloads\b_QbwYiLeIRg7`
5. 点击右上角 "Push origin" 按钮

### 方式二：使用命令行（需要配置 Token）

```bash
# 1. 生成 GitHub Personal Access Token
# 访问: https://github.com/settings/tokens
# 点击 "Generate new token (classic)"
# 勾选 "repo" 权限，生成 token（复制保存）

# 2. 配置 Git 凭据
git config --global credential.helper store

# 3. 推送代码（会提示输入用户名和 token）
git push origin main
# Username: 你的GitHub用户名
# Password: 粘贴刚才生成的 token
```

### 方式三：使用 VS Code（如果已安装）

1. 打开 VS Code
2. 打开项目文件夹
3. 点击左侧 "Source Control" 图标
4. 点击 "..." → "Push"
5. 按提示登录 GitHub

---

## 第二步：在 Vercel 部署

### 1. 访问 Vercel 并登录

🔗 打开浏览器访问: **https://vercel.com**

点击右上角 **"Sign Up"** 或 **"Log In"**

选择 **"Continue with GitHub"** 登录

### 2. 导入项目

1. 点击 **"Add New..."** → **"Project"**
2. 在列表中找到 **`policy-prediction-market`** 仓库
3. 点击 **"Import"**

### 3. 配置项目（重要！）

在配置页面：

**Framework Preset**: 自动检测为 `Next.js` ✅

**Root Directory**: 保持默认 `./` ✅

**Build Command**: 保持默认 `pnpm build` ✅

**Environment Variables**: 点击展开，添加以下变量：

```
名称: NEXT_PUBLIC_SUPABASE_URL
值: https://placeholder.supabase.co

名称: NEXT_PUBLIC_SUPABASE_ANON_KEY
值: placeholder-key-will-update-later
```

> 💡 先用占位符，稍后更新真实值

### 4. 开始部署

点击 **"Deploy"** 按钮

⏳ 等待 2-3 分钟...

✅ 部署成功后，记录你的网站 URL（如：`https://policy-prediction-market.vercel.app`）

---

## 第三步：创建 Supabase 数据库

### 1. 注册并创建项目

🔗 打开浏览器访问: **https://supabase.com**

1. 点击 **"Start your project"**
2. 选择 **"Sign in with GitHub"**
3. 点击 **"New Project"**
4. 填写信息：
   - **Name**: `policy-prediction-market`
   - **Database Password**: 设置一个强密码（记住它！）
   - **Region**: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`
5. 点击 **"Create new project"**

⏳ 等待 2-3 分钟项目初始化...

### 2. 创建数据库表

1. 在左侧菜单点击 **"SQL Editor"**
2. 点击 **"New query"**
3. 复制粘贴以下完整 SQL 代码：

```sql
-- ==========================================
-- 政策预测市场 - 数据库初始化脚本
-- ==========================================

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

-- 4. 创建索引
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
  
  UPDATE profiles 
  SET points = points - p_amount 
  WHERE id = p_user_id AND points >= p_amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '积分不足';
  END IF;
  
  IF p_position THEN
    UPDATE markets SET yes_pool = yes_pool + p_amount WHERE id = p_market_id;
  ELSE
    UPDATE markets SET no_pool = no_pool + p_amount WHERE id = p_market_id;
  END IF;
  
  INSERT INTO bets (user_id, market_id, amount, position)
  VALUES (p_user_id, p_market_id, p_amount, p_position);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 创建新用户触发器
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

-- 7. 启用行级安全
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- 8. 创建安全策略
CREATE POLICY "任何人可查看市场" ON markets FOR SELECT USING (true);
CREATE POLICY "认证用户可创建市场" ON markets FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "任何人可查看资料" ON profiles FOR SELECT USING (true);
CREATE POLICY "用户可更新自己的资料" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "任何人可查看投注" ON bets FOR SELECT USING (true);
CREATE POLICY "认证用户可创建投注" ON bets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. 插入示例数据
INSERT INTO markets (title, description, category, end_date) VALUES
('2027年中国是否会实施碳税？', '预测中国是否会在2027年底前正式实施全国性碳税政策', '环境政策', '2027-12-31 23:59:59+08'),
('2026年新能源汽车补贴是否延续？', '预测2026年新能源汽车购置补贴政策是否会延续', '能源政策', '2026-06-30 23:59:59+08'),
('2027年是否会推行四天工作制试点？', '预测是否会有省份或城市在2027年推行四天工作制试点', '劳动政策', '2027-12-31 23:59:59+08'),
('2026年房贷利率是否会降至3%以下？', '预测2026年首套房贷款利率是否会降至3%以下', '金融政策', '2026-12-31 23:59:59+08'),
('2027年是否会对AI大模型实施许可制？', '预测中国是否会在2027年对大型AI模型实施许可证管理', '科技政策', '2027-06-30 23:59:59+08');
```

4. 点击右下角 **"Run"** 按钮
5. 看到 **"Success. No rows returned"** 表示成功 ✅

### 3. 获取 API 密钥

1. 在左侧菜单点击 **"Settings"** → **"API"**
2. 复制以下两个值（保存到记事本）：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（很长的字符串）

---

## 第四步：更新 Vercel 环境变量

### 1. 回到 Vercel Dashboard

🔗 访问: **https://vercel.com/dashboard**

### 2. 更新环境变量

1. 选择你的项目 **`policy-prediction-market`**
2. 点击顶部 **"Settings"** 标签
3. 点击左侧 **"Environment Variables"**
4. 找到之前创建的两个变量，点击右侧 **"Edit"**

**更新为真实值：**

```
NEXT_PUBLIC_SUPABASE_URL
值: https://xxxxx.supabase.co  (粘贴你的 Supabase Project URL)

NEXT_PUBLIC_SUPABASE_ANON_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  (粘贴你的 anon public key)
```

5. 点击 **"Save"**

### 3. 重新部署

1. 点击顶部 **"Deployments"** 标签
2. 找到最新的部署，点击右侧 **"..."** 菜单
3. 选择 **"Redeploy"**
4. 点击 **"Redeploy"** 确认

⏳ 等待 1-2 分钟...

---

## 第五步：配置 Supabase 认证

### 1. 设置回调 URL

🔗 回到 Supabase Dashboard

1. 点击左侧 **"Authentication"** → **"URL Configuration"**
2. 填写以下信息：

**Site URL**:
```
https://your-app.vercel.app
```
（替换为你的 Vercel 部署 URL）

**Redirect URLs**: 点击 "Add URL"，添加：
```
https://your-app.vercel.app/auth/callback
```

3. 点击 **"Save"**

---

## ✅ 完成！测试你的网站

### 1. 访问你的网站

🔗 打开: **https://your-app.vercel.app**

### 2. 测试功能

1. ✅ 首页显示 5 个示例市场
2. ✅ 点击右上角 "注册" 创建账号
3. ✅ 注册成功后自动获得 1000 积分
4. ✅ 点击任意市场卡片进入详情页
5. ✅ 选择 "是" 或 "否"，输入积分数量
6. ✅ 点击 "确认投注"
7. ✅ 查看 "我的投注" 记录
8. ✅ 点击顶部 "排行榜" 查看排名

---

## 🎉 恭喜！部署成功

你的政策预测市场平台已经上线了！

### 📊 后续操作

**分享你的网站**:
- 复制 Vercel URL 分享给朋友
- 在 GitHub 仓库添加网站链接

**监控网站**:
- Vercel Dashboard → Logs（查看访问日志）
- Supabase Dashboard → Table Editor（查看数据）

**自定义域名**（可选）:
- Vercel Settings → Domains → Add Domain

---

## ❓ 遇到问题？

### 常见问题

**1. 部署失败显示 "Build Error"**
- 检查 GitHub 代码是否推送成功
- 查看 Vercel 部署日志的具体错误信息

**2. 网站打开显示 "Internal Server Error"**
- 检查 Vercel 环境变量是否正确填写
- 确保 Supabase 项目状态为 "Active"

**3. 注册后没有获得积分**
- 检查 Supabase SQL 中的触发器是否创建成功
- 在 Supabase → Database → Triggers 查看

**4. 投注失败**
- 检查 `place_bet` 函数是否创建成功
- 在 Supabase → Database → Functions 查看

**5. 认证回调失败**
- 检查 Supabase 的 Redirect URLs 是否正确
- 确保 URL 完全匹配（包括 https://）

### 获取帮助

- 查看完整文档: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Vercel 文档: https://vercel.com/docs
- Supabase 文档: https://supabase.com/docs

---

**预计总耗时**: 5-10 分钟

**完全免费**: ✅ Vercel 免费版 + Supabase 免费版

**支持流量**: 约 10 万 PV/月
