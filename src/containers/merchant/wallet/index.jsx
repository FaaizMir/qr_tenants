"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import { LoadingSpinner } from "@/helper/Loader";
import AnnualWalletView from "./parts/annual-wallet-view";
import TemporaryWalletView from "./parts/temporary-wallet-view";

const VALIDATE_API = "/api/merchant/wallet/validate";

const deriveType = (wallet, sessionType) => {
  const fromApi =
    wallet?.subscriptionType ||
    wallet?.subscription_type ||
    wallet?.merchantType ||
    wallet?.merchant_type ||
    wallet?.merchant?.merchant_type ||
    wallet?.merchant?.type ||
    wallet?.type;
  const normalized =
    (fromApi || "").toString().trim().toUpperCase() ||
    (sessionType === "annual" ? "ANNUAL" : "TEMPORARY");
  return normalized === "ANNUAL" ? "ANNUAL" : "TEMPORARY";
};

export default function MerchantWalletContainer({ embedded = false }) {
  const { data: session } = useSession();
  const user = session?.user;
  const sessionType =
    user?.subscriptionType?.toString().toLowerCase() || "temporary";

  const [wallet, setWallet] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);

  const merchantId =
    session?.user?.merchantId || user?.merchant_id || user?.merchant?.id || null;

  const merchantType = useMemo(
    () => deriveType(wallet, sessionType),
    [wallet, sessionType]
  );

  useEffect(() => {
    let mounted = true;

    if (!merchantId) {
      setError("Unable to determine merchant wallet. Please contact support.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [wRes, tRes] = await Promise.all([
          axiosInstance.get(`/wallets/merchant/${merchantId}`),
          axiosInstance.get(`/wallets/merchant/${merchantId}/transactions`, {
            params: { page: 1, limit: 50 },
          }),
        ]);

        const rawWallet = wRes?.data?.data || wRes?.data || {};
        console.log("Raw Wallet Response:", rawWallet);

        // Normalize backend wallet response into the shape expected by views
        const messageCredits =
          Number(rawWallet.message_credits ?? rawWallet.marketing_credits) || 0;
        const marketingCredits =
          Number(rawWallet.marketing_credits ?? rawWallet.message_credits) || 0;
        const utilityCredits = Number(rawWallet.utility_credits) || 0;
        const totalPurchased =
          Number(rawWallet.total_credits_purchased) ||
          messageCredits + marketingCredits + utilityCredits;
        const totalUsed = Number(rawWallet.total_credits_used) || 0;

        const expiresAt =
          rawWallet.subscription_expires_at || rawWallet.expires_at || null;

        const rawTransactions = tRes?.data?.data || [];

        const normalizedTransactions = (rawTransactions || []).map((tx) => {
          let currency = rawWallet.currency || "USD";
          try {
            const meta =
              typeof tx.metadata === "string"
                ? JSON.parse(tx.metadata)
                : tx.metadata || {};
            currency =
              meta?.package?.currency ||
              meta?.currency ||
              currency;
          } catch {
            // ignore parse errors, keep fallback
          }

          return {
            id: tx.id,
            date: tx.completed_at || tx.created_at,
            description: tx.description,
            amount: Number(tx.amount) || 0,
            type: "debit", // purchases reduce merchant balance
            status: tx.status,
            currency,
          };
        });

        const normalizedWallet = {
          ...rawWallet,
          // balance seen in UI
          balance: totalPurchased - totalUsed,
          // keep tiers for Annual view
          tiers: ["MARKETING", "UTILITY"],
          // attach normalized transactions for annual view table
          transactions: normalizedTransactions,
          // align expiry field naming for warnings / summary
          expiresAt,
          subscriptionType:
            rawWallet.subscription_type || rawWallet.subscriptionType,
          creditBreakdown: {
            message: messageCredits,
            marketing: marketingCredits,
            utility: utilityCredits,
            purchased: totalPurchased,
            used: totalUsed,
          },
          status: {
            isActive: rawWallet.is_active,
            annualFeePaid: rawWallet.annual_fee_paid,
            currency: rawWallet.currency || "USD",
          },
        };

        const normalizedSummary = {
          usage: {
            used: totalUsed,
          },
          batches: rawWallet.batches || [],
          expiresAt,
          currency: rawWallet.currency,
        };

        if (!mounted) return;
        setWallet(normalizedWallet);
        setSummary(normalizedSummary);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to load merchant wallet:", err);
        setError("Unable to load wallet. Please retry.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [merchantId]);

  const handleValidateBalance = async () => {
    try {
      setValidating(true);
      const res = await fetch(VALIDATE_API, { method: "POST" });
      if (!res.ok) throw new Error("Validation failed");
      const json = await res.json();
      return json;
    } catch (err) {
      setError("Insufficient credits or expired. Please check your wallet.");
      return null;
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-destructive">
        {error}
      </div>
    );
  }

  const sharedProps = {
    wallet,
    summary,
    onValidate: handleValidateBalance,
    validating,
    embedded,
  };

  if (merchantType === "ANNUAL") {
    return <AnnualWalletView {...sharedProps} />;
  }

  return <TemporaryWalletView {...sharedProps} />;
}
