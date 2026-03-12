"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function SubscriptionExpiryPopup({ isOpen, onClose }) {
  const t = useTranslations("agentDashboard.subscriptionExpiry");
  const router = useRouter();

  const handleGoToWallet = () => {
    router.push("/agent/wallet");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
        <div className="bg-linear-to-br from-amber-50 to-white p-6 pt-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl shadow-sm flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>

            <DialogHeader className="p-0">
              <DialogTitle className="text-2xl font-bold text-amber-900 tracking-tight text-center">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-amber-800/70 mt-2 leading-relaxed text-center">
                {t("description")}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 p-6 pt-2 bg-white">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 text-black  bg-slate-200 hover:bg-slate-300 rounded-xl transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            {t("remindLater")}
          </Button>
          <Button
            onClick={handleGoToWallet}
            className="flex-1 gap-2 bg-amber-100 hover:bg-amber-200 text-black rounded-xl shadow-md  transition-all hover:scale-[1.01] active:scale-[0.98]"
          >
            <Wallet className="h-4 w-4" />
            {t("goToWallet")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
