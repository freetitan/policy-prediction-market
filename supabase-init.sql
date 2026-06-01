-- ==========================================
-- 政策预测市场 - Supabase 数据库初始化脚本
-- ==========================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 点击左侧 "SQL Editor"
-- 3. 点击 "New query"
-- 4. 复制粘贴此文件全部内容
-- 5. 点击 "Run" 执行
-- ==========================================

-- 1. 创建用户资料表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  points INTEGER DEFAULT 1000 CHECK (points >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS '用户资料表';
COMMENT ON COLUMN profiles.id IS '用户ID，关联 auth.users';
COMMENT ON COLUMN profiles.display_name IS '显示名称';
COMMENT ON COLUMN profiles.points IS '用户积分余额';
COMMENT ON COLUMN profiles.created_at IS '创建时间';

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

COMMENT ON TABLE markets IS '预测市场表';
COMMENT ON COLUMN markets.title IS '市场标题';
COMMENT ON COLUMN markets.description IS '市场描述';
COMMENT ON COLUMN markets.category IS '市场分类';
COMMENT ON COLUMN markets.end_date IS '截止时间';
COMMENT ON COLUMN markets.resolved IS '是否已结算';
COMMENT ON COLUMN markets.outcome IS '结算结果（true=是，false=否）';
COMMENT ON COLUMN markets.yes_pool IS '"是"方向的积分池';
COMMENT ON COLUMN markets.no_pool IS '"否"方向的积分池';

-- 3. 创建投注表
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount >= 10),
  position BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE bets IS '投注记录表';
COMMENT ON COLUMN bets.user_id IS '投注用户ID';
COMMENT ON COLUMN bets.market_id IS '投注市场ID';
COMMENT ON COLUMN bets.amount IS '投注积分数量';
COMMENT ON COLUMN bets.position IS '投注方向（true=是，false=否）';

-- 4. 创建索引提升查询性能
CREATE INDEX idx_markets_category ON markets(category);
CREATE INDEX idx_markets_end_date ON markets(end_date);
CREATE INDEX idx_markets_resolved ON markets(resolved);
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_market_id ON bets(market_id);
CREATE INDEX idx_bets_created_at ON bets(created_at DESC);

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
  v_user_points INTEGER;
BEGIN
  -- 检查市场是否存在
  SELECT resolved, end_date INTO v_market_resolved, v_market_end_date
  FROM markets WHERE id = p_market_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '市场不存在';
  END IF;
  
  -- 检查市场是否已结算
  IF v_market_resolved THEN
    RAISE EXCEPTION '市场已结算，无法投注';
  END IF;
  
  -- 检查市场是否已截止
  IF v_market_end_date < NOW() THEN
    RAISE EXCEPTION '市场已截止，无法投注';
  END IF;
  
  -- 检查投注金额
  IF p_amount < 10 THEN
    RAISE EXCEPTION '最少投注10积分';
  END IF;
  
  -- 检查用户积分是否足够
  SELECT points INTO v_user_points FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '用户不存在';
  END IF;
  
  IF v_user_points < p_amount THEN
    RAISE EXCEPTION '积分不足，当前余额: %', v_user_points;
  END IF;
  
  -- 扣除用户积分
  UPDATE profiles 
  SET points = points - p_amount 
  WHERE id = p_user_id;
  
  -- 更新市场积分池
  IF p_position THEN
    UPDATE markets 
    SET yes_pool = yes_pool + p_amount,
        updated_at = NOW()
    WHERE id = p_market_id;
  ELSE
    UPDATE markets 
    SET no_pool = no_pool + p_amount,
        updated_at = NOW()
    WHERE id = p_market_id;
  END IF;
  
  -- 记录投注
  INSERT INTO bets (user_id, market_id, amount, position)
  VALUES (p_user_id, p_market_id, p_amount, p_position);
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION place_bet IS '投注存储过程：处理用户投注逻辑';

-- 6. 创建新用户自动创建资料的触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, points)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), 1000);
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- 如果用户已存在，忽略错误
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user IS '新用户注册时自动创建资料并赠送1000积分';

-- 7. 启用行级安全（RLS）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- 8. 创建安全策略

-- 市场表策略
DROP POLICY IF EXISTS "任何人可查看市场" ON markets;
CREATE POLICY "任何人可查看市场" ON markets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "认证用户可创建市场" ON markets;
CREATE POLICY "认证用户可创建市场" ON markets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "创建者可更新市场" ON markets;
CREATE POLICY "创建者可更新市场" ON markets
  FOR UPDATE USING (auth.uid() = created_by);

-- 资料表策略
DROP POLICY IF EXISTS "任何人可查看资料" ON profiles;
CREATE POLICY "任何人可查看资料" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "用户可更新自己的资料" ON profiles;
CREATE POLICY "用户可更新自己的资料" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 投注表策略
DROP POLICY IF EXISTS "任何人可查看投注" ON bets;
CREATE POLICY "任何人可查看投注" ON bets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "认证用户可创建投注" ON bets;
CREATE POLICY "认证用户可创建投注" ON bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. 插入示例数据
INSERT INTO markets (title, description, category, end_date) VALUES
('2027年中国是否会实施碳税？', 
 '预测中国是否会在2027年底前正式实施全国性碳税政策。碳税是一种针对二氧化碳排放征收的税收，旨在减少温室气体排放。', 
 '环境政策', 
 '2027-12-31 23:59:59+08'),

('2026年新能源汽车补贴是否延续？', 
 '预测2026年新能源汽车购置补贴政策是否会延续。当前补贴政策将于2025年底到期。', 
 '能源政策', 
 '2026-06-30 23:59:59+08'),

('2027年是否会推行四天工作制试点？', 
 '预测是否会有省份或城市在2027年推行四天工作制试点。四天工作制是指每周工作四天，休息三天的工作模式。', 
 '劳动政策', 
 '2027-12-31 23:59:59+08'),

('2026年房贷利率是否会降至3%以下？', 
 '预测2026年首套房贷款利率是否会降至3%以下。当前首套房贷利率约为3.5%-4%。', 
 '金融政策', 
 '2026-12-31 23:59:59+08'),

('2027年是否会对AI大模型实施许可制？', 
 '预测中国是否会在2027年对大型AI模型实施许可证管理制度，类似于互联网新闻信息服务许可。', 
 '科技政策', 
 '2027-06-30 23:59:59+08'),

('2026年是否会提高个税起征点？', 
 '预测2026年个人所得税起征点是否会从当前的5000元/月提高。', 
 '税收政策', 
 '2026-12-31 23:59:59+08'),

('2027年是否会实施全民免费医疗？', 
 '预测中国是否会在2027年实施全民免费医疗制度，类似于英国NHS模式。', 
 '医疗政策', 
 '2027-12-31 23:59:59+08'),

('2026年是否会取消中考分流？', 
 '预测2026年是否会取消中考后的普职分流政策，实现普通高中教育普及化。', 
 '教育政策', 
 '2026-12-31 23:59:59+08');

-- 10. 创建视图：排行榜
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  id,
  display_name,
  points,
  ROW_NUMBER() OVER (ORDER BY points DESC, created_at ASC) as rank
FROM profiles
ORDER BY points DESC, created_at ASC
LIMIT 100;

COMMENT ON VIEW leaderboard IS '排行榜视图：显示积分前100名用户';

-- 11. 创建视图：市场统计
CREATE OR REPLACE VIEW market_stats AS
SELECT 
  m.id,
  m.title,
  m.category,
  m.yes_pool + m.no_pool as total_pool,
  CASE 
    WHEN (m.yes_pool + m.no_pool) > 0 
    THEN ROUND((m.yes_pool::NUMERIC / (m.yes_pool + m.no_pool) * 100), 1)
    ELSE 50.0
  END as yes_percentage,
  COUNT(b.id) as bet_count,
  COUNT(DISTINCT b.user_id) as unique_bettors
FROM markets m
LEFT JOIN bets b ON m.id = b.market_id
GROUP BY m.id, m.title, m.category, m.yes_pool, m.no_pool;

COMMENT ON VIEW market_stats IS '市场统计视图：显示每个市场的详细统计信息';

-- ==========================================
-- 初始化完成！
-- ==========================================
-- 执行成功后，你应该能看到：
-- ✅ 3个表：profiles, markets, bets
-- ✅ 1个函数：place_bet
-- ✅ 1个触发器：on_auth_user_created
-- ✅ 8条示例市场数据
-- ✅ 2个视图：leaderboard, market_stats
-- ==========================================
