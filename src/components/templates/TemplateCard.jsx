"use client";

import { cn } from "@/lib/utils";

const variantClasses = {
  sunrise:
    "bg-gradient-to-br from-amber-100 via-white to-orange-50 border-amber-200 text-amber-900",
  midnight:
    "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 text-white",
  mint: "bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border-emerald-200 text-emerald-900",
  amber:
    "bg-gradient-to-br from-yellow-50 via-white to-amber-100 border-amber-200 text-amber-900",
  slate:
    "bg-gradient-to-br from-slate-50 via-white to-slate-100 border-slate-200 text-slate-900",
};

export function TemplateCard({
  template,
  content,
  selected,
  disabled,
  onSelect,
  onPreview,
}) {
  const body = {
    header: content?.header || template?.header || "Header",
    title: content?.title || template?.title || "Title",
    description: content?.description || template?.description || "Description",
  };

  return (
    <button
      type="button"
      onClick={() => {
        if (!disabled) {
          onSelect();
          onPreview();
        }
      }}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary",
        variantClasses[template.styleVariant],
        disabled && "cursor-not-allowed opacity-60",
        selected && "ring-2 ring-offset-2 ring-primary"
      )}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
        {template.name}
      </div>

      <div className="mt-2 text-sm font-medium opacity-80">{body.header}</div>

      <div className="mt-1 text-2xl font-bold leading-tight">{body.title}</div>

      <p className="mt-2 text-sm opacity-80 line-clamp-3">{body.description}</p>

      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/0 via-black/0 to-black/0 transition group-hover:from-black/5 group-hover:to-black/20" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
        <div className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          Click to Preview
        </div>
      </div>

      {selected && (
        <div className="absolute top-3 right-3 rounded-full bg-primary text-primary-foreground px-3 py-1 text-[11px] font-semibold shadow">
          Selected
        </div>
      )}
    </button>
  );
}
