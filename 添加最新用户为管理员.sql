-- ==========================================
-- 将最新注册的用户添加为管理员
-- （如果你是最近注册的，直接用这个！）
-- ==========================================

-- 确保表存在
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 将最新注册的用户添加为超级管理员
INSERT INTO admins (user_id, username, role, active)
SELECT 
    au.id,
    COALESCE(p.display_name, au.email, 'Admin'),
    'super_admin',
    true
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 1
ON CONFLICT (user_id) 
DO UPDATE SET 
    active = true, 
    role = 'super_admin';

-- 显示结果
SELECT 
    '✅ 已将以下用户添加为超级管理员：' as 状态,
    au.email as 邮箱,
    a.username as 用户名,
    a.role as 角色,
    a.active as 是否激活,
    au.created_at as 注册时间
FROM admins a
JOIN auth.users au ON a.user_id = au.id
ORDER BY a.created_at DESC
LIMIT 1;

-- ==========================================
-- 🎉 完成！
-- 现在刷新页面或重新登录，然后访问：
-- https://policy-prediction-market.vercel.app/admin
-- ==========================================
