"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function TemplateEditorModal({ open, onOpenChange, value, onChange }) {
  const handleField = (field) => (e) => {
    onChange({ ...value, [field]: e.target.value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Template Content</DialogTitle>
          <DialogDescription>
            Update header, title, and description. Changes preview live.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Header</label>
            <Input
              value={value?.header || ""}
              onChange={handleField("header")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={value?.title || ""} onChange={handleField("title")} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={value?.description || ""}
              onChange={handleField("description")}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
