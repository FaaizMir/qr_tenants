import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRef, useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TemplateEditorModal({ open, onOpenChange, value, onChange, batchId }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Sync internal preview with incoming value
  useEffect(() => {
    if (value?.brand_image) {
      setPreviewUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api${value.brand_image}`);
    } else {
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  }, [value?.brand_image, open]);

  const handleField = (field) => (e) => {
    onChange({ ...value, [field]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDone = async () => {
    // Validation
    if (!selectedFile && !value?.brand_image) {
      toast.error("Brand image is mandatory");
      return;
    }

    setUploading(true);
    let currentBrandImage = value?.brand_image;

    try {
      // 1. Upload new image if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("brandImage", selectedFile);

        const uploadRes = await axiosInstance.post("/coupon-batches/upload-brand-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        currentBrandImage = uploadRes.data?.url;
        if (!currentBrandImage) {
          throw new Error("Failed to get image URL from server");
        }
      }

      // 2. Update local state
      const updatedValue = {
        ...value,
        brand_image: currentBrandImage,
      };
      onChange(updatedValue);

      // 3. Patch batch if batchId is provided (Editing mode)
      if (batchId) {
        await axiosInstance.patch(`/coupon-batches/${batchId}`, {
          header: updatedValue.header,
          title: updatedValue.title,
          description: updatedValue.description,
          brand_image: updatedValue.brand_image,
        });
        toast.success("Content updated successfully");
      }

      onOpenChange(false);
    } catch (err) {
      console.error("Save failed", err);
      toast.error(err?.response?.data?.message || "Failed to save content");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Template Content</DialogTitle>
          <DialogDescription>
            Update brand image, header, title, and description. Changes preview live.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Brand Image <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-4">
              {previewUrl && (
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Brand Preview"
                    className="h-20 w-20 rounded-md object-contain bg-muted p-1 border"
                  />
                  {!uploading && (
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(value?.brand_image ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api${value.brand_image}` : null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {previewUrl ? "Change Image" : "Upload Brand Image"}
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Required for all templates</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Header</label>
            <Input
              value={value?.header || ""}
              onChange={handleField("header")}
              placeholder="e.g. SPECIAL OFFER"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={value?.title || ""}
              onChange={handleField("title")}
              placeholder="e.g. 50% Discount"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={value?.description || ""}
              onChange={handleField("description")}
              rows={4}
              placeholder="Describe the offer details..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDone}
            disabled={uploading}
          >
            {uploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
