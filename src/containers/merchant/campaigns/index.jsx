"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { campaigns } from "./campaigns-data";

export default function MerchantCampaignsContainer() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaign Automation</h1>
        <p className="text-muted-foreground">
          Automate your customer engagement and marketing
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${campaign.colorClass}`}
                  >
                    <campaign.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>{campaign.title}</CardTitle>
                    <CardDescription>{campaign.description}</CardDescription>
                  </div>
                </div>
                <Switch defaultChecked={campaign.defaultChecked} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {campaign.details}
              </p>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs font-mono text-muted-foreground mb-1">
                  Preview:
                </p>
                <p className="text-sm">{campaign.preview}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cost per message:</span>
                <span className="font-semibold">{campaign.cost}</span>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full">
                Configure Settings
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
