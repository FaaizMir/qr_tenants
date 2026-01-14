"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function MasterAdminMerchantsContainer() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Merchants Management</h1>
                <p className="text-muted-foreground">Manage all merchants here.</p>
            </div>
            <Card>
                <CardContent className="p-6">
                    <p>Merchants content goes here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
