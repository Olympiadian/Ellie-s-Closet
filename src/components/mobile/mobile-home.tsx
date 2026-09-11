import Link from "next/link";
import { MessagesButton } from "@/components/wardrobe/messages";
import {
  AddClothesIcon,
  BrowseClosetIcon,
  CalendarIcon,
  DealsIcon,
  SupportIcon,
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

export function MobileHome({ dateLabel }: { dateLabel: string }) {
  return (
    <div className="mobile-home">
      <header className="mobile-home__header">
        <p className="mobile-home__eyebrow">Mobile</p>
        <h1>Ellie&apos;s Closet</h1>
        <p className="mobile-home__date">{dateLabel}</p>
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
          <Link href="/deals"><span>Deals</span><DealsIcon className="mobile-home__quick-icon" /></Link>
          <MessagesButton mobile />
          <Link href="/calendar"><span>Calendar</span><CalendarIcon className="mobile-home__quick-icon" /></Link>
          <Link href="/help"><span>Support</span><SupportIcon className="mobile-home__quick-icon" /></Link>
        </div>
      </nav>

      <section
        className="mobile-home__weather"
        aria-label="Today is sunny with a high of 108 degrees, a low of 78 degrees, and a UV index of 10 between 11 AM and 1 PM"
      >
        <div>
          <span>Sunny</span>
          <i aria-hidden="true" />
          <span>High 108°</span>
          <span>Low 78°</span>
          <i aria-hidden="true" />
          <span><strong>UV</strong> 10 · 11–1pm</span>
        </div>
      </section>
    </div>
  );
}
