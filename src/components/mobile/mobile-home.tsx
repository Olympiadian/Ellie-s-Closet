import Link from "next/link";
import {
  AddClothesIcon,
  DatabaseCheckIcon,
  RequestFeatureIcon,
} from "@/components/mobile/mobile-icons";

const mobileActions = [
  {
    title: "New Clothes?",
    description: "Upload to your closet.",
    href: "/mobile/new-clothes",
    icon: AddClothesIcon,
  },
  {
    title: "Request Feature",
    description: "Changes to your experience.",
    href: "/mobile/request",
    icon: RequestFeatureIcon,
  },
  {
    title: "Database Check",
    description: "Fix / add information about your clothes.",
    href: "/mobile/database",
    icon: DatabaseCheckIcon,
  },
] as const;

export function MobileHome() {
  return (
    <div className="mobile-home">
      <header className="mobile-home__header">
        <p>Mobile</p>
        <h1>Ellie&apos;s Closet</h1>
      </header>

      <nav className="mobile-home__actions" aria-label="Mobile closet actions">
        {mobileActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link href={action.href} key={action.href}>
              <span className="mobile-home__action-copy">
                <strong>{action.title}</strong>
                <small>{action.description}</small>
              </span>
              <Icon className="mobile-home__action-icon" />
            </Link>
          );
        })}
      </nav>

      <p className="mobile-home__manual" aria-label="Full closet manual coming later">
        Full Ellie&apos;s Closet Manual:
        <span>Here</span>
      </p>
    </div>
  );
}
