"use client";

import { DataTable } from "@/components/common/data-table";
import { getStaffColumns } from "./staff-columns";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";

export function StaffTable({ data, isLoading, total, page, pageSize, setPage, setPageSize, refresh }) {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!staffToDelete) return;
        setDeleting(true);
        try {
            await axiosInstance.delete(`/admins/${staffToDelete.id}`);
            toast.success("Staff member deleted successfully.");
            refresh?.();
        } catch (error) {
            console.error("Failed to delete staff:", error);
            toast.error(error?.response?.data?.message || "Failed to delete staff member.");
        } finally {
            setDeleting(false);
            setDeleteConfirmOpen(false);
            setStaffToDelete(null);
        }
    };

    const columns = getStaffColumns((staff) => {
        setStaffToDelete(staff);
        setDeleteConfirmOpen(true);
    });

    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                total={total}
                page={page}
                pageSize={pageSize}
                setPage={setPage}
                setPageSize={setPageSize}
                columnsBtn={true}
            />

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">Delete Staff Member?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base py-2">
                            Are you sure you want to remove <strong>{staffToDelete?.name}</strong>?
                            This will permanently revoke their access to the platform.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="rounded-xl border-zinc-200">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={deleting}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-6"
                        >
                            {deleting ? "Deleting..." : "Delete Permanently"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
