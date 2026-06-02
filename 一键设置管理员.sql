-- ==========================================
-- 一键设置管理员系统（完整版）
-- 邮箱：unimaster@gmail.com
-- ==========================================
-- 在 Supabase SQL Editor 中一次性执行此脚本
-- ==========================================

-- ========== 第一部分：创建所有表 ==========

-- 1. 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_active ON admins(active);

-- 2. 创建验证者表
CREATE TABLE IF NOT EXISTS verifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reputation INTEGER DEFAULT 100 CHECK (reputation >= 0),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verifiers_user_id ON verifiers(user_id);
CREATE INDEX IF NOT EXISTS idx_verifiers_active ON verifiers(active);

-- 3. 创建验证投票表
CREATE TABLE IF NOT EXISTS verification_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  verifier_id UUID NOT NULL REFERENCES verifiers(id) ON DELETE CASCADE,
  vote BOOLEAN NOT NULL,
  evidence TEXT,
  confidence INTEGER DEFAULT 3 CHECK (confidence BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(market_id, verifier_id)
);

CREATE INDEX IF NOT EXISTS idx_verification_votes_market_id ON verification_votes(market_id);
CREATE INDEX IF NOT EXISTS idx_verification_votes_verifier_id ON verification_votes(verifier_id);

-- 4. 创建管理员操作日志表
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- ========== 第二部分：创建函数 ==========

-- 1. 辅助函数：通过邮箱获取用户信息
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    display_name TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id,
        au.email::TEXT,
        p.display_name
    FROM auth.users au
    LEFT JOIN profiles p ON au.id = p.id
    WHERE au.email = user_email;
END;
$$;

-- 2. 辅助函数：获取用户邮箱
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;
    
    RETURN user_email;
END;
$$;

-- 3. 市场结算函数
CREATE OR REPLACE FUNCTION settle_market(
  p_market_id UUID,
  p_outcome BOOLEAN
) RETURNS VOID AS $$
DECLARE
  v_yes_pool INTEGER;
  v_no_pool INTEGER;
  v_total_pool INTEGER;
  v_winning_pool INTEGER;
BEGIN
  SELECT yes_pool, no_pool INTO v_yes_pool, v_no_pool
  FROM markets WHERE id = p_market_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '市场不存在';
  END IF;
  
  v_total_pool := v_yes_pool + v_no_pool;
  
  IF p_outcome THEN
    v_winning_pool := v_yes_pool;
  ELSE
    v_winning_pool := v_no_pool;
  END IF;
  
  IF v_winning_pool > 0 THEN
    UPDATE profiles p
    SET points = points + FLOOR(
      (b.amount::NUMERIC / v_winning_pool::NUMERIC) * v_total_pool::NUMERIC
    )::INTEGER
    FROM bets b
    WHERE b.user_id = p.id
      AND b.market_id = p_market_id
      AND b.position = p_outcome;
  END IF;
  
  UPDATE markets
  SET resolved = true,
      outcome = p_outcome,
      updated_at = NOW()
  WHERE id = p_market_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 自动结算触发器函数
CREATE OR REPLACE FUNCTION auto_settle_market()
RETURNS TRIGGER AS $$
DECLARE
  v_yes_votes INTEGER;
  v_no_votes INTEGER;
  v_total_votes INTEGER;
  v_required_votes INTEGER := 3;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE vote = true),
    COUNT(*) FILTER (WHERE vote = false),
    COUNT(*)
  INTO v_yes_votes, v_no_votes, v_total_votes
  FROM verification_votes
  WHERE market_id = NEW.market_id;
  
  IF v_total_votes >= v_required_votes THEN
    IF v_yes_votes >= 2 THEN
      PERFORM settle_market(NEW.market_id, true);
      
      UPDATE verifiers
      SET reputation = reputation + 10
      WHERE id IN (
        SELECT verifier_id FROM verification_votes 
        WHERE market_id = NEW.market_id AND vote = true
      );
      
      UPDATE verifiers
      SET reputation = GREATEST(reputation - 5, 0)
      WHERE id IN (
        SELECT verifier_id FROM verification_votes 
        WHERE market_id = NEW.market_id AND vote = false
      );
      
    ELSIF v_no_votes >= 2 THEN
      PERFORM settle_market(NEW.market_id, false);
      
      UPDATE verifiers
      SET reputation = reputation + 10
      WHERE id IN (
        SELECT verifier_id FROM verification_votes 
        WHERE market_id = NEW.market_id AND vote = false
      );
      
      UPDATE verifiers
      SET reputation = GREATEST(reputation - 5, 0)
      WHERE id IN (
        SELECT verifier_id FROM verification_votes 
        WHERE market_id = NEW.market_id AND vote = true
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 检查是否为管理员
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = auth.uid() AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== 第三部分：创建触发器 ==========

DROP TRIGGER IF EXISTS trigger_auto_settle ON verification_votes;
CREATE TRIGGER trigger_auto_settle
  AFTER INSERT ON verification_votes
  FOR EACH ROW EXECUTE FUNCTION auto_settle_market();

-- ========== 第四部分：配置权限 ==========

GRANT EXECUTE ON FUNCTION get_user_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

-- ========== 第五部分：启用 RLS ==========

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- ========== 第六部分：创建安全策略 ==========

-- 管理员表
DROP POLICY IF EXISTS "管理员可查看管理员表" ON admins;
CREATE POLICY "管理员可查看管理员表" ON admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = auth.uid() AND active = true
    )
  );

-- 验证者表
DROP POLICY IF EXISTS "任何人可查看验证者" ON verifiers;
CREATE POLICY "任何人可查看验证者" ON verifiers
  FOR SELECT USING (true);

-- 验证投票表
DROP POLICY IF EXISTS "任何人可查看验证投票" ON verification_votes;
CREATE POLICY "任何人可查看验证投票" ON verification_votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "验证者可创建投票" ON verification_votes;
CREATE POLICY "验证者可创建投票" ON verification_votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM verifiers 
      WHERE user_id = auth.uid() AND active = true AND id = verifier_id
    )
  );

-- 管理员日志表
DROP POLICY IF EXISTS "管理员可查看日志" ON admin_logs;
CREATE POLICY "管理员可查看日志" ON admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = auth.uid() AND active = true
    )
  );

-- ========== 第七部分：添加 unimaster@gmail.com 为管理员 ==========

INSERT INTO admins (user_id, username, role)
SELECT 
    au.id,
    COALESCE(p.display_name, 'Admin'),
    'super_admin'
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'unimaster@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET active = true, role = 'super_admin';

-- ========== 验证结果 ==========

SELECT 
    '✅ 管理员添加成功！' as status,
    a.id,
    a.username,
    a.role,
    a.active,
    au.email,
    p.display_name,
    a.created_at
FROM admins a
JOIN auth.users au ON a.user_id = au.id
LEFT JOIN profiles p ON a.user_id = p.id
WHERE au.email = 'unimaster@gmail.com';

-- ==========================================
-- 🎉 设置完成！
-- ==========================================
-- 如果看到上面的查询结果显示你的管理员信息，
-- 说明设置成功！现在可以访问：
-- https://policy-prediction-market.vercel.app/admin
-- ==========================================
