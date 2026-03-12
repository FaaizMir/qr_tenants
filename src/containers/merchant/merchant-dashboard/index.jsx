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

import { useDashboardTabs } from "./dashboard-tabs";
import QRImageDialogHover from "@/components/common/qr-image-dialog";

export default function MerchantDashboardContainer() {
  const t = useTranslations("merchantDashboard");
  const { data: session } = useSession();
  const [batches, setBatches] = useState([]);
  const [walletCredits, setWalletCredits] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [merchantInfo, setMerchantInfo] = useState(null);
  const [loadingMerchant, setLoadingMerchant] = useState(true);

  useEffect(() => {
    if (!session?.user?.merchantId) return;

    const fetchMerchantInfo = async () => {
      try {
        setLoadingMerchant(true);
        const resp = await axiosInstance.get(
          `/merchants/${session.user.merchantId}`,
        );
        setMerchantInfo(resp?.data?.data || resp?.data || null);
      } catch (err) {
        console.error("Failed to fetch merchant info:", err);
      } finally {
        setLoadingMerchant(false);
      }
    };

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

    fetchMerchantInfo();
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

  const tabs = useDashboardTabs({
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
        <div className="flex items-center gap-6">
          {merchantInfo?.qr_code_image || merchantInfo?.qr_code ? (
            <div className="shrink-0 flex items-center justify-center border bg-white shadow-sm hover:shadow-md transition-shadow p-1 rounded-xl group relative">
              <QRImageDialogHover
                imageBase64={
                  merchantInfo?.qr_code_image || merchantInfo?.qr_code
                }
                filename={`qr-${merchantInfo?.id || session?.user?.merchantId}.png`}
                label={t("qrCode.scanFor", { name: merchantInfo?.business_name || session?.user?.name })}
                sizeClass="w-16 h-16"
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[7px] px-2 py-0.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-y-2 group-hover:translate-y-1 shadow-lg pointer-events-none">
                {t("qrCode.tapToZoom")}
              </div>
            </div>
          ) : (
            !loadingMerchant && (
              <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <span className="text-[10px] font-black tracking-tighter leading-none text-center">
                  NO<br />QR
                </span>
              </div>
            )
          )}

          <div>
            <h1 className="text-3xl font-bold">
              {merchantInfo?.business_name || t("header.title")}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <SubscriptionBadge type={subscriptionType} />
              <span className="text-muted-foreground">•</span>
              <CreditDisplay credits={walletCredits} />
            </div>
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
