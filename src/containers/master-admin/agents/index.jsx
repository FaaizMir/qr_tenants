"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function MasterAdminAgentsContainer() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Agents Management</h1>
                <p className="text-muted-foreground">Manage agents listing here.</p>
            </div>
            <Card>
                <CardContent className="p-6">
                    <p>Agents content goes here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
