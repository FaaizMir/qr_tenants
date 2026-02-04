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

export const RewardSuccess = ({
  reward,
  formValues,
  merchantConfig,
  prevStep,
  nextStep,
}) => {
  const hasWhatsAppError =
    reward?.whatsapp_status === "failed" ||
    reward?.whatsapp_error ||
    reward?.error === "whatsapp_credit_low" ||
    reward?.whatsapp_notification?.credits_insufficient;

  return (
    <div className=" w-full flex items-center justify-center p-4 md:p-8 bg-linear-to-br from-slate-50 via-white to-slate-50 animate-in fade-in duration-700 overflow-y-auto">
      <div className="w-full max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8 animate-in slide-in-from-top duration-700">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-linear-to-br from-emerald-500 to-teal-600 mb-6 shadow-2xl shadow-emerald-500/30 relative">
            <div className="absolute inset-0 rounded-3xl bg-white/20 animate-pulse"></div>
            <Gift className="w-12 h-12 text-white relative z-10" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-zinc-900 mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-600 animate-shimmer bg-size[length:200%_100%]">
              Congratulations!
            </span>
          </h1>

          <p className="text-lg text-zinc-600 font-medium max-w-md mx-auto">
            Your reward is ready to claim at{" "}
            <span className="font-bold text-zinc-900">
              {merchantConfig?.name || "our store"}
            </span>
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-zinc-500">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>{merchantConfig?.address || "Store Location"}</span>
          </div>
        </div>

        {/* Reward Card */}
        <div className="relative group mb-8 animate-in slide-in-from-bottom duration-700 delay-200">
          {/* Glow Effect */}
          <div className="absolute -inset-2 bg-linear-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

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
                    Official Merchant Reward
                  </span>
                </div>
              </div>

              {/* Prize Name */}
              <div className="text-center">
                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight uppercase mb-2">
                  {reward?.prize?.prize_name ||
                    reward?.name ||
                    "Special Discount"}
                </h2>
                {reward?.prize?.prize_description && (
                  <p className="text-sm text-zinc-400 font-medium">
                    {reward.prize.prize_description}
                  </p>
                )}
              </div>

              {/* Coupon Code */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-w-md bg-white/5 border-2 border-white/10 rounded-2xl p-6 backdrop-blur-md">
                  <div className="text-center space-y-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide block">
                      Redemption Code
                    </span>
                    <span className="text-3xl md:text-4xl font-bold text-white tracking-widest uppercase block">
                      {reward?.coupon?.coupon_code ||
                        reward?.coupon_code ||
                        "PROCESSING"}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Status */}
                {hasWhatsAppError ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border-2 border-red-500/20">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
                      {reward?.whatsapp_notification?.credits_insufficient
                        ? `WhatsApp Credit Exhausted (${reward?.whatsapp_notification?.available_credits ?? 0} left)`
                        : "WhatsApp Delivery Failed"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      Sent to WhatsApp
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border-2 border-slate-200/50 shadow-lg mb-8 animate-in slide-in-from-bottom duration-700 delay-300">
          {hasWhatsAppError ? (
            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-red-600 italic leading-relaxed">
                We couldn&apos;t deliver the code via WhatsApp. Please
                screenshot this screen or note down the code above to show our
                staff.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-zinc-600 leading-relaxed">
                Confirmation sent to{" "}
                <span className="text-zinc-900 font-bold">
                  {formValues?.phone || "your provided number"}
                </span>
              </p>
              <p className="text-xs text-zinc-500 italic">
                Show this code to our staff to claim your reward
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="animate-in slide-in-from-bottom duration-700 delay-400">
          <Button
            onClick={nextStep}
            className="w-full h-16 rounded-2xl text-base font-bold uppercase tracking-wide bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative flex items-center justify-center gap-3">
              Complete Experience
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </span>
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            Secured by QR Tenants • All data encrypted
          </p>
        </div>
      </div>
    </div>
  );
};
