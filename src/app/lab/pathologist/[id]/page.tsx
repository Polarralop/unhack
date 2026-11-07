import { Suspense } from "react";
import { LabCaseView } from "@/components/lab/LabCaseView";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LabCaseView role="pathologist" />
    </Suspense>
  );
}
