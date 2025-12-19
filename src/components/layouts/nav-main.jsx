"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getTextDirection } from "@/i18n/routing";
import { Link } from "@/i18n/routing";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

const getIconColor = (url) => {
  const colorMap = {
    "/dashboard": "text-blue-600",
    "/merchants": "text-green-600",
    "/subscriptions": "text-orange-600",
    "/agents": "text-purple-600",
    "/feedbacks": "text-indigo-600",
    "/coupons": "text-teal-600",
    "/analytics": "text-cyan-600",
    "/settings": "text-gray-600",
  };

  for (const [path, color] of Object.entries(colorMap)) {
    if (url?.startsWith(path)) {
      return color;
    }
  }
  return "text-gray-600";
};

export function NavMain({ items }) {
  const locale = useLocale();
  const direction = getTextDirection(locale);
  const isRTL = direction === "rtl";
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  const rotateClass = isRTL
    ? "group-data-[state=open]/collapsible:rotate-[-90deg]"
    : "group-data-[state=open]/collapsible:rotate-90";
  const tMerchant = useTranslations("dashboard.merchantSidebar");
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{tMerchant("platform")}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (item.items && item.items.length > 0) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && (
                        <item.icon
                          className={`w-4 h-4 ${getIconColor(item.url)}  `}
                        />
                      )}
                      <span>{item.title}</span>
                      <ChevronIcon
                        className={`ml-auto transition-transform duration-200 ${rotateClass}`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }
          // Simple link without sub-items
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild>
                <Link href={item.url}>
                  {item.icon && (
                    <item.icon
                      className={`w-4 h-4 ${getIconColor(item.url)}`}
                    />
                  )}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
