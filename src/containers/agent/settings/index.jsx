"use client";

import { useTranslations } from "next-intl";
import { BrandingForm } from "./branding-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function AgentSettingsContainer() {
    const t = useTranslations("agent.settings");

    return (
        <div className="space-y-6 p-1">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {t("platformSettings")}
                </h1>
                <p className="text-muted-foreground">
                    {t("settingsDescription")}
                </p>
            </div>

            <Tabs defaultValue="branding" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="branding">Branding</TabsTrigger>
                    <TabsTrigger value="general">Details</TabsTrigger>
                    <TabsTrigger value="domains">Domain</TabsTrigger>
                </TabsList>

                <TabsContent value="branding" className="mt-6 space-y-6">
                    <BrandingForm />
                </TabsContent>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Manage your contact details and support channels.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-muted-foreground">Contact settings coming soon...</div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="domains">
                    <Card>
                        <CardHeader>
                            <CardTitle>Domain Configuration</CardTitle>
                            <CardDescription>Manage your white-label subdomain.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-muted/50 border flex justify-between items-center">
                                <div>
                                    <div className="font-medium">current-agent.platform.com</div>
                                    <div className="text-xs text-muted-foreground">Primary Subdomain</div>
                                </div>
                                <div className="px-2 py-1 bg-green-500/10 text-green-600 text-xs rounded font-medium">Active</div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
