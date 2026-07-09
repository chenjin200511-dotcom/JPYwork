// Purpose: Keeps workspace app copy local, bilingual, and out of JSX.
import type { Language } from "@/lib/i18n/dictionary";

export type WorkspaceCopy = (typeof workspaceText)["zh"];

export const workspaceText = {
  en: {
    actions: {
      approve: "Approve",
      copy: "Copy",
      create: "Create",
      downloadCsv: "Export CSV",
      edit: "Update",
      generate: "Generate",
      importCsv: "Import CSV",
      reject: "Reject",
      refresh: "Refresh",
      resolve: "Resolve",
      save: "Save",
      search: "Search",
      send: "Send",
      signOut: "Sign out",
      submit: "Submit",
      test: "Test",
    },
    auth: {
      checking: "Checking team session...",
      home: "Back to public home",
      lockedSubtitle:
        "Open the Team Login panel from the public home and sign in with a JPY team account.",
      lockedTitle: "Please sign in first.",
    },
    common: {
      all: "All",
      createdAt: "Created",
      currentLanguage: "Language",
      currentRole: "Role",
      currentTeam: "Team",
      empty: "No records yet.",
      error: "Request failed.",
      loading: "Loading...",
      ownerOnly: "Owner only",
      reserved: "MVP",
      searchPlaceholder: "Search records",
      status: "Status",
      updatedAt: "Updated",
    },
    dashboard: {
      activity: "Recent activity",
      briefing: "Today briefing",
      heroSubtitle:
        "A live operations console for JPY tasks, customer messages, orders, listings, pricing, inventory, approvals, and integrations.",
      heroTitle: "Workspace overview",
      metrics: {
        inventoryAlerts: "Inventory alerts",
        listingsInProgress: "Listings in progress",
        messagesWaiting: "Messages waiting",
        myTasks: "Open tasks",
        orderRisks: "Order risks",
        overdueTasks: "Overdue tasks",
        pendingApprovals: "Pending approvals",
        pendingPricing: "Pending pricing",
      },
      quickActions: "Daily workflow",
    },
    modules: {
      approvals: {
        subtitle:
          "Review pricing, refunds, escalation, listing, order, and inventory approval requests.",
        title: "Approvals",
      },
      audit: {
        subtitle: "Owner-only log of sensitive workspace operations.",
        title: "Audit log",
      },
      briefing: {
        subtitle: "Generate a morning plan or evening review from live workspace records.",
        title: "Daily briefing",
      },
      content: {
        helper: "Edit JSON carefully. This is versioned content, not code.",
        subtitle: "Owner-only public site, workspace, and theme configuration.",
        title: "Content settings",
      },
      system: {
        subtitle: "Owner-only AI, webhook, notification, and runtime health controls.",
        title: "System configuration",
      },
      integrations: {
        subtitle:
          "Reserved connection states for Shopee, TikTok, Miaoshou, finance, logistics, and tax.",
        title: "Integrations",
      },
      inventory: {
        subtitle: "Track stock health, incoming quantity, safety stock, and restock tasks.",
        title: "Inventory",
      },
      listings: {
        subtitle:
          "Move product ideas through pricing, content, inventory check, approval, and publishing.",
        title: "Listings",
      },
      messages: {
        subtitle:
          "Turn Shopee customer conversations and after-sales issues into tracked work.",
        title: "Messages",
      },
      orders: {
        subtitle:
          "Manage order risk, pending shipment, logistics, after-sales, and profit snapshots.",
        title: "Orders",
      },
      pricing: {
        subtitle: "Calculate price floors, submit pricing changes, and route approvals to the owner.",
        title: "Pricing",
      },
      tasks: {
        subtitle: "Assign, prioritize, and close operational tasks across the three-person team.",
        title: "Tasks",
      },
    },
    nav: {
      approvals: "Approvals",
      audit: "Audit",
      briefing: "Briefing",
      content: "Content",
      dashboard: "Dashboard",
      integrations: "Integrations",
      system: "System",
      inventory: "Inventory",
      listings: "Listings",
      messages: "Messages",
      orders: "Orders",
      pricing: "Pricing",
      tasks: "Tasks",
    },
    roles: {
      OPERATOR: "Operator",
      OWNER: "Owner",
      SUPPORT: "Support & Fulfillment",
    },
  },
  zh: {
    actions: {
      approve: "审批通过",
      copy: "复制",
      create: "创建",
      downloadCsv: "导出 CSV",
      edit: "更新",
      generate: "生成简报",
      importCsv: "导入 CSV",
      reject: "驳回",
      refresh: "刷新",
      resolve: "标记已解决",
      save: "保存",
      search: "搜索",
      send: "发送",
      signOut: "退出登录",
      submit: "提交审批",
      test: "测试连接",
    },
    auth: {
      checking: "正在检查团队会话...",
      home: "返回公开首页",
      lockedSubtitle: "请从公开首页打开团队登录面板，使用 JPY 团队账号登录。",
      lockedTitle: "请先登录。",
    },
    common: {
      all: "全部",
      createdAt: "创建时间",
      currentLanguage: "当前语言",
      currentRole: "当前角色",
      currentTeam: "当前团队",
      empty: "暂无记录。",
      error: "请求失败。",
      loading: "加载中...",
      ownerOnly: "仅负责人",
      reserved: "可用版",
      searchPlaceholder: "搜索记录",
      status: "状态",
      updatedAt: "更新时间",
    },
    dashboard: {
      activity: "最近动态",
      briefing: "今日简报",
      heroSubtitle:
        "用于 JPY 任务、客服消息、订单风险、商品刊登、定价、库存、审批和集成状态的实时运营控制台。",
      heroTitle: "工作区总览",
      metrics: {
        inventoryAlerts: "库存预警",
        listingsInProgress: "刊登进行中",
        messagesWaiting: "客服待处理",
        myTasks: "未完成任务",
        orderRisks: "订单风险",
        overdueTasks: "逾期任务",
        pendingApprovals: "待审批",
        pendingPricing: "待定价审批",
      },
      quickActions: "日常工作流",
    },
    modules: {
      approvals: {
        subtitle: "集中处理定价、退款、补发、客服升级、订单风险、商品发布和库存采购审批。",
        title: "审批中心",
      },
      audit: {
        subtitle: "负责人查看登录、创建、更新、审批和内容修改等关键操作记录。",
        title: "审计日志",
      },
      briefing: {
        subtitle: "基于真实工作区数据生成今日计划或晚间复盘，减少重复沟通。",
        title: "每日简报",
      },
      content: {
        helper: "请谨慎编辑 JSON。这里保存的是版本化内容配置，不是代码。",
        subtitle: "负责人集中配置公开首页、工作区文案和主题参数。",
        title: "内容设置",
      },
      system: {
        subtitle: "负责人查看 AI、Webhook、通知和运行时健康状态，不在页面暴露任何密钥。",
        title: "系统配置",
      },
      integrations: {
        subtitle: "预留 Shopee、TikTok Shop、妙手 ERP、AI、财务、物流和税务连接状态。",
        title: "集成中心",
      },
      inventory: {
        subtitle: "跟踪 SKU 库存健康、在途数量、安全库存和补货任务。",
        title: "库存与采购提醒",
      },
      listings: {
        subtitle: "把商品从选品想法推进到定价、内容、库存检查、审批和发布。",
        title: "商品刊登流程",
      },
      messages: {
        subtitle: "把 Shopee 客服会话和售后问题沉淀成可追踪的协作事项。",
        title: "客服协作中心",
      },
      orders: {
        subtitle: "集中处理待发货、物流异常、售后、低利润和其他风险订单。",
        title: "订单风险中心",
      },
      pricing: {
        subtitle: "计算价格底线和建议售价，提交负责人审批后执行。",
        title: "定价审批系统",
      },
      tasks: {
        subtitle: "分配、排序并关闭三人团队每天要处理的运营任务。",
        title: "任务中心",
      },
    },
    nav: {
      approvals: "审批",
      audit: "审计",
      briefing: "简报",
      content: "内容",
      dashboard: "总览",
      integrations: "集成",
      system: "系统",
      inventory: "库存",
      listings: "刊登",
      messages: "客服",
      orders: "订单",
      pricing: "定价",
      tasks: "任务",
    },
    roles: {
      OPERATOR: "运营",
      OWNER: "负责人",
      SUPPORT: "客服与发货",
    },
  },
} satisfies Record<Language, object>;
