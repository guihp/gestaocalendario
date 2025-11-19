import { Suspense } from "react";
import { CalendarManager } from "@/components/calendars/calendar-manager";
import { Spinner } from "@/components/ui/spinner";

export default function CalendariosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <CalendarManager />
    </Suspense>
  );
}

