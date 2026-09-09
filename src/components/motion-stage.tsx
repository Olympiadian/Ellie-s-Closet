"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function MotionStage({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="site-motion-stage" key={pathname}>
      {children}
    </div>
  );
}
