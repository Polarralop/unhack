import { Suspense } from "react";
import { LabCaseView } from "./LabCaseView";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LabCaseView />
    </Suspense>
  );
}
