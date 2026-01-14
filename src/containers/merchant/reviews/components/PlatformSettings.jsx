import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import PlatformItem from "./PlatformItem";

export default function PlatformSettings({ config, setConfig }) {
    return (
        <Card className="border-muted/40 shadow-sm overflow-hidden bg-linear-to-br from-white to-gray-50/50">
            <CardHeader className="pb-6 border-b border-muted/20 bg-white/50">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Share2 className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-semibold">
                            Review Platforms
                        </CardTitle>
                        <CardDescription>
                            Connect your social profiles to collect reviews
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid gap-6 p-6">
                {/* Google */}
                <PlatformItem
                    icon={
                        <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                    }
                    label="Google Business"
                    color="hover:border-blue-200 hover:bg-blue-50/30"
                    enabled={config.enableGoogle}
                    onToggle={(c) => setConfig({ ...config, enableGoogle: c })}
                    link={config.googleReviewLink}
                    onLinkChange={(e) =>
                        setConfig({ ...config, googleReviewLink: e.target.value })
                    }
                    placeholder="https://g.page/r/..."
                />

                {/* Facebook */}
                <PlatformItem
                    icon={
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg"
                            alt="F"
                            className="w-5 h-5"
                        />
                    }
                    label="Facebook Page"
                    color="hover:border-indigo-200 hover:bg-indigo-50/30"
                    enabled={config.enableFacebook}
                    onToggle={(c) => setConfig({ ...config, enableFacebook: c })}
                    link={config.facebookReviewLink}
                    onLinkChange={(e) =>
                        setConfig({ ...config, facebookReviewLink: e.target.value })
                    }
                    placeholder="https://facebook.com/..."
                />

                {/* Instagram */}
                <PlatformItem
                    icon={
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg"
                            alt="I"
                            className="w-5 h-5"
                        />
                    }
                    label="Instagram"
                    color="hover:border-pink-200 hover:bg-pink-50/30"
                    enabled={config.enableInstagram}
                    onToggle={(c) => setConfig({ ...config, enableInstagram: c })}
                    link={config.instagramReviewLink}
                    onLinkChange={(e) =>
                        setConfig({ ...config, instagramReviewLink: e.target.value })
                    }
                    placeholder="https://instagram.com/..."
                />

                {/* RED (XiaoHongShu) */}
                <PlatformItem
                    icon={
                        <span className="text-red-500 font-bold text-lg leading-none">
                            Red
                        </span>
                    }
                    label="XiaoHongShu"
                    color="hover:border-red-200 hover:bg-red-50/30"
                    enabled={config.enableRed}
                    onToggle={(c) => setConfig({ ...config, enableRed: c })}
                    link={config.redReviewLink}
                    onLinkChange={(e) =>
                        setConfig({ ...config, redReviewLink: e.target.value })
                    }
                    placeholder="https://xiaohongshu.com/..."
                />
            </CardContent>
        </Card>
    );
}
