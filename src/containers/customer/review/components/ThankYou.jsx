"use client";

import React from "react";
import { Heart, RefreshCcw, Sparkles, Star, MapPin, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

export const ThankYou = ({
  resetFlow,
  merchantConfig,
  prevStep,
  reward,
  formValues,
  t,
}) => {
  const hasWhatsAppError =
    reward?.whatsapp_status === "failed" ||
    reward?.whatsapp_error ||
    reward?.error === "whatsapp_credit_low" ||
    reward?.whatsapp_notification?.credits_insufficient;

  const hasGeneralError = reward?.general_error && reward?.error_message;

  // Don't show reward section if reward has critical errors
  const hasValidReward =
    reward &&
    reward?.prize?.prize_name &&
    !hasWhatsAppError &&
    !hasGeneralError;

  // Show toast notifications for backend errors on mount
  React.useEffect(() => {
    if (hasWhatsAppError) {
      toast.error(
        reward?.whatsapp_notification?.credits_insufficient
          ? `${t("thankYou.whatsAppDeliveryFailedMessage")} (${reward.whatsapp_notification.available_credits ?? 0} credits remaining)`
          : t("thankYou.whatsAppDeliveryFailedMessage"),
      );
    } else if (hasGeneralError) {
      toast.error(reward?.error_message || t("thankYou.luckyDrawErrorMessage"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full flex items-center justify-center p-4 md:p-8 bg-linear-to-br from-slate-50 via-white to-slate-50 overflow-y-auto">
      <div className="w-full max-w-4xl">
        {/* Heart Animation Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-linear-to-br from-red-500 to-pink-600 mb-6 shadow-2xl shadow-red-500/30">
            <Heart className="w-12 h-12 text-white fill-white" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-zinc-900 mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-red-600 via-pink-600 to-red-600">
              {t("thankYou.thankYou")}
            </span>
          </h1>

          <p className="text-lg text-zinc-600 font-medium max-w-md mx-auto leading-relaxed">
            {t("thankYou.feedbackMessage")}
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-zinc-500">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="font-semibold">
              {merchantConfig?.name || t("thankYou.ourStore")}
            </span>
            <span>•</span>
            <span>{merchantConfig?.address || t("thankYou.location")}</span>
          </div>
        </div>

        {/* General Error Display (Lucky Draw errors, configuration issues, etc.) */}
        {hasGeneralError && !hasWhatsAppError && (
          <div className="relative mb-8">
            {/* Background Gradient Orbs */}
            <div className="absolute -inset-4 bg-linear-to-r from-red-100/50 via-red-50/50 to-red-100/50 rounded-[2.5rem] blur-2xl -z-10"></div>

            <div className="bg-linear-to-br from-red-50/90 via-white to-red-50/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border-2 border-red-200/60 shadow-2xl">
              <div className="text-center space-y-6">
                {/* Error Icon with Animation */}
                <div className="relative inline-flex">
                  <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center shadow-2xl shadow-red-500/40 animate-pulse">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  {/* Pulsing ring */}
                  <div className="absolute inset-0 rounded-3xl bg-red-500/20 blur-xl animate-pulse"></div>
                </div>

                {/* Error Title */}
                <div className="space-y-2">
                  <h3 className="text-3xl md:text-4xl font-bold text-red-900 tracking-tight">
                    {t("thankYou.luckyDrawError")}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-0.5 w-8 bg-linear-to-r from-transparent to-red-500/50 rounded-full"></div>
                    <div className="h-1 w-1 rounded-full bg-red-500"></div>
                    <div className="h-0.5 w-8 bg-linear-to-l from-transparent to-red-500/50 rounded-full"></div>
                  </div>
                </div>

                {/* Error Message */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-red-200/70 max-w-xl mx-auto shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        className="w-3.5 h-3.5 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-base font-semibold text-red-700 leading-relaxed flex-1">
                      {reward?.error_message ||
                        t("thankYou.luckyDrawErrorMessage")}
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-zinc-50/80 rounded-2xl p-5 border border-zinc-200/50 max-w-xl mx-auto">
                  <p className="text-sm font-medium text-zinc-700 leading-relaxed">
                    <span className="font-bold text-green-600">
                      {t("thankYou.feedbackRecordedSuccess")}
                    </span>
                    <br />
                    <span className="text-zinc-600">
                      {t("thankYou.contactStaffForReward")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Error Display */}
        {hasWhatsAppError && reward && (
          <div className="relative mb-8">
            {/* Background Gradient Orbs */}
            <div className="absolute -inset-4 bg-linear-to-r from-orange-100/50 via-red-50/50 to-orange-100/50 rounded-[2.5rem] blur-2xl -z-10"></div>

            <div className="bg-linear-to-br from-orange-50/90 via-white to-red-50/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border-2 border-orange-200/60 shadow-2xl">
              <div className="text-center space-y-6">
                {/* Error Icon with Animation */}
                <div className="relative inline-flex">
                  <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-orange-500 via-red-500 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/40 animate-pulse">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  {/* Pulsing ring */}
                  <div className="absolute inset-0 rounded-3xl bg-orange-500/20 blur-xl animate-pulse"></div>
                </div>

                {/* Error Title */}
                <div className="space-y-2">
                  <h3 className="text-3xl md:text-4xl font-bold text-red-900 tracking-tight">
                    {t("thankYou.rewardDeliveryFailed")}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-0.5 w-8 bg-linear-to-r from-transparent to-orange-500/50 rounded-full"></div>
                    <div className="h-1 w-1 rounded-full bg-orange-500"></div>
                    <div className="h-0.5 w-8 bg-linear-to-l from-transparent to-orange-500/50 rounded-full"></div>
                  </div>
                </div>

                {/* Error Message */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-orange-200/70 max-w-xl mx-auto shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        className="w-3.5 h-3.5 text-orange-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-base font-semibold text-red-700 leading-relaxed flex-1">
                      {reward?.whatsapp_notification?.credits_insufficient
                        ? `${t("thankYou.whatsAppDeliveryFailedMessage")} (${reward.whatsapp_notification.available_credits ?? 0} credits remaining)`
                        : t("thankYou.whatsAppDeliveryFailedMessage")}
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-zinc-50/80 rounded-2xl p-5 border border-zinc-200/50 max-w-xl mx-auto">
                  <p className="text-sm font-medium text-zinc-700 leading-relaxed">
                    <span className="font-bold text-green-600">
                      {t("thankYou.feedbackRecordedSuccess")}
                    </span>
                    <br />
                    <span className="text-zinc-600">
                      {t("thankYou.contactStaffToClaim")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reward Recap (if exists and valid) */}
        {hasValidReward && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border-2 border-slate-200/50 shadow-2xl mb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border-2 border-red-500/20">
                <Gift className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold uppercase tracking-wide text-red-600">
                  {t("thankYou.rewardConfirmed")}
                </span>
              </div>
            </div>

            <div className="relative max-w-lg mx-auto">
              {/* Card */}
              <div className="relative bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-3xl p-8 shadow-2xl overflow-hidden border border-zinc-800/50">
                {/* Background Pattern */}
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 space-y-4 text-center">
                  {/* Prize Name */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold uppercase tracking-wide text-red-400">
                        Reward Confirmed
                      </span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight uppercase">
                      {reward?.prize?.prize_name ||
                        reward?.name ||
                        t("thankYou.specialDiscount")}
                    </h3>
                  </div>

                  {/* Prize Details */}
                  {reward?.prize?.prize_description && (
                    <div className="bg-white/5 border-2 border-white/10 rounded-2xl p-5 backdrop-blur-md">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide block mb-2">
                        {t("thankYou.prizeDetails")}
                      </span>
                      <p className="text-base text-white leading-relaxed">
                        {reward.prize.prize_description}
                      </p>
                    </div>
                  )}

                  {/* WhatsApp Status */}
                  {hasWhatsAppError ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border-2 border-red-500/20">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
                        {t("thankYou.whatsAppDeliveryFailed")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                        {t("thankYou.sentToWhatsApp")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/50 text-center">
              {hasWhatsAppError ? (
                <p className="text-sm font-semibold text-red-600 italic leading-relaxed">
                  {t("rewardSuccess.whatsAppErrorInstructions")}
                </p>
              ) : (
                <p className="text-sm font-medium text-zinc-600 leading-relaxed">
                  {t("thankYou.rewardConfirmationSent", {
                    phone: formValues?.phone || "",
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="space-y-4">
          <Button
            onClick={resetFlow}
            className="w-full h-16 rounded-2xl text-base font-bold uppercase tracking-wide bg-linear-to-r from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 text-white shadow-xl shadow-zinc-900/30 hover:shadow-2xl transition-all"
          >
            <span className="flex items-center justify-center gap-3">
              <RefreshCcw className="w-5 h-5" />
              {t("thankYou.submitAnotherReview")}
            </span>
          </Button>

          <p className="text-center text-sm text-zinc-500 font-medium">
            {t("thankYou.helpImprove")}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            {t("thankYou.securedBy")}
          </p>
        </div>
      </div>
    </div>
  );
};
