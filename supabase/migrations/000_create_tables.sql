-- =============================================
-- 政策预测市场 - 数据库表结构
-- =============================================

-- 用户档案表
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  points INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 预测市场表
CREATE TABLE IF NOT EXISTS public.markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '其他',
  end_date TIMESTAMPTZ NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  outcome BOOLEAN,
  yes_pool INTEGER NOT NULL DEFAULT 0,
  no_pool INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 投注记录表
CREATE TABLE IF NOT EXISTS public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  position BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON public.bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_market_id ON public.bets(market_id);
CREATE INDEX IF NOT EXISTS idx_markets_category ON public.markets(category);
CREATE INDEX IF NOT EXISTS idx_markets_created_at ON public.markets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points DESC);

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- 清理旧策略（避免重复创建失败）
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Markets are viewable by everyone" ON public.markets;
DROP POLICY IF EXISTS "Authenticated users can create markets" ON public.markets;
DROP POLICY IF EXISTS "Users can view all bets" ON public.bets;
DROP POLICY IF EXISTS "Users can create own bets" ON public.bets;

-- 档案策略：所有人可读，只能更新自己
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 市场策略：所有人可读，认证用户可创建
CREATE POLICY "Markets are viewable by everyone" ON public.markets FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create markets" ON public.markets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 投注策略：所有人可读，认证用户可创建自己的投注
CREATE POLICY "Users can view all bets" ON public.bets FOR SELECT USING (TRUE);
CREATE POLICY "Users can create own bets" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 开启实时（可选）
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.markets;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.bets;
