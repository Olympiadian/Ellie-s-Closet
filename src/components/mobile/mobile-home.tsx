import Link from "next/link";
import { MessagesButton } from "@/components/wardrobe/messages";
import {
  AddClothesIcon,
  BrowseClosetIcon,
} from "@/components/mobile/mobile-icons";

const mobilePrimaryActions = [
  {
    title: "New Clothes?",
    description: "Upload new items to your closet",
    href: "/mobile/new-clothes",
    icon: AddClothesIcon,
  },
  {
    title: "Browse Closet",
    description: "Browse your closet and saved items",
    href: "/closet",
    icon: BrowseClosetIcon,
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
        {mobilePrimaryActions.map((action) => {
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

        <div className="mobile-home__quick-actions">
          <Link href="/deals">Deals</Link>
          <MessagesButton mobile />
          <Link href="/help">Support</Link>
        </div>
      </nav>
    </div>
  );
}
