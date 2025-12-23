"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TemplateCard } from "./TemplateCard";

export function TemplatePreviewModal({
  open,
  onOpenChange,
  template,
  content,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Template Preview</DialogTitle>
          <DialogDescription>
            Read-only preview with current content.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          <TemplateCard
            template={template}
            content={content}
            selected
            onSelect={() => {}}
            onPreview={() => {}}
            disabled
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
