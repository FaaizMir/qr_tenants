"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import axiosInstance from "@/lib/axios";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { PrizesColumns } from "./prizes-columns";
import useDebounce from "@/hooks/useDebounceRef";

export default function MerchantLuckyDrawContainer() {
  const router = useRouter();
  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;
  const [loading, setLoading] = useState(false);
  const [prizes, setPrizes] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prizeToDelete, setPrizeToDelete] = useState(null);

  const fetchPrizes = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/lucky-draw/prizes/merchant/${merchantId}`
      );
      const data = response?.data?.data || response?.data || [];
      setPrizes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch prizes:", err);
      toast.error("Failed to load prizes");
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  // Fetch prizes
  useEffect(() => {
    if (!merchantId) return;
    fetchPrizes();
  }, [merchantId, fetchPrizes]);
  const handleEdit = (prize) => {
    router.push(`/merchant/lucky-draw/edit/${prize.id}`);
  };

  const handleDelete = (prize) => {
    setPrizeToDelete(prize);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!prizeToDelete) return;

    try {
      await axiosInstance.delete(`/lucky-draw/prizes/${prizeToDelete.id}`);
      toast.success("Prize deleted successfully!");
      fetchPrizes();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete prize");
    } finally {
      setDeleteDialogOpen(false);
      setPrizeToDelete(null);
    }
  };

  // Filter prizes
  const filteredPrizes = prizes.filter(
    (prize) =>
      prize.prize_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      prize.prize_description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      prize.prize_type?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Pagination
  const paginatedData = filteredPrizes.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const columns = PrizesColumns({ onEdit: handleEdit, onDelete: handleDelete });

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Lucky Draw Settings</h1>
          <p className="text-muted-foreground">
            Configure the &quot;Spin the Wheel&quot; prizes for customers who
            complete a review.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prizes</CardTitle>
            <CardDescription>
              Manage all prizes for the lucky draw
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableToolbar
              placeholder="Search prizes by name, description, or type..."
              search={search}
              onSearchChange={setSearch}
              total={filteredPrizes.length}
              rightSlot={
                <Button
                  onClick={() => router.push("/merchant/lucky-draw/create")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Prize
                </Button>
              }
            />
            <DataTable
              data={paginatedData}
              columns={columns}
              page={page}
              pageSize={pageSize}
              total={filteredPrizes.length}
              setPage={setPage}
              setPageSize={setPageSize}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the prize &quot;
              {prizeToDelete?.prize_name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPrizeToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
