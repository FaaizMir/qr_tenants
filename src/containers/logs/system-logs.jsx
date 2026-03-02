"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/common/data-table";
import { getLogColumns } from "./logs-columns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, RefreshCcw } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export default function SystemLogsContainer({
  scope = "master-admin",
  merchantId,
  agentId,
}) {
  const t = useTranslations("systemLogs");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [logType, setLogType] = useState("");
  const [date, setDate] = useState(null);

  const { data: session } = useSession();
  const user = session?.user;
  const merchantSubscriptionType = user?.subscriptionType
    ?.toString?.()
    .toLowerCase();
  const userRole =
    user?.role?.toString?.().toLowerCase() ||
    user?.admin_role?.toString?.().toLowerCase() ||
    "";
  const isAdminOrSuper = userRole === "admin" || userRole === "super_admin";

  const LOG_TYPES = useMemo(() => ({
    "master-admin": [
      { label: t("logTypes.masterAdmin.allPlatformActivity"), value: "all" },
      { label: t("logTypes.masterAdmin.authenticationEvents"), value: "auth", category: "auth" },
      { label: t("logTypes.masterAdmin.agentActivities"), value: "agent", category: "agent" },
      { label: t("logTypes.masterAdmin.merchantActivities"), value: "merchant", category: "merchant" },
      { label: t("logTypes.masterAdmin.criticalErrors"), value: "critical", level: "critical" },
      { label: t("logTypes.masterAdmin.couponOperations"), value: "coupon", category: "coupon" },
      {
        label: t("logTypes.masterAdmin.whatsappUIFeedback"),
        value: "whatsapp_ui_feedback_ui",
        category: "whatsapp_ui",
        action: "ui_feedback_sent",
      },
      {
        label: t("logTypes.masterAdmin.whatsappBIFeedback"),
        value: "whatsapp_bi_feedback_bi",
        category: "whatsapp_ui",
        action: "bi_feedback_sent",
      },
      { label: t("logTypes.masterAdmin.walletTransactions"), value: "wallet", category: "wallet" },
      { label: t("logTypes.masterAdmin.campaignLogs"), value: "campaign", category: "campaign" },
      { label: t("logTypes.masterAdmin.customerActions"), value: "customer", category: "customer" },
    ],
    agent: [
      { label: t("logTypes.agent.myMerchantsActivity"), value: "all" },
      { label: t("logTypes.agent.merchantScopedLogs"), value: "merchant", category: "merchant" },
      { label: t("logTypes.agent.couponLogs"), value: "coupon", category: "coupon" },
      { label: t("logTypes.agent.campaignLogs"), value: "campaign", category: "campaign" },
      { label: t("logTypes.agent.walletEarnings"), value: "wallet", category: "wallet" },
      { label: t("logTypes.agent.customerLogs"), value: "customer", category: "customer" },
      {
        label: t("logTypes.agent.whatsappUIFeedback"),
        value: "whatsapp_ui_feedback_ui",
        category: "whatsapp_ui",
        action: "ui_feedback_sent",
      },
      {
        label: t("logTypes.agent.whatsappBIFeedback"),
        value: "whatsapp_bi_feedback_bi",
        category: "whatsapp_bi",
        action: "bi_feedback_sent",
      },
    ],
    merchant: [
      { label: t("logTypes.merchant.storeActivity"), value: "all" },
      { label: t("logTypes.merchant.couponUsage"), value: "coupon", category: "coupon" },
      { label: t("logTypes.merchant.campaignLogs"), value: "campaign", category: "campaign" },
      { label: t("logTypes.merchant.walletTransactions"), value: "wallet", category: "wallet" },
      { label: t("logTypes.merchant.customerActions"), value: "customer", category: "customer" },
      { label: t("logTypes.merchant.securityAuth"), value: "auth", category: "auth" },
      {
        label: t("logTypes.merchant.whatsappUIFeedback"),
        value: "whatsapp_ui_feedback_ui",
        category: "whatsapp_ui",
        action: "ui_feedback_sent",
      },
      {
        label: t("logTypes.merchant.whatsappBIFeedback"),
        value: "whatsapp_bi_feedback_bi",
        category: "whatsapp_ui",
        action: "bi_feedback_sent",
      },
    ],
  }), [t]);

  const availableLogTypes = useMemo(() => {
    let base = Array.isArray(LOG_TYPES[scope]) ? LOG_TYPES[scope] : [];

    if (isAdminOrSuper && scope === "master-admin") {
      const expandedOptions = [
        {
          label: t("logTypes.masterAdmin.whatsappUIDetailed"),
          value: "whatsapp_ui_detailed",
          category: "whatsapp_ui",
        },
        {
          label: t("logTypes.masterAdmin.whatsappBIDetailed"),
          value: "whatsapp_bi_detailed",
          category: "whatsapp_ui",
          action: "bi_feedback_sent",
        },
        {
          label: t("logTypes.masterAdmin.whatsappCreditWallet"),
          value: "whatsapp_credits_wallet",
          category: "wallet",
        },
      ];
      const insertIdx = base.findIndex((t) => t.category === "whatsapp");
      if (insertIdx >= 0) {
        base = [
          ...base.slice(0, insertIdx + 1),
          ...expandedOptions,
          ...base.slice(insertIdx + 1),
        ];
      } else {
        base = [...base, ...expandedOptions];
      }
    }

    if (scope === "merchant" && merchantSubscriptionType === "temporary") {
      return base.filter(
        (t) =>
          !(t.category === "whatsapp_ui" && t.action === "bi_feedback_sent"),
      );
    }
    return base;
  }, [scope, merchantSubscriptionType, isAdminOrSuper, LOG_TYPES, t]);

  useEffect(() => {
    if (!logType && availableLogTypes.length)
      setLogType(availableLogTypes[0].value);
  }, [availableLogTypes, logType]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const selectedType = availableLogTypes.find((t) => t.value === logType);
      const url = "/system-logs";

      const params = {
        page: page + 1,
        pageSize: pageSize,
      };

      // 1. Handle Ownership-based Filtering
      if (scope === "merchant" && merchantId) {
        params.merchantId = merchantId;
      } else if (scope === "agent" && agentId) {
        params.agentId = agentId;
      }

      // 2. Add Category/Level Filters
      if (selectedType?.category) {
        params.category = selectedType.category;
      }
      if (selectedType?.level) {
        params.level = selectedType.level;
      }
      // 2b. Add Action filter when present (e.g., ui_feedback_sent, bi_feedback_sent)
      if (selectedType?.action) {
        params.action = selectedType.action;
      }

      // 3. Add Date Filtering
      if (date?.from && date?.to) {
        params.startDate = format(date.from, "yyyy-MM-dd");
        params.endDate = format(date.to, "yyyy-MM-dd");
      }

      const res = await axiosInstance.get(url, { params });

      // Backend returns: { data: [...logs], meta: { total: X, ... } }
      const logsData = res.data?.data;
      const meta = res.data?.meta;

      // Filter out logs created by admin roles for merchants and agents
      let filteredLogs = Array.isArray(logsData) ? logsData : [];

      if (scope === "merchant" || scope === "agent") {
        const excludedUserTypes = [
          "super_admin",
          "admin",
          "finance_viewer",
          "support_staff",
          "ad_approver",
        ];

        filteredLogs = filteredLogs.filter((log) => {
          // Check user_type field
          const logUserType = log.user_type?.toLowerCase();
          if (logUserType && excludedUserTypes.includes(logUserType)) {
            return false;
          }

          // Check metadata.user_type
          const metadataUserType = log.metadata?.user_type?.toLowerCase();
          if (
            metadataUserType &&
            excludedUserTypes.includes(metadataUserType)
          ) {
            return false;
          }

          // Check if log has associated user data
          if (log.user?.role) {
            const userRole = log.user.role.toLowerCase();
            if (excludedUserTypes.includes(userRole)) {
              return false;
            }
          }

          return true;
        });
      }

      setLogs(filteredLogs);
      setTotal(meta?.total || 0);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error(t("errors.failedToLoad"));
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    scope,
    logType,
    page,
    pageSize,
    date,
    merchantId,
    agentId,
    availableLogTypes,
    t,
  ]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = getLogColumns(t);

  return (
    <Card className="w-full shadow-sm border-muted/40 ">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold">
              {scope === "master-admin"
                ? t("titles.masterAdmin")
                : scope === "agent"
                  ? t("titles.agent")
                  : t("titles.merchant")}
            </CardTitle>
            <CardDescription>
              {scope === "master-admin"
                ? t("descriptions.masterAdmin")
                : scope === "agent"
                  ? t("descriptions.agent")
                  : t("descriptions.merchant")}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={logType} onValueChange={setLogType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("filters.logCategory")} />
              </SelectTrigger>
              <SelectContent>
                {availableLogTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-60 justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>{t("filters.pickDateRange")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchLogs()}
              title={t("filters.refresh")}
            >
              <RefreshCcw
                className={cn("h-4 w-4", loading && "animate-spin")}
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={logs}
          isLoading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={setPageSize}
          columnsBtn={true}
          columnNameTranslations={{
            created_at: t("columns.dateTime"),
            category: t("columns.category"),
            action: t("columns.action"),
            message: t("columns.description"),
            details: t("columns.details"),
            level: t("columns.severity"),
          }}
        />
      </CardContent>
    </Card>
  );
}
