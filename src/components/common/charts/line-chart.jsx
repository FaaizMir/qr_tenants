"use client";

import React from "react";

export default function LineChart({ data = [], height = 300, color = "#06b6d4" }) {
    if (!data || data.length === 0) return <div className="text-muted-foreground">No data</div>;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d - min) / range) * 100;
        return { x, y, v: d };
    });

    const pathD = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');
    const areaD = `${pathD} L 100 100 L 0 100 Z`;

    const viewBox = "0 0 100 100";

    return (
        <div className="w-full" style={{ height }}>
            <svg viewBox={viewBox} preserveAspectRatio="none" className="w-full h-full">
                {/* subtle horizontal grid */}
                <g stroke="#eef2f4" strokeWidth="0.5">
                    <line x1="0" x2="100" y1="20" y2="20" />
                    <line x1="0" x2="100" y1="40" y2="40" />
                    <line x1="0" x2="100" y1="60" y2="60" />
                    <line x1="0" x2="100" y1="80" y2="80" />
                </g>

                {/* filled area */}
                <path d={areaD} fill={color} fillOpacity="0.08" stroke="none" />

                {/* gradient line */}
                <defs>
                    <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="1" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.6" />
                    </linearGradient>
                </defs>

                <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

                {/* dots + labels */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="0.9" fill={color} />
                    </g>
                ))}
            </svg>
        </div>
    );
}
