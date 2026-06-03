import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'

export default async function DebugAdminPage() {
  const supabase = await createClient()

  // 检查用户
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  // 尝试查询管理员（带错误处理）
  const { data: admin, error: adminError } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user?.id || '')
    .eq('active', true)
    .single()

  // 查询所有管理员（测试权限）
  const { data: allAdmins, error: allAdminsError } = await supabase
    .from('admins')
    .select('*')

  // 检查表是否存在
  const { data: tableCheck, error: tableError } = await supabase
    .from('admins')
    .select('count')
    .limit(1)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">管理员权限调试</h1>
        
        <div className="space-y-6">
          {/* 用户信息 */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">1. 当前用户</h2>
            {userError && (
              <div className="text-red-500 mb-2">错误: {userError.message}</div>
            )}
            {user ? (
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify({ 
                  id: user.id, 
                  email: user.email,
                  created_at: user.created_at 
                }, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">未登录</p>
            )}
          </div>

          {/* 管理员查询结果 */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">2. 查询你的管理员记录</h2>
            {adminError && (
              <div className="text-red-500 mb-2">
                错误: {adminError.message} (Code: {adminError.code})
              </div>
            )}
            {admin ? (
              <pre className="bg-green-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(admin, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">未找到管理员记录</p>
            )}
          </div>

          {/* 所有管理员 */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">3. 查询所有管理员</h2>
            {allAdminsError && (
              <div className="text-red-500 mb-2">
                错误: {allAdminsError.message} (Code: {allAdminsError.code})
              </div>
            )}
            {allAdmins && allAdmins.length > 0 ? (
              <pre className="bg-blue-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(allAdmins, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">未找到任何管理员</p>
            )}
          </div>

          {/* 表存在性检查 */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">4. admins 表检查</h2>
            {tableError && (
              <div className="text-red-500 mb-2">
                错误: {tableError.message}
              </div>
            )}
            {tableCheck !== null ? (
              <p className="text-green-600">✅ admins 表存在</p>
            ) : (
              <p className="text-red-600">❌ admins 表不存在或无法访问</p>
            )}
          </div>

          {/* SQL 命令 */}
          <div className="border rounded-lg p-4 bg-yellow-50">
            <h2 className="font-semibold mb-2">5. 修复步骤</h2>
            <p className="text-sm mb-2">如果看到权限错误，请在 Supabase SQL Editor 执行：</p>
            <pre className="bg-gray-800 text-white p-3 rounded text-xs overflow-auto">
{`-- 禁用 RLS 或添加公开策略
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 或者创建允许认证用户查看的策略
DROP POLICY IF EXISTS "认证用户可查看管理员" ON admins;
CREATE POLICY "认证用户可查看管理员" ON admins
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 验证
SELECT * FROM admins;`}
            </pre>
          </div>
        </div>
      </main>
    </div>
  )
}
