"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function MotionStage({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const instant = typeof document !== "undefined" && document.documentElement.dataset.instantNavigation === "true";

  useEffect(() => {
    if (instant) delete document.documentElement.dataset.instantNavigation;
  }, [instant]);

  return (
    <div className={`site-motion-stage${instant ? " is-instant" : ""}`} key={pathname}>
      {children}
    </div>
  );
}
