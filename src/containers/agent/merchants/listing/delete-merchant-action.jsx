"use client";

import { useState } from "react";
import { toast } from "sonner";
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
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteMerchant(merchantId);
            toast.success(`Merchant "${merchantName}" deleted successfully.`);
            setOpen(false);
            if (onDeleted) {
                onDeleted(merchantId);
            }
        } catch (error) {
            console.error("Error deleting merchant:", error);
            toast.error(error?.response?.data?.message || "Failed to delete merchant");
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
                    <Trash className="mr-2 h-4 w-4" /> Delete Merchant
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Merchant</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <strong>{merchantName}</strong>? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
