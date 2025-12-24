"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { annualTemplates, temporaryTemplates } from "./templates.config";
import { TemplateCard } from "./TemplateCard";
import { TemplateEditorModal } from "./TemplateEditorModal";
import { TemplatePreviewModal } from "./TemplatePreviewModal";

const defaultContent = {
  header: "",
  title: "",
  description: "",
};

export function TemplateSelector({ isAnnual, onChange, cardRef }) {
  const templates = useMemo(
    () => (isAnnual ? annualTemplates : temporaryTemplates),
    [isAnnual]
  );

  const [selectedId, setSelectedId] = useState(() => templates[0]?.id);
  const [content, setContent] = useState(defaultContent);
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!selectedId) return;

    onChange({
      templateId: selectedId,
      content,
    });
  }, [selectedId, content, onChange]);

  const selectedTemplate =
    templates.find((t) => t.id === selectedId) || templates[0];

  const handleSelect = (id) => {
    if (!isAnnual) return;
    setSelectedId(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">
            {isAnnual
              ? "Choose a template"
              : "Template locked for temporary plan"}
          </p>
          <p className="text-xs text-muted-foreground">
            Hover to preview. Click a card or “Preview” to see full view.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditorOpen(true)}
          >
            Edit Template Content
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            template={tpl}
            content={content}
            selected={tpl.id === selectedId}
            disabled={!isAnnual && tpl.id !== selectedId}
            onSelect={() => handleSelect(tpl.id)}
            onPreview={() => setPreviewOpen(true)}
            ref={tpl.id === selectedId ? cardRef : null}
          />
        ))}
      </div>

      {/* Modals */}
      {selectedTemplate && (
        <TemplateEditorModal
          open={editorOpen}
          onOpenChange={setEditorOpen}
          value={content}
          onChange={setContent}
        />
      )}

      {selectedTemplate && (
        <TemplatePreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          template={selectedTemplate}
          content={content}
        />
      )}
    </div>
  );
}
