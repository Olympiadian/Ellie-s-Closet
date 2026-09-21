import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Closet", href: "/closet" },
  { label: "Build", href: "/build" },
  { label: "Saved", href: "/saved" },
  { label: "Hub", href: "/hub" },
];

type AppShellProps = {
  active?: string;
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  wide?: boolean;
};

export function AppShell({
  active,
  children,
  eyebrow,
  title,
  description,
  action,
  wide = false,
}: AppShellProps) {
  return (
    <main className="app-shell">
      <header className="app-topbar">
        <Link href="/" className="app-brand" aria-label="The Wall home">
          W
        </Link>
        <nav className="app-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className={active === item.label.toLowerCase() ? "is-active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/add" className="topbar-add">
          <span aria-hidden="true">+</span> Add
        </Link>
      </header>

      <section className={wide ? "app-page app-page--wide" : "app-page"}>
        <header className="page-heading">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h1>{title}</h1>
            {description ? <p className="page-description">{description}</p> : null}
          </div>
          {action ? <div className="page-action">{action}</div> : null}
        </header>
        {children}
      </section>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.slice(0, 4).map((item) => (
          <Link
            href={item.href}
            key={item.label}
            className={active === item.label.toLowerCase() ? "is-active" : undefined}
          >
            {item.label}
          </Link>
        ))}
        <Link href="/add" className={active === "add" ? "is-active mobile-add" : "mobile-add"}>
          + Add
        </Link>
      </nav>
    </main>
  );
}
