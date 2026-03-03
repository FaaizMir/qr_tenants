"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Package,
  Calendar,
  Building2,
  CreditCard,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function MasterAdminCommissionContainer() {
  const t = useTranslations("masterAdminCommission");
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/wallets/super-admin");
      setWalletData(response.data);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        t("errors.loadFailed");
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchWalletData();
  }, []);
  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-48 bg-slate-100 rounded-lg"></div>
          <div className="h-8 w-32 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 md:col-span-2 bg-slate-100 rounded-2xl"></div>
          <div className="h-48 bg-slate-100 rounded-2xl"></div>
        </div>
        <div className="h-64 bg-slate-100 rounded-2xl mt-6"></div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t("header.managementTitle")}
          </h1>
          <p className="text-slate-500 text-sm">
            {t("header.managementSubtitle")}
          </p>
        </div>
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <Wallet className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {t("noData.title")}
            </h3>
            <p className="text-sm text-slate-500">
              {t("noData.message")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("header.title")}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {t("header.subtitle")}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold self-start md:self-auto transition-colors",
            walletData.is_active
              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
              : "bg-rose-50 border-rose-100 text-rose-700",
          )}
        >
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              walletData.is_active ? "bg-emerald-500" : "bg-rose-500",
            )}
          ></div>
          {walletData.is_active ? t("status.systemActive") : t("status.systemInactive")}
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Earnings Card - Spans 2 columns */}
        <Card className="md:col-span-2 border-none shadow-sm bg-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-32 bg-slate-50/50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-slate-100/50"></div>

          <CardContent className="p-8 relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  {t("cards.totalRevenue.title")}
                </p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl font-bold text-slate-900">
                    {formatCurrency(
                      walletData.total_earnings,
                      walletData.currency,
                    )}
                  </h2>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-slate-900" />
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              <span className="font-medium text-emerald-600">
                {t("cards.totalRevenue.allTimeEarnings")}
              </span>
              <span className="text-slate-300">•</span>
              <span>{t("cards.totalRevenue.updatedToday")}</span>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Status Card */}
        <Card className="border-none shadow-sm bg-slate-900 text-white rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-800 rounded-full blur-xl -ml-10 -mb-10"></div>

          <CardContent className="p-8 relative z-10 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  {t("status.operatingWallet")}
                </p>
                <p className="text-2xl font-bold mt-1">{walletData.currency}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-800/50 mt-6">
              <span className="text-xs font-medium text-slate-400">
                {t("status.systemStatus")}
              </span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Sources Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-400" />
            {t("cards.revenueAllocation.title")}
          </h3>
          <span className="text-xs font-medium text-slate-400 uppercase">
            {t("cards.revenueAllocation.fiscalYear", { year: new Date().getFullYear() })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: t("cards.sources.agentSubscription.title"),
              amount: walletData.revenue_admin_annual_subscription_fee,
              icon: Calendar,
              desc: t("cards.sources.agentSubscription.description"),
            },
            {
              title: t("cards.sources.tempPackages.title"),
              amount: walletData.commission_temporary_merchant_packages,
              icon: Package,
              desc: t("cards.sources.tempPackages.description"),
            },
            {
              title: t("cards.sources.annualPackages.title"),
              amount: walletData.commission_annual_merchant_packages,
              icon: Building2,
              desc: t("cards.sources.annualPackages.description"),
            },
            {
              title: t("cards.sources.merchantFees.title"),
              amount: walletData.commission_merchant_annual_fee,
              icon: DollarSign,
              desc: t("cards.sources.merchantFees.description"),
            },
          ].map((item, index) => (
            <Card
              key={index}
              className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-2xl group"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors flex items-center justify-center">
                    <item.icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {item.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(item.amount, walletData.currency)}
                  </p>
                  <p className="text-xs text-slate-400 pt-1 line-clamp-1">
                    {item.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
