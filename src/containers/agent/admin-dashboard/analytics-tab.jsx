"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
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
import { ChevronLeft, ChevronRight, Loader2, MessageSquare, Ticket, DollarSign } from "lucide-react";

export default function AnalyticsTab() {
  const t = useTranslations("agentDashboard.analytics");
  const { data: session } = useSession();
  const adminId = session?.adminId;

  const [whatsappData, setWhatsappData] = useState([]);
  const [couponData, setCouponData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [whatsappPage, setWhatsappPage] = useState(1);
  const [couponPage, setCouponPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (!adminId) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/admins/${adminId}/dashboard`);
        if (res?.data?.data) {
          setWhatsappData(res.data.data.whatsappStats?.byMerchant || []);
          setCouponData(res.data.data.couponStats?.byMerchant || []);
        }
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
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

  const whatsappPaginated = paginateData(whatsappData, whatsappPage);
  const couponPaginated = paginateData(couponData, couponPage);
  
  const whatsappTotalPages = Math.ceil(whatsappData.length / pageSize);
  const couponTotalPages = Math.ceil(couponData.length / pageSize);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* WhatsApp Usage by Merchant */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-50/50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{t("whatsappUsage.title")}</CardTitle>
              <CardDescription className="text-xs">
                {t("whatsappUsage.description")} • {whatsappData.length} {t("whatsappUsage.merchantsLabel")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 px-6 pb-4">
              {whatsappPaginated.length > 0 ? (
                whatsappPaginated.map((merchant, index) => (
                  <div
                    key={merchant.merchantId}
                    className="group relative p-4 rounded-xl shadow-sm hover:shadow-md hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {merchant.businessName?.charAt(0) || "M"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">
                            {merchant.businessName}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            <span>{merchant.messagesSent || 0} {t("whatsappUsage.messagesSent")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                          <DollarSign className="h-4 w-4" />
                          {(merchant.estimatedCost || 0).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {t("whatsappUsage.estimatedCost")}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground mb-0.5">{t("whatsappUsage.avgPerMessage")}</div>
                        <div className="text-sm font-bold">
                          ${merchant.messagesSent > 0 
                            ? ((merchant.estimatedCost || 0) / merchant.messagesSent).toFixed(3)
                            : "0.000"}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground mb-0.5">{t("whatsappUsage.rank")}</div>
                        <div className="text-sm font-bold">
                          #{(whatsappPage - 1) * pageSize + index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{t("whatsappUsage.noData")}</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {whatsappTotalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground font-medium">
                {t("pagination.pageOf", { current: whatsappPage, total: whatsappTotalPages })}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWhatsappPage((p) => Math.max(1, p - 1))}
                  disabled={whatsappPage === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setWhatsappPage((p) => Math.min(whatsappTotalPages, p + 1))
                  }
                  disabled={whatsappPage === whatsappTotalPages}
                  className="h-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coupon Stats by Merchant */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50/50 rounded-lg">
              <Ticket className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{t("couponPerformance.title")}</CardTitle>
              <CardDescription className="text-xs">
                {t("couponPerformance.description")} • {couponData.length} {t("couponPerformance.merchantsLabel")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 px-6 pb-4">
              {couponPaginated.length > 0 ? (
                couponPaginated.map((merchant, index) => {
                  const redemptionRate = merchant.issued > 0
                    ? ((merchant.redeemed / merchant.issued) * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <div
                      key={merchant.merchantId}
                      className="group relative p-4 rounded-xl shadow-sm hover:shadow-md hover:bg-muted/50 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {merchant.businessName?.charAt(0) || "M"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">
                              {merchant.businessName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-2 py-0.5 ${
                                  redemptionRate >= 50
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : redemptionRate >= 25
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}
                              >
                                {redemptionRate}% {t("couponPerformance.redeemed")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-muted rounded-lg">
                          <div className="text-xs text-muted-foreground mb-0.5">{t("couponPerformance.issued")}</div>
                          <div className="text-sm font-bold">
                            {merchant.issued || 0}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded-lg">
                          <div className="text-xs text-muted-foreground mb-0.5">{t("couponPerformance.redeemedLabel")}</div>
                          <div className="text-sm font-bold">
                            {merchant.redeemed || 0}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded-lg">
                          <div className="text-xs text-muted-foreground mb-0.5">{t("couponPerformance.rank")}</div>
                          <div className="text-sm font-bold">
                            #{(couponPage - 1) * pageSize + index + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Ticket className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{t("couponPerformance.noData")}</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {couponTotalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground font-medium">
                {t("pagination.pageOf", { current: couponPage, total: couponTotalPages })}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCouponPage((p) => Math.max(1, p - 1))}
                  disabled={couponPage === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCouponPage((p) => Math.min(couponTotalPages, p + 1))
                  }
                  disabled={couponPage === couponTotalPages}
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
