import { Suspense } from "react";
import { DoctorResultView } from "./DoctorResultView";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DoctorResultView />
    </Suspense>
  );
}
