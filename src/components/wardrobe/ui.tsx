"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, type ReactNode } from "react";
import type { WardrobeItem } from "@/lib/wardrobe";
import { useAnimatedClose } from "@/components/use-animated-close";

export function HomeIcon() { return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="m6 14 10-9 10 9v12H6V14Z"/><path d="M13 26v-8h6v8"/></svg>; }
export function PageShell({ title, children }: { title: string; children: ReactNode }) {
  return <main className="closet-index-page wc-page"><Link href="/" className="closet-index-page__home" aria-label="Return home"><HomeIcon/></Link><header className="closet-index-page__header"><h1>{title}</h1></header>{children}</main>;
}
export function Drawer({ title, close, children, small = false }: { title: string; close: () => void; children: ReactNode; small?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { isClosing, requestClose } = useAnimatedClose(close);

  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);

  return (
    <dialog
      ref={ref}
      className={"wc-drawer" + (small ? " wc-drawer--small" : "") + (isClosing ? " is-closing" : "")}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        ) {
          requestClose();
        }
      }}
    >
      <header className="wc-drawer__header">
        <h2 id={titleId}>{title}</h2>
        <button className="wc-icon-button" onClick={requestClose} aria-label="Close panel">×</button>
      </header>
      {children}
    </dialog>
  );
}
export function ItemPhoto({ item, side = "front", original = false }: { item: WardrobeItem; side?: "front" | "back"; original?: boolean }) {
  const src = original ? (side === "front" ? item.originalFrontUrl : item.originalBackUrl) : side === "front" ? item.frontUrl : item.backUrl;
  return <div className="wc-photo">{src ? <Image src={src} alt={item.name + " · " + side} fill sizes="(max-width: 600px) 40vw, 25vw" unoptimized /> : <span className="sr-only">{side} photo not yet available</span>}</div>;
}
export function Heart({ filled }: { filled: boolean }) {
  return <svg viewBox="0 0 32 32" className={"wc-heart" + (filled ? " is-filled" : "")} aria-hidden="true"><path d="M16 27S5 20.7 5 12.7C5 8.5 7.7 6 11.2 6c2.2 0 3.9 1.2 4.8 2.8C16.9 7.2 18.6 6 20.8 6 24.3 6 27 8.5 27 12.7 27 20.7 16 27 16 27Z"/></svg>;
}
export function Empty({ children }: { children: ReactNode }) { return <p className="wc-empty">{children}</p>; }
