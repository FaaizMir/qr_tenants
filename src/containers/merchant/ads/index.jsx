"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Megaphone,
  TrendingUp,
  MousePointer,
  Eye,
  MapPin,
  Store,
  LayoutGrid,
  CreditCard
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { toast } from "sonner";

import { activeAds } from "./ads-data";
import { adsColumns } from "./ads-columns";

export default function MerchantAdsContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get tab from URL or default
  const activeTab = searchParams.get("tab") || "campaigns";

  const handleTabChange = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("homepage");

  // Marketplace Profile State
  const [marketplaceProfile, setMarketplaceProfile] = useState({
    businessName: "The Gourmet Bistro",
    category: "restaurant",
    region: "downtown",
    description: "Authentic French cuisine in the heart of the city.",
    submitted: false
  });

  const filteredAds = activeAds.filter((item) =>
    item.campaign.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredAds.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const handleProfileSubmit = () => {
    setMarketplaceProfile({ ...marketplaceProfile, submitted: true });
    toast.success("Profile submitted to marketplace!");
  };

  const handleAdCreate = () => {
    toast.success("Ad campaign created! Pending approval.");
  };

  const AD_FORMATS = [
    {
      id: "homepage",
      name: "Homepage Featured",
      icon: LayoutGrid,
      price: "$150/week",
      desc: "Top placement on the main landing page."
    },
    {
      id: "category",
      name: "Category Top",
      icon: Store,
      price: "$75/week",
      desc: "Be the first seen in 'Restaurants' etc."
    },
    {
      id: "region",
      name: "Regional Boost",
      icon: MapPin,
      price: "$50/week",
      desc: "Target customers in your specific city area."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Ads & Marketplace</h1>
        <p className="text-muted-foreground">
          Manage your public presence and paid promotions.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="campaigns">Ad Campaigns</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Create Ad Column */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-primary" />
                    New Campaign
                  </CardTitle>
                  <CardDescription>Launch a new paid promotion.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ad Format</Label>
                    <div className="grid gap-2">
                      {AD_FORMATS.map(fmt => (
                        <div
                          key={fmt.id}
                          onClick={() => setSelectedFormat(fmt.id)}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedFormat === fmt.id ? "border-primary bg-background shadow-sm" : "border-transparent hover:bg-white/50"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <fmt.icon className={`h-5 w-5 ${selectedFormat === fmt.id ? "text-primary" : "text-muted-foreground"}`} />
                            <div className="text-sm">
                              <p className="font-medium">{fmt.name}</p>
                              <p className="text-xs text-muted-foreground">{fmt.price}</p>
                            </div>
                          </div>
                          <div className={`h-3 w-3 rounded-full border ${selectedFormat === fmt.id ? "bg-primary border-primary" : "border-muted-foreground"}`}></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Coupon Batch</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a batch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="batch1">Summer Special (Active)</SelectItem>
                        <SelectItem value="batch2">Weekend Sale (Active)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (Weeks)</Label>
                    <Input type="number" min="1" max="12" defaultValue="1" />
                  </div>

                  <Button className="w-full" onClick={handleAdCreate}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Purchase & Launch
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Stats & List Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase">Total Views</span>
                    </div>
                    <p className="text-2xl font-bold">12.5k</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <MousePointer className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase">Total Clicks</span>
                    </div>
                    <p className="text-2xl font-bold">843</p>
                  </CardContent>
                </Card>
              </div>

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
                    columns={adsColumns}
                    page={page}
                    pageSize={pageSize}
                    total={filteredAds.length}
                    setPage={setPage}
                    setPageSize={setPageSize}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Public Marketplace Profile</CardTitle>
                  <CardDescription>
                    Configure how you appear on the public coupon homepage.
                  </CardDescription>
                </div>
                {marketplaceProfile.submitted && (
                  <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Live on Marketplace
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <Label>Business Display Name</Label>
                <Input
                  value={marketplaceProfile.businessName}
                  onChange={e => setMarketplaceProfile({ ...marketplaceProfile, businessName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select defaultValue={marketplaceProfile.category} onValueChange={v => setMarketplaceProfile({ ...marketplaceProfile, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant & Cafe</SelectItem>
                      <SelectItem value="retail">Retail & Fashion</SelectItem>
                      <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Region / City</Label>
                  <Select defaultValue={marketplaceProfile.region} onValueChange={v => setMarketplaceProfile({ ...marketplaceProfile, region: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="downtown">Downtown Area</SelectItem>
                      <SelectItem value="north">North District</SelectItem>
                      <SelectItem value="south">South Bay</SelectItem>
                      <SelectItem value="west">West Side</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Short Description (for Listing)</Label>
                <Textarea
                  value={marketplaceProfile.description}
                  onChange={e => setMarketplaceProfile({ ...marketplaceProfile, description: e.target.value })}
                  placeholder="Describe your business in 1-2 sentences..."
                  rows={3}
                />
              </div>

              <Button size="lg" onClick={handleProfileSubmit}>
                {marketplaceProfile.submitted ? "Update Profile" : "Submit to Marketplace"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
