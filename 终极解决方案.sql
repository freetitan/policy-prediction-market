-- ==========================================
-- 🎯 终极解决方案
-- 分步执行，每一步都能看到结果
-- ==========================================

-- ========== 第 1 步：查看所有用户 ==========
-- 执行这个，找到你的邮箱
SELECT 
    '第1步：所有用户列表' as 步骤,
    au.id,
    au.email,
    au.created_at,
    p.display_name,
    p.points
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- 👆 找到你的邮箱对应的 id，记下来
-- 如果看到 unimaster@gmail.com，记下对应的 id

-- ========== 第 2 步：创建必要的表 ==========

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 创建验证者表
CREATE TABLE IF NOT EXISTS verifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reputation INTEGER DEFAULT 100,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建验证投票表
CREATE TABLE IF NOT EXISTS verification_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  verifier_id UUID NOT NULL REFERENCES verifiers(id) ON DELETE CASCADE,
  vote BOOLEAN NOT NULL,
  evidence TEXT,
  confidence INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(market_id, verifier_id)
);

-- 创建管理员日志表
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建辅助函数
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
DECLARE user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = user_id;
    RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建结算函数
CREATE OR REPLACE FUNCTION settle_market(p_market_id UUID, p_outcome BOOLEAN)
RETURNS VOID AS $$
DECLARE
  v_yes_pool INTEGER;
  v_no_pool INTEGER;
  v_total_pool INTEGER;
  v_winning_pool INTEGER;
BEGIN
  SELECT yes_pool, no_pool INTO v_yes_pool, v_no_pool FROM markets WHERE id = p_market_id;
  IF NOT FOUND THEN RAISE EXCEPTION '市场不存在'; END IF;
  
  v_total_pool := v_yes_pool + v_no_pool;
  IF p_outcome THEN v_winning_pool := v_yes_pool; ELSE v_winning_pool := v_no_pool; END IF;
  
  IF v_winning_pool > 0 THEN
    UPDATE profiles p
    SET points = points + FLOOR((b.amount::NUMERIC / v_winning_pool::NUMERIC) * v_total_pool::NUMERIC)::INTEGER
    FROM bets b
    WHERE b.user_id = p.id AND b.market_id = p_market_id AND b.position = p_outcome;
  END IF;
  
  UPDATE markets SET resolved = true, outcome = p_outcome, updated_at = NOW() WHERE id = p_market_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 启用 RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- 创建策略
DROP POLICY IF EXISTS "管理员可查看" ON admins;
CREATE POLICY "管理员可查看" ON admins FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND active = true)
);

DROP POLICY IF EXISTS "任何人可查看验证者" ON verifiers;
CREATE POLICY "任何人可查看验证者" ON verifiers FOR SELECT USING (true);

-- ========== 第 3 步：添加管理员 ==========

-- 方法 A：通过邮箱添加（确保邮箱正确）
INSERT INTO admins (user_id, username, role, active)
SELECT 
    au.id,
    COALESCE(p.display_name, 'Admin'),
    'super_admin',
    true
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'unimaster@gmail.com'  -- 确保这个邮箱正确
ON CONFLICT (user_id) 
DO UPDATE SET active = true, role = 'super_admin';

-- 方法 B：如果方法A不行，把最新用户添加为管理员（注释掉上面的，用这个）
-- INSERT INTO admins (user_id, username, role, active)
-- SELECT 
--     au.id,
--     COALESCE(p.display_name, au.email),
--     'super_admin',
--     true
-- FROM auth.users au
-- LEFT JOIN profiles p ON au.id = p.id
-- ORDER BY au.created_at DESC
-- LIMIT 1
-- ON CONFLICT (user_id) 
-- DO UPDATE SET active = true, role = 'super_admin';

-- ========== 第 4 步：验证结果 ==========

SELECT 
    '✅ 当前所有管理员：' as 状态,
    a.id as 管理员ID,
    au.email as 邮箱,
    a.username as 用户名,
    a.role as 角色,
    a.active as 激活状态,
    a.created_at as 添加时间
FROM admins a
JOIN auth.users au ON a.user_id = au.id
ORDER BY a.created_at DESC;

-- ==========================================
-- 🎉 如果上面显示了你的邮箱，说明成功了！
-- 
-- 下一步：
-- 1. 重新登录网站（确保用添加为管理员的邮箱）
-- 2. 访问：https://policy-prediction-market.vercel.app/admin
-- 3. 如果还不行，清除浏览器缓存后再试
-- ==========================================
