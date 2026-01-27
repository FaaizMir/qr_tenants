"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
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

const LOG_TYPES = {
  "master-admin": [
    { label: "All Platform Activity", value: "all" },
    { label: "Authentication Events", value: "auth", category: "auth" },
    { label: "Agent Activities", value: "agent", category: "agent" },
    { label: "Merchant Activities", value: "merchant", category: "merchant" },
    { label: "Critical Errors", value: "critical", level: "critical" },
    { label: "Coupon Operations", value: "coupon", category: "coupon" },
    {
      label: "WhatsApp UI Feedback",
      value: "whatsapp_ui_feedback_ui",
      category: "whatsapp_ui",
      action: "ui_feedback_sent",
    },
    {
      label: "WhatsApp BI Feedback",
      value: "whatsapp_bi_feedback_bi",
      category: "whatsapp_ui",
      action: "bi_feedback_sent",
    },
    { label: "Wallet & Transactions", value: "wallet", category: "wallet" },
    { label: "Campaign Logs", value: "campaign", category: "campaign" },
    { label: "Customer Actions", value: "customer", category: "customer" },
  ],
  agent: [
    { label: "My Merchants Activity", value: "all" },
    { label: "Merchant Scoped Logs", value: "merchant", category: "merchant" },
    { label: "Coupon Logs", value: "coupon", category: "coupon" },
    { label: "Campaign Logs", value: "campaign", category: "campaign" },
    { label: "Wallet & Earnings", value: "wallet", category: "wallet" },
    { label: "Customer Logs", value: "customer", category: "customer" },
    {
      label: "WhatsApp UI Feedback",
      value: "whatsapp_ui_feedback_ui",
      category: "whatsapp_ui",
      action: "ui_feedback_sent",
    },
  ],
  merchant: [
    { label: "Store Activity", value: "all" },
    { label: "Coupon Usage", value: "coupon", category: "coupon" },
    { label: "Campaign Logs", value: "campaign", category: "campaign" },
    { label: "Wallet Transactions", value: "wallet", category: "wallet" },
    { label: "Customer Actions", value: "customer", category: "customer" },
    { label: "Security & Auth", value: "auth", category: "auth" },
    {
      label: "WhatsApp UI Feedback",
      value: "whatsapp_ui_feedback_ui",
      category: "whatsapp_ui",
      action: "ui_feedback_sent",
    },
    {
      label: "WhatsApp BI Feedback",
      value: "whatsapp_bi_feedback_bi",
      category: "whatsapp_ui",
      action: "bi_feedback_sent",
    },
  ],
};

export default function SystemLogsContainer({
  scope = "master-admin",
  merchantId,
  agentId,
}) {
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

  // Compute available log types; if merchant user is temporary, hide BI whatsapp entries
  // If admin/super_admin in master-admin scope, show all whatsapp_ui and whatsapp_bi options
  const availableLogTypes = useMemo(() => {
    let base = Array.isArray(LOG_TYPES[scope]) ? LOG_TYPES[scope] : [];

    // For admin/super_admin in master-admin scope, add expanded whatsapp options
    if (isAdminOrSuper && scope === "master-admin") {
      const expandedOptions = [
        {
          label: "WhatsApp UI Messages (Detailed)",
          value: "whatsapp_ui_detailed",
          category: "whatsapp_ui",
        },
        {
          label: "WhatsApp BI Messages (Detailed)",
          value: "whatsapp_bi_detailed",
          category: "whatsapp_ui",
          action: "bi_feedback_sent",
        },
        {
          label: "WhatsApp Credit Wallet",
          value: "whatsapp_credits_wallet",
          category: "wallet",
        },
      ];
      // Insert expanded options after the base WhatsApp Logs entry
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
  }, [scope, merchantSubscriptionType, isAdminOrSuper]);

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

      setLogs(Array.isArray(logsData) ? logsData : []);
      setTotal(meta?.total || 0);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load system logs");
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
  ]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = getLogColumns();

  return (
    <Card className="w-full shadow-sm border-muted/40">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold">
              {scope === "master-admin"
                ? "Global Audit Trail"
                : scope === "agent"
                  ? "Agent Activity Stream"
                  : "Store Operations Log"}
            </CardTitle>
            <CardDescription>
              {scope === "master-admin"
                ? "Monitoring platform-wide events and system health"
                : scope === "agent"
                  ? "Tracking sub-merchant activities and wallet transactions"
                  : "Detailed record of your store coupons and customer interactions"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={logType} onValueChange={setLogType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Log Category" />
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
                    <span>Pick a date range</span>
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
              title="Refresh"
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
        />
      </CardContent>
    </Card>
  );
}
