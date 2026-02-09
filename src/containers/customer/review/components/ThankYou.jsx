"use client";

import React from "react";
import { Heart, RefreshCcw, Sparkles, Star, MapPin, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ThankYou = ({
  resetFlow,
  merchantConfig,
  prevStep,
  reward,
  formValues,
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
              Thank You!
            </span>
          </h1>

          <p className="text-lg text-zinc-600 font-medium max-w-md mx-auto leading-relaxed">
            Every word you share helps us craft a more perfect experience. We
            can&apos;t wait to serve you again!
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-zinc-500">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="font-semibold">
              {merchantConfig?.name || "Our Store"}
            </span>
            <span>•</span>
            <span>{merchantConfig?.address || "Location"}</span>
          </div>
        </div>

        {/* General Error Display (Lucky Draw errors, configuration issues, etc.) */}
        {hasGeneralError && !hasWhatsAppError && (
          <div className="relative mb-8">
            {/* Background Gradient Orbs */}
            <div className="absolute -inset-4 bg-gradient-to-r from-red-100/50 via-red-50/50 to-red-100/50 rounded-[2.5rem] blur-2xl -z-10"></div>

            <div className="bg-gradient-to-br from-red-50/90 via-white to-red-50/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border-2 border-red-200/60 shadow-2xl">
              <div className="text-center space-y-6">
                {/* Error Icon with Animation */}
                <div className="relative inline-flex">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center shadow-2xl shadow-red-500/40 animate-pulse">
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
                    Lucky Draw Error
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-0.5 w-8 bg-gradient-to-r from-transparent to-red-500/50 rounded-full"></div>
                    <div className="h-1 w-1 rounded-full bg-red-500"></div>
                    <div className="h-0.5 w-8 bg-gradient-to-l from-transparent to-red-500/50 rounded-full"></div>
                  </div>
                </div>

                {/* Error Message */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-red-200/70 max-w-xl mx-auto shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
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
                        "Unable to complete lucky draw. Please contact our staff."}
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-zinc-50/80 rounded-2xl p-5 border border-zinc-200/50 max-w-xl mx-auto">
                  <p className="text-sm font-medium text-zinc-700 leading-relaxed">
                    <span className="font-bold text-green-600">
                      ✓ Your feedback has been recorded successfully.
                    </span>
                    <br />
                    <span className="text-zinc-600">
                      Please contact our staff for assistance with your reward.
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
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-100/50 via-red-50/50 to-orange-100/50 rounded-[2.5rem] blur-2xl -z-10"></div>

            <div className="bg-gradient-to-br from-orange-50/90 via-white to-red-50/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border-2 border-orange-200/60 shadow-2xl">
              <div className="text-center space-y-6">
                {/* Error Icon with Animation */}
                <div className="relative inline-flex">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/40 animate-pulse">
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
                    Reward Delivery Failed
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-0.5 w-8 bg-gradient-to-r from-transparent to-orange-500/50 rounded-full"></div>
                    <div className="h-1 w-1 rounded-full bg-orange-500"></div>
                    <div className="h-0.5 w-8 bg-gradient-to-l from-transparent to-orange-500/50 rounded-full"></div>
                  </div>
                </div>

                {/* Error Message */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-orange-200/70 max-w-xl mx-auto shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
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
                        ? `WhatsApp delivery failed. Only ${reward.whatsapp_notification.available_credits ?? 0} credits remaining.`
                        : "WhatsApp delivery failed. Unable to send reward notification."}
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-zinc-50/80 rounded-2xl p-5 border border-zinc-200/50 max-w-xl mx-auto">
                  <p className="text-sm font-medium text-zinc-700 leading-relaxed">
                    <span className="font-bold text-green-600">
                      ✓ Your feedback has been recorded successfully.
                    </span>
                    <br />
                    <span className="text-zinc-600">
                      Please contact our staff to claim your reward.
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
                  Your Reward Recap
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
                        "Special Discount"}
                    </h3>
                  </div>

                  {/* Prize Details */}
                  {reward?.prize?.prize_description && (
                    <div className="bg-white/5 border-2 border-white/10 rounded-2xl p-5 backdrop-blur-md">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide block mb-2">
                        Prize Details
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
                        WhatsApp Delivery Failed
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                        Sent to WhatsApp
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
                  Couldn&apos;t deliver via WhatsApp. Please screenshot this
                  screen or note down the code above.
                </p>
              ) : (
                <p className="text-sm font-medium text-zinc-600 leading-relaxed">
                  Reward confirmation sent to{" "}
                  <span className="text-zinc-900 font-bold">
                    {formValues?.phone || "your number"}
                  </span>
                  . Present this to our staff to redeem.
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
              Submit Another Review
            </span>
          </Button>

          <p className="text-center text-sm text-zinc-500 font-medium">
            Help us improve by sharing another experience
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            Secured by QR Tenants • All data encrypted
          </p>
        </div>
      </div>
    </div>
  );
};
