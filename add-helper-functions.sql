-- 辅助函数：通过邮箱查找用户
-- 这些函数允许前端通过邮箱查询用户信息

-- 1. 创建函数：通过邮箱获取用户信息
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    display_name TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id,
        au.email::TEXT,
        p.display_name
    FROM auth.users au
    LEFT JOIN profiles p ON au.id = p.id
    WHERE au.email = user_email;
END;
$$;

COMMENT ON FUNCTION get_user_by_email IS '通过邮箱查找用户（用于管理员添加验证者）';

-- 2. 创建函数：获取用户邮箱（通过 user_id）
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;
    
    RETURN user_email;
END;
$$;

COMMENT ON FUNCTION get_user_email IS '通过 user_id 获取用户邮箱';

-- 3. 授予执行权限给认证用户
GRANT EXECUTE ON FUNCTION get_user_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

-- 4. 测试函数
-- SELECT * FROM get_user_by_email('unimaster@gmail.com');
