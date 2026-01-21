import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link as LinkIcon } from "lucide-react";

export default function PlatformItem({
    icon,
    label,
    color,
    enabled,
    onToggle,
    link,
    onLinkChange,
    placeholder,
}) {
    return (
        <div
            className={`rounded-xl border transition-all duration-300 ${enabled
                    ? `bg-white shadow-sm border-primary/20`
                    : "bg-muted/10 border-muted/40"
                }`}
        >
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        {icon}
                    </div>
                    <Label
                        className={`text-sm font-semibold cursor-pointer ${enabled ? "text-foreground" : "text-muted-foreground"
                            }`}
                    >
                        {label}
                    </Label>
                </div>
                <Switch checked={enabled} onCheckedChange={onToggle} />
            </div>

            <div
                className={`grid transition-all duration-300 ease-in-out ${enabled
                        ? "grid-rows-[1fr] opacity-100 pb-4 px-4"
                        : "grid-rows-[0fr] opacity-0 p-0"
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="relative">
                        <Input
                            value={link}
                            onChange={onLinkChange}
                            placeholder={placeholder}
                            className="pl-9 bg-muted/20 border-muted/60"
                        />
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                </div>
            </div>
        </div>
    );
}
