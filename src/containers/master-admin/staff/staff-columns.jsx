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

const ROLE_CONFIG = {
    support_staff: {
        label: "Support Staff",
        color: "bg-blue-50 text-blue-700 border-blue-100",
    },
    ad_approver: {
        label: "Ad Approver",
        color: "bg-purple-50 text-purple-700 border-purple-100",
    },
    finance_viewer: {
        label: "Finance Viewer",
        color: "bg-amber-50 text-amber-700 border-amber-100",
    },
    super_admin: {
        label: "Super Admin",
        color: "bg-red-50 text-red-700 border-red-100",
    },
    admin: {
        label: "Admin",
        color: "bg-slate-50 text-slate-700 border-slate-100",
    },
};

export const getStaffColumns = (onDelete) => [
    {
        accessorKey: "name",
        header: "Staff Member",
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
        header: "Phone",
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
        header: "Role",
        cell: ({ row }) => {
            const role =
                row.original.admin_role || row.original.role || "support_staff";
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
        header: "Access",
        cell: ({ row }) => {
            const role =
                row.original.admin_role || row.original.role || "support_staff";
            let access = "Read Only";
            if (role === "super_admin") access = "Full Access";
            else if (role === "ad_approver") access = "Ads Management";
            else if (role === "support_staff") access = "Support Help";
            else if (role === "finance_viewer") access = "Finance Only";

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
        header: "Status",
        cell: ({ row }) => {
            return <StaffStatusToggle staff={row.original} />;
        },
    },
    {
        id: "actions",
        header: "Actions",
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
                            Staff Options
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/master-admin/staff/edit/${staff.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                            onClick={() => onDelete(staff)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
