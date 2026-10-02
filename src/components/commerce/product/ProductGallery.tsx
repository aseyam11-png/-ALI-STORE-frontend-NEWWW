"use client";

import Image from "next/image";
import { useState } from "react";
import { Maximize2 } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  // Reset naturally on remount: the caller keys this component by
  // selected variant, so a fresh instance (and fresh default) is created
  // whenever the image set actually changes — no effect needed.
  const [selectedImage, setSelectedImage] =
    useState(images[0] ?? "");

  const [fullscreenOpen, setFullscreenOpen] =
    useState(false);

  if (images.length === 0) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-neutral-200 bg-surface">
        <p className="text-sm text-neutral-400">
          No product images available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-surface">
        <div className="relative aspect-square min-h-[420px] sm:min-h-[520px]">
          <Image
            src={selectedImage}
            alt={productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-contain p-10 sm:p-14"
          />
        </div>

        <button
          type="button"
          onClick={() =>
            setFullscreenOpen(true)
          }
          aria-label="View fullscreen"
          className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-surface/95 text-neutral-500 shadow-sm transition hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        <div className="absolute bottom-4 start-4 rounded-full bg-surface/95 px-3 py-1.5 text-[11px] font-bold text-neutral-500 shadow-sm">
          Product preview
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((image, index) => {
          const isSelected = image === selectedImage;

          return (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              aria-label={`View ${productName} image ${index + 1}`}
              aria-pressed={isSelected}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-surface transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 ${
                isSelected
                  ? "border-brand ring-2 ring-primary-100"
                  : "border-neutral-200 hover:border-primary-200"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} image ${index + 1}`}
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            </button>
          );
        })}
      </div>

      <Dialog
        open={fullscreenOpen}
        onClose={() =>
          setFullscreenOpen(false)
        }
        title={productName}
      >
        <div className="relative aspect-square w-full">
          <Image
            src={selectedImage}
            alt={productName}
            fill
            sizes="(max-width: 640px) 90vw, 560px"
            className="object-contain"
          />
        </div>
      </Dialog>

    </div>
  );
}
