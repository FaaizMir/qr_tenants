import Link from "next/link";
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
  Phone,
  MapPin,
  User,
  MoreHorizontal,
  FileText,
  Edit,
} from "lucide-react";
import { DeleteAgentAction } from "./delete-agent-action";
import { AgentStatusToggle } from "./agent-status-toggle";

export const getAgentsColumns = (onDeleted) => [
  {
    id: "agent",
    header: "Agent Account",
    cell: ({ row }) => {
      const user = row.original.user;

      return (
        <div className="flex items-start gap-3 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10">
            <User className="h-4 w-4" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {user?.name ?? "—"}
            </span>

            <span className="text-xs text-muted-foreground truncate">
              {user?.email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Phone className="h-3.5 w-3.5" />
        <span className="truncate">{row.original.user?.phone ?? "—"}</span>
      </div>
    ),
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => {
      const city = row.original.city;
      const country = row.original.country;
      const locationStr = [city, country].filter(Boolean).join(", ");
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{locationStr || "—"}</span>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <AgentStatusToggle
        initialStatus={row.original.user?.is_active}
        agentId={row.original.id}
      />
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Agent Options
          </DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link href={`/master-admin/agents/${row.original.id}`}>
              <FileText className="mr-2 h-4 w-4" />
              Details
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`/master-admin/agents/edit/${row.original.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DeleteAgentAction
            agentId={row.original.id}
            agentName={row.original.user?.name}
            onDeleted={onDeleted}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
