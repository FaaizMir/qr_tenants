"use client";

import React from "react";

export default function BarChart({ data = [], labels = [], color = "#06b6d4", colors = [] }) {
    if (!data || data.length === 0) return <div className="text-muted-foreground">No data</div>;

    const max = Math.max(...data);

    return (
        <div className="w-full h-[220px] flex items-end gap-3 px-2">
            {data.map((d, i) => {
                const heightPct = Math.max(6, Math.round((d / (max || 1)) * 100));
                const barColor = colors?.[i] || color;
                const darker = shadeColor(barColor, -12);
                return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="text-sm font-medium text-muted-foreground mb-2">{d}%</div>
                        <div className="w-full bg-slate-100 rounded-md overflow-hidden h-full flex items-end" style={{ height: `${heightPct}%` }}>
                            <div
                                className="w-full rounded-md shadow-inner"
                                style={{
                                    height: "100%",
                                    background: `linear-gradient(180deg, ${barColor} 0%, ${darker} 100%)`,
                                }}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground mt-3 text-center truncate w-full">{labels?.[i] ?? ""}</div>
                    </div>
                );
            })}
        </div>
    );
}

// small helper to darken/lighten hex color by percent
function shadeColor(hex, percent) {
    try {
        const h = hex.replace('#', '');
        const num = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
        const r = (num >> 16) + Math.round((percent / 100) * 255);
        const g = ((num >> 8) & 0x00ff) + Math.round((percent / 100) * 255);
        const b = (num & 0x0000ff) + Math.round((percent / 100) * 255);
        const newR = Math.max(0, Math.min(255, r));
        const newG = Math.max(0, Math.min(255, g));
        const newB = Math.max(0, Math.min(255, b));
        return `rgb(${newR}, ${newG}, ${newB})`;
    } catch (e) {
        return hex;
    }
}
