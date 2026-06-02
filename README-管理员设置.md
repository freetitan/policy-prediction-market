# 🚀 管理员设置 - 超简单版

## 你只需要做 3 步：

### ✅ 第 1 步：打开 Supabase

访问：https://supabase.com/dashboard/project/peqmnkzptnrhfxqbpecq

点击左侧的 **SQL Editor**

### ✅ 第 2 步：执行 SQL

1. 点击 **"New query"** 
2. 打开项目文件 **`一键设置管理员.sql`**
3. 复制全部内容
4. 粘贴到 SQL Editor
5. 点击 **"Run"** ▶️

### ✅ 第 3 步：访问管理后台

如果看到 "✅ 管理员添加成功！" 的消息，立即访问：

**https://policy-prediction-market.vercel.app/admin**

---

## 🎯 就这么简单！

执行完 SQL 后，你就是超级管理员了！

---

## ❓ 如果遇到问题

### 问题 1：SQL 执行报错
**可能原因**：表已经存在  
**解决方法**：这是正常的，继续执行即可

### 问题 2：看不到管理链接
**解决方法**：
1. 刷新页面 (Ctrl+R 或 F5)
2. 重新登录
3. 清除浏览器缓存

### 问题 3：还是显示"访问被拒绝"
**检查步骤**：
1. 确认 SQL 执行成功（看到 ✅ 消息）
2. 确认你已登录 unimaster@gmail.com 账号
3. 在 Supabase SQL Editor 执行：
```sql
SELECT * FROM admins;
```
查看是否有你的记录

---

## 📁 所有 SQL 文件说明

| 文件名 | 用途 | 是否必须 |
|--------|------|---------|
| **`一键设置管理员.sql`** | **一次搞定所有设置** | **✅ 必须** |
| `create-admin-tables.sql` | 只创建表（不添加管理员） | 可选 |
| `add-helper-functions.sql` | 只创建辅助函数 | 可选 |
| `add-admin.sql` | 只添加管理员 | 可选 |
| `admin-operations.sql` | SQL 操作参考 | 参考 |

**建议：直接使用 `一键设置管理员.sql`，最简单！**

---

## 🎊 成功后你可以做什么

进入管理后台后，你可以：

✅ **市场管理**
- 创建新市场
- 编辑市场
- 手动结算市场

✅ **验证者管理**
- 添加验证者
- 停用/激活验证者
- 查看声誉分数

✅ **用户管理**
- 查看所有用户
- 调整用户积分
- 查看投注记录

✅ **统计数据**
- 查看平台统计
- 实时数据更新

---

## 🔗 重要链接

- **网站首页**: https://policy-prediction-market.vercel.app
- **管理后台**: https://policy-prediction-market.vercel.app/admin
- **验证页面**: https://policy-prediction-market.vercel.app/verify
- **Supabase**: https://supabase.com/dashboard/project/peqmnkzptnrhfxqbpecq

---

## 💡 提示

1. 管理员导航链接带**盾牌图标** 🛡️
2. 所有操作都有日志记录
3. 重要操作需要二次确认
4. 支持手机访问

---

**祝你使用愉快！🎉**
