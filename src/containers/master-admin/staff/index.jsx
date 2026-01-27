"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Plus, Users, RefreshCw, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import useDebounce from "@/hooks/useDebounceRef";
import TableToolbar from "@/components/common/table-toolbar";
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
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export default function StaffManagement() {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    // Deletion state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/admins", {
                params: {
                    page: page + 1,
                    limit: pageSize,
                    search: debouncedSearch,
                },
            });

            const result = response.data;
            let staffList = result?.data || result || [];

            // Roles that define "Staff"
            const staffRoles = [
                "support_staff",
                "ad_approver",
                "finance_viewer",
                "super_admin",
            ];
            let filteredStaff = staffList.filter(
                (item) =>
                    staffRoles.includes(item.admin_role) ||
                    staffRoles.includes(item.role),
            );

            // If no staff found and not searching, show dummy data for demo
            if (filteredStaff.length === 0 && !debouncedSearch) {
                filteredStaff = [
                    {
                        id: "staff-1",
                        name: "Alexander Pierce",
                        email: "alex.p@must.services",
                        phone: "+44 20 7123 4567",
                        admin_role: "super_admin",
                        is_active: true,
                        created_at: "2024-01-10T10:00:00Z",
                    },
                    {
                        id: "staff-2",
                        name: "Sarah Jenkins",
                        email: "s.jenkins@must.services",
                        phone: "+44 20 7234 5678",
                        admin_role: "ad_approver",
                        is_active: true,
                        created_at: "2024-02-15T09:30:00Z",
                    },
                    {
                        id: "staff-3",
                        name: "Robert Fox",
                        email: "r.fox@must.services",
                        phone: "+44 20 7345 6789",
                        admin_role: "finance_viewer",
                        is_active: false,
                        created_at: "2024-05-20T14:45:00Z",
                    },
                    {
                        id: "staff-4",
                        name: "Emily Watson",
                        email: "e.watson@must.services",
                        phone: "+44 20 7456 7890",
                        admin_role: "support_staff",
                        is_active: true,
                        created_at: "2024-08-11T11:15:00Z",
                    },
                ];
            }

            setData(Array.isArray(filteredStaff) ? filteredStaff : []);
            setTotal(result?.meta?.total || filteredStaff.length);
        } catch (error) {
            console.error("Failed to fetch staff:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, debouncedSearch]);

    const handleDelete = async () => {
        if (!staffToDelete) return;
        setDeleting(true);
        try {
            await axiosInstance.delete(`/admins/${staffToDelete.id}`);
            toast.success("Staff member deleted successfully.");
            fetchStaff();
        } catch (error) {
            console.error("Failed to delete staff:", error);
            toast.error(
                error?.response?.data?.message || "Failed to delete staff member.",
            );
        } finally {
            setDeleting(false);
            setDeleteConfirmOpen(false);
            setStaffToDelete(null);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const columns = getStaffColumns((staff) => {
        setStaffToDelete(staff);
        setDeleteConfirmOpen(true);
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Staff Management</h1>
                    <p className="text-muted-foreground">
                        Manage platform administrative roles and permissions.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Staff Members</CardTitle>
                </CardHeader>
                <CardContent>
                    <TableToolbar
                        placeholder="Search staff members..."
                        onSearchChange={setSearch}
                        rightSlot={
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => fetchStaff()}
                                    title="Refresh"
                                >
                                    <RefreshCw
                                        className={cn("h-4 w-4", loading && "animate-spin")}
                                    />
                                </Button>
                                <Button
                                    onClick={() => router.push("/master-admin/staff/create")}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Staff
                                </Button>
                            </div>
                        }
                    />

                    {data.length === 0 && !loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-muted/10">
                            <ShieldAlert className="w-10 h-10 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">No staff found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Try adjusting your search or add a new staff member.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-6"
                                onClick={() => setSearch("")}
                            >
                                Clear Search
                            </Button>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={data}
                            isLoading={loading}
                            total={total}
                            page={page}
                            pageSize={pageSize}
                            setPage={setPage}
                            setPageSize={setPageSize}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Role Legend */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    {
                        role: "Support Staff",
                        desc: "Tickets & Replies",
                        color: "border-blue-100 bg-blue-50/50",
                    },
                    {
                        role: "Ad Approver",
                        desc: "Review ads",
                        color: "border-purple-100 bg-purple-50/50",
                    },
                    {
                        role: "Finance Viewer",
                        desc: "Ledgers & Statements",
                        color: "border-amber-100 bg-amber-50/50",
                    },
                    {
                        role: "Super Admin",
                        desc: "Full Access",
                        color: "border-red-100 bg-red-50/50",
                    },
                ].map((item, i) => (
                    <div
                        key={i}
                        className={cn(
                            "p-4 rounded-lg border flex flex-col gap-1",
                            item.color,
                        )}
                    >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Role
                        </span>
                        <span className="font-semibold text-sm">{item.role}</span>
                        <span className="text-xs text-muted-foreground">{item.desc}</span>
                    </div>
                ))}
            </div>

            {/* Deletion Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Staff Member?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove{" "}
                            <strong>{staffToDelete?.name}</strong>? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleting ? "Deleting..." : "Delete Permanently"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
