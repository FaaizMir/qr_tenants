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

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-linear-to-br from-pink-50 via-white to-red-50 animate-in fade-in duration-700">
      <div className="w-full max-w-4xl">
        {/* Heart Animation Header */}
        <div className="text-center mb-8 animate-in slide-in-from-top duration-700">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-linear-to-br from-red-500 to-pink-600 mb-6 shadow-2xl shadow-red-500/30 relative">
            <div className="absolute inset-0 rounded-3xl bg-white/20 animate-pulse"></div>
            <Heart className="w-12 h-12 text-white fill-white relative z-10 animate-heartbeat" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-zinc-900 mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-red-600 via-pink-600 to-red-600 animate-shimmer bg-size-[200%_100%]">
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

        {/* Reward Recap (if exists) */}
        {reward && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border-2 border-slate-200/50 shadow-2xl mb-8 animate-in slide-in-from-bottom duration-700 delay-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border-2 border-red-500/20">
                <Gift className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold uppercase tracking-wide text-red-600">
                  Your Reward Recap
                </span>
              </div>
            </div>

            <div className="relative group max-w-lg mx-auto">
              {/* Glow Effect */}
              <div className="absolute -inset-2 bg-linear-to-r from-red-500/20 via-pink-500/20 to-red-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

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

                  {/* Coupon Code */}
                  <div className="bg-white/5 border-2 border-white/10 rounded-2xl p-5 backdrop-blur-md">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-2">
                      Redemption Code
                    </span>
                    <span className="text-2xl font-bold text-white tracking-widest uppercase">
                      {reward?.coupon?.coupon_code ||
                        reward?.coupon_code ||
                        "PROCESSING"}
                    </span>
                  </div>

                  {/* WhatsApp Status */}
                  {hasWhatsAppError ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border-2 border-red-500/20">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
                        WhatsApp Delivery Failed
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
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
                <p className="text-sm font-medium text-red-600 italic leading-relaxed">
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
        <div className="space-y-4 animate-in slide-in-from-bottom duration-700 delay-300">
          <Button
            onClick={resetFlow}
            className="w-full h-16 rounded-2xl text-base font-bold uppercase tracking-wide bg-linear-to-r from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 text-white shadow-xl shadow-zinc-900/30 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative flex items-center justify-center gap-3">
              <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
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
            <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            Secured by QR Tenants • All data encrypted
          </p>
        </div>
      </div>
    </div>
  );
};
