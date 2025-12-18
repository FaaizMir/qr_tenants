"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { DeleteDialogBox } from "@/components/common/delete-dialog-box";
import { useRouter } from "@/i18n/routing";
import { agentsColumns } from "./agents-columns";
import { toast } from "sonner";
import { Plus, ShieldCheck, Search } from "lucide-react";
import TableToolbar from "@/components/common/table-toolbar";
import useDebounce from "@/hooks/useDebounceRef";

// Dummy data for agents
const generateDummyAgents = () => {
  const agents = [];
  const names = [
    "Imran Sikandar",
    "Aisha Khan",
    "Michael Chen",
    "Sara Ahmed",
    "Lucas Silva",
    "Priya Patel",
    "Noor Ali",
    "David Kim",
    "Maria Garcia",
    "Omar Farooq",
  ];

  const statuses = ["active", "pending", "suspended"];

  for (let i = 0; i < 10; i++) {
    const name = names[i] || `Agent ${i + 1}`;
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    agents.push({
      id: `agent-${i + 1}`,
      name,
      email: `${slug}@example.com`,
      phone: `+1-555-${String(1000 + i).padStart(4, "0")}`,
      domain: `${slug}.qr-app.com`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      merchantCount: Math.floor(Math.random() * 12),
      createdAt: new Date(
        Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  }

  return agents;
};

export default function AgentsTable({
  title = "Agents",
  description = "Manage agents and their assigned merchants",
  loadingText = "Loading agents...",
}) {
  const router = useRouter();
  const [allAgents] = useState(() => generateDummyAgents());
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 800);

  // Filter and paginate data based on search
  useEffect(() => {
    setIsTableLoading(true);
    const timer = setTimeout(() => {
      let filtered = [...allAgents];

      if (debouncedSearch.trim()) {
        const searchLower = debouncedSearch.toLowerCase();
        filtered = allAgents.filter(
          (agent) =>
            agent.name.toLowerCase().includes(searchLower) ||
            agent.email.toLowerCase().includes(searchLower) ||
            agent.domain.toLowerCase().includes(searchLower) ||
            agent.phone?.includes(searchLower)
        );
      }

      // Apply pagination
      const start = page * pageSize;
      const end = start + pageSize;
      const paginated = filtered.slice(start, end);

      setTableData(paginated);
      setTotal(filtered.length);
      setIsTableLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [page, pageSize, debouncedSearch, allAgents]);

  const handleSearchChange = (value) => {
    setPage(0);
    setSearch(value);
  };

  const handleEdit = (agent) => {
    router.push(`/agents/edit/${agent.id}`);
  };

  const handleDelete = (agent) => {
    setAgentToDelete(agent);
    setDeletePopupOpen(true);
  };

  const handleViewDetails = (agent) => {
    router.push(`/agents/${agent.id}`);
  };

  const confirmDelete = async () => {
    if (!agentToDelete) return;

    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setTableData((prevData) =>
        prevData.filter((item) => item.id !== agentToDelete.id)
      );
      toast.success("Agent deleted successfully");
      setDeletePopupOpen(false);
      setAgentToDelete(null);
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Failed to delete agent");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 my-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div>
          <Button
            variant="secondary"
            onClick={() => router.push("/agents/create")}
            className="w-full md:w-auto mx-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>
      </div>

      <TableToolbar
        placeholder="Search agents by name, email, domain, or phone..."
        total={total}
        onSearchChange={handleSearchChange}
        rightSlot={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>{total} agents found</span>
          </div>
        }
      />

      <DataTable
        columns={agentsColumns(handleEdit, handleDelete, handleViewDetails)}
        data={tableData}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        total={total}
        isLoading={isTableLoading}
        loadingText={loadingText}
      />

      <DeleteDialogBox
        open={deletePopupOpen}
        onClose={() => {
          setDeletePopupOpen(false);
          setAgentToDelete(null);
        }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Agent"
        description={`Are you sure you want to delete "${agentToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}

