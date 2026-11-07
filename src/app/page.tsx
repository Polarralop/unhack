import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
        Results that reach the patient, and make sense to them.
      </h1>
      <p className="mt-5 text-lg text-muted">
        A results hub for fluorescence microscopy tests used to find and track cancer, like
        FISH on biopsies, bone marrow and urine. Doctors share each result with a plain-language explanation. Patients open it, confirm they
        understand, and ask questions about it. Doctors can see where every result stands.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/doctor"
          className="rounded-lg border border-line bg-surface p-5 hover:border-scrub"
        >
          <p className="text-lg font-bold">Open the doctor view</p>
          <p className="mt-1 text-muted">See which results need follow-up, answer questions, share a new result.</p>
        </Link>
        <Link
          href="/patient"
          className="rounded-lg border border-line bg-surface p-5 hover:border-scrub"
        >
          <p className="text-lg font-bold">Open the patient view</p>
          <p className="mt-1 text-muted">Read your results, confirm you understand, ask your doctor a question.</p>
        </Link>
      </div>
      <p className="mt-6 text-sm text-muted">
        You can switch between the two views at any time from the top bar.
      </p>
    </div>
  );
}
