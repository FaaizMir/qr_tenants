"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function MasterAdminCommissionContainer() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Commission Management</h1>
                <p className="text-muted-foreground">Manage commissions and earnings.</p>
            </div>
            <Card>
                <CardContent className="p-6">
                    <p>Commission content goes here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
