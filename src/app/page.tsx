import Link from "next/link";

const railItems = [
  { label: "Linen set", tone: "sand" },
  { label: "Black knit", tone: "ink" },
  { label: "Silk skirt", tone: "clay" },
  { label: "Denim", tone: "denim" },
];

const navItems = [
  { label: "Home", href: "/", current: true },
  { label: "Closet", href: "/closet" },
  { label: "Build", href: "/build" },
  { label: "Saved", href: "/saved" },
];

export default function Home() {
  return (
    <main className="wall-home">
      <aside className="closet-rail" aria-label="Quick closet access">
        <div className="rail-mark" aria-hidden="true">
          W
        </div>
        <div className="rail-items">
          {railItems.map((item) => (
            <Link
              href="/closet"
              className={`rail-item rail-item--${item.tone}`}
              key={item.label}
              aria-label={`Open ${item.label}`}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <Link href="/add" className="rail-add" aria-label="Add clothing">
          +
        </Link>
      </aside>

      <section className="home-content">
        <header className="home-header">
          <div>
            <p className="eyebrow">Sunday, August 23</p>
            <h1>Good afternoon, Ellie.</h1>
          </div>
          <div className="weather-card" aria-label="Weather: 82 degrees and sunny">
            <span className="weather-icon" aria-hidden="true">
              ☼
            </span>
            <div>
              <strong>82°</strong>
              <p>Clear · UV 4</p>
            </div>
          </div>
        </header>

        <div className="home-stage">
          <div className="stage-copy">
            <p className="eyebrow">Your wardrobe, in view</p>
            <h2>Start with one piece.</h2>
            <p>
              Browse what you own, build around a favorite, and save the look for
              later.
            </p>
            <div className="stage-actions">
              <Link href="/build" className="button button--primary">
                Build an outfit <span aria-hidden="true">→</span>
              </Link>
              <Link href="/closet" className="button button--quiet">
                Browse closet
              </Link>
            </div>
          </div>

          <Link href="/closet" className="today-card">
            <div className="today-visual" aria-hidden="true">
              <div className="garment garment--top" />
              <div className="garment garment--bottom" />
            </div>
            <div className="today-meta">
              <div>
                <p className="eyebrow">Today’s pick</p>
                <h3>Soft neutrals</h3>
              </div>
              <span aria-hidden="true">↗</span>
            </div>
          </Link>
        </div>

        <nav className="bottom-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className={item.current ? "is-current" : undefined}
              aria-current={item.current ? "page" : undefined}
              aria-label={item.label}
            >
              <span className="nav-dot" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
          <Link href="/add" className="nav-add" aria-label="Add">
            <span aria-hidden="true">+</span> Add
          </Link>
        </nav>
      </section>
    </main>
  );
}
