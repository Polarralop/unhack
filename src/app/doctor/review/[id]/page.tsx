import { Suspense } from "react";
import { ReviewView } from "./ReviewView";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReviewView />
    </Suspense>
  );
}
