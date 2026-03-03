"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Mail,
    Shield,
    User,
    Phone,
    Clock,
    Lock,
} from "lucide-react";
import Link from "next/link";
import { StaffStatusToggle } from "./staff-status-toggle";

const getRoleConfig = (t) => ({
    support_staff: {
        label: t("roles.supportStaff"),
        color: "bg-blue-50 text-blue-700 border-blue-100",
    },
    ad_approver: {
        label: t("roles.adApprover"),
        color: "bg-purple-50 text-purple-700 border-purple-100",
    },
    finance_viewer: {
        label: t("roles.financeViewer"),
        color: "bg-amber-50 text-amber-700 border-amber-100",
    },
    super_admin: {
        label: t("roles.superAdmin"),
        color: "bg-red-50 text-red-700 border-red-100",
    },
    admin: {
        label: t("roles.admin"),
        color: "bg-slate-50 text-slate-700 border-slate-100",
    },
});

const getAccessLabel = (role, t) => {
    if (role === "super_admin") return t("access.fullAccess");
    if (role === "ad_approver") return t("access.adsManagement");
    if (role === "support_staff") return t("access.supportHelp");
    if (role === "finance_viewer") return t("access.financeOnly");
    return t("access.readOnly");
};

export const getStaffColumns = (onDelete, t) => [
    {
        accessorKey: "name",
        header: t("columns.staffMember"),
        meta: { label: t("columns.staffMember") },
        cell: ({ row }) => {
            const staff = row.original;
            return (
                <div className="flex items-center gap-3 py-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 truncate text-sm">
                            {staff.name || "—"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                            {staff.email}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "phone",
        header: t("columns.phone"),
        meta: { label: t("columns.phone") },
        cell: ({ row }) => {
            const phone = row.original.phone || row.original.phone_number;
            return (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="truncate">{phone || "—"}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "admin_role",
        header: t("columns.role"),
        meta: { label: t("columns.role") },
        cell: ({ row }) => {
            const role =
                row.original.admin_role || row.original.role || "support_staff";
            const ROLE_CONFIG = getRoleConfig(t);
            const config = ROLE_CONFIG[role] || ROLE_CONFIG.support_staff;

            return (
                <Badge
                    variant="outline"
                    className={`${config.color} px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider`}
                >
                    {config.label}
                </Badge>
            );
        },
    },
    {
        id: "permissions",
        header: t("columns.access"),
        meta: { label: t("columns.access") },
        cell: ({ row }) => {
            const role =
                row.original.admin_role || row.original.role || "support_staff";
            const access = getAccessLabel(role, t);

            return (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    {access}
                </div>
            );
        },
    },
    {
        accessorKey: "is_active",
        header: t("columns.status"),
        meta: { label: t("columns.status") },
        cell: ({ row }) => {
            return <StaffStatusToggle staff={row.original} />;
        },
    },
    {
        id: "actions",
        header: t("columns.actions"),
        meta: { label: t("columns.actions") },
        cell: ({ row }) => {
            const staff = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">
                            {t("actions.menuLabel")}
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/master-admin/staff/edit/${staff.id}?role=${staff.role}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t("actions.edit")}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                            onClick={() => onDelete(staff)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("actions.delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
