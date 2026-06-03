-- ==========================================
-- 修复管理员权限问题
-- ==========================================
-- 如果你已经添加为管理员，但网站上看不到"管理"链接
-- 或访问 /admin 显示"访问被拒绝"，执行此脚本
-- ==========================================

-- 方案 1：暂时禁用 RLS（最简单，适合测试）
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE verifiers DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs DISABLE ROW LEVEL SECURITY;

-- 方案 2：创建更宽松的策略（推荐用于生产）
-- 如果你想保留 RLS，注释掉上面的，使用下面的：

-- DROP POLICY IF EXISTS "认证用户可查看管理员" ON admins;
-- CREATE POLICY "认证用户可查看管理员" ON admins
--   FOR SELECT USING (auth.uid() IS NOT NULL);

-- DROP POLICY IF EXISTS "管理员可插入日志" ON admin_logs;
-- CREATE POLICY "管理员可插入日志" ON admin_logs
--   FOR INSERT WITH CHECK (
--     EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND active = true)
--   );

-- DROP POLICY IF EXISTS "认证用户可查看验证者" ON verifiers;
-- CREATE POLICY "认证用户可查看验证者" ON verifiers
--   FOR SELECT USING (auth.uid() IS NOT NULL);

-- DROP POLICY IF EXISTS "认证用户可查看投票" ON verification_votes;
-- CREATE POLICY "认证用户可查看投票" ON verification_votes
--   FOR SELECT USING (auth.uid() IS NOT NULL);

-- 验证：查看所有管理员
SELECT 
    a.id,
    a.username,
    a.role,
    a.active,
    au.email,
    a.created_at
FROM admins a
JOIN auth.users au ON a.user_id = au.id
ORDER BY a.created_at DESC;

-- ==========================================
-- 执行完成后：
-- 1. 重新登录网站
-- 2. 刷新页面（Ctrl + F5）
-- 3. 检查导航栏是否显示"管理"链接
-- 4. 访问 /admin 检查是否能进入
-- ==========================================
