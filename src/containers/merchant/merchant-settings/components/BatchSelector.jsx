import React, { useMemo, useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Loader2, Ticket, CheckCircle2, ChevronDown, Info } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Badge } from "@/components/ui/badge";

export default function BatchSelector({
  selectedId,
  merchantId,
  isOpen,
  setIsOpen,
  onSelect,
  placeholder,
  className = "",
  batches: propBatches,
  loading: propLoading,
}) {
  const [internalBatches, setInternalBatches] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);

  const batches = propBatches || internalBatches;
  const loading = propLoading !== undefined ? propLoading : internalLoading;

  useEffect(() => {
    if (propBatches) return;
    if (!merchantId) return;

    const fetchBatches = async () => {
      setInternalLoading(true);
      try {
        const res = await axiosInstance.get("/coupon-batches", {
          params: { page: 1, pageSize: 50, merchantId },
        });
        const data = res?.data?.data || res?.data || {};
        setInternalBatches(data.batches || []);
      } catch (error) {
        console.error("Failed to load coupon batches:", error);
      } finally {
        setInternalLoading(false);
      }
    };

    fetchBatches();
  }, [merchantId, propBatches]);

  const selectedBatch = useMemo(
    () => batches.find((b) => b.id === selectedId),
    [batches, selectedId],
  );

  return (
    <Select
      value={selectedId || ""}
      onValueChange={onSelect}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger
        className={`w-full py-3 px-4 bg-white border border-gray-200 hover:border-primary/40 hover:shadow-sm transition-all rounded-lg group ${className}`}
      >
        <div className="flex items-center gap-3 w-full overflow-hidden">
          <Ticket
            className={`h-4 w-4 shrink-0 transition-colors ${selectedId ? "text-primary" : "text-gray-400"}`}
          />
          <span
            className={`text-sm flex-1 truncate text-left transition-colors ${selectedId ? "font-medium text-gray-900" : "text-gray-500"}`}
          >
            {selectedId
              ? selectedBatch?.batch_name || `Batch #${selectedId}`
              : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-[280px] rounded-lg border-gray-200 shadow-lg">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        ) : batches.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Ticket className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              No batches available
            </p>
            <p className="text-xs text-muted-foreground">
              Create a coupon batch first
            </p>
          </div>
        ) : (
          <div className="p-1">
            {batches.map((batch) => (
              <SelectItem
                key={batch.id}
                value={batch.id}
                className="rounded-md py-2.5 px-3 cursor-pointer transition-colors hover:bg-gray-50 focus:bg-primary/5 data-[state=checked]:bg-primary/10"
              >
                <div className="flex items-center justify-between gap-3 pointer-events-none">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {batch.batch_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {batch.issued_quantity || 0} of{" "}
                      {batch.total_quantity || 0} used
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 border-0"
                  >
                    {Math.round(
                      ((batch.issued_quantity || 0) /
                        (batch.total_quantity || 1)) *
                        100,
                    )}
                    %
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
