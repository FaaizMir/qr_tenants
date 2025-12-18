"use client";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useState } from "react";

export function QRCodeDialog({ open, onOpenChange, merchant, baseUrl }) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!merchant) return null;

  // Generate URL for the merchant (using subdomain)
  const merchantUrl = baseUrl
    ? `${baseUrl.replace(/\/$/, "")}/${merchant.subdomain}`
    : `https://${merchant.subdomain}.example.com`;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Create a canvas to render the QR code
      const svgElement = document.querySelector(`#qr-code-${merchant.id} svg`);
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `qr-code-${merchant.subdomain}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, "image/png");
      };

      img.onerror = () => {
        console.error("Error loading image for download");
        setIsDownloading(false);
      };

      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error("Error downloading QR code:", error);
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {merchant.name}</DialogTitle>
          <DialogDescription>
            Scan this QR code to access {merchant.name}'s portal
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div
            id={`qr-code-${merchant.id}`}
            className="p-4 bg-white rounded-lg border-2 border-gray-200"
          >
            <QRCodeSVG
              value={merchantUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-mono text-muted-foreground break-all">
              {merchantUrl}
            </p>
            <p className="text-xs text-muted-foreground">
              Subdomain: {merchant.subdomain}
            </p>
          </div>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            variant="outline"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download QR Code"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

