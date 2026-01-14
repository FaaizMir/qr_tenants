"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function MasterAdminPackagesContainer() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Packages Management</h1>
                <p className="text-muted-foreground">Manage system packages here.</p>
            </div>
            <Card>
                <CardContent className="p-6">
                    <p>Packages content goes here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
