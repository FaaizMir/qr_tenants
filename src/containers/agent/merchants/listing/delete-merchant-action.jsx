"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";
import { deleteMerchant } from "@/lib/services/helper";
import { Trash } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function DeleteMerchantAction({ merchantId, merchantName, onDeleted }) {
    const t = useTranslations("agentMerchants.listing.delete");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteMerchant(merchantId);
            toast.success(t("successMessage", { merchantName }));
            setOpen(false);
            if (onDeleted) {
                onDeleted(merchantId);
            }
        } catch (error) {
            console.error("Error deleting merchant:", error);
            toast.error(error?.response?.data?.message || t("errorMessage"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                >
                    <Trash className="mr-2 h-4 w-4" /> {t("trigger")}
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("description", { merchantName: "" })}
                        <strong>{merchantName}</strong>
                        {t("descriptionEnd", { merchantName: "" })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? t("deleting") : t("confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
