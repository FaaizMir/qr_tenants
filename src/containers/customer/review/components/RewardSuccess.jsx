"use client";

import React from "react";
import {
  CheckCircle2,
  Gift,
  QrCode,
  Sparkles,
  ArrowRight,
  MapPin,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { Loader2 } from "lucide-react";

export const RewardSuccess = ({
  reward,
  formValues,
  merchantConfig,
  prevStep,
  nextStep,
  t,
}) => {
  const hasWhatsAppError =
    reward?.whatsapp_status === "failed" ||
    reward?.whatsapp_error ||
    reward?.error === "whatsapp_credit_low" ||
    reward?.whatsapp_notification?.credits_insufficient;

  // Check if it's a lucky draw prize or direct coupon
  const isLuckyDrawPrize = reward?.prize?.prize_name;
  const isDirectCoupon = reward?.coupon || reward?.coupon_code;
  const hasValidReward = isLuckyDrawPrize || isDirectCoupon;

  // If there's an error or no valid reward, redirect to ThankYou
  const didRedirect = React.useRef(false);
  React.useEffect(() => {
    if (
      (!reward || !hasValidReward || hasWhatsAppError) &&
      !didRedirect.current
    ) {
      didRedirect.current = true;
      if (hasWhatsAppError) {
        toast.error(
          reward?.whatsapp_notification?.credits_insufficient
            ? t("rewardSuccess.whatsAppCreditExhausted", {
                credits: reward?.whatsapp_notification?.available_credits ?? 0,
              })
            : t("rewardSuccess.whatsAppDeliveryFailed"),
        );
      }
      // Defer navigation to avoid unmounting the component mid React commit cycle
      setTimeout(() => nextStep(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If still rendering (during redirect), show a spinner — never return null
  // as that causes React DOM removeChild errors when the parent unmounts us
  if (!reward || !hasValidReward || hasWhatsAppError) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get display name from either prize or coupon
  const rewardName = isLuckyDrawPrize
    ? reward.prize.prize_name
    : reward.coupon?.name || reward.name || "Special Discount";

  const rewardDescription = isLuckyDrawPrize
    ? reward.prize.prize_description
    : reward.coupon?.description;

  return (
    <div className="w-full flex items-center justify-center p-4 md:p-8 bg-linear-to-br from-slate-50 via-white to-slate-50 overflow-y-auto">
      <div className="w-full max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-linear-to-br from-emerald-500 to-teal-600 mb-6 shadow-2xl shadow-emerald-500/30">
            <Gift className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-zinc-900 mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-600">
              {t("rewardSuccess.congratulations")}
            </span>
          </h1>

          <p className="text-lg text-zinc-600 font-medium max-w-md mx-auto">
            {t("rewardSuccess.rewardReady", {
              merchantName: merchantConfig?.name || t("rewardSuccess.ourStore"),
            })}
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-zinc-500">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>{merchantConfig?.address || "Store Location"}</span>
          </div>
        </div>

        {/* Reward Card */}
        <div className="relative mb-8">
          {/* Main Card */}
          <div className="relative bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden border border-zinc-800/50">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <QrCode className="w-40 h-40 text-white" />
            </div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-6">
              {/* Official Badge */}
              <div className="flex items-center justify-center">
                <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md inline-flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wide text-emerald-400">
                    {isLuckyDrawPrize
                      ? t("rewardSuccess.officialPrizeConfirmed")
                      : t("rewardSuccess.couponIssued")}
                  </span>
                </div>
              </div>

              {/* Prize Name */}
              <div className="text-center">
                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight uppercase mb-2">
                  {rewardName}
                </h2>
                {rewardDescription && (
                  <p className="text-sm text-zinc-400 font-medium">
                    {rewardDescription}
                  </p>
                )}
              </div>

              {/* Reward Status */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-w-md bg-white/5 border-2 border-white/10 rounded-2xl p-6 backdrop-blur-md">
                  <div className="text-center space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                    <p className="text-base text-white font-semibold">
                      {t("rewardSuccess.rewardConfirmed")}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {t("rewardSuccess.detailsSentWhatsApp")}
                    </p>
                  </div>
                </div>

                {/* WhatsApp Status */}
                {hasWhatsAppError ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border-2 border-red-500/20">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
                      {reward?.whatsapp_notification?.credits_insufficient
                        ? t("rewardSuccess.whatsAppCreditExhausted", {
                            credits:
                              reward?.whatsapp_notification
                                ?.available_credits ?? 0,
                          })
                        : t("rewardSuccess.whatsAppDeliveryFailed")}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      {t("rewardSuccess.sentToWhatsApp")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border-2 border-slate-200/50 shadow-lg mb-8">
          {hasWhatsAppError ? (
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-red-600 italic leading-relaxed">
                {t("rewardSuccess.whatsAppErrorInstructions")}
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-zinc-600 leading-relaxed">
                {t("rewardSuccess.confirmationSentTo", {
                  phone: formValues?.phone || "",
                })}
              </p>
              <p className="text-xs text-zinc-500 italic">
                {t("rewardSuccess.showToStaff")}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          <Button
            onClick={nextStep}
            className="w-full h-16 rounded-2xl text-base font-bold uppercase tracking-wide bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/30 hover:shadow-2xl transition-all"
          >
            <span className="flex items-center justify-center gap-3">
              {t("rewardSuccess.completeExperience")}
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            {t("rewardSuccess.securedBy")}
          </p>
        </div>
      </div>
    </div>
  );
};
