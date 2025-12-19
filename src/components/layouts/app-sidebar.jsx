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
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getTextDirection } from "@/i18n/routing";
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
  role = "agent",
  subscriptionType = "temporary",
  ...props
}) {
  const locale = useLocale();
  const direction = getTextDirection(locale);
  const isRTL = direction === "rtl";
  const tAgent = useTranslations("dashboard.agentSidebar");
  const tMerchant = useTranslations("dashboard.merchantSidebar");
export function AppSidebar({ role: roleProp = "agent", subscriptionType: subscriptionProp = "temporary", ...props }) {
  const locale = useLocale();
  const direction = getTextDirection(locale);
  const isRTL = direction === "rtl";
  const [role, setRole] = React.useState((roleProp || "agent").toLowerCase());
  const [subscriptionType, setSubscriptionType] = React.useState(subscriptionProp || "temporary");

  React.useEffect(() => {
    try {
      const { getCurrentUser, getSubscriptionType } = require("@/lib/auth-utils");
      const user = getCurrentUser();
      if (user && user.role) setRole((user.role || "").toLowerCase());
      const sub = getSubscriptionType();
      if (sub) setSubscriptionType(sub);
    } catch (e) {
      // If auth-utils isn't available (SSR) keep props
    }
  }, []);

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
      title: tAgent("earnings"),
      url: "/agent/earnings",
      icon: DollarSign,
    },
    {
      title: tAgent("statements"),
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
  ];

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
    {
      title: tMerchant("serialCodes"),
      url: "/merchant/serial-codes",
      icon: Hash,
    },
    {
      title: tMerchant("wallet"),
      url: "/merchant/wallet",
      icon: Wallet,
    },
    {
      title: tMerchant("campaigns"),
      url: "/merchant/campaigns",
      icon: Megaphone,
    },
    {
      title: tMerchant("luckydraw"),
      url: "/merchant/lucky-draw",
      icon: Gift,
    },
    // Only show Customer Data for annual subscribers
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
      title: tMerchant("ads"),
      url: "/merchant/ads",
      icon: Settings,
    },
  ];

  const navItems = (role === "agent" || role === "admin") ? agentNav : merchantNav;

  // derive user display info from stored user when available
  let userData = {
    name: role === "agent" ? "Agent Admin" : "Merchant User",
    email: role === "agent" ? "agent@qrscanner.com" : "merchant@qrscanner.com",
    avatar: "/images/avatar.jpg",
  };

  try {
    const { getCurrentUser } = require("@/lib/auth-utils");
    const u = getCurrentUser();
    if (u) {
      userData = {
        name: u.name || u.username || userData.name,
        email: u.email || userData.email,
        avatar: u.avatar || userData.avatar,
      };
    }
  } catch (e) {
    // ignore
  }

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
