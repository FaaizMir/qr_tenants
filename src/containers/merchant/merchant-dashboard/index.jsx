"use client";

import { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/lib/axios";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { PageTabs } from "@/components/common/page-tabs";
import { SubscriptionBadge } from "@/components/common/subscription-badge";
import { CreditDisplay } from "@/components/common/credit-display";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { getKpiData, recentRedemptions } from "./dashboard-data";
import { useDashboardTabs } from "./dashboard-tabs";

export default function MerchantDashboardContainer() {
  const t = useTranslations("merchantDashboard");
  const { data: session } = useSession();
  const [batches, setBatches] = useState([]);
  const [walletCredits, setWalletCredits] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    if (!session?.user?.merchantId) return;

    const fetchBatches = async () => {
      try {
        const resp = await axiosInstance.get("/coupon-batches", {
          params: { pageSize: 1000 },
        });
        const data = resp?.data?.data || resp?.data || resp || {};
        setBatches(data.batches || []);
      } catch (err) {
        console.error(t("errors.failedToFetchBatches"), err);
      }
    };

    const fetchWallet = async () => {
      try {
        const resp = await axiosInstance.get(
          `/wallets/merchant/${session.user.merchantId}`,
        );
        const data = resp?.data || resp || {};
        setWalletCredits(data.message_credits || 0);
      } catch (err) {
        console.error(t("errors.failedToFetchWallet"), err);
      }
    };

    const fetchDashboardData = async () => {
      try {
        setLoadingDashboard(true);
        const resp = await axiosInstance.get(
          `/merchants/${session.user.merchantId}/dashboard`,
        );
        const data = resp?.data?.data || null;
        setDashboardData(data);
      } catch (err) {
        console.error(t("errors.failedToFetchDashboard"), err);
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchBatches();
    fetchWallet();
    fetchDashboardData();
  }, [session?.user?.merchantId, t]);

  const [feeData, setFeeData] = useState(null);
  useEffect(() => {
    const fetchFee = async () => {
      try {
        const res = await axiosInstance.get(
          "/merchant-settings/subscription-fee",
        );
        setFeeData(res.data?.data || res.data);
      } catch (error) {
        console.error(t("errors.failedToFetchFee"), error);
      }
    };
    fetchFee();
  }, [t]);

  const creditStats = useMemo(() => {
    const totalIssued = batches.reduce(
      (sum, b) => sum + (Number(b.total_quantity) || 0),
      0,
    );
    const totalRedeemed = batches.reduce(
      (sum, b) => sum + (Number(b.issued_quantity) || 0),
      0,
    );
    const remainingCredits = totalIssued - totalRedeemed;
    const creditsUsed = totalRedeemed;

    return { totalIssued, totalRedeemed, remainingCredits, creditsUsed };
  }, [batches]);

  const subscriptionType = session?.user?.subscriptionType || "temporary";
  const kpiData = getKpiData(walletCredits, t);

  const tabs = useDashboardTabs({
    kpiData,
    recentRedemptions,
    subscriptionType,
    creditStats,
    dashboardData,
    loadingDashboard,
    feeData,
    adminId: session?.user?.adminId,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("header.title")}</h1>
          <div className="flex items-center gap-2 mt-2">
            <SubscriptionBadge type={subscriptionType} />
            <span className="text-muted-foreground">•</span>
            <CreditDisplay credits={walletCredits} />
          </div>
        </div>
        <Link href="/en/merchant/coupons/create">
          <Button>{t("header.createNewBatch")}</Button>
        </Link>
      </div>

      <PageTabs tabs={tabs} defaultTab="overview" />
    </div>
  );
}
