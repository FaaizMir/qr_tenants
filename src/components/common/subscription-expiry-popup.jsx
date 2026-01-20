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

export function SubscriptionExpiryPopup({ isOpen, onClose }) {
    const router = useRouter();

    const handleGoToWallet = () => {
        router.push("/agent/wallet");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Subscription Expired
                    </DialogTitle>
                    <DialogDescription className="py-4">
                        Your agent subscription has expired. Most features will be restricted until you renew your plan. Please top up your balance to restore full access.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex sm:justify-between gap-2">
                    <Button variant="ghost" onClick={onClose}>
                        Remind me later
                    </Button>
                    <Button onClick={handleGoToWallet} className="gap-2">
                        <Wallet className="h-4 w-4" />
                        Go to Wallet
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
