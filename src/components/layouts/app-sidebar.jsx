"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Wallet,
  DollarSign,
  FileText,
  RefreshCw,
  MessageSquare,
  Ticket,
  Hash,
  Megaphone,
  Gift,
  BarChart3,
  Database,
  Settings,
  ShoppingCart,
  Package,
  CheckCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getTextDirection } from "@/i18n/routing";
import { useSession } from "next-auth/react";
import { NavMain } from "@/components/layouts/nav-main";
import { NavUser } from "@/components/layouts/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({
  role: roleProp = "agent",
  subscriptionType: subscriptionProp = "temporary",
  ...props
}) {
  const locale = useLocale();
  const direction = getTextDirection(locale);
  const isRTL = direction === "rtl";
  const tSidebar = useTranslations("sidebar");
  const { data: session } = useSession();
  const user = session?.user;

  // Use user from session for role and subscriptionType
  const role = (user?.role || roleProp || "agent").toLowerCase();
  const subscriptionType =
    user?.subscriptionType || subscriptionProp || "temporary";

  // Agent navigation
  const agentNav = [
    {
      title: tSidebar("agent.dashboard"),
      url: "/agent/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: tSidebar("agent.merchants"),
      url: "/agent/merchants",
      icon: Users,
    },
    {
      title: tSidebar("agent.wallet"),
      url: "/agent/wallet",
      icon: Wallet,
    },
    {
      title: "Ads Packages",
      url: "/agent/packages",
      icon: ShoppingCart,
    },
    {
      title: tSidebar("agent.approvals"),
      url: "/agent/approvals",
      icon: Package,
    },

    // {
    //   title: tSidebar("agent.earnings"),
    //   url: "/agent/earnings",
    //   icon: DollarSign,
    // },
    {
      title: tSidebar("agent.statements"),
      url: "/agent/statements",
      icon: FileText,
    },
    {
      title: tSidebar("agent.couponsync"),
      url: "/agent/coupon-sync",
      icon: RefreshCw,
    },
    {
      title: tSidebar("agent.support"),
      url: "/agent/support",
      icon: MessageSquare,
    },
    {
      title: tSidebar("agent.logs"),
      url: "/agent/logs",
      icon: Search,
    },
  ];

  // Merchant navigation
  const merchantNav = [
    {
      title: tSidebar("merchant.dashboard"),
      url: "/merchant/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: tSidebar("merchant.coupons"),
      url: "/merchant/coupons",
      icon: Ticket,
    },
    /*{
          title: tSidebar("merchant.serialCodes"),
          url: "/merchant/serial-codes",
          icon: Hash,
        },*/
    {
      title: tSidebar("merchant.wallet"),
      url: "/merchant/wallet",
      icon: Wallet,
    },
    {
      title: tSidebar("merchant.purchase"),
      url: "/merchant/purchase",
      icon: ShoppingCart,
    },
    // {
    //   title: tSidebar("merchant.campaigns"),
    //   url: "/merchant/campaigns",
    //   icon: Megaphone,
    // },
    {
      title: tSidebar("merchant.luckyDraw"),
      url: "/merchant/lucky-draw",
      icon: Gift,
    },
    // Annual-only sections
    ...(subscriptionType === "annual"
      ? [
          {
            title: tSidebar("merchant.customerData"),
            url: "/merchant/customer-data",
            icon: Database,
          },
        ]
      : []),

    {
      title: tSidebar("merchant.statements"),
      url: "/merchant/statements",
      icon: FileText,
    },
    {
      title: tSidebar("merchant.support"),
      url: "/merchant/support",
      icon: MessageSquare,
    },
    {
      title: tSidebar("merchant.logs"),
      url: "/merchant/logs",
      icon: Search,
    },
  ];

  // Master Admin navigation
  const masterAdminNav = [
    {
      title: tSidebar("masterAdmin.dashboard"),
      url: "/master-admin/dashboard",
      icon: LayoutDashboard,
    },

    {
      title: tSidebar("masterAdmin.agents"),
      url: "/master-admin/agents",
      icon: Users,
      allowedStaff: ["super_admin"],
    },
    {
      title: tSidebar("masterAdmin.merchants"),
      url: "/master-admin/merchants",
      icon: Users,
      allowedStaff: ["super_admin"],
    },
    {
      title: tSidebar("masterAdmin.staff"),
      url: "/master-admin/staff",
      icon: ShieldCheck,
      allowedStaff: ["super_admin"],
    },
    {
      title: tSidebar("masterAdmin.packages"),
      url: "/master-admin/packages",
      icon: Package,
      allowedStaff: ["super_admin"],
    },
    {
      title: tSidebar("masterAdmin.commission"),
      url: "/master-admin/commission",
      icon: DollarSign,
      allowedStaff: ["super_admin", "finance_viewer"],
    },
    {
      title: tSidebar("masterAdmin.approvals"),
      url: "/master-admin/approvals",
      icon: CheckCircle,
      allowedStaff: ["super_admin", "ad_approver"],
    },
    {
      title: tSidebar("masterAdmin.statements"),
      url: "/master-admin/statements",
      icon: FileText,
      allowedStaff: ["super_admin", "finance_viewer"],
    },
    {
      title: tSidebar("masterAdmin.support"),
      url: "/master-admin/support",
      icon: MessageSquare,
      allowedStaff: ["super_admin", "support_staff"],
    },
    {
      title: tSidebar("masterAdmin.settings"),
      url: "/master-admin/superadmin_settings",
      icon: Settings,
      allowedStaff: ["super_admin"],
    },
    {
      title: tSidebar("masterAdmin.logs"),
      url: "/master-admin/logs",
      icon: Search,
      allowedStaff: ["super_admin"],
    },
  ];

  // Filter masterAdminNav based on staffRole if role is super_admin
  // Normalize staffRole to token format used in routing/permissions (e.g., "support_staff")
  // Prefer explicit staffRole, fall back to user.role when staffRole is not present
  const staffRole = (user?.staffRole || user?.role || "super_admin")
    .toString()
    .toLowerCase();

  const filteredMasterAdminNav = masterAdminNav.filter((item) => {
    if (!item.allowedStaff) return true; // Common items like Dashboard
    // Normalize allowedStaff entries to lowercase tokens for comparison
    const allowed = item.allowedStaff.map((s) => s.toString().toLowerCase());
    return allowed.includes(staffRole) || staffRole === "super_admin";
  });

  const masterStaffRoles = ["support_staff", "ad_approver", "finance_viewer"];

  const navItems =
    role === "super_admin" || masterStaffRoles.includes(role)
      ? filteredMasterAdminNav
      : role === "agent" || role === "admin"
        ? agentNav
        : merchantNav;

  // derive user display info from session when available
  const userData = {
    name:
      user?.name ||
      user?.username ||
      (role === "agent" ? tSidebar("agent.defaultName") : tSidebar("merchant.defaultName")),
    email:
      user?.email ||
      (role === "agent" ? tSidebar("agent.defaultEmail") : tSidebar("merchant.defaultEmail")),
    avatar: user?.avatar || "/images/avatar.jpg",
  };

  return (
    <Sidebar collapsible="icon" side={isRTL ? "right" : "left"} {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <h1 className="text-lg font-semibold">{tSidebar("brand.name")}</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
