"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CENTRE, CURRENT_PATIENT_ID, DOCTOR, PATHOLOGIST, PATIENTS, TECHNOLOGIST } from "@/lib/seed";
import { useStore } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dispatch } = useStore();
  const role = (["lab", "doctor", "patient"] as const).find((r) => pathname.startsWith(`/${r}`)) ?? null;
  const patient = PATIENTS.find((p) => p.id === CURRENT_PATIENT_ID)!;
  const who = {
    lab: `${TECHNOLOGIST.name} and ${PATHOLOGIST.name}`,
    doctor: DOCTOR.name,
    patient: patient.name,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-scrub-deep">
            unhack <span className="text-base font-normal text-muted">{CENTRE}</span>
          </Link>

          {role && (
            <p className="text-sm text-muted">
              Signed in as{" "}
              <span className="font-semibold text-ink">{who[role]}</span>
            </p>
          )}

          <nav aria-label="Switch view" className="ml-auto flex items-center gap-1 rounded-full border border-line p-1 text-sm">
            <ViewLink href="/lab" active={role === "lab"}>
              Lab
            </ViewLink>
            <ViewLink href="/doctor" active={role === "doctor"}>
              Doctor
            </ViewLink>
            <ViewLink href="/patient" active={role === "patient"}>
              Patient
            </ViewLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-muted sm:px-6">
          <p>Prototype with fictional demo data. Changes are saved in this browser only.</p>
          <button
            type="button"
            onClick={() => dispatch({ type: "reset" })}
            className="underline underline-offset-2 hover:text-ink"
          >
            Reset demo data
          </button>
        </div>
      </footer>
    </div>
  );
}

function ViewLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-1 ${active ? "bg-scrub text-white" : "text-muted hover:text-ink"}`}
    >
      {children}
    </Link>
  );
}
