-- 添加管理员账号
-- 邮箱：unimaster@gmail.com

-- 第一步：找到你的 user_id（可选，用于验证）
SELECT 
    au.id,
    au.email,
    p.display_name
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'unimaster@gmail.com';

-- 第二步：添加为管理员
INSERT INTO admins (user_id, username, role)
SELECT 
    au.id,
    COALESCE(p.display_name, 'Admin'),
    'super_admin'
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'unimaster@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- 第三步：验证是否添加成功
SELECT 
    a.id,
    a.username,
    a.role,
    a.active,
    au.email,
    p.display_name,
    a.created_at
FROM admins a
JOIN auth.users au ON a.user_id = au.id
LEFT JOIN profiles p ON a.user_id = p.id
WHERE au.email = 'unimaster@gmail.com';
