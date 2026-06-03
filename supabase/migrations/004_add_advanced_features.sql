-- =============================================
-- 高级预测市场功能 - Metaculus风格
-- =============================================

-- 1. 添加预测历史追踪表
CREATE TABLE IF NOT EXISTS public.prediction_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  yes_probability DECIMAL(5,4) NOT NULL CHECK (yes_probability >= 0 AND yes_probability <= 1),
  total_volume INTEGER NOT NULL DEFAULT 0,
  unique_predictors INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_prediction_snapshots_market_time 
ON public.prediction_snapshots(market_id, created_at DESC);

-- 2. 扩展用户档案表，添加信誉系统字段
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS prediction_score DECIMAL(6,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_predictions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS correct_predictions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS accuracy_rate DECIMAL(5,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rank_tier TEXT DEFAULT 'novice' CHECK (rank_tier IN ('novice', 'intermediate', 'advanced', 'expert', 'super_forecaster'));

-- 添加索引用于排行榜
CREATE INDEX IF NOT EXISTS idx_profiles_prediction_score 
ON public.profiles(prediction_score DESC);

-- 3. 创建预测记录详情表（用于计算准确度）
CREATE TABLE IF NOT EXISTS public.prediction_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  predicted_outcome BOOLEAN NOT NULL,
  confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0.5 AND confidence <= 1),
  points_wagered INTEGER NOT NULL,
  points_won INTEGER DEFAULT 0,
  is_correct BOOLEAN,
  brier_score DECIMAL(6,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_prediction_records_user 
ON public.prediction_records(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prediction_records_market 
ON public.prediction_records(market_id);

-- 4. 创建市场统计视图
CREATE OR REPLACE VIEW public.market_statistics AS
SELECT 
  m.id,
  m.title,
  m.category,
  m.end_date,
  m.resolved,
  m.yes_pool,
  m.no_pool,
  (m.yes_pool + m.no_pool) AS total_volume,
  CASE 
    WHEN (m.yes_pool + m.no_pool) = 0 THEN 0.5
    ELSE ROUND(m.yes_pool::DECIMAL / NULLIF(m.yes_pool + m.no_pool, 0), 4)
  END AS yes_probability,
  COUNT(DISTINCT b.user_id) AS unique_predictors,
  COUNT(b.id) AS total_bets
FROM public.markets m
LEFT JOIN public.bets b ON m.id = b.market_id
GROUP BY m.id;

-- 5. 创建用户统计视图
CREATE OR REPLACE VIEW public.user_statistics AS
SELECT 
  p.id,
  p.display_name,
  p.points,
  p.prediction_score,
  p.total_predictions,
  p.correct_predictions,
  p.accuracy_rate,
  p.rank_tier,
  COUNT(DISTINCT b.market_id) AS markets_participated,
  COALESCE(SUM(b.amount), 0) AS total_wagered,
  RANK() OVER (ORDER BY p.prediction_score DESC) AS leaderboard_rank
FROM public.profiles p
LEFT JOIN public.bets b ON p.id = b.user_id
GROUP BY p.id;

-- 6. 创建函数：更新预测快照
CREATE OR REPLACE FUNCTION update_prediction_snapshot(p_market_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_yes_pool INTEGER;
  v_no_pool INTEGER;
  v_yes_prob DECIMAL(5,4);
  v_unique_predictors INTEGER;
  v_total_volume INTEGER;
BEGIN
  -- 获取市场当前状态
  SELECT yes_pool, no_pool INTO v_yes_pool, v_no_pool
  FROM markets WHERE id = p_market_id;
  
  v_total_volume := v_yes_pool + v_no_pool;
  
  -- 计算概率
  IF v_total_volume = 0 THEN
    v_yes_prob := 0.5;
  ELSE
    v_yes_prob := v_yes_pool::DECIMAL / v_total_volume;
  END IF;
  
  -- 获取独立预测者数量
  SELECT COUNT(DISTINCT user_id) INTO v_unique_predictors
  FROM bets WHERE market_id = p_market_id;
  
  -- 插入快照
  INSERT INTO prediction_snapshots (market_id, yes_probability, total_volume, unique_predictors)
  VALUES (p_market_id, v_yes_prob, v_total_volume, v_unique_predictors);
END;
$$;

-- 7. 创建函数：计算Brier分数
CREATE OR REPLACE FUNCTION calculate_brier_score(
  p_predicted_probability DECIMAL,
  p_actual_outcome BOOLEAN
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Brier分数 = (预测概率 - 实际结果)^2
  -- 实际结果: TRUE=1, FALSE=0
  -- 分数越低越好
  RETURN POWER(p_predicted_probability - CASE WHEN p_actual_outcome THEN 1 ELSE 0 END, 2);
END;
$$;

-- 8. 创建函数：更新用户信誉分数
CREATE OR REPLACE FUNCTION update_user_reputation(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_predictions INTEGER;
  v_correct_predictions INTEGER;
  v_accuracy_rate DECIMAL(5,4);
  v_avg_brier_score DECIMAL(6,4);
  v_prediction_score DECIMAL(6,2);
  v_rank_tier TEXT;
BEGIN
  -- 统计预测记录
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE is_correct = TRUE),
    COALESCE(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END), 0),
    COALESCE(AVG(brier_score), 0.5)
  INTO v_total_predictions, v_correct_predictions, v_accuracy_rate, v_avg_brier_score
  FROM prediction_records
  WHERE user_id = p_user_id AND resolved_at IS NOT NULL;
  
  -- 计算综合分数 (基于准确率和Brier分数)
  -- 分数范围: 0-100
  IF v_total_predictions > 0 THEN
    v_prediction_score := (v_accuracy_rate * 50) + ((1 - v_avg_brier_score) * 50);
  ELSE
    v_prediction_score := 0;
  END IF;
  
  -- 确定等级
  IF v_prediction_score >= 90 AND v_total_predictions >= 100 THEN
    v_rank_tier := 'super_forecaster';
  ELSIF v_prediction_score >= 75 AND v_total_predictions >= 50 THEN
    v_rank_tier := 'expert';
  ELSIF v_prediction_score >= 60 AND v_total_predictions >= 20 THEN
    v_rank_tier := 'advanced';
  ELSIF v_prediction_score >= 45 AND v_total_predictions >= 10 THEN
    v_rank_tier := 'intermediate';
  ELSE
    v_rank_tier := 'novice';
  END IF;
  
  -- 更新用户档案
  UPDATE profiles SET
    prediction_score = v_prediction_score,
    total_predictions = v_total_predictions,
    correct_predictions = v_correct_predictions,
    accuracy_rate = v_accuracy_rate,
    rank_tier = v_rank_tier
  WHERE id = p_user_id;
END;
$$;

-- 9. 启用RLS
ALTER TABLE public.prediction_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_records ENABLE ROW LEVEL SECURITY;

-- 清理旧策略
DROP POLICY IF EXISTS "Prediction snapshots are viewable by everyone" ON public.prediction_snapshots;
DROP POLICY IF EXISTS "Prediction records are viewable by everyone" ON public.prediction_records;
DROP POLICY IF EXISTS "Users can view own prediction records" ON public.prediction_records;

-- 快照策略：所有人可读
CREATE POLICY "Prediction snapshots are viewable by everyone" 
ON public.prediction_snapshots FOR SELECT USING (TRUE);

-- 预测记录策略：所有人可读统计，只能看自己详情
CREATE POLICY "Prediction records are viewable by everyone" 
ON public.prediction_records FOR SELECT USING (TRUE);

-- 10. 添加触发器：下注后自动更新快照
CREATE OR REPLACE FUNCTION trigger_update_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM update_prediction_snapshot(NEW.market_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_bet_update_snapshot ON public.bets;
CREATE TRIGGER after_bet_update_snapshot
AFTER INSERT ON public.bets
FOR EACH ROW
EXECUTE FUNCTION trigger_update_snapshot();

-- 11. 初始化现有市场的快照
INSERT INTO prediction_snapshots (market_id, yes_probability, total_volume, unique_predictors)
SELECT 
  m.id,
  CASE 
    WHEN (m.yes_pool + m.no_pool) = 0 THEN 0.5
    ELSE m.yes_pool::DECIMAL / NULLIF(m.yes_pool + m.no_pool, 0)
  END,
  m.yes_pool + m.no_pool,
  COUNT(DISTINCT b.user_id)
FROM markets m
LEFT JOIN bets b ON m.id = b.market_id
GROUP BY m.id, m.yes_pool, m.no_pool
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.prediction_snapshots IS '预测快照表 - 记录市场概率随时间的变化';
COMMENT ON TABLE public.prediction_records IS '预测记录表 - 用于计算用户预测准确度和Brier分数';
COMMENT ON VIEW public.market_statistics IS '市场统计视图 - 聚合市场的实时统计数据';
COMMENT ON VIEW public.user_statistics IS '用户统计视图 - 聚合用户的表现指标';
