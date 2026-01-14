"use client";

import { useState } from "react";
import { ExportButton } from "@/components/common/export-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useDebounce from "@/hooks/useDebounceRef";

import { serialCodes } from "./serial-codes-data";
import { serialCodesColumns } from "./serial-codes-columns";

export default function MerchantSerialCodesContainer() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const filteredCodes = serialCodes.filter(
    (item) =>
      item.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.customer.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const paginatedData = filteredCodes.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Serial Codes</h1>
        <p className="text-muted-foreground">
          Search and manage all generated coupon codes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <TableToolbar
            placeholder="Search code or customer..."
            onSearchChange={setSearchTerm}
            rightSlot={
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="unused">Unused</SelectItem>
                  </SelectContent>
                </Select>
                <ExportButton />
              </div>
            }
          />
          <DataTable
            data={paginatedData}
            columns={serialCodesColumns}
            page={page}
            pageSize={pageSize}
            total={filteredCodes.length}
            setPage={setPage}
            setPageSize={setPageSize}
            style={{ marginTop: "1rem" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
