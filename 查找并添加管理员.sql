-- ==========================================
-- 查找你的账号并添加为管理员
-- ==========================================

-- 第一步：查看最近注册的用户（找到你的账号）
SELECT 
    au.id,
    au.email,
    au.created_at as 注册时间,
    p.display_name as 昵称,
    p.points as 积分
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 20;

-- ==========================================
-- 👆 看上面的结果，找到你的邮箱对应的记录
-- 如果看到了你的邮箱，继续执行下面的步骤
-- ==========================================

-- 第二步：先确保 admins 表存在（如果已存在会忽略）
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 第三步：添加你为管理员（修改邮箱为你实际的邮箱）
-- 方法1：如果你确认邮箱是 unimaster@gmail.com
INSERT INTO admins (user_id, username, role, active)
SELECT 
    au.id,
    COALESCE(p.display_name, au.email),
    'super_admin',
    true
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'unimaster@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    active = true, 
    role = 'super_admin',
    username = EXCLUDED.username;

-- 如果上面的邮箱不对，使用下面的方法2：
-- 方法2：直接用 user_id 添加（替换成你的实际 user_id）
-- INSERT INTO admins (user_id, username, role, active)
-- VALUES (
--     'your-user-id-here'::uuid,  -- 替换成第一步查到的 id
--     'Admin',
--     'super_admin',
--     true
-- )
-- ON CONFLICT (user_id) 
-- DO UPDATE SET active = true, role = 'super_admin';

-- 第四步：验证是否添加成功
SELECT 
    '✅ 验证结果' as 状态,
    a.id as 管理员ID,
    a.username as 用户名,
    a.role as 角色,
    a.active as 是否激活,
    au.email as 邮箱,
    au.id as 用户ID
FROM admins a
JOIN auth.users au ON a.user_id = au.id
ORDER BY a.created_at DESC;

-- ==========================================
-- 如果第四步能看到你的邮箱，说明成功了！
-- 现在访问：https://policy-prediction-market.vercel.app/admin
-- 如果还是不行，请刷新页面或重新登录
-- ==========================================
