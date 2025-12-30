// This file exists solely to force Tailwind CSS to generate classes 
// that are used dynamically in the template API response but not found elsewhere in the source code.

export const TemplateSafelist = () => (
    <div className="hidden">
        {/* Sunrise Promo */}
        <div className="bg-gradient-to-br from-amber-100 via-white to-orange-50 border-amber-200 text-amber-900"></div>

        {/* Midnight Glow */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 text-white"></div>

        {/* Fresh Mint */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border-emerald-200 text-emerald-900"></div>

        {/* Amber Edge (overlaps with Sunrise mostly) */}
        <div className="from-yellow-50 to-amber-100"></div>

        {/* Ensure basic utilities often used in these templates are present */}
        <div className="group relative w-full overflow-hidden rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary ring-2 ring-primary bg-black/70 bg-primary text-primary-foreground shadow"></div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70 mt-2 text-sm font-medium opacity-80 mt-1 text-2xl font-bold leading-tight line-clamp-3 pointer-events-none absolute inset-0 bg-linear-to-b from-black/0 via-black/0 to-black/0 group-hover:from-black/5 group-hover:to-black/20 flex items-center justify-center group-hover:opacity-100"></div>
    </div>
);
