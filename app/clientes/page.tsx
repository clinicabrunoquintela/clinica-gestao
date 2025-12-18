import { Suspense } from "react";
import ClientesPageClient from "./ClientesPageClient";

export const dynamic = "force-dynamic";

export default function ClientesPage() {
  return (
    <Suspense fallback={null}>
      <ClientesPageClient />
    </Suspense>
  );
}
