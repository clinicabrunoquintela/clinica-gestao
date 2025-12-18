import { Suspense } from "react";
import CalendarioDiaClient from "./CalendarioDiaClient";

export const dynamic = "force-dynamic";

export default function CalendarioDiaPage() {
  return (
    <Suspense fallback={null}>
      <CalendarioDiaClient />
    </Suspense>
  );
}
