"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import axiosInstance from "@/lib/axios";
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

export function DeleteAgentAction({ agentId, agentName, onDeleted, t }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axiosInstance.delete(`/admins/${agentId}`);
            toast.success(t("delete.success"));
            if (onDeleted) {
                onDeleted();
            }
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(t("delete.error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("actions.delete")}
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("delete.description")}
                        <span className="font-medium text-foreground">{t("delete.descriptionName", { name: agentName })}</span>
                        {t("delete.descriptionEnd")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{t("delete.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={loading}
                    >
                        {loading ? t("delete.deleting") : t("delete.confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
