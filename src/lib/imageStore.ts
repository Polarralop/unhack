"use client";

// Uploaded microscopy images live in the browser's IndexedDB: localStorage is
// far too small for them, and the prototype has no server-side storage.
// Each image keeps its original file untouched (for download) and a separate
// preview that browsers can display (TIFFs are converted to PNG).

const DB_NAME = "unhack-images";
const STORE = "images";

export interface StoredImage {
  original: Blob;
  preview: Blob;
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => {
      db.close();
      resolve(req.result as T);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export function putImage(id: string, image: StoredImage) {
  return run<void>("readwrite", (s) => s.put(image, id));
}

export function getImage(id: string) {
  return run<StoredImage | undefined>("readonly", (s) => s.get(id));
}

export function clearImages() {
  return run<void>("readwrite", (s) => s.clear());
}

export function isTiff(file: File) {
  return file.type === "image/tiff" || /\.tiff?$/i.test(file.name);
}

/** Builds a browser-viewable PNG from a TIFF (first page). */
export async function tiffToPng(file: File): Promise<Blob> {
  const UTIF = await import("utif");
  const buffer = await file.arrayBuffer();
  const [ifd] = UTIF.decode(buffer);
  if (!ifd) throw new Error("This TIFF has no images in it.");
  UTIF.decodeImage(buffer, ifd);
  const rgba = UTIF.toRGBA8(ifd);
  const width = ifd.width as number;
  const height = ifd.height as number;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn’t prepare a preview of this TIFF.");
  ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), width, height), 0, 0);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn’t prepare a preview of this TIFF."))), "image/png"),
  );
}
