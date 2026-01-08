import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Eye, User, Mail, Phone, MapPin, Gift } from "lucide-react";

export const customersColumns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-4 w-4" />
        </div>
        <span className="font-medium">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    id: "contact",
    header: "Contact Info",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-sm">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <span>{row.original.phone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span>{row.original.email}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "date_of_birth",
    header: "Date of Birth",
    cell: ({ row }) => <span>{row.getValue("date_of_birth") || "N/A"}</span>,
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("gender") || "N/A"}</span>
    ),
  },
  {
    accessorKey: "reward",
    header: "Reward Status",
    cell: ({ row }) => {
      const reward = row.getValue("reward");
      return (
        <div className="flex items-center gap-2">
          {reward ? (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Gift className="mr-1 h-3 w-3" />
              Eligible
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-400">
              Not Eligible
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Link href={`/merchant/customer-data/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Details
        </Button>
      </Link>
    ),
  },
];
