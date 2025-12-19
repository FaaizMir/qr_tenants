"use client";

import React from "react";

export default function HorizontalBarChart({ items = [], color = "#06b6d4" }) {
    if (!items || items.length === 0) return <div className="text-muted-foreground">No data</div>;
    const max = Math.max(...items.map((i) => i.value));

    return (
        <div className="w-full space-y-4">
            {items.map((it, idx) => {
                const pct = Math.round((it.value / (max || 1)) * 100);
                return (
                    <div key={idx} className="flex items-center gap-4 py-2">
                        <div className="w-40 text-sm text-muted-foreground truncate">{it.label}</div>
                        <div className="flex-1">
                            <div className="relative bg-slate-100 rounded-full h-4 overflow-hidden">
                                <div
                                    className="absolute left-0 top-0 bottom-0 rounded-full shadow-sm"
                                    style={{ width: `${pct}%`, background: color }}
                                />
                            </div>
                        </div>
                        <div className="w-12 text-right text-sm font-semibold text-slate-700">{it.value}</div>
                    </div>
                );
            })}
        </div>
    );
}
