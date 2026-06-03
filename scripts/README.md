# 添加100个中国公共政策市场数据

## 方法1: 使用Supabase Dashboard（推荐）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单 **SQL Editor**
4. 创建新查询
5. 复制 `supabase/migrations/003_add_china_policy_markets.sql` 文件的全部内容
6. 粘贴到编辑器
7. 点击 **Run** 执行

## 方法2: 使用脚本自动推送

### 前置条件

确保 `.env.local` 文件存在并包含以下配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 执行步骤

```bash
# 安装依赖（如果还没安装）
pnpm install

# 运行脚本
node scripts/add-markets.js
```

## 数据内容

脚本将添加100个中国公共政策预测市场，分类如下：

- **经济政策** (20个): GDP增速、汇率、房地产税、新能源车等
- **科技创新** (15个): 载人登月、6G、量子计算、光刻机、AI等
- **教育政策** (15个): 高考改革、义务教育、学费、AI课程等
- **医疗健康** (15个): 医保改革、互联网医疗、罕见病药等
- **环境能源** (15个): 碳达峰、可再生能源、核电、垃圾分类等
- **社会治理** (15个): 个人破产、延迟退休、三孩政策等
- **文化数字** (5个): 游戏版号、短视频、国产电影等

所有市场事件截止时间设置在2026-2027年。
