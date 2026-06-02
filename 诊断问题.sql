-- ==========================================
-- 诊断管理员问题
-- ==========================================

-- 步骤 1：检查你的账号是否存在
SELECT 
    '步骤1: 检查账号' as 检查项,
    au.id as 用户ID,
    au.email as 邮箱,
    au.created_at as 注册时间
FROM auth.users au
WHERE au.email = 'unimaster@gmail.com';

-- 如果上面没有结果，说明账号不存在或邮箱不对
-- 请执行下面的查询查看所有用户：
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- 步骤 2：检查 profiles 表
SELECT 
    '步骤2: 检查个人资料' as 检查项,
    p.id as 用户ID,
    p.display_name as 昵称,
    p.points as 积分,
    p.created_at as 创建时间
FROM profiles p
WHERE p.id IN (SELECT id FROM auth.users WHERE email = 'unimaster@gmail.com');

-- 步骤 3：检查 admins 表是否存在
SELECT 
    '步骤3: 检查管理员表' as 检查项,
    COUNT(*) as 管理员总数
FROM admins;

-- 步骤 4：检查你是否是管理员
SELECT 
    '步骤4: 检查你的管理员记录' as 检查项,
    a.id as 管理员ID,
    a.username as 用户名,
    a.role as 角色,
    a.active as 是否激活,
    au.email as 邮箱,
    a.created_at as 添加时间
FROM admins a
JOIN auth.users au ON a.user_id = au.id
WHERE au.email = 'unimaster@gmail.com';

-- 步骤 5：列出所有管理员（如果有的话）
SELECT 
    '步骤5: 所有管理员列表' as 检查项,
    a.username as 用户名,
    au.email as 邮箱,
    a.role as 角色,
    a.active as 是否激活
FROM admins a
JOIN auth.users au ON a.user_id = au.id
ORDER BY a.created_at DESC;

-- ==========================================
-- 根据上面的结果判断：
-- 
-- 如果步骤1没有结果：
--   → 账号不存在或邮箱拼写错误
--   → 需要先注册账号或检查邮箱
--
-- 如果步骤3报错（表不存在）：
--   → 需要先执行 一键设置管理员.sql
--
-- 如果步骤4没有结果：
--   → 账号存在但不是管理员
--   → 需要执行添加管理员的 SQL
-- ==========================================
