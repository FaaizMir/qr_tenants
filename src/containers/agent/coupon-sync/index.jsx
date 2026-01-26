"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  RefreshCw,
  Monitor,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  BarChart,
} from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import { Slider } from "@/components/ui/slider";
import useDebounce from "@/hooks/useDebounceRef";

import { syncHistory, adRequests } from "./sync-data";
import { syncColumns, adColumns } from "./sync-columns";

export default function AgentCouponSyncContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get tab from URL or default
  const activeTab = searchParams.get("tab") || "sync";

  const handleTabChange = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [requestOpen, setRequestOpen] = useState(false);

  // Tab 1: Sync Data
  const filteredHistory = syncHistory.filter((item) =>
    item.merchant.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  // Tab 2: Ads Data
  const filteredAds = adRequests.filter((item) =>
    item.merchant.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const handleSyncRequest = () => {
    setRequestOpen(false);
    toast.success("Sync request submitted to Admin for approval.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace & Ads</h1>
          <p className="text-muted-foreground">
            Manage public homepage visibility and paid promotions.
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="sync">Coupon Sync</TabsTrigger>
          <TabsTrigger value="ads">Ads & Promotions</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: SYNC REQUESTS --- */}
        <TabsContent value="sync" className="space-y-6 mt-6">
          {/* Pending Request Status Card */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-linear-to-br from-blue-50 to-white dark:from-blue-950/20 shadow-sm border-blue-100">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Live on Homepage
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  124
                </div>
                <p className="text-xs text-blue-600/80 mt-1">
                  Active coupons visible publicly
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold">Pending Approval</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Requests waiting for Admin review
                </p>
              </CardContent>
            </Card>

            <Card className="border-dashed bg-muted/20 flex flex-col justify-center items-center p-6 text-center">
              <Button onClick={() => setRequestOpen(true)} className="w-full">
                <ArrowUpRight className="mr-2 h-4 w-4" /> Request New Sync
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Submit local coupons for global listing.
              </p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sync Request History</CardTitle>
              <CardDescription>
                Track the status of your marketplace submission requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableToolbar
                placeholder="Search requests..."
                onSearchChange={setSearch}
              />
              <DataTable
                data={filteredHistory}
                columns={syncColumns}
                page={page}
                pageSize={pageSize}
                total={filteredHistory.length}
                setPage={setPage}
                setPageSize={setPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: ADS & BOOSTS --- */}
        <TabsContent value="ads" className="space-y-6 mt-6">
          <div className="lg:flex gap-6">
            <div className="flex-1 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Active Ad Campaigns</CardTitle>
                      <CardDescription>
                        Performance of boosted coupons.
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Megaphone className="mr-2 h-4 w-4" /> Create Ad Campaign
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <TableToolbar
                    placeholder="Search campaigns..."
                    onSearchChange={setSearch}
                  />
                  <DataTable
                    data={filteredAds}
                    columns={adColumns}
                    page={page}
                    pageSize={pageSize}
                    total={filteredAds.length}
                    setPage={setPage}
                    setPageSize={setPageSize}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar: Performance Widget */}
            <div className="w-full lg:w-[350px] space-y-4">
              <Card className="bg-zinc-950 text-white border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-green-400" />
                    Ad Performance
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Past 30 Days
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">
                      Total Impressions
                    </div>
                    <div className="text-2xl font-bold">45,200</div>
                    <div className="text-xs text-green-400 mt-1">
                      +12% vs last month
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">
                      Click-Through Rate
                    </div>
                    <div className="text-2xl font-bold">3.8%</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">
                      Total Convertions
                    </div>
                    <div className="text-2xl font-bold">1,890</div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-zinc-800 pt-4">
                  <p className="text-xs text-zinc-500">
                    Based on aggregate data from all your active campaigns.
                  </p>
                </CardFooter>
              </Card>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Ad Policy
                </div>
                Pricing and placement rules are controlled by the Admin.
                Available slots depend on region demand.
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Dialog */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Homepage Sync</DialogTitle>
            <DialogDescription>
              Submit a merchant&apos;s coupons for public listing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="merchant">Select Merchant</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a merchant..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m1">Pizza Palace</SelectItem>
                  <SelectItem value="m2">Burger King</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Business Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Visibility Duration (Days)</Label>
              <div className="pt-2 px-2">
                <Slider defaultValue={[15]} max={30} step={1} />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                15 Days
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSyncRequest}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
