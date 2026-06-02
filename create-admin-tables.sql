-- ==========================================
-- 创建管理员和验证者系统表
-- ==========================================
-- 在 Supabase SQL Editor 中执行此脚本
-- ==========================================

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

COMMENT ON TABLE admins IS '管理员表';
COMMENT ON COLUMN admins.user_id IS '关联的用户ID';
COMMENT ON COLUMN admins.username IS '管理员用户名';
COMMENT ON COLUMN admins.role IS '角色：admin 或 super_admin';
COMMENT ON COLUMN admins.active IS '是否激活';
COMMENT ON COLUMN admins.last_login IS '最后登录时间';

-- 创建索引
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

COMMENT ON TABLE verifiers IS '市场验证者表';
COMMENT ON COLUMN verifiers.user_id IS '关联的用户ID';
COMMENT ON COLUMN verifiers.reputation IS '声誉分数';
COMMENT ON COLUMN verifiers.active IS '是否激活';

-- 创建索引
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

COMMENT ON TABLE verification_votes IS '验证投票记录表';
COMMENT ON COLUMN verification_votes.market_id IS '市场ID';
COMMENT ON COLUMN verification_votes.verifier_id IS '验证者ID';
COMMENT ON COLUMN verification_votes.vote IS '投票结果（true=是，false=否）';
COMMENT ON COLUMN verification_votes.evidence IS '证据链接或说明';
COMMENT ON COLUMN verification_votes.confidence IS '置信度（1-5）';

-- 创建索引
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

COMMENT ON TABLE admin_logs IS '管理员操作日志表';
COMMENT ON COLUMN admin_logs.admin_id IS '操作的管理员ID';
COMMENT ON COLUMN admin_logs.action IS '操作类型';
COMMENT ON COLUMN admin_logs.details IS '操作详情（JSON）';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- 5. 创建市场结算函数
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
  -- 获取市场积分池
  SELECT yes_pool, no_pool INTO v_yes_pool, v_no_pool
  FROM markets WHERE id = p_market_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '市场不存在';
  END IF;
  
  v_total_pool := v_yes_pool + v_no_pool;
  
  -- 确定获胜方的积分池
  IF p_outcome THEN
    v_winning_pool := v_yes_pool;
  ELSE
    v_winning_pool := v_no_pool;
  END IF;
  
  -- 如果获胜方积分池为0，则无需分配
  IF v_winning_pool > 0 THEN
    -- 为所有获胜者分配奖励
    UPDATE profiles p
    SET points = points + FLOOR(
      (b.amount::NUMERIC / v_winning_pool::NUMERIC) * v_total_pool::NUMERIC
    )::INTEGER
    FROM bets b
    WHERE b.user_id = p.id
      AND b.market_id = p_market_id
      AND b.position = p_outcome;
  END IF;
  
  -- 标记市场为已结算
  UPDATE markets
  SET resolved = true,
      outcome = p_outcome,
      updated_at = NOW()
  WHERE id = p_market_id;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION settle_market IS '结算市场并分配奖励';

-- 6. 创建自动结算触发器（当投票达成共识）
CREATE OR REPLACE FUNCTION auto_settle_market()
RETURNS TRIGGER AS $$
DECLARE
  v_yes_votes INTEGER;
  v_no_votes INTEGER;
  v_total_votes INTEGER;
  v_required_votes INTEGER := 3;
BEGIN
  -- 统计该市场的投票
  SELECT 
    COUNT(*) FILTER (WHERE vote = true),
    COUNT(*) FILTER (WHERE vote = false),
    COUNT(*)
  INTO v_yes_votes, v_no_votes, v_total_votes
  FROM verification_votes
  WHERE market_id = NEW.market_id;
  
  -- 检查是否达成共识（至少3票，且其中2票一致）
  IF v_total_votes >= v_required_votes THEN
    IF v_yes_votes >= 2 THEN
      -- "是"方达成共识
      PERFORM settle_market(NEW.market_id, true);
      
      -- 更新验证者声誉
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
      -- "否"方达成共识
      PERFORM settle_market(NEW.market_id, false);
      
      -- 更新验证者声誉
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

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS trigger_auto_settle ON verification_votes;

-- 创建触发器
CREATE TRIGGER trigger_auto_settle
  AFTER INSERT ON verification_votes
  FOR EACH ROW EXECUTE FUNCTION auto_settle_market();

COMMENT ON FUNCTION auto_settle_market IS '当投票达成共识时自动结算市场';

-- 7. 启用行级安全（RLS）
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- 8. 创建安全策略

-- 管理员表策略
DROP POLICY IF EXISTS "管理员可查看管理员表" ON admins;
CREATE POLICY "管理员可查看管理员表" ON admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = auth.uid() AND active = true
    )
  );

-- 验证者表策略
DROP POLICY IF EXISTS "任何人可查看验证者" ON verifiers;
CREATE POLICY "任何人可查看验证者" ON verifiers
  FOR SELECT USING (true);

-- 验证投票表策略
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

-- 管理员日志表策略
DROP POLICY IF EXISTS "管理员可查看日志" ON admin_logs;
CREATE POLICY "管理员可查看日志" ON admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = auth.uid() AND active = true
    )
  );

-- 9. 创建辅助函数：检查是否为管理员
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = auth.uid() AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_admin IS '检查当前用户是否为管理员';

-- ==========================================
-- 创建完成！
-- ==========================================
-- 执行成功后，你应该能看到：
-- ✅ 4个新表：admins, verifiers, verification_votes, admin_logs
-- ✅ 2个新函数：settle_market, auto_settle_market, is_admin
-- ✅ 1个新触发器：trigger_auto_settle
-- ✅ RLS 安全策略已配置
-- ==========================================
