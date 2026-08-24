"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const allowedPhoneRoutes = new Set([
  "/",
  "/mobile/new-clothes",
  "/mobile/request",
  "/mobile/database",
]);

const phoneMediaQuery =
  "(max-width: 600px), (max-height: 600px) and (pointer: coarse)";

export function MobileRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const media = window.matchMedia(phoneMediaQuery);
    const keepPhoneInMobileExperience = () => {
      if (media.matches && !allowedPhoneRoutes.has(pathname)) {
        router.replace("/");
      }
    };

    keepPhoneInMobileExperience();
    media.addEventListener("change", keepPhoneInMobileExperience);

    return () => media.removeEventListener("change", keepPhoneInMobileExperience);
  }, [pathname, router]);

  return null;
}
