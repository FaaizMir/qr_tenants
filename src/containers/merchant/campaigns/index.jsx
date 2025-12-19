"use client";

import { MessageSquare, Gift, Star, Calendar } from "lucide-react";
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
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";

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
        {/* WhatsApp Nudge */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>WhatsApp Nudge</CardTitle>
                  <CardDescription>
                    Send reminder to inactive customers
                  </CardDescription>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Automatically send a WhatsApp message to customers who
              haven&apos;t visited in 30 days.
            </p>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs font-mono text-muted-foreground mb-1">
                Preview:
              </p>
              <p className="text-sm">
                &quot;Hi [Name]! We miss you at [Store Name]. Here is a 10%
                discount coupon for your next visit!&quot;
              </p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cost per message:</span>
              <span className="font-semibold">1 Credit</span>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="w-full">
              Configure Settings
            </Button>
          </CardFooter>
        </Card>

        {/* Birthday Rewards */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Birthday Rewards</CardTitle>
                  <CardDescription>
                    Automatic birthday wishes & coupons
                  </CardDescription>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send a special birthday greeting and exclusive offer to customers
              on their birthday.
            </p>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs font-mono text-muted-foreground mb-1">
                Preview:
              </p>
              <p className="text-sm">
                &quot;Happy Birthday [Name]! 🎂 Enjoy a free dessert on us today
                at [Store Name]!&quot;
              </p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cost per message:</span>
              <span className="font-semibold">2 Credits</span>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="w-full">
              Configure Settings
            </Button>
          </CardFooter>
        </Card>

        {/* Post-Review Message */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Post-Review Message</CardTitle>
                  <CardDescription>
                    Thank customers after a review
                  </CardDescription>
                </div>
              </div>
              <Switch />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send a thank you message immediately after a customer leaves a
              review.
            </p>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs font-mono text-muted-foreground mb-1">
                Preview:
              </p>
              <p className="text-sm">
                &quot;Thanks for the [Rating] star review! We appreciate your
                feedback. See you soon!&quot;
              </p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cost per message:</span>
              <span className="font-semibold">1 Credit</span>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="w-full">
              Configure Settings
            </Button>
          </CardFooter>
        </Card>

        {/* Festival Greetings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Festival Greetings</CardTitle>
                  <CardDescription>
                    Seasonal & holiday campaigns
                  </CardDescription>
                </div>
              </div>
              <Switch />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Schedule messages for upcoming festivals (Christmas, New Year,
              Diwali, etc.).
            </p>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs font-mono text-muted-foreground mb-1">
                Preview:
              </p>
              <p className="text-sm">
                &quot;Merry Christmas! 🎄 Celebrate with us and get 15% off this
                week!&quot;
              </p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cost per message:</span>
              <span className="font-semibold">1.5 Credits</span>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="w-full">
              Configure Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
