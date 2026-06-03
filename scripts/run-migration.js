/**
 * 批量添加市场数据到 Supabase
 * 使用方法: node scripts/run-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// 从环境变量读取配置
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 缺少 Supabase 配置');
  console.error('请在 .env.local 文件中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 100个中国公共政策市场数据
const markets = [
  // 经济政策类 (1-20)
  { title: '2027年中国GDP增速将超过5%', description: '根据国家统计局数据，2027年全年GDP实际增速是否超过5%', category: '经济政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年底人民币兑美元汇率将低于6.5', description: '2026年12月31日人民币兑美元中间价是否低于6.5', category: '经济政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年推出全国性房地产税', description: '2027年底前是否会在全国范围内正式开征房地产税', category: '经济政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年新能源汽车渗透率超过50%', description: '2026年全年新能源汽车销量占乘用车总销量比例是否超过50%', category: '经济政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年个人所得税起征点上调至8000元', description: '2027年底前个税起征点是否上调至8000元/月或更高', category: '经济政策', end_date: '2027-12-31T23:59:59+08:00' },
];
