import Link from "next/link";

const VIEWS = [
  {
    href: "/lab",
    title: "Lab",
    body: "Score microscope captures, then sign out the report. Images stay exactly as captured.",
  },
  {
    href: "/doctor",
    title: "Doctor",
    body: "Review signed-out results, explain them in plain language, share them and follow up.",
  },
  {
    href: "/patient",
    title: "Patient",
    body: "Read your results, see your microscope images, confirm you understand and ask questions.",
  },
];

export default function Home() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
        Results that reach the patient, and make sense to them.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        A results hub for fluorescence microscopy tests that find and track cancer, like FISH on biopsies, bone
        marrow and urine. The microscope captures the sample, the lab scores and signs it out, the doctor
        explains it, and the patient gets a result they can understand.
      </p>

      <ol className="mt-10 grid gap-4 sm:grid-cols-3">
        {VIEWS.map((v, i) => (
          <li key={v.href}>
            <Link href={v.href} className="flex h-full flex-col rounded-lg border border-line bg-surface p-5 hover:border-scrub">
              <span className="text-sm text-muted">Step {i + 1}</span>
              <span className="mt-1 text-lg font-bold">{v.title}</span>
              <span className="mt-1 text-muted">{v.body}</span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-muted">Switch between views at any time from the top bar.</p>
    </div>
  );
}
