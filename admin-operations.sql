-- 管理员常用操作 SQL 参考
-- 这些操作也可以通过管理员后台界面完成

-- ========================================
-- 1. 管理员管理
-- ========================================

-- 查看所有管理员
SELECT 
    a.id,
    a.username,
    a.role,
    a.active,
    au.email,
    p.display_name,
    a.created_at,
    a.last_login
FROM admins a
JOIN auth.users au ON a.user_id = au.id
LEFT JOIN profiles p ON a.user_id = p.id
ORDER BY a.created_at DESC;

-- 添加管理员（邮箱：unimaster@gmail.com）
INSERT INTO admins (user_id, username, role)
SELECT 
    au.id,
    COALESCE(p.display_name, 'Admin'),
    'super_admin'
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'unimaster@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- 停用管理员（替换邮箱地址）
UPDATE admins
SET active = false
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'admin-email@example.com'
);

-- 激活管理员（替换邮箱地址）
UPDATE admins
SET active = true
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'admin-email@example.com'
);

-- ========================================
-- 2. 验证者管理
-- ========================================

-- 查看所有验证者
SELECT 
    v.id,
    au.email,
    p.display_name,
    v.reputation,
    v.active,
    v.created_at
FROM verifiers v
JOIN auth.users au ON v.user_id = au.id
LEFT JOIN profiles p ON v.user_id = p.id
ORDER BY v.created_at DESC;

-- 添加验证者（替换邮箱地址）
INSERT INTO verifiers (user_id)
SELECT id FROM auth.users
WHERE email = 'verifier-email@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- 查看验证者的验证记录
SELECT 
    v.user_id,
    au.email,
    COUNT(*) as total_votes,
    SUM(CASE WHEN vv.vote = true THEN 1 ELSE 0 END) as yes_votes,
    SUM(CASE WHEN vv.vote = false THEN 1 ELSE 0 END) as no_votes,
    v.reputation
FROM verifiers v
JOIN auth.users au ON v.user_id = au.id
LEFT JOIN verification_votes vv ON v.id = vv.verifier_id
GROUP BY v.user_id, au.email, v.reputation
ORDER BY total_votes DESC;

-- ========================================
-- 3. 市场管理
-- ========================================

-- 查看所有市场统计
SELECT 
    m.id,
    m.title,
    m.category,
    m.resolved,
    m.outcome,
    m.yes_pool,
    m.no_pool,
    m.yes_pool + m.no_pool as total_pool,
    m.end_date,
    COUNT(b.id) as total_bets,
    p.email as creator_email
FROM markets m
LEFT JOIN bets b ON m.id = b.market_id
LEFT JOIN profiles p ON m.created_by = p.id
GROUP BY m.id, p.email
ORDER BY m.created_at DESC;

-- 查看待结算的市场
SELECT 
    m.id,
    m.title,
    m.end_date,
    m.yes_pool,
    m.no_pool,
    COUNT(b.id) as total_bets
FROM markets m
LEFT JOIN bets b ON m.id = b.market_id
WHERE m.resolved = false
  AND m.end_date < NOW()
GROUP BY m.id
ORDER BY m.end_date;

-- 手动结算市场（替换 market_id 和 outcome）
SELECT settle_market(
    'market-id-here'::uuid,
    true  -- true 表示"是"，false 表示"否"
);

-- 查看某个市场的详细投注情况
SELECT 
    m.title,
    m.yes_pool,
    m.no_pool,
    au.email,
    p.display_name,
    b.position,
    b.amount,
    b.created_at
FROM markets m
JOIN bets b ON m.id = b.market_id
JOIN auth.users au ON b.user_id = au.id
LEFT JOIN profiles p ON b.user_id = p.id
WHERE m.id = 'market-id-here'  -- 替换为实际市场 ID
ORDER BY b.created_at DESC;

-- ========================================
-- 4. 用户管理
-- ========================================

-- 查看用户排行榜（前20名）
SELECT 
    au.email,
    p.display_name,
    p.points,
    COUNT(b.id) as total_bets,
    COALESCE(SUM(b.amount), 0) as total_wagered,
    p.created_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
LEFT JOIN bets b ON p.id = b.user_id
GROUP BY p.id, au.email, p.display_name, p.points, p.created_at
ORDER BY p.points DESC
LIMIT 20;

-- 调整用户积分（增加）
UPDATE profiles
SET points = points + 1000  -- 增加的数量
WHERE id IN (SELECT id FROM auth.users WHERE email = 'unimaster@gmail.com');

-- 调整用户积分（减少）
UPDATE profiles
SET points = GREATEST(points - 500, 0)  -- 减少的数量，确保不小于0
WHERE id IN (SELECT id FROM auth.users WHERE email = 'user-email@example.com');

-- 设置用户积分为指定值
UPDATE profiles
SET points = 5000  -- 新的积分值
WHERE id IN (SELECT id FROM auth.users WHERE email = 'user-email@example.com');

-- 查看用户的所有投注
SELECT 
    au.email,
    p.display_name,
    m.title as market_title,
    b.position,
    b.amount,
    m.resolved,
    m.outcome,
    CASE 
        WHEN m.resolved = false THEN '未结算'
        WHEN m.outcome = b.position THEN '胜利'
        ELSE '失败'
    END as result,
    b.created_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
JOIN bets b ON p.id = b.user_id
JOIN markets m ON b.market_id = m.id
WHERE au.email = 'user-email@example.com'  -- 替换邮箱
ORDER BY b.created_at DESC;

-- ========================================
-- 5. 统计分析
-- ========================================

-- 平台总体统计
SELECT 
    (SELECT COUNT(*) FROM markets) as total_markets,
    (SELECT COUNT(*) FROM markets WHERE resolved = false) as active_markets,
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT SUM(points) FROM profiles) as total_points,
    (SELECT COUNT(*) FROM bets) as total_bets,
    (SELECT SUM(amount) FROM bets) as total_wagered;

-- 各类别市场统计
SELECT 
    category,
    COUNT(*) as market_count,
    SUM(yes_pool + no_pool) as total_pool,
    AVG(yes_pool + no_pool) as avg_pool
FROM markets
GROUP BY category
ORDER BY market_count DESC;

-- 用户活跃度统计
SELECT 
    DATE(created_at) as date,
    COUNT(*) as new_users
FROM profiles
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 投注活跃度统计
SELECT 
    DATE(created_at) as date,
    COUNT(*) as bet_count,
    SUM(amount) as total_amount
FROM bets
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ========================================
-- 6. 操作日志查询
-- ========================================

-- 查看最近的管理员操作
SELECT 
    al.action,
    al.details,
    al.created_at,
    a.username as admin_username,
    au.email as admin_email
FROM admin_logs al
JOIN admins a ON al.admin_id = a.id
JOIN auth.users au ON a.user_id = au.id
ORDER BY al.created_at DESC
LIMIT 50;

-- 按操作类型统计
SELECT 
    action,
    COUNT(*) as count
FROM admin_logs
GROUP BY action
ORDER BY count DESC;

-- 查看特定管理员的操作记录
SELECT 
    al.action,
    al.details,
    al.created_at
FROM admin_logs al
JOIN admins a ON al.admin_id = a.id
JOIN auth.users au ON a.user_id = au.id
WHERE au.email = 'unimaster@gmail.com'
ORDER BY al.created_at DESC;

-- ========================================
-- 7. 数据清理和维护
-- ========================================

-- 查找异常数据：积分为负的用户
SELECT 
    p.id, 
    au.email, 
    p.display_name, 
    p.points
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.points < 0;

-- 查找异常数据：结束日期已过但未结算的市场
SELECT id, title, end_date, yes_pool, no_pool
FROM markets
WHERE resolved = false
  AND end_date < NOW()
ORDER BY end_date;

-- 查找异常数据：没有投注的市场
SELECT m.id, m.title, m.created_at
FROM markets m
LEFT JOIN bets b ON m.id = b.market_id
WHERE b.id IS NULL
ORDER BY m.created_at DESC;

-- 清理测试数据（谨慎使用！）
-- DELETE FROM bets WHERE created_at < '2026-01-01';
-- DELETE FROM markets WHERE created_at < '2026-01-01';

-- ========================================
-- 8. 备份和恢复
-- ========================================

-- 导出所有市场数据
SELECT * FROM markets ORDER BY created_at;

-- 导出所有用户数据
SELECT * FROM profiles ORDER BY created_at;

-- 导出所有投注数据
SELECT * FROM bets ORDER BY created_at;

-- 注意：实际备份请使用 Supabase 的备份功能或 pg_dump
