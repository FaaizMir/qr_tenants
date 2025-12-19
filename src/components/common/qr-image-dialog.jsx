"use client";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export default function QRImageDialogHover({
  imageBase64,
  filename = "qr-code.png",
  label = "QR Code",
  openOnHover = false,
  sizeClass = "w-8 h-8",
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const handleDownload = async () => {
    try {
      const res = await fetch(imageBase64);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to download QR image", e);
    }
  };

  if (!imageBase64) return null;

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  const triggerEnter = () => {
    if (!openOnHover) return;
    clearCloseTimer();
    setOpen(true);
  };

  const triggerLeave = () => {
    if (!openOnHover) return;
    scheduleClose();
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        className={`${sizeClass} rounded overflow-hidden cursor-pointer p-0 border-0 bg-transparent`}
        onClick={() => setOpen(true)}
        onMouseEnter={triggerEnter}
        onMouseLeave={triggerLeave}
        aria-label={label}
      >
        <img src={imageBase64} alt={label} className={`${sizeClass} object-cover`} />
      </button>

      <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
        <DialogContent className="sm:max-w-sm" onMouseEnter={() => { clearCloseTimer(); }} onMouseLeave={() => { if (openOnHover) scheduleClose(); }}>
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            <img src={imageBase64} alt={label} className="max-w-[360px] max-h-[360px]" />
            <div className="w-full flex gap-2">
              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
