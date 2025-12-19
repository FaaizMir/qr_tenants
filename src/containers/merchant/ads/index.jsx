"use client";

import { Megaphone, TrendingUp, MousePointer, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/common/status-badge";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useState } from "react";

export default function MerchantAdsContainer() {
  // Dummy ads data
  const activeAds = [
    {
      id: 1,
      campaign: "Summer Sale Boost",
      type: "Banner Ad",
      budget: "$100",
      status: "active",
      impressions: 1540,
      clicks: 45,
    },
    {
      id: 2,
      campaign: "Weekend Special",
      type: "Sidebar Ad",
      budget: "$50",
      status: "completed",
      impressions: 890,
      clicks: 22,
    },
  ];

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const filteredAds = activeAds.filter((item) =>
    item.campaign.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredAds.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const columns = [
    {
      accessorKey: "campaign",
      header: "Campaign",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.campaign}
          <span className="block text-xs text-muted-foreground">
            {row.original.type}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: "clicks", header: "Clicks" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ads & Promotions</h1>
        <p className="text-muted-foreground">
          Boost your visibility and reach new customers
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Ad */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Promotion</CardTitle>
            <CardDescription>Promote your store or coupons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Promotion Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 border-primary bg-primary/5">
                  <Megaphone className="h-6 w-6 mb-2 text-primary" />
                  <p className="font-medium">Boost Coupon</p>
                  <p className="text-xs text-muted-foreground">
                    Highlight active coupons
                  </p>
                </div>
                <div className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <TrendingUp className="h-6 w-6 mb-2 text-muted-foreground" />
                  <p className="font-medium">Store Highlight</p>
                  <p className="text-xs text-muted-foreground">
                    Feature on homepage
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Coupon Batch</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option>Summer Special (Active)</option>
                <option>Welcome Offer (Active)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Budget Limit</Label>
              <Input type="number" placeholder="$50.00" />
            </div>

            <Button className="w-full">Launch Campaign</Button>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Ad Performance (This Month)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs uppercase font-bold">
                      Impressions
                    </span>
                  </div>
                  <p className="text-2xl font-bold">2,450</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MousePointer className="h-4 w-4" />
                    <span className="text-xs uppercase font-bold">Clicks</span>
                  </div>
                  <p className="text-2xl font-bold">85</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <TableToolbar
                placeholder="Search campaigns..."
                onSearchChange={setSearch}
              />
              <DataTable
                data={paginatedData}
                columns={columns}
                page={page}
                pageSize={pageSize}
                total={filteredAds.length}
                setPage={setPage}
                setPageSize={setPageSize}
              />
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full">
                View All History
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
