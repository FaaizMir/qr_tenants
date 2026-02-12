"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TemplateCard } from "./TemplateCard";
import { useTranslations } from "next-intl";

export function TemplatePreviewModal({
  open,
  onOpenChange,
  template,
  content,
}) {
  const t = useTranslations("merchantCoupons.template.previewModal");
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("readOnlyPreview")}</DialogDescription>
        </DialogHeader>

        <TemplateCard
          template={template}
          content={content}
          selected={false}
          readOnly={true}
          onSelect={() => {}}
          onPreview={() => {}}
        />
      </DialogContent>
    </Dialog>
  );
}
