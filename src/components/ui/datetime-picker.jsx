"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

export function DateTimePicker({ value, onChange }) {
    // value is expected in YYYY-MM-DDTHH:mm format
    const date = React.useMemo(() => (value ? new Date(value) : new Date()), [value]);

    const handleDateSelect = (newDate) => {
        if (!newDate) return;
        const hours = date.getHours();
        const minutes = date.getMinutes();
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        updateValue(newDate);
    };

    const handleTimeChange = (type, val) => {
        const newDate = new Date(date);
        if (type === "hour") {
            newDate.setHours(parseInt(val));
        } else if (type === "minute") {
            newDate.setMinutes(parseInt(val));
        }
        updateValue(newDate);
    };

    const updateValue = (newDate) => {
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, "0");
        const day = String(newDate.getDate()).padStart(2, "0");
        const hours = String(newDate.getHours()).padStart(2, "0");
        const minutes = String(newDate.getMinutes()).padStart(2, "0");

        onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
        <div className="flex flex-col sm:flex-row gap-0 bg-white rounded-lg overflow-hidden translate-x-1">
            <div className="p-3 border-r border-border/50">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="p-0"
                    classNames={{
                        month_caption: "flex justify-center py-2 relative items-center text-sm font-semibold text-gray-900",
                        nav: "flex items-center gap-1 absolute top-0 inset-x-0 justify-between px-2",
                        day: cn(
                            "h-8 w-8 text-center text-xs p-0 font-medium aria-selected:opacity-100 hover:bg-gray-100 rounded-md transition-colors"
                        ),
                        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    }}
                />
            </div>
            <div className="flex flex-col w-[130px] bg-gray-50/50 p-3">
                <div className="flex items-center gap-2 mb-3 px-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Clock className="h-3 w-3" />
                    Time
                </div>
                <div className="flex gap-2 h-60">
                    <ScrollArea className="flex-1 h-full">
                        <div className="flex flex-col pr-2 gap-1">
                            {hours.map((h) => (
                                <Button
                                    key={h}
                                    variant={date.getHours() === h ? "default" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "h-7 w-full justify-center text-[11px] font-medium px-0 rounded-md",
                                        date.getHours() === h ? "shadow-sm" : "text-gray-500"
                                    )}
                                    onClick={() => handleTimeChange("hour", h)}
                                >
                                    {String(h).padStart(2, "0")}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                    <ScrollArea className="flex-1 h-full font-mono">
                        <div className="flex flex-col pr-2 gap-1">
                            {minutes.map((m) => (
                                <Button
                                    key={m}
                                    variant={date.getMinutes() === m ? "default" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "h-7 w-full justify-center text-[11px] font-medium px-0 rounded-md",
                                        date.getMinutes() === m ? "shadow-sm" : "text-gray-500"
                                    )}
                                    onClick={() => handleTimeChange("minute", m)}
                                >
                                    {String(m).padStart(2, "0")}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
