"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Plus,
  Package,
  Activity,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TableToolbar from "@/components/common/table-toolbar";
import { DataTable } from "@/components/common/data-table";
import { PackagesColumns } from "./packages-columns";
import useDebounce from "@/hooks/useDebounceRef";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import { useSession } from "next-auth/react";
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

export default function PackagesTable() {
  const t = useTranslations("agentPackages");
  const router = useRouter();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: session } = useSession();

  // Fetch packages from API
  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/wallets/credit-packages", {
        params: {
          admin_id: session.user.adminId,
        },
      });

      // Handle different response structures and filter for paid ads only
      const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      const paidAdsPackages = data.filter(pkg => pkg.credit_type === 'paid ads');
      setPackages(paidAdsPackages);
    } catch (err) {
      console.error(err);
      toast.error(t("messages.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Filter packages by name
  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleEdit = (pkg) => {
    router.push(`/agent/packages/edit/${pkg.id}`);
  };

  const handleDelete = (pkg) => {
    setPackageToDelete(pkg);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!packageToDelete) return;

    setLoading(true);
    try {
      await axiosInstance.delete(
        `/wallets/credit-packages/${packageToDelete.id}`,
        {
          params: { admin_id: session?.user?.adminId },
        }
      );
      toast.success(t("messages.deleteSuccess"));
      fetchPackages();
    } catch (err) {
      toast.error(err?.response?.data?.message || t("messages.deleteError"));
    } finally {
      setLoading(false);
      setPackageToDelete(null);
      setConfirmOpen(false);
    }
  };

  // Pagination
  const paginatedData = filteredPackages.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  return (
    <div className="max-w-full space-y-8 py-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/5">
            <Target className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {t("title")}
            </h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-emerald-500" />
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="px-4 pb-10">
        <Card className="border-muted/60 shadow-2xl rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-8">
            <div className="mb-6">
              <TableToolbar
                placeholder={t("table.searchPlaceholder")}
                search={search}
                onSearchChange={setSearch}
                total={filteredPackages.length}
                rightSlot={
                  <Button
                    onClick={() => router.push("/agent/packages/create")}
                    size="lg"
                    className="shadow-xl shadow-primary/20 font-bold px-8 h-12 rounded-xl"
                  >
                    <Plus className="h-5 w-5 mr-2 stroke-[3px]" />
                    {t("table.createButton")}
                  </Button>
                }
              />
            </div>
            <DataTable
              data={paginatedData}
              columns={PackagesColumns({
                onEdit: handleEdit,
                onDelete: handleDelete,
                t,
              })}
              page={page}
              pageSize={pageSize}
              total={filteredPackages.length}
              setPage={setPage}
              setPageSize={setPageSize}
              loading={loading}
              className="border-none"
            />
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-4xl border-none shadow-2xl p-8 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black italic font-mono uppercase text-slate-900">
              {t("deleteDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-500 leading-relaxed font-medium">
              {t("deleteDialog.description")}
              <span className="text-slate-900 font-bold italic underline decoration-red-500 decoration-2">
                {packageToDelete?.name}
              </span>
              {t("deleteDialog.descriptionEnd")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="h-12 px-6 rounded-2xl font-bold border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all">
              {t("deleteDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="h-12 px-8 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all"
            >
              {t("deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
