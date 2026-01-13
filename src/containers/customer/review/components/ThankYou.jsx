"use client";

import React from "react";
import { Heart, RefreshCcw, ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export const ThankYou = ({
  resetFlow,
  merchantConfig,
  prevStep,
  reward,
  formValues,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <Card className="w-full border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[20px] overflow-hidden bg-white ">
        <CardHeader className="flex flex-col items-center text-center pb-8 border-b border-zinc-100/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-100 text-red-500 mb-4 shadow-sm">
            <Heart className="h-8 w-8 fill-red-500" />
          </div>
          <div className="space-y-1.5 w-full max-w-lg">
            <CardTitle className="text-3xl font-black tracking-tight">
              {merchantConfig?.name && merchantConfig.name !== "Loading..."
                ? merchantConfig.name
                : "Thank You"}
            </CardTitle>
            <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>{merchantConfig?.address || "Store Location"}</span>
            </div>
            <CardDescription className="text-base font-medium pt-1">
              We appreciate your feedback!
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="py-12 px-8 md:px-20 space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase italic">
              Heartfelt Thanks!
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-[400px] mx-auto leading-relaxed">
              Every word you share helps us craft a more perfect experience. We
              can't wait to serve you again at {merchantConfig.name}.
            </p>
          </div>

          {reward && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="relative group max-w-lg mx-auto">
                <div className="absolute -inset-1 bg-primary/20 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-zinc-900 dark:bg-zinc-950 rounded-2xl p-8 shadow-2xl overflow-hidden border border-zinc-800/50">
                  <div className="flex flex-col items-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">
                      Reward Confirmed
                    </p>

                    <h3 className="text-3xl font-black text-white tracking-widest mb-6 uppercase">
                      {reward?.prize?.prize_name ||
                        reward?.name ||
                        "Special Discount"}
                    </h3>

                    <div className="flex flex-col items-center gap-4 w-full">
                      <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                          Redemption Code
                        </span>
                        <span className="text-lg font-black text-white tracking-widest">
                          {reward?.coupon?.coupon_code ||
                            reward?.coupon_code ||
                            "PROCESSING"}
                        </span>
                      </div>

                      {reward?.whatsapp_status === "failed" ||
                        reward?.whatsapp_error ||
                        reward?.error === "whatsapp_credit_low" ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                            WhatsApp Delivery Failed
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
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
                  reward?.error === "whatsapp_credit_low" ? (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 italic">
                    "Couldn't deliver via WhatsApp. Please screenshot this
                    screen or note down the code above."
                  </p>
                ) : (
                  <p className="text-xs font-medium text-zinc-500 italic leading-relaxed">
                    "Reward confirmation sent to{" "}
                    <span className="text-zinc-900 dark:text-zinc-100 font-bold not-italic">
                      {formValues?.phone || "your number"}
                    </span>
                    . Present this to our staff to redeem."
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="pt-6">
            <Button
              onClick={resetFlow}
              className="w-full h-12 rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-[0.98] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 group"
            >
              <RefreshCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-700" />
              Submit Another Review
            </Button>
          </div>
        </CardContent>

        <CardFooter className="bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800 py-4 flex justify-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            Verified Secure Experience{" "}
            <RefreshCcw className="w-3 h-3 text-primary animate-spin-slow" />{" "}
            Powered by QR Tenants
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
