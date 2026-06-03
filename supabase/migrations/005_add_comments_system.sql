-- =============================================
-- 评论系统 - Comments System
-- =============================================

-- 1. 创建评论表
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 5000),
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. 创建评论点赞表
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_comments_market_id ON public.comments(market_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- 4. 启用RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- 清理旧策略
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Comment likes are viewable by everyone" ON public.comment_likes;
DROP POLICY IF EXISTS "Authenticated users can like comments" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can remove own likes" ON public.comment_likes;

-- 5. 评论策略：所有人可读，认证用户可创建
CREATE POLICY "Comments are viewable by everyone" 
ON public.comments FOR SELECT 
USING (NOT is_deleted OR user_id = auth.uid());

CREATE POLICY "Authenticated users can create comments" 
ON public.comments FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own comments" 
ON public.comments FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
ON public.comments FOR DELETE 
USING (auth.uid() = user_id);

-- 6. 点赞策略
CREATE POLICY "Comment likes are viewable by everyone" 
ON public.comment_likes FOR SELECT 
USING (TRUE);

CREATE POLICY "Authenticated users can like comments" 
ON public.comment_likes FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can remove own likes" 
ON public.comment_likes FOR DELETE 
USING (auth.uid() = user_id);

-- 7. 创建函数：更新评论的点赞数
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments 
    SET likes_count = GREATEST(0, likes_count - 1) 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 8. 创建触发器：点赞后自动更新计数
DROP TRIGGER IF EXISTS trigger_update_comment_likes_count ON public.comment_likes;
CREATE TRIGGER trigger_update_comment_likes_count
AFTER INSERT OR DELETE ON public.comment_likes
FOR EACH ROW
EXECUTE FUNCTION update_comment_likes_count();

-- 9. 创建函数：更新评论的编辑时间
CREATE OR REPLACE FUNCTION update_comment_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.is_edited = TRUE;
  RETURN NEW;
END;
$$;

-- 10. 创建触发器：编辑评论时自动更新时间
DROP TRIGGER IF EXISTS trigger_update_comment_updated_at ON public.comments;
CREATE TRIGGER trigger_update_comment_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
WHEN (OLD.content IS DISTINCT FROM NEW.content)
EXECUTE FUNCTION update_comment_updated_at();

-- 11. 创建视图：评论详情（包含用户信息和点赞状态）
CREATE OR REPLACE VIEW public.comments_with_details AS
SELECT 
  c.id,
  c.market_id,
  c.user_id,
  c.parent_id,
  c.content,
  c.likes_count,
  c.created_at,
  c.updated_at,
  c.is_edited,
  c.is_deleted,
  p.display_name as user_display_name,
  p.rank_tier as user_rank_tier,
  p.prediction_score as user_prediction_score,
  (SELECT COUNT(*) FROM comments WHERE parent_id = c.id AND NOT is_deleted) as reply_count
FROM comments c
LEFT JOIN profiles p ON c.user_id = p.id
WHERE NOT c.is_deleted;

-- 12. 创建函数：软删除评论
CREATE OR REPLACE FUNCTION soft_delete_comment(p_comment_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE comments 
  SET is_deleted = TRUE, content = '[已删除]'
  WHERE id = p_comment_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- 13. 创建函数：获取评论树（包含回复）
CREATE OR REPLACE FUNCTION get_comment_tree(p_market_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  market_id UUID,
  user_id UUID,
  parent_id UUID,
  content TEXT,
  likes_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_edited BOOLEAN,
  user_display_name TEXT,
  user_rank_tier TEXT,
  user_prediction_score DECIMAL(6,2),
  reply_count BIGINT,
  depth INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE comment_tree AS (
    -- 顶级评论（没有父评论）
    SELECT 
      c.*,
      0 as depth
    FROM comments_with_details c
    WHERE c.market_id = p_market_id AND c.parent_id IS NULL
    
    UNION ALL
    
    -- 递归获取回复
    SELECT 
      c.*,
      ct.depth + 1
    FROM comments_with_details c
    INNER JOIN comment_tree ct ON c.parent_id = ct.id
    WHERE ct.depth < 3  -- 最多3层嵌套
  )
  SELECT * FROM comment_tree
  ORDER BY depth, created_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON TABLE public.comments IS '评论表 - 用户对市场的评论和讨论';
COMMENT ON TABLE public.comment_likes IS '评论点赞表 - 记录用户对评论的点赞';
COMMENT ON VIEW public.comments_with_details IS '评论详情视图 - 包含用户信息和回复数';
