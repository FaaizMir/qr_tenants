"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "./TemplateCard";
import { TemplateEditorModal } from "./TemplateEditorModal";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { TemplateSafelist } from "./TemplateSafelist";
import axiosInstance from "@/lib/axios";

const defaultContent = {
  header: "",
  title: "",
  description: "",
};

export function TemplateSelector({ isAnnual, onChange, cardRef }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [content, setContent] = useState(defaultContent);
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  /* -------- HELPER -------- */
  const getTemplateId = (t) => t.id || t.templateId || t._id;

  /* -------- FETCH TEMPLATES -------- */
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);

        const endpoint = isAnnual
          ? "/coupons/templates/annual"
          : "/coupons/templates/temporary";

        const res = await axiosInstance.get(endpoint);
        const list = res.data?.data || [];

        // Normalize templates to ensure every item has a unique ID
        // We append the index `_${i}` to guarantee uniqueness even if backend returns duplicate IDs currently
        const normalized = list.map((t, i) => ({
          ...t,
          _uiId: (t.id || t.templateId || t._id)
            ? `${t.id || t.templateId || t._id}_${i}`
            : `temp_${i}`,
        }));

        setTemplates(normalized);

        if (normalized.length > 0) {
          setSelectedId(normalized[0]._uiId);
        }
      } catch (err) {
        console.error("Template fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [isAnnual]);

  /* -------- PROPAGATE CHANGE -------- */
  useEffect(() => {
    if (!selectedId) return;

    // Find the original template to pass correct ID back up
    const selected = templates.find((t) => t._uiId === selectedId);
    if (selected) {
      onChange({
        // Send backend ID if available, otherwise fallback (though backend likely needs real ID)
        templateId: selected.id || selected.templateId || selected._id,
        content,
      });
    }
  }, [selectedId, content, onChange, templates]);

  const selectedTemplate =
    templates.find((t) => t._uiId === selectedId) || null;

  const handleSelect = (id) => {
    if (!isAnnual) return;
    setSelectedId(id);
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading templates…</p>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">
            {isAnnual
              ? "Choose a template"
              : "Template locked for temporary plan"}
          </p>
          <p className="text-xs text-muted-foreground">
            Hover to preview or click to open
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEditorOpen(true)}
            disabled={!selectedTemplate}
          >
            Edit Content
          </Button>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setPreviewOpen(true)}
            disabled={!selectedTemplate}
          >
            Preview
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((tpl) => {
          const isSel = tpl._uiId === selectedId;
          return (
            <TemplateCard
              key={tpl._uiId}
              ref={isSel ? cardRef : null}
              template={tpl}
              content={content}
              selected={isSel}
              disabled={!isAnnual && !isSel}
              onSelect={() => handleSelect(tpl._uiId)}
              onPreview={() => setPreviewOpen(true)}
            />
          );
        })}
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
