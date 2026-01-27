"use client";

import React from "react";
import {
  CheckCircle2,
  MessageSquare,
  Gift,
  QrCode,
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export const RewardSuccess = ({
  reward,
  formValues,
  merchantConfig,
  prevStep,
  nextStep,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <Card className="w-full border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[20px] overflow-hidden bg-white ">
        <CardHeader className="flex flex-col items-center text-center pb-8 border-b border-zinc-100/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 text-primary mb-4 shadow-sm">
            <Gift className="h-8 w-8" />
          </div>
          <div className="space-y-1.5 w-full max-w-lg">
            <CardTitle className="text-3xl font-black tracking-tight">
              {merchantConfig?.name && merchantConfig.name !== "Loading..."
                ? merchantConfig.name
                : "Reward Unlocked"}
            </CardTitle>
            <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{merchantConfig?.address || "Store Location"}</span>
            </div>
            <CardDescription className="text-base font-medium pt-1">
              You've earned an exclusive gift.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="py-12 px-8 md:px-20 space-y-12">
          <div className="relative group max-w-lg mx-auto">
            <div className="absolute -inset-1 bg-primary/20 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-zinc-900 dark:bg-zinc-950 rounded-2xl p-8 md:p-12 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <QrCode className="w-24 h-24 text-white" />
              </div>

              <div className="flex flex-col items-center text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6">
                  Official Merchant Reward
                </span>

                <h3 className="text-4xl md:text-5xl font-black text-white tracking-widest mb-6 uppercase">
                  {reward?.prize?.prize_name ||
                    reward?.name ||
                    "Special Discount"}
                </h3>

                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-1 backdrop-blur-sm">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                      Redemption Code
                    </span>
                    <span className="text-2xl font-black text-white tracking-widest uppercase">
                      {reward?.coupon?.coupon_code ||
                        reward?.coupon_code ||
                        "PROCESSING"}
                    </span>
                  </div>

                  {reward?.whatsapp_status === "failed" ||
                    reward?.whatsapp_error ||
                    reward?.error === "whatsapp_credit_low" ||
                    reward?.whatsapp_notification?.credits_insufficient ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                        {reward?.whatsapp_notification?.credits_insufficient
                          ? `WhatsApp Credit Exhausted (Available: ${reward?.whatsapp_notification?.available_credits ?? 0})`
                          : "WhatsApp Delivery Failed"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                        Sent to WhatsApp
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-center max-w-lg mx-auto">
            {reward?.whatsapp_status === "failed" ||
              reward?.whatsapp_error ||
              reward?.error === "whatsapp_credit_low" ||
              reward?.whatsapp_notification?.credits_insufficient ? (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 leading-relaxed italic">
                "We couldn't deliver the code via WhatsApp. Please screenshot
                this screen or note down the code above to show our staff."
              </p>
            ) : (
              <p className="text-xs font-medium text-zinc-500 leading-relaxed italic">
                "Confirmation sent to{" "}
                <span className="text-zinc-900 dark:text-zinc-100 font-bold not-italic">
                  {formValues?.phone || "your provided number"}
                </span>
                . Show this to our staff to claim your reward."
              </p>
            )}
          </div>

          <div className="pt-6">
            <Button
              onClick={nextStep}
              className="w-full h-12 rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 text-white group"
            >
              Complete Experience
              <CheckCircle2 className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </CardContent>

        <CardFooter className="bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800 py-4 flex justify-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            Verified Secure Experience{" "}
            <Sparkles className="w-3 h-3 text-primary animate-pulse" /> Powered
            by QR Tenants
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
