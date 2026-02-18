"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Loader2, Store, TrendingUp, Calendar } from "lucide-react";

export default function MerchantsTab() {
  const { data: session } = useSession();
  const adminId = session?.adminId;

  const [recentMerchants, setRecentMerchants] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [recentPage, setRecentPage] = useState(1);
  const [topPage, setTopPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (!adminId) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/admins/${adminId}/dashboard`);
        if (res?.data?.data) {
          setRecentMerchants(res.data.data.merchantStats?.recentlyAdded || []);
          setTopPerformers(res.data.data.merchantStats?.topPerformers || []);
        }
      } catch (error) {
        console.error("Failed to fetch merchant data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [adminId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Pagination logic
  const paginateData = (data, page) => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  };

  const recentPaginated = paginateData(recentMerchants, recentPage);
  const topPaginated = paginateData(topPerformers, topPage);
  
  const recentTotalPages = Math.ceil(recentMerchants.length / pageSize);
  const topTotalPages = Math.ceil(topPerformers.length / pageSize);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recently Added Merchants */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Store className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Recently Added Merchants</CardTitle>
              <CardDescription className="text-xs">
                Latest registrations • {recentMerchants.length} total
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 px-6 pb-4">
              {recentPaginated.length > 0 ? (
                recentPaginated.map((merchant, index) => (
                  <div
                    key={merchant.merchantId}
                    className="group relative flex items-center justify-between p-4 rounded-xl shadow-sm hover:shadow-md hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {merchant.businessName?.charAt(0) || "M"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm truncate">
                            {merchant.businessName}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0.5 ${
                              merchant.merchantType === "annual"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                : "bg-orange-50 text-orange-700 border-orange-200"
                            }`}
                          >
                            {merchant.merchantType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(merchant.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">
                      #{(recentPage - 1) * pageSize + index + 1}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  <Store className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No merchants found</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {recentTotalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground font-medium">
                Page {recentPage} of {recentTotalPages}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                  disabled={recentPage === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRecentPage((p) => Math.min(recentTotalPages, p + 1))
                  }
                  disabled={recentPage === recentTotalPages}
                  className="h-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Top Performers</CardTitle>
              <CardDescription className="text-xs">
                Ranked by revenue • {topPerformers.length} total
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 px-6 pb-4">
              {topPaginated.length > 0 ? (
                topPaginated.map((merchant, index) => {
                  const rank = (topPage - 1) * pageSize + index + 1;
                  const redemptionRate = merchant.totalCouponsIssued > 0
                    ? ((merchant.totalCouponsRedeemed / merchant.totalCouponsIssued) * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <div
                      key={merchant.merchantId}
                      className="group relative p-4 rounded-xl shadow-sm hover:shadow-md hover:bg-muted/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            rank === 1 ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-400" :
                            rank === 2 ? "bg-slate-100 text-slate-700 border-2 border-slate-400" :
                            rank === 3 ? "bg-orange-100 text-orange-700 border-2 border-orange-400" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {rank}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">
                              {merchant.businessName}
                            </h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ${merchant.totalRevenue?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-2 bg-muted rounded-lg">
                          <div className="text-xs text-muted-foreground mb-0.5">Issued</div>
                          <div className="text-sm font-bold">
                            {merchant.totalCouponsIssued || 0}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded-lg">
                          <div className="text-xs text-muted-foreground mb-0.5">Redeemed</div>
                          <div className="text-sm font-bold">
                            {merchant.totalCouponsRedeemed || 0}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded-lg">
                          <div className="text-xs text-muted-foreground mb-0.5">Rate</div>
                          <div className="text-sm font-bold">
                            {redemptionRate}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No performance data available</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {topTotalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground font-medium">
                Page {topPage} of {topTotalPages}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTopPage((p) => Math.max(1, p - 1))}
                  disabled={topPage === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setTopPage((p) => Math.min(topTotalPages, p + 1))
                  }
                  disabled={topPage === topTotalPages}
                  className="h-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
