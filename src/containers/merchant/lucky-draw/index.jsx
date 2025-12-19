"use client";

import { Gift, Trophy, Shuffle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useState } from "react";
import { StatusBadge } from "@/components/common/status-badge";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";

export default function MerchantLuckyDrawContainer() {
  // Dummy winners
  const winners = [
    {
      id: 1,
      name: "John Doe",
      prize: "Free Dinner",
      date: "2024-06-01",
      status: "claimed",
    },
    {
      id: 2,
      name: "Jane Smith",
      prize: "$50 Voucher",
      date: "2024-05-15",
      status: "claimed",
    },
    {
      id: 3,
      name: "Bob Johnson",
      prize: "Free Coffee",
      date: "2024-05-01",
      status: "expired",
    },
  ];

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const filteredWinners = winners.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredWinners.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const columns = [
    {
      accessorKey: "name",
      header: "Winner Name",
      cell: ({ row }) => (
        <div className="font-medium flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
            <Trophy className="h-3 w-3" />
          </div>
          {row.original.name}
        </div>
      ),
    },
    { accessorKey: "prize", header: "Prize" },
    { accessorKey: "date", header: "Draw Date" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status === "claimed" ? "completed" : "expired"}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lucky Draw</h1>
        <p className="text-muted-foreground">
          Run giveaways for your customers
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Draw Configuration</CardTitle>
            <CardDescription>Set up your next lucky draw</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prize">Prize Name</Label>
              <Input id="prize" placeholder="e.g. Weekend Getaway" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="winners">Number of Winners</Label>
              <Input id="winners" type="number" placeholder="1" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="criteria">Eligibility Criteria</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option>All Customers</option>
                <option>Customers who visited this month</option>
                <option>Customers who spent over $50</option>
                <option>Customers with 5 star reviews</option>
              </select>
            </div>

            <Button className="w-full gap-2">
              <Shuffle className="h-4 w-4" />
              Run Draw Now
            </Button>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Draw Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <h3 className="text-2xl font-bold">Ready to Launch</h3>
              <p className="text-muted-foreground mt-2">
                245 eligible participants found for the selected criteria.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Last Draw
                </p>
                <p className="font-semibold">June 1, 2024</p>
              </div>
              <div className="bg-white p-3 rounded-lg border text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Winners
                </p>
                <p className="font-semibold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Winners History */}
      <Card>
        <CardHeader>
          <CardTitle>Winners History</CardTitle>
        </CardHeader>
        <CardContent>
          <TableToolbar
            placeholder="Search winners..."
            onSearchChange={setSearch}
          />
          <DataTable
            data={paginatedData}
            columns={columns}
            page={page}
            pageSize={pageSize}
            total={filteredWinners.length}
            setPage={setPage}
            setPageSize={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}
