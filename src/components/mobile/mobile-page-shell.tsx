import Link from "next/link";
import type { ReactNode } from "react";
import { BackIcon } from "@/components/mobile/mobile-icons";

type MobilePageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function MobilePageShell({
  eyebrow,
  title,
  description,
  children,
}: MobilePageShellProps) {
  return (
    <main className="mobile-tool-page">
      <div className="mobile-tool-page__background" aria-hidden="true" />
      <div className="mobile-tool-page__content">
        <header className="mobile-tool-page__header">
          <Link href="/" className="mobile-tool-page__back" aria-label="Back to mobile home">
            <BackIcon />
          </Link>
          <div>
            <p>{eyebrow}</p>
            <h1>{title}</h1>
            <span>{description}</span>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
