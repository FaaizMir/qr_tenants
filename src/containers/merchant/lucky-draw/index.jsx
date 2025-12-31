"use client";

import React, { useState } from "react";
import {
  Trophy,
  Plus,
  Trash2,
  Save,
  Percent,
  AlertCircle
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DataTable } from "@/components/common/data-table";
import { winnersColumns } from "./lucky-draw-columns";
import { winners } from "./lucky-draw-data";

export default function MerchantLuckyDrawContainer() {
  const [loading, setLoading] = useState(false);

  // -- Instant Draw Configuration --
  const [prizes, setPrizes] = useState([
    { id: 1, name: "10% OFF Coupon", probability: 40, limit: 100, used: 12 },
    { id: 2, name: "Free Drink", probability: 30, limit: 50, used: 25 },
    { id: 3, name: "Buy 1 Get 1", probability: 20, limit: 20, used: 18 },
    { id: 4, name: "Grand Prize: $100 Voucher", probability: 1, limit: 1, used: 0 },
    { id: 5, name: "Better Luck Next Time", probability: 9, limit: 9999, used: 150 },
  ]);

  const [dailyLimit, setDailyLimit] = useState(1);
  const [customerCooldown, setCustomerCooldown] = useState(24); // hours

  const totalProbability = prizes.reduce((sum, p) => sum + Number(p.probability), 0);
  const isProbabilityValid = totalProbability === 100;

  const handleAddPrize = () => {
    const newId = Math.max(...prizes.map(p => p.id)) + 1;
    setPrizes([...prizes, { id: newId, name: "New Prize", probability: 0, limit: 10, used: 0 }]);
  };

  const handleUpdatePrize = (id, field, value) => {
    setPrizes(prizes.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleDeletePrize = (id) => {
    setPrizes(prizes.filter(p => p.id !== id));
  };

  const handleSaveConfig = async () => {
    if (!isProbabilityValid) {
      toast.error(`Total probability must be 100%. Current: ${totalProbability}%`);
      return;
    }
    setLoading(true);
    // Simulate API save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    toast.success("Lucky Draw configuration saved!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Lucky Draw Settings</h1>
        <p className="text-muted-foreground">
          Configure the "Spin the Wheel" prizes for customers who complete a review.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* -- Configuration Logic -- */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Prize Probability</CardTitle>
                <div className={`text-sm font-bold px-3 py-1 rounded-full border ${isProbabilityValid ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                  Total: {totalProbability}%
                </div>
              </div>
              <CardDescription>
                Define what customers can win. Ensure probability sums to 100%.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prizes.map((prize) => (
                  <div key={prize.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 border rounded-lg bg-card hover:bg-muted/20 transition-colors">
                    <div className="flex-1 space-y-1 w-full">
                      <Label className="text-xs text-muted-foreground">Prize Name</Label>
                      <Input
                        value={prize.name}
                        onChange={e => handleUpdatePrize(prize.id, 'name', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="w-full sm:w-24 space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1"><Percent className="w-3 h-3" /> Odds</Label>
                      <Input
                        type="number"
                        value={prize.probability}
                        onChange={e => handleUpdatePrize(prize.id, 'probability', Number(e.target.value))}
                        className="h-9"
                      />
                    </div>
                    <div className="w-full sm:w-24 space-y-1">
                      <Label className="text-xs text-muted-foreground">Qty Limit</Label>
                      <Input
                        type="number"
                        value={prize.limit}
                        onChange={e => handleUpdatePrize(prize.id, 'limit', Number(e.target.value))}
                        className="h-9"
                      />
                    </div>
                    <div className="pt-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePrize(prize.id)}
                        className="h-9 w-9 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={handleAddPrize} className="w-full border-dashed">
                  <Plus className="mr-2 h-4 w-4" /> Add Prize Option
                </Button>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t p-4 bg-muted/20">
              <div className="text-xs text-muted-foreground">
                Changes apply immediately to new spins.
              </div>
              <Button onClick={handleSaveConfig} disabled={loading}>
                {loading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Configuration</>}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Winners</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={winners.slice(0, 5)}
                columns={winnersColumns}
                hideToolbar={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* -- Rules & Limits -- */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rules & Limits</CardTitle>
              <CardDescription>Control participation frequency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Max Spins Per Customer (Total)</Label>
                <Input
                  type="number"
                  value={dailyLimit}
                  onChange={e => setDailyLimit(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Limit the total number of times a single customer can ever play.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Cooldown Period (Hours)</Label>
                <Input
                  type="number"
                  value={customerCooldown}
                  onChange={e => setCustomerCooldown(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Time before a customer can review & spin again.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                Note
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-800/80">
              <p>
                If a prize limit is reached, the system will automatically default to the next available prize with the highest probability, or "Better Luck Next Time".
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
