"use client";

import Link from "next/link";
import { MicroscopyImg } from "@/components/MicroscopyImg";
import { PATIENTS } from "@/lib/seed";
import type { DiagnosticResult } from "@/lib/types";

export function patientName(id: string) {
  return PATIENTS.find((p) => p.id === id)?.name ?? "Unknown patient";
}

export function CaseCard({ r, href, meta }: { r: DiagnosticResult; href: string; meta: React.ReactNode }) {
  return (
    <Link href={href} className="flex gap-4 rounded-lg border border-line bg-surface p-3 hover:border-scrub">
      <MicroscopyImg image={r.images[0]} alt="" className="size-20 shrink-0 rounded bg-black object-cover" />
      <div className="min-w-0 space-y-1">
        <p className="font-semibold">{patientName(r.patientId)}</p>
        <p className="text-muted">{r.title}</p>
        <div className="flex flex-wrap items-center gap-2 text-sm">{meta}</div>
      </div>
    </Link>
  );
}

export function CaseGrid({ children, empty }: { children: React.ReactNode[]; empty: string }) {
  if (children.length === 0) return <p className="mt-4 text-muted">{empty}</p>;
  return <ul className="mt-4 grid gap-3 sm:grid-cols-2">{children}</ul>;
}

export const byNewest =
  (key: "capturedAt" | "scoredAt" | "signedOutAt") => (a: DiagnosticResult, b: DiagnosticResult) =>
    (b[key] ?? "").localeCompare(a[key] ?? "");
