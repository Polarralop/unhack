"use client";

/* eslint-disable @next/next/no-img-element -- demo SVGs and blob URLs, no optimisation needed */

import { useEffect, useState } from "react";
import { getImage } from "@/lib/imageStore";
import type { MicroscopyImage } from "@/lib/types";

/**
 * URLs for an image's preview and original. Demo images are static files;
 * uploaded ones are read from IndexedDB and exposed as object URLs.
 */
export function useImageUrls(image: MicroscopyImage | undefined) {
  const [urls, setUrls] = useState<{ id: string; preview: string; original: string } | null>(null);

  useEffect(() => {
    if (!image?.upload) return;
    let cancelled = false;
    const made: string[] = [];
    getImage(image.id).then((stored) => {
      if (cancelled || !stored) return;
      const preview = URL.createObjectURL(stored.preview);
      const original = stored.original === stored.preview ? preview : URL.createObjectURL(stored.original);
      made.push(preview, original);
      setUrls({ id: image.id, preview, original });
    });
    return () => {
      cancelled = true;
      new Set(made).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [image?.id, image?.upload]);

  if (!image) return null;
  if (!image.upload) return { preview: image.src, original: image.src };
  return urls?.id === image.id ? urls : null;
}

export function MicroscopyImg({
  image,
  alt,
  className,
}: {
  image: MicroscopyImage | undefined;
  alt: string;
  className?: string;
}) {
  const urls = useImageUrls(image);
  if (!urls) return <span className={`block bg-black ${className ?? ""}`} role="img" aria-label={alt} />;
  return <img src={urls.preview} alt={alt} className={className} />;
}
