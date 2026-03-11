"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function MerchantAdsContainer() {
  const t = useTranslations("merchantPaidAds");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t?.("title") || "Ads & Promotions"}</CardTitle>
          <CardDescription>
            {t?.("description") || "Manage your advertisement campaigns and promotions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {t?.("noAds") || "No active ads campaigns"}
              </p>
              <Button>
                {t?.("createAd") || "Create New Campaign"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
