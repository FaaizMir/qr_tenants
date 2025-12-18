"use client";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { DeleteDialogBox } from "@/components/common/delete-dialog-box";
import { QRCodeDialog } from "@/components/common/qr-code-dialog";
import { useRouter } from "@/i18n/routing";
import { merchantsColumns } from "./merchants-columns";
import { toast } from "sonner";
import { Plus, Store, Search } from "lucide-react";
import TableToolbar from "@/components/common/table-toolbar";
import useDebounce from "@/hooks/useDebounceRef";

// Dummy data for merchants
const generateDummyMerchants = () => {
  const merchants = [];
  const names = [
    "TechMart Solutions",
    "Foodie Express",
    "Fashion Hub",
    "ElectroWorld",
    "HealthCare Plus",
    "Beauty Palace",
    "Sports Zone",
    "BookStore Central",
    "Home Decor Co",
    "Auto Parts Pro",
    "Garden Paradise",
    "Pet Care Center",
    "Music Store",
    "Toy Kingdom",
    "Jewelry Boutique",
  ];

  const statuses = ["active", "inactive", "suspended"];

  for (let i = 0; i < 15; i++) {
    const name = names[i] || `Merchant ${i + 1}`;
    const subdomain = name.toLowerCase().replace(/\s+/g, "-");
    merchants.push({
      id: `merchant-${i + 1}`,
      name,
      email: `contact@${subdomain}.com`,
      subdomain,
      phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      storeCount: Math.floor(Math.random() * 20) + 1,
      createdAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  }

  return merchants;
};

export default function MerchantsTable({
  filterType = "all",
  title = "Merchants",
  description = "Manage merchant accounts and tenant information",
  loadingText = "Loading merchants...",
}) {
  const router = useRouter();
  const [allMerchants] = useState(() => generateDummyMerchants());
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [merchantToDelete, setMerchantToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [merchantForQR, setMerchantForQR] = useState(null);
  const debouncedSearch = useDebounce(search, 1000);

  // Filter and paginate data based on search
  useEffect(() => {
    setIsTableLoading(true);
    const timer = setTimeout(() => {
      let filtered = [...allMerchants];

      if (debouncedSearch.trim()) {
        const searchLower = debouncedSearch.toLowerCase();
        filtered = allMerchants.filter(
          (merchant) =>
            merchant.name.toLowerCase().includes(searchLower) ||
            merchant.email.toLowerCase().includes(searchLower) ||
            merchant.subdomain.toLowerCase().includes(searchLower) ||
            merchant.phone?.includes(searchLower)
        );
      }

      // Apply pagination
      const start = page * pageSize;
      const end = start + pageSize;
      const paginated = filtered.slice(start, end);

      setTableData(paginated);
      setTotal(filtered.length);
      setIsTableLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [page, pageSize, debouncedSearch, filterType, allMerchants]);

  const handleSearchChange = (value) => {
    setPage(0);
    setSearch(value);
  };

  const handleEdit = (merchant) => {
    router.push(`/merchants/edit/${merchant.id}`);
  };

  const handleDelete = (merchant) => {
    setMerchantToDelete(merchant);
    setDeletePopupOpen(true);
  };

  const handleViewDetails = (merchant) => {
    router.push(`/merchants/${merchant.id}`);
  };

  const handleShowQRCode = (merchant) => {
    setMerchantForQR(merchant);
    setQrCodeDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!merchantToDelete) return;

    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setTableData((prevData) =>
        prevData.filter((item) => item.id !== merchantToDelete.id)
      );
      toast.success("Merchant deleted successfully");
      setDeletePopupOpen(false);
      setMerchantToDelete(null);
    } catch (error) {
      console.error("Error deleting merchant:", error);
      toast.error("Failed to delete merchant");
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
            onClick={() => router.push("/merchants/create")}
            className="w-full md:w-auto mx-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Merchant
          </Button>
        </div>
      </div>

      <TableToolbar
        placeholder="Search merchants by name, email, subdomain, or phone..."
        total={total}
        onSearchChange={handleSearchChange}
        rightSlot={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="h-4 w-4 text-primary" />
            <span>{total} merchants found</span>
          </div>
        }
      />

      <DataTable
        columns={merchantsColumns(handleEdit, handleDelete, handleViewDetails, handleShowQRCode)}
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
          setMerchantToDelete(null);
        }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Merchant"
        description={`Are you sure you want to delete "${merchantToDelete?.name}"? This action cannot be undone and will affect all associated stores and data.`}
      />

      <QRCodeDialog
        open={qrCodeDialogOpen}
        onOpenChange={setQrCodeDialogOpen}
        merchant={merchantForQR}
        baseUrl={process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}
      />
    </div>
  );
}

