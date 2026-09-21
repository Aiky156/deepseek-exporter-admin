# DeepSeek Exporter Admin (DSE Admin)

> `ds.aikeyu.cn` 的独立上帝视角后台管理面板。
> 采用 Next.js (App Router) + TypeScript + Tailwind CSS 构建，针对 Vercel 零配置自动化部署设计。

---

## 🌟 设计定位与架构原则

1. **完全隔离**：独立 GitHub 私有仓库、独立 Vercel 部署，不依赖主站的任何登录体系。
2. **纯粹的上帝视角**：直接通过 `service_role` 密钥操作 Supabase 的 `app` schema，无需在数据库建管理员用户或权限表。
3. **极简密码门**：通过 Vercel 环境变量 `ADMIN_PASSWORD` 设防，输入密码后签发加密 session cookie（7 天免密），安全无冗余。
4. **实时联动**：在后台调整用户套餐、标记退款或发布公告，主站前台 API 实时感知并生效。

---

## 🚀 部署指引（Vercel 一键部署）

### 1. 导入仓库
在 [Vercel 控制台](https://vercel.com/dashboard) 点击 **Add New...** -> **Project**，导入 GitHub 仓库 `Aiky156/deepseek-exporter-admin`。

### 2. 配置环境变量 (Environment Variables)
在 Vercel 项目设置中添加以下 4 个环境变量：

| 环境变量名 | 描述 | 示例值 |
|---|---|---|
| `SUPABASE_URL` | Supabase 项目地址（与主站一致） | `https://xxxx.supabase.co` |
| `SUPABASE_SECRET_KEY` | Supabase service_role 密钥（具备全权） | `eyJhbGci...` |
| `ADMIN_PASSWORD` | 管理端网页访问密码（您自定义） | `YourStrongAdminPassword` |
| `COOKIE_SECRET` | Cookie 签名密钥（任意长随机字符串） | `dse_super_secret_cookie_random_key_2026` |

### 3. 点击 Deploy
Vercel 将自动运行 Next.js 构建，1 分钟即可部署完毕获得管理面板独立域名。

---

## 📋 功能特性

### 1. 密码门 (`/login`)
- 仅需输入 `ADMIN_PASSWORD` 即可通行。
- 采用 Web Crypto API 原生 HMAC-SHA256 签名，保护所有页面与 API 路由。

### 2. 数据总览看板 (`/dashboard`)
- 注册用户总数、今日新增注册。
- 付费会员转化率（永久会员 vs 月度会员 vs 免费用户结构条形图）。
- 累计交易流水金额、付款成功率、各状态分布。
- 今日免费用户累计导出量监控。
- 最新下单与最新注册列表。

### 3. 用户与订阅管理 (`/dashboard/users`)
- 用户列表分页、用户名 / 邮箱全文模糊搜索。
- 套餐类型筛选（全部 / 免费 / 月卡 / 永久）。
- **上帝视角套餐调整**：一键将任意用户调整为月卡（支持自定义到期时间或快捷 +30天/+90天/+1年）或永久会员。
- **删除用户安全防护**：对存在交易订单的用户启用防孤儿校验（ON DELETE RESTRICT），避免误删引发审计异常。

### 4. 订单流水与财务管理 (`/dashboard/orders`)
- 全量订单分页列表，支持按商户订单号 (`out_trade_no`) 或渠道交易号 (`trade_no`) 搜索。
- 订单状态筛选：`paid`（已支付）、`pending`（待支付）、`refunded`（已退款）、`cancelled`（已取消）。
- **退款与核销**：一键将订单标记为退款，自动写入 `refunded_at` 时间戳。

### 5. 站内公告与强提醒弹窗 (`/dashboard/announcements`)
- 支持创建、编辑、删除站内公告。
- 支持分类标签：`通告`、`新功能`、`系统更新`、`停机维护`、`福利活动`。
- 支持 `is_popup` 开关：控制是前台普通公告还是用户进入时的强提醒弹窗。

---

## 🛠️ 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置本地环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填入实际配置

# 3. 启动开发服务器
npm run dev
# 浏览器打开 http://localhost:3000
```
