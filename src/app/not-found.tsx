import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">Not found</p>
      <h1>That piece is not in the closet.</h1>
      <Link href="/closet" className="button button--primary">Return to closet</Link>
    </main>
  );
}
