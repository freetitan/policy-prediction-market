-- 创建投注 RPC 函数，保证事务安全
CREATE OR REPLACE FUNCTION place_bet(
  p_user_id UUID,
  p_market_id UUID,
  p_amount INTEGER,
  p_position BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_points INTEGER;
  v_market_resolved BOOLEAN;
  v_market_end_date TIMESTAMPTZ;
BEGIN
  -- 锁定用户行，获取当前积分
  SELECT points INTO v_user_points
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '用户不存在';
  END IF;

  IF v_user_points < p_amount THEN
    RAISE EXCEPTION '积分不足';
  END IF;

  IF p_amount < 10 THEN
    RAISE EXCEPTION '最少投注10积分';
  END IF;

  -- 锁定市场行，检查状态
  SELECT resolved, end_date INTO v_market_resolved, v_market_end_date
  FROM markets
  WHERE id = p_market_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '市场不存在';
  END IF;

  IF v_market_resolved THEN
    RAISE EXCEPTION '该市场已结算';
  END IF;

  IF v_market_end_date < NOW() THEN
    RAISE EXCEPTION '该市场已截止';
  END IF;

  -- 创建投注记录
  INSERT INTO bets (user_id, market_id, amount, position)
  VALUES (p_user_id, p_market_id, p_amount, p_position);

  -- 扣减用户积分
  UPDATE profiles
  SET points = points - p_amount
  WHERE id = p_user_id;

  -- 更新市场奖池
  IF p_position THEN
    UPDATE markets
    SET yes_pool = yes_pool + p_amount, updated_at = NOW()
    WHERE id = p_market_id;
  ELSE
    UPDATE markets
    SET no_pool = no_pool + p_amount, updated_at = NOW()
    WHERE id = p_market_id;
  END IF;
END;
$$;
