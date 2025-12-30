"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function injectContent(html, content) {
  // Strip hardcoded "Selected" badges if they exist in the HTML
  // Matches <div/span/p ...> ... Selected ... </div> without destroying the whole layout if used carefully
  // This is a heuristic to fix the "double badge" issue where backend HTML already has it.
  const cleanedHtml = html.replace(
    /<(div|span|p)[^>]*class="[^"]*badge[^"]*"[^>]*>\s*Selected\s*<\/\1>/gi,
    ""
  ).replace(
    // Fallback: remove any small element strictly containing just "Selected"
    /<(div|span|p)[^>]*>\s*Selected\s*<\/\1>/gi,
    ""
  );

  return cleanedHtml
    .replace(/{{header}}/g, content.header || "Header")
    .replace(/{{title}}/g, content.title || "Title")
    .replace(/{{description}}/g, content.description || "Description");
}

export const TemplateCard = forwardRef(
  (
    {
      template,
      content,
      selected,
      disabled,
      readOnly,
      onSelect,
      onPreview,
      className,
    },
    ref
  ) => {
    const finalHtml = injectContent(template.html, content);

    return (
      <div
        ref={ref}
        onClick={() => {
          if (!disabled && !readOnly) {
            onSelect();
            onPreview();
          }
        }}
        className={cn(
          "group relative w-full overflow-hidden rounded-xl border bg-background transition-all cursor-pointer",
          selected ? "border-primary ring-1 ring-primary" : "border-border",
          disabled && "cursor-not-allowed opacity-60",
          readOnly && "cursor-default",
          !disabled && !readOnly && "hover:shadow-lg",
          className
        )}
      >
        {/* HTML Content */}
        <div
          className="h-full w-full"
          dangerouslySetInnerHTML={{ __html: finalHtml }}
        />

        {/* Selected Badge */}
        {selected && (
          <div className="absolute right-3 top-3 z-10">
            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
              Selected
            </Badge>
          </div>
        )}

        {/* Hover Overlay */}
        {!disabled && !readOnly && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg  cursor-pointer border-primary px-4 py-2 text-xs font-medium text-white transition  hover:border-primary"
            >
              Click to Preview
            </button>
          </div>
        )}
      </div>
    );
  }
);

TemplateCard.displayName = "TemplateCard";
