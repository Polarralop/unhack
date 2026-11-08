"use client";

/* eslint-disable @next/next/no-img-element -- local blob previews */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProbeLegend } from "@/components/ImageGallery";
import { ASSAYS } from "@/lib/assays";
import { isTiff, putImage, tiffToPng } from "@/lib/imageStore";
import { PATIENTS, uploadedCapture } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { MicroscopyImage } from "@/lib/types";

const field = "w-full rounded-md border border-line bg-surface px-3 py-2";
const ACCEPT = ".jpg,.jpeg,.png,.tif,.tiff,image/jpeg,image/png,image/tiff";
const MAGNIFICATIONS = ["10×", "20×", "40×", "63×", "100×"];

interface Pending {
  key: string;
  file: File;
  /** Browser-viewable copy: the file itself, or a PNG made from a TIFF. */
  preview?: Blob;
  previewUrl?: string;
  error?: string;
  caption: string;
  magnification: string;
}

function isSupported(file: File) {
  return /^image\/(jpeg|png)$/.test(file.type) || /\.(jpe?g|png)$/i.test(file.name) || isTiff(file);
}

function formatSize(bytes: number) {
  return bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.ceil(bytes / 1000)} KB`;
}

export default function UploadCapture() {
  const { dispatch } = useStore();
  const router = useRouter();
  const [patientId, setPatientId] = useState(PATIENTS[0].id);
  const [assayKey, setAssayKey] = useState(Object.keys(ASSAYS)[0]);
  const [collectedOn, setCollectedOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [files, setFiles] = useState<Pending[]>([]);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const urls = useRef<string[]>([]);

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const assay = ASSAYS[assayKey];

  function addFiles(list: FileList | null) {
    if (!list) return;
    const added: Pending[] = [...list].map((file, i) => ({
      key: `${file.name}-${file.size}-${Date.now()}-${i}`,
      file,
      caption: `Image ${files.length + i + 1}`,
      magnification: "40×",
      error: isSupported(file) ? undefined : "This file type isn’t supported. Use JPEG, PNG or TIFF.",
    }));
    setFiles((fs) => [...fs, ...added]);

    for (const p of added) {
      if (p.error) continue;
      const ready = isTiff(p.file) ? tiffToPng(p.file) : Promise.resolve<Blob>(p.file);
      ready
        .then((preview) => {
          const previewUrl = URL.createObjectURL(preview);
          urls.current.push(previewUrl);
          setFiles((fs) => fs.map((f) => (f.key === p.key ? { ...f, preview, previewUrl } : f)));
        })
        .catch(() =>
          setFiles((fs) =>
            fs.map((f) =>
              f.key === p.key ? { ...f, error: "This TIFF couldn’t be read. Try exporting it again, or as PNG." } : f,
            ),
          ),
        );
    }
  }

  function update(key: string, patch: Partial<Pending>) {
    setFiles((fs) => fs.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  }

  const usable = files.filter((f) => !f.error);
  const ready = usable.length > 0 && usable.every((f) => f.preview && f.caption.trim());

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || saving) return;
    setSaving(true);
    setSaveError(null);
    const id = `u-${crypto.randomUUID().slice(0, 8)}`;
    try {
      const images: MicroscopyImage[] = [];
      for (const [i, f] of usable.entries()) {
        const imageId = `${id}-img${i + 1}`;
        // The original file is stored untouched; the preview is only for display.
        await putImage(imageId, { original: f.file, preview: isTiff(f.file) ? f.preview! : f.file });
        images.push({
          id: imageId,
          src: "",
          caption: f.caption.trim(),
          magnification: f.magnification,
          upload: { fileName: f.file.name, type: f.file.type || "image/tiff", size: f.file.size },
        });
      }
      dispatch({
        type: "addCapture",
        result: uploadedCapture({
          id,
          assay: assayKey,
          patientId,
          collectedAt: new Date(`${collectedOn}T12:00:00`).toISOString(),
          images,
        }),
      });
      router.push(`/lab/technologist/${id}`);
    } catch {
      setSaveError("The images couldn’t be saved in this browser. Check that there’s free disk space and try again.");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <Link href="/lab/technologist" className="text-sm text-muted hover:text-ink">
        ← Scoring
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Upload a capture</h1>
      <p className="mt-1 text-muted">
        Upload images exported from the microscope camera.
      </p>

      <form onSubmit={save} className="mt-8 space-y-8">
        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="sr-only">Sample</legend>
          <label className="block space-y-1.5">
            <span className="font-semibold">Patient</span>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className={field}>
              {PATIENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="font-semibold">Test</span>
            <select value={assayKey} onChange={(e) => setAssayKey(e.target.value)} className={field}>
              {Object.values(ASSAYS).map((a) => (
                <option key={a.key} value={a.key}>
                  {a.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="font-semibold">Collected on</span>
            <input type="date" value={collectedOn} onChange={(e) => setCollectedOn(e.target.value)} className={field} />
          </label>
          <div className="space-y-1.5 text-sm sm:col-span-3">
            <p className="text-muted">
              {assay.method} on {assay.specimen.toLowerCase()}. Colours in this test:
            </p>
            <ProbeLegend probes={assay.probes} />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-bold">Images</legend>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center ${
              dragging ? "border-scrub bg-scrub-soft" : "border-line bg-surface hover:border-scrub"
            }`}
          >
            <span className="font-semibold">Drop images here, or click to choose files</span>
            <span className="mt-1 text-sm text-muted">JPEG, PNG or TIFF. Use one combined colour image per view.</span>
            <input
              type="file"
              accept={ACCEPT}
              multiple
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>

          {files.length > 0 && (
            <ul className="space-y-3">
              {files.map((f) => (
                <li key={f.key} className="flex gap-4 rounded-lg border border-line bg-surface p-3">
                  <div className="size-24 shrink-0 overflow-hidden rounded bg-black">
                    {f.previewUrl && <img src={f.previewUrl} alt="" className="size-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="truncate text-sm">
                      <span className="font-semibold">{f.file.name}</span>{" "}
                      <span className="text-muted">{formatSize(f.file.size)}</span>
                    </p>
                    {f.error ? (
                      <p className="text-sm font-semibold text-alert">{f.error}</p>
                    ) : !f.preview ? (
                      <p className="text-sm text-muted">Preparing preview…</p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-[1fr_8rem]">
                        <label className="block">
                          <span className="sr-only">Caption for {f.file.name}</span>
                          <input
                            value={f.caption}
                            onChange={(e) => update(f.key, { caption: e.target.value })}
                            placeholder="Caption, e.g. Overview of the sample"
                            className={field}
                          />
                        </label>
                        <label className="block">
                          <span className="sr-only">Magnification for {f.file.name}</span>
                          <select
                            value={f.magnification}
                            onChange={(e) => update(f.key, { magnification: e.target.value })}
                            className={field}
                          >
                            {MAGNIFICATIONS.map((m) => (
                              <option key={m}>{m}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFiles((fs) => fs.filter((x) => x.key !== f.key))}
                    className="self-start text-sm font-semibold text-muted hover:text-ink"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        {saveError && <p className="font-semibold text-alert">{saveError}</p>}

        <div className="flex items-center gap-4 border-t border-line pt-6">
          <button
            type="submit"
            disabled={!ready || saving}
            className="rounded-md bg-scrub px-5 py-2.5 font-semibold text-white hover:bg-scrub-deep disabled:opacity-40"
          >
            {saving ? "Saving…" : "Add to scoring queue"}
          </button>
          <Link href="/lab/technologist" className="text-muted hover:text-ink">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
