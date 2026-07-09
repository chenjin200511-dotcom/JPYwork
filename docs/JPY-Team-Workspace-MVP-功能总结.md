# JPY Team Workspace MVP 功能总结

## 1. 这是什么

JPY Team Workspace 是给 JPY 三人跨境电商团队使用的远程运营工作区。

JPY 是团队名称，不是日元，也不是 Japanese Yen。

这个系统不是替代 Shopee、TikTok Shop 或妙手 ERP，而是作为三人团队的“运营指挥台”和“协作层”。它帮助团队把任务、客服、订单、商品刊登、库存、定价、审批、每日简报和操作记录集中管理。

一句话总结：

> 让三个人不用一直靠微信、表格和口头沟通，也能知道今天谁该做什么、哪些事有风险、哪些事需要负责人拍板。

## 2. 它能帮团队解决什么问题

当前系统主要解决这些问题：

1. 今天每个人该做什么。
2. 哪些任务还没完成。
3. 哪些客服消息还没处理。
4. 哪些订单有风险。
5. 哪些商品卡在刊登流程里。
6. 哪些价格需要负责人审批。
7. 哪些库存低于安全线。
8. 哪些事项已经被谁处理过。
9. 为什么某个价格、订单或客服问题这样处理。
10. 每天团队完成了什么，还有什么没完成。

## 3. 已经实现的核心功能

### 3.1 公开首页

公开首页已经保留并升级为 Apple 官网式的简约产品展示页。

已经支持：

- JPY 品牌展示。
- 中文 / 英文切换。
- 语言选择保存。
- 000 到 100 Loading。
- Apple 风格顶部导航。
- 团队登录入口。
- 背景轻微鼠标反应。
- 克制的 hover 动效。

### 3.2 团队登录系统

这是 JPY 自己的网站登录，不是登录 Shopee、TikTok 或妙手。

已经支持：

- 邮箱 + 密码登录。
- httpOnly cookie session。
- 密码 hash 存储。
- session token 只保存 hash。
- 刷新后登录状态保留。
- 退出登录。
- 未登录访问 `/workspace` 时显示登录提示。

默认开发账号：

| 角色 | 邮箱 | 密码 |
| --- | --- | --- |
| 负责人 Owner | owner@team.local | 123456 |
| 运营 Operator | operator@team.local | 123456 |
| 客服与发货 Support | support@team.local | 123456 |

## 4. 工作区已经实现的页面

### 4.1 今日工作台 `/workspace`

用于查看团队当前运营状态。

已经支持：

- 未完成任务数量。
- 逾期任务数量。
- 客服待处理数量。
- 订单风险数量。
- 商品刊登进行中数量。
- 待定价审批数量。
- 待审批数量。
- 库存预警数量。
- 今日简报。
- 最近操作动态。
- 快捷进入各模块。

数据来自数据库，不是静态假数字。

### 4.2 任务中心 `/workspace/tasks`

用于管理团队每天要做的事情。

已经支持：

- 新建任务。
- 搜索任务。
- 按状态筛选。
- 修改任务状态。
- 设置优先级。
- 分配负责人。
- 设置截止时间。
- 查看任务列表。
- 添加内部备注。
- 查看任务 Activity Timeline。
- 保存后刷新仍然存在。

### 4.3 客服协作 `/workspace/messages`

用于把客服消息和售后问题变成可追踪事项。

已经支持：

- 新建客服消息。
- 搜索客服消息。
- 修改处理状态。
- 分配负责人。
- 设置 SLA / 截止时间。
- 标记已解决。
- 升级给负责人。
- 查看回复模板。
- 一键复制模板内容。
- 添加内部备注。
- 查看消息 Activity Timeline。

目前不连接真实 Shopee 消息 API，先作为内部客服协作中心使用。

### 4.4 订单风险 `/workspace/orders`

用于管理订单异常和风险。

已经支持：

- 新建订单。
- 搜索订单。
- 修改订单状态。
- 标记风险等级。
- 分配负责人。
- 创建关联任务。
- 添加内部备注。
- 查看订单 Activity Timeline。
- CSV 导入订单。
- CSV 导出订单。

### 4.5 商品刊登流程 `/workspace/listings`

用于管理团队商品上架前的协作流程。

已经支持：

- 新建商品刊登项。
- 搜索商品。
- 修改刊登状态。
- 分配负责人。
- 设置成本和目标价。
- 创建关联任务。
- 查看商品 Activity Timeline。
- CSV 导入商品。
- CSV 导出商品。

状态包括：

- IDEA
- PRICING
- CONTENT
- INVENTORY_CHECK
- APPROVAL
- READY_TO_PUBLISH
- PUBLISHED
- ERROR

### 4.6 定价系统 `/workspace/pricing`

用于计算商品价格并提交负责人审批。

已经支持：

- 新建定价记录。
- 填写成本结构。
- 自动计算最低不亏价。
- 自动计算建议售价。
- 自动计算活动底价。
- 提交审批。
- 负责人审批。
- 负责人驳回。
- 查看定价状态。
- 查看定价 Activity Timeline。

定价字段包括：

- 商品成本。
- 国内运费。
- 国际物流费。
- 包材成本。
- 平台佣金率。
- 支付手续费率。
- 广告成本。
- 退货损耗率。
- 汇率。
- 税费预留率。
- 目标利润率。

### 4.7 审批中心 `/workspace/approvals`

用于负责人集中处理需要拍板的事项。

已经支持：

- 查看审批列表。
- 新建审批事项。
- 负责人通过审批。
- 负责人驳回审批。
- 审批结果回写关联对象。
- 查看审批 Activity Timeline。

可用于：

- 定价审批。
- 客服升级。
- 订单风险。
- 商品发布。
- 退款 / 补发占位。
- 库存采购占位。

### 4.8 库存与采购提醒 `/workspace/inventory`

用于管理 SKU 库存健康。

已经支持：

- 新建库存项。
- 搜索库存。
- 修改库存状态。
- 记录当前库存。
- 记录在途库存。
- 设置安全库存。
- 低于安全库存自动预警。
- 创建补货任务。
- 查看库存 Activity Timeline。
- CSV 导入库存。
- CSV 导出库存。

状态包括：

- NORMAL
- LOW_STOCK
- OUT_OF_STOCK
- RESTOCK_SUGGESTED
- PAUSED_PROMOTION

### 4.9 每日简报 `/workspace/briefing`

用于减少每天重复沟通。

已经支持：

- 生成今日计划。
- 生成晚间复盘。
- 内容基于数据库数据生成。
- 保存简报。
- 查看历史简报。
- 复制简报内容。

目前不调用真实 AI，先用规则化方式根据当前任务、订单、库存、审批等数据生成。

### 4.10 集成中心 `/workspace/integrations`

用于预留第三方平台接入位置。

已经支持：

- 显示 Shopee、TikTok、妙手、AI、汇率、物流、支付、税务等连接状态。
- 显示 Not Connected / Reserved / Key Required 等状态。
- 测试连接配置。
- 检查缺失的环境变量。
- 不暴露真实密钥。

目前不会真实调用第三方 API。

### 4.11 内容设置 `/workspace/settings/content`

负责人可以集中管理网站内容和主题配置。

已经支持：

- 查看 site 内容配置。
- 查看 workspace 内容配置。
- 查看 theme 配置。
- JSON 编辑器。
- 保存到 ContentVersion 数据表。
- 写入 AuditLog。

只有负责人可以保存。

### 4.12 审计日志 `/workspace/audit`

用于负责人查看关键操作记录。

已经支持：

- 查看登录、创建、更新、审批、内容修改等敏感操作。
- 记录用户、动作、对象、时间、IP、User Agent。
- 过滤敏感字段，避免暴露 password、token、secret 等内容。

## 5. 三个角色分别能做什么

### 5.1 Owner / 负责人

负责人可以：

- 查看全部 Dashboard。
- 查看和管理全部任务。
- 审批定价。
- 审批客服升级、订单风险、商品发布等事项。
- 管理 API 连接状态。
- 编辑内容和主题配置。
- 查看审计日志。
- 查看全部简报和活动记录。

### 5.2 Operator / 运营

运营可以：

- 查看运营相关 Dashboard。
- 创建和更新任务。
- 管理商品刊登流程。
- 管理库存。
- 创建定价并提交审批。
- 查看订单和客服消息。

运营不能：

- 审批定价。
- 查看审计日志。
- 管理敏感内容配置。
- 管理 API 密钥。

### 5.3 Support & Fulfillment / 客服与发货

客服与发货可以：

- 处理客服消息。
- 更新订单状态。
- 创建内部备注。
- 升级问题给负责人。
- 查看分配给自己的任务。
- 创建和更新任务。

客服与发货不能：

- 修改定价。
- 审批事项。
- 管理 API。
- 查看审计日志。
- 管理内容配置。

## 6. 已经实现的后端能力

已经实现：

- 统一 API 返回格式。
- 统一错误处理。
- Zod 参数校验。
- 登录校验。
- RBAC 权限校验。
- Prisma 数据库模型。
- SQLite 本地数据库兜底。
- PostgreSQL schema 预留。
- Prisma seed 演示数据。
- Activity Timeline。
- AuditLog 审计日志。
- CSV 解析。
- CSV 导出。
- 内容版本管理。
- 集成状态检查。

## 7. CSV 导入导出

当前支持：

- Orders 导入 / 导出。
- Listings 导入 / 导出。
- Inventory 导入 / 导出。

导入方式目前是 textarea 粘贴 CSV 内容。

这样即使暂时没有真实 Shopee、TikTok 或妙手 API，团队也可以先通过手动导入数据使用系统。

## 8. 目前只是预留的功能

以下功能已经有结构和入口，但还没有接真实第三方服务：

- Shopee API。
- TikTok Shop API。
- 妙手 ERP API。
- AI 自动回复。
- 汇率 API。
- 支付接口。
- 物流接口。
- 税务接口。

这些现在不会假装已经连接，而是明确显示连接状态和缺失配置。

## 9. 项目怎么运行

进入项目目录：

```bash
cd C:\Users\71954\Desktop\codex\jpy-team-workspace
```

安装依赖：

```bash
npm install
```

本地使用 SQLite：

```bash
npm run db:sqlite:generate
npm run db:sqlite:push
npm run db:sqlite:seed
```

启动项目：

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:3000/
http://127.0.0.1:3000/workspace
```

## 10. 已验证通过的检查

已经通过：

- Prisma PostgreSQL schema validate。
- Prisma SQLite schema validate。
- SQLite generate。
- SQLite push。
- SQLite seed。
- npm test。
- npm run lint。
- npm run build。
- health API。
- 登录 API。
- dashboard API。
- tasks API。
- messages API。
- orders API。
- listings API。
- pricing API。
- approvals API。
- inventory API。
- briefings API。
- integrations API。
- audit API。
- 浏览器打开首页和所有工作区页面。
- 浏览器创建任务。
- 浏览器添加 Activity 备注。
- 权限拦截测试。

## 11. 上线前必须做什么

上线前建议完成：

1. 修改默认账号密码。
2. 接入正式 PostgreSQL。
3. 配置生产环境 `.env`。
4. 配置真实域名和 HTTPS。
5. 接入真实 Shopee / TikTok / 妙手 API。
6. 增加正式用户管理。
7. 增加密码重置。
8. 增加更完整的 E2E 测试。
9. 做数据库备份策略。
10. 做权限和审计安全复查。

## 12. 最终总结

现在这个项目已经不是一个展示页面，也不是一个只有菜单的空后台。

它已经是一个可以登录、可以创建数据、可以修改状态、可以导入导出、可以审批、可以记录操作、可以按角色控制权限的 JPY 团队运营 MVP。

它适合当前阶段先作为三人团队的内部运营工作台使用。

后续真正接入 Shopee、TikTok Shop 和妙手 ERP 后，它可以继续扩展成 JPY 团队自己的跨境电商运营系统。
