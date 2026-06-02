-- 添加管理员账号
-- 使用方法：将 'your-email@example.com' 替换为你的实际邮箱地址，然后在 Supabase SQL Editor 中执行

-- 第一步：找到你的 user_id（可选，用于验证）
SELECT id, email, display_name 
FROM profiles 
WHERE email = 'your-email@example.com';

-- 第二步：添加为管理员（替换邮箱地址）
INSERT INTO admins (user_id, username, role)
SELECT 
    id,
    COALESCE(display_name, 'Admin'),
    'super_admin'
FROM profiles
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- 第三步：验证是否添加成功
SELECT 
    a.id,
    a.username,
    a.role,
    a.active,
    p.email,
    p.display_name
FROM admins a
JOIN profiles p ON a.user_id = p.id
WHERE p.email = 'your-email@example.com';
