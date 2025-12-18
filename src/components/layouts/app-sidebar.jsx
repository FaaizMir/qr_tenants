"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Store,
  MessageSquare,
  Ticket,
  BarChart3,
  Settings,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
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

export function AppSidebar({ ...props }) {
  const t = useTranslations("common");
  const tSidebar = useTranslations("sidebar");
  const locale = useLocale();
  const direction = getTextDirection(locale);
  const isRTL = direction === "rtl";

  const data = {
    user: {
      name: "Super Admin",
      email: "admin@qrscanner.com",
      avatar: "/images/avatar.jpg",
    },
    navMain: [
      {
        title: t("dashboard"),
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: t("merchants"),
        url: "/merchants",
        icon: Users,
        items: [
          {
            title: tSidebar("allMerchants"),
            url: "/merchants",
          },
          {
            title: tSidebar("addMerchant"),
            url: "/merchants/create",
          },
          {
            title: tSidebar("merchantReports"),
            url: "/merchants/reports",
          },
        ],
      },
      {
        title: t("subscriptions"),
        url: "/subscriptions",
        icon: CreditCard,
        items: [
          {
            title: tSidebar("allSubscriptions"),
            url: "/subscriptions",
          },
          {
            title: tSidebar("activePlans"),
            url: "/subscriptions/active",
          },
          {
            title: tSidebar("paymentHistory"),
            url: "/subscriptions/payments",
          },
        ],
      },
      {
        title: t("whiteLabelAgents"),
        url: "/agents",
        icon: Store,
        items: [
          {
            title: tSidebar("allAgents"),
            url: "/agents",
          },
          {
            title: tSidebar("addAgent") || "Add Agent",
            url: "/agents/create",
          },
          {
            title: tSidebar("agentPoints"),
            url: "/agents/points",
          },
          {
            title: tSidebar("agentReports"),
            url: "/agents/reports",
          },
        ],
      },
      {
        title: t("feedbacks"),
        url: "/feedbacks",
        icon: MessageSquare,
        items: [
          {
            title: tSidebar("allFeedbacks"),
            url: "/feedbacks",
          },
          {
            title: tSidebar("pendingReview"),
            url: "/feedbacks/pending",
          },
          {
            title: tSidebar("feedbackAnalytics"),
            url: "/feedbacks/analytics",
          },
        ],
      },
      {
        title: t("coupons"),
        url: "/coupons",
        icon: Ticket,
        items: [
          {
            title: tSidebar("allCoupons"),
            url: "/coupons",
          },
          {
            title: tSidebar("redeemedCoupons"),
            url: "/coupons/redeemed",
          },
          {
            title: tSidebar("couponAnalytics"),
            url: "/coupons/analytics",
          },
        ],
      },
      {
        title: t("analytics"),
        url: "/analytics",
        icon: BarChart3,
        items: [
          {
            title: tSidebar("revenueAnalytics"),
            url: "/analytics/revenue",
          },
          {
            title: tSidebar("userAnalytics"),
            url: "/analytics/users",
          },
          {
            title: tSidebar("feedbackAnalytics"),
            url: "/analytics/feedbacks",
          },
        ],
      },
      {
        title: t("settings"),
        url: "/settings",
        icon: Settings,
        items: [
          {
            title: tSidebar("generalSettings"),
            url: "/settings/general",
          },
          {
            title: tSidebar("paymentSettings"),
            url: "/settings/payments",
          },
          {
            title: tSidebar("systemSettings"),
            url: "/settings/system",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" side={isRTL ? "right" : "left"} {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <h1 className="text-lg font-semibold">QR</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
