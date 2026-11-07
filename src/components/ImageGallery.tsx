"use client";

import { useEffect, useRef, useState } from "react";
import type { MicroscopyImage, ProbeChannel } from "@/lib/types";
import { MicroscopyImg, useImageUrls } from "./MicroscopyImg";

function fileName(title: string, img: MicroscopyImage) {
  if (img.upload) return img.upload.fileName;
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const ext = img.src.split(".").pop();
  return `${base}-${img.magnification.replace("×", "x")}.${ext}`;
}

export function ProbeLegend({ probes }: { probes: ProbeChannel[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
      {probes.map((p) => (
        <li key={p.name} className="flex items-center gap-1.5">
          <span className="size-3 shrink-0 rounded-full ring-1 ring-black/20" style={{ background: p.color }} aria-hidden />
          {p.name}
        </li>
      ))}
    </ul>
  );
}

/** Microscopy image thumbnails that open in a full-screen preview with download. */
export function ImageGallery({
  images,
  probes,
  title,
}: {
  images: MicroscopyImage[];
  probes: ProbeChannel[];
  title: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  if (images.length === 0) return null;
  const current = open !== null ? images[open] : undefined;
  const step = (delta: number) =>
    setOpen((i) => (i === null ? i : (i + delta + images.length) % images.length));

  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-2 gap-3">
        {images.map((img, i) => (
          <li key={img.id}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full overflow-hidden rounded-md border border-line bg-black text-left"
            >
              <MicroscopyImg
                image={img}
                alt={`${title}: ${img.caption}, ${img.magnification}`}
                className="aspect-[4/3] w-full object-cover"
              />
              <span className="flex items-center justify-between gap-2 bg-surface px-3 py-2 text-sm">
                <span>
                  {img.caption} <span className="text-muted">({img.magnification})</span>
                </span>
                <span className="font-semibold text-scrub-deep group-hover:underline">Expand</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <ProbeLegend probes={probes} />

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(null);
        }}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/85"
        aria-label={current ? `${title}: ${current.caption}` : title}
      >
        {current && (
          <div className="flex h-dvh w-screen flex-col bg-black/95 p-3 text-white sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p>
                <span className="font-semibold">{current.caption}</span>{" "}
                <span className="text-white/70">
                  {current.magnification}, image {open! + 1} of {images.length}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <DownloadLink image={current} fileName={fileName(title, current)} />
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="rounded-md border border-white/40 px-4 py-2 font-semibold hover:border-white"
                  autoFocus
                >
                  Close
                </button>
              </div>
            </div>

            <div className="relative mt-3 flex min-h-0 flex-1 items-center justify-center">
              <MicroscopyImg image={current} alt={`${title}: ${current.caption}`} className="max-h-full max-w-full object-contain" />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous image"
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-2xl hover:bg-black/80"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next image"
                    className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-2xl hover:bg-black/80"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div className="mt-3 rounded-md bg-white/95 px-4 py-3 text-ink">
              <ProbeLegend probes={probes} />
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}

/** Downloads the original file exactly as captured. */
function DownloadLink({ image, fileName }: { image: MicroscopyImage; fileName: string }) {
  const urls = useImageUrls(image);
  return (
    <a
      href={urls?.original}
      download={fileName}
      aria-disabled={!urls}
      className="rounded-md bg-white px-4 py-2 font-semibold text-ink hover:bg-white/90 aria-disabled:opacity-50"
    >
      Download original
    </a>
  );
}
