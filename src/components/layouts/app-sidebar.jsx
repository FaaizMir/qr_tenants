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
  const tAgent = useTranslations("dashboard.agentSidebar");
  const tMerchant = useTranslations("dashboard.merchantSidebar");
  const tMasterAdmin = useTranslations("dashboard.masterAdminSidebar");
  const { data: session } = useSession();
  const user = session?.user;

  // Use user from session for role and subscriptionType
  const role = (user?.role || roleProp || "agent").toLowerCase();
  const subscriptionType =
    user?.subscriptionType || subscriptionProp || "temporary";

  // Agent navigation
  const agentNav = [
    {
      title: tAgent("dashboard"),
      url: "/agent/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: tAgent("merchants"),
      url: "/agent/merchants",
      icon: Users,
    },
    {
      title: tAgent("wallet"),
      url: "/agent/wallet",
      icon: Wallet,
    },
    {
      title: "Approvals",
      url: "/agent/approvals",
      icon: Package,
    },

    // {
    //   title: tAgent("earnings"),
    //   url: "/agent/earnings",
    //   icon: DollarSign,
    // },
    {
      title: "Statements",
      url: "/agent/statements",
      icon: FileText,
    },
    {
      title: tAgent("couponsync"),
      url: "/agent/coupon-sync",
      icon: RefreshCw,
    },
    {
      title: tAgent("support"),
      url: "/agent/support",
      icon: MessageSquare,
    },
    {
      title: tAgent("logs"),
      url: "/agent/logs",
      icon: Search,
    },
  ];

  // {
  //   title: tAgent("earnings"),
  //   url: "/agent/earnings",
  //   icon: DollarSign,
  // },
  // {
  //   title: tAgent("statements"),
  //   url: "/agent/statements",
  //   icon: FileText,
  // },
  // {
  //   title: tAgent("couponsync"),
  //   url: "/agent/coupon-sync",
  //   icon: RefreshCw,
  // },
  // {
  //   title: tAgent("support"),
  //   url: "/agent/support",
  //   icon: MessageSquare,
  // },

  // Merchant navigation
  const merchantNav = [
    {
      title: tMerchant("dashboard"),
      url: "/merchant/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: tMerchant("coupons"),
      url: "/merchant/coupons",
      icon: Ticket,
    },
    /*{
          title: tMerchant("serialCodes"),
          url: "/merchant/serial-codes",
          icon: Hash,
        },*/
    {
      title: tMerchant("wallet"),
      url: "/merchant/wallet",
      icon: Wallet,
    },
    {
      title: tMerchant("purchase"),
      url: "/merchant/purchase",
      icon: ShoppingCart,
    },
    // {
    //   title: tMerchant("campaigns"),
    //   url: "/merchant/campaigns",
    //   icon: Megaphone,
    // },
    {
      title: tMerchant("luckydraw"),
      url: "/merchant/lucky-draw",
      icon: Gift,
    },
    // Annual-only sections
    ...(subscriptionType === "annual"
      ? [
          {
            title: "Customer Data",
            url: "/merchant/customer-data",
            icon: Database,
          },
        ]
      : []),

    {
      title: "Statements",
      url: "/merchant/statements",
      icon: FileText,
    },
    {
      title: "Support",
      url: "/merchant/support",
      icon: MessageSquare,
    },
    {
      title: tMerchant("logs"),
      url: "/merchant/logs",
      icon: Search,
    },
  ];

  // Master Admin navigation
  const masterAdminNav = [
    {
      title: tMasterAdmin("dashboard"),
      url: "/master-admin/dashboard",
      icon: LayoutDashboard,
    },

    {
      title: tMasterAdmin("agents"),
      url: "/master-admin/agents",
      icon: Users,
      allowedStaff: ["super_admin"],
    },
    {
      title: tMasterAdmin("merchants"),
      url: "/master-admin/merchants",
      icon: Users,
      allowedStaff: ["super_admin"],
    },
    {
      title: tMasterAdmin("packages"),
      url: "/master-admin/packages",
      icon: Package,
      allowedStaff: ["super_admin"],
    },
    {
      title: tMasterAdmin("commission"),
      url: "/master-admin/commission",
      icon: DollarSign,
      allowedStaff: ["super_admin", "finance_viewer"],
    },
    {
      title: tMasterAdmin("approvals"),
      url: "/master-admin/approvals",
      icon: CheckCircle,
      allowedStaff: ["super_admin", "ad_approver"],
    },
    {
      title: "Statements",
      url: "/master-admin/statements",
      icon: FileText,
      allowedStaff: ["super_admin", "finance_viewer"],
    },
    {
      title: "Support",
      url: "/master-admin/support",
      icon: MessageSquare,
      allowedStaff: ["super_admin", "support_staff"],
    },
    {
      title: tMasterAdmin("settings"),
      url: "/master-admin/superadmin_settings",
      icon: Settings,
    },
    // {
    //   title: tMasterAdmin("commission"),
    //   url: "/master-admin/commission",
    //   icon: DollarSign,
    // },
    // {
    //   title: tMasterAdmin("approvals"),
    //   url: "/master-admin/approvals",
    //   icon: CheckCircle,
    // },
    {
      title: tMasterAdmin("logs"),
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
      (role === "agent" ? "Agent Admin" : "Merchant User"),
    email:
      user?.email ||
      (role === "agent" ? "agent@qrscanner.com" : "merchant@qrscanner.com"),
    avatar: user?.avatar || "/images/avatar.jpg",
  };

  return (
    <Sidebar collapsible="icon" side={isRTL ? "right" : "left"} {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <h1 className="text-lg font-semibold">QR Scanner</h1>
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
