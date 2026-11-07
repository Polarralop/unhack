import { Suspense } from "react";
import { PatientResultView } from "./PatientResultView";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PatientResultView />
    </Suspense>
  );
}
