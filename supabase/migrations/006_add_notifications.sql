-- 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'market_ending',      -- 市场即将截止
    'market_settled',     -- 市场已结算
    'comment_reply',      -- 评论被回复
    'comment_like',       -- 评论被点赞
    'level_up',           -- 等级提升
    'bet_result',         -- 投注结果
    'system'              -- 系统通知
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,              -- 相关链接
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE NOT read;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- 启用 RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能查看自己的通知
DROP POLICY IF EXISTS "用户可查看自己的通知" ON notifications;
CREATE POLICY "用户可查看自己的通知" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- RLS 策略：用户可以更新自己的通知（标记为已读）
DROP POLICY IF EXISTS "用户可更新自己的通知" ON notifications;
CREATE POLICY "用户可更新自己的通知" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 系统可以插入通知
DROP POLICY IF EXISTS "系统可创建通知" ON notifications;
CREATE POLICY "系统可创建通知" ON notifications
  FOR INSERT WITH CHECK (true);

-- 创建通知辅助函数
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- 触发器：市场结算时通知所有参与者
CREATE OR REPLACE FUNCTION notify_market_settled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 只在市场首次结算时触发
  IF NEW.resolved = true AND (OLD.resolved IS NULL OR OLD.resolved = false) THEN
    -- 通知所有在该市场下注的用户
    INSERT INTO notifications (user_id, type, title, message, link)
    SELECT DISTINCT
      b.user_id,
      'market_settled',
      '市场已结算',
      '您参与的市场"' || NEW.title || '"已结算，查看结果',
      '/market/' || NEW.id::TEXT
    FROM bets b
    WHERE b.market_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_market_settled ON markets;
CREATE TRIGGER trigger_notify_market_settled
  AFTER UPDATE ON markets
  FOR EACH ROW
  EXECUTE FUNCTION notify_market_settled();

-- 触发器：评论被回复时通知
CREATE OR REPLACE FUNCTION notify_comment_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_parent_user_id UUID;
  v_market_title TEXT;
BEGIN
  -- 只处理回复（有parent_id的评论）
  IF NEW.parent_id IS NOT NULL THEN
    -- 获取被回复评论的作者
    SELECT user_id INTO v_parent_user_id
    FROM comments
    WHERE id = NEW.parent_id;
    
    -- 获取市场标题
    SELECT title INTO v_market_title
    FROM markets
    WHERE id = NEW.market_id;
    
    -- 如果被回复的人不是自己，发送通知
    IF v_parent_user_id IS NOT NULL AND v_parent_user_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (
        v_parent_user_id,
        'comment_reply',
        '收到新回复',
        '有人回复了您在"' || v_market_title || '"的评论',
        '/market/' || NEW.market_id::TEXT
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_comment_reply ON comments;
CREATE TRIGGER trigger_notify_comment_reply
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_reply();

-- 触发器：评论被点赞时通知（限制频率避免刷屏）
CREATE OR REPLACE FUNCTION notify_comment_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_comment_user_id UUID;
  v_market_id UUID;
  v_recent_like_count INTEGER;
BEGIN
  -- 获取评论作者和市场ID
  SELECT user_id, market_id INTO v_comment_user_id, v_market_id
  FROM comments
  WHERE id = NEW.comment_id;
  
  -- 如果点赞的人不是评论作者
  IF v_comment_user_id != NEW.user_id THEN
    -- 检查最近10分钟内该评论是否已发送过点赞通知（避免刷屏）
    SELECT COUNT(*) INTO v_recent_like_count
    FROM notifications
    WHERE user_id = v_comment_user_id
      AND type = 'comment_like'
      AND link = '/market/' || v_market_id::TEXT
      AND created_at > NOW() - INTERVAL '10 minutes';
    
    -- 如果最近没有通知，则发送
    IF v_recent_like_count = 0 THEN
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (
        v_comment_user_id,
        'comment_like',
        '评论获得点赞',
        '有人赞了您的评论',
        '/market/' || v_market_id::TEXT
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_comment_like ON comment_likes;
CREATE TRIGGER trigger_notify_comment_like
  AFTER INSERT ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_like();

-- 创建清理旧通知的函数（可通过定时任务调用）
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL
    AND read = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- 获取未读通知数量的函数
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM notifications
  WHERE user_id = p_user_id AND read = false;
  
  RETURN unread_count;
END;
$$;

-- 标记所有通知为已读
CREATE OR REPLACE FUNCTION mark_all_read(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications
  SET read = true
  WHERE user_id = p_user_id AND read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$;

-- 注释
COMMENT ON TABLE notifications IS '用户通知表';
COMMENT ON COLUMN notifications.type IS '通知类型：market_ending, market_settled, comment_reply, comment_like, level_up, bet_result, system';
COMMENT ON FUNCTION create_notification IS '创建新通知';
COMMENT ON FUNCTION cleanup_old_notifications IS '清理旧的已读通知，默认保留30天';
COMMENT ON FUNCTION get_unread_count IS '获取用户未读通知数量';
COMMENT ON FUNCTION mark_all_read IS '标记用户所有通知为已读';
