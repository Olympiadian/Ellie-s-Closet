"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";

const loadingMessages = [
  "Sweeping off the shelves…",
  "Turning on the closet lights…",
  "Straightening the racks…",
  "Folding everything just right…",
  "Lining up the shoes…",
  "Organizing by color…",
  "Polishing the mirrors…",
  "Convincing the jeans to fold…",
  "Tucking in loose tags…",
  "Making sure nothing fell behind the dresser…",
  "Making room for something new…",
  "Finding the perfect spot…",
  "Checking if black goes with black…",
  "Putting everything in its place…",
  "Buttoning up the details…",
  "Adding the finishing touches…",
  "Waking up the wardrobe…",
] as const;

const transitionDuration = 1900;
const exitDuration = 280;
const lastMessageKey = "ellies-closet-last-loading-message";
const animatedPaths = new Set(["/closet", "/saved", "/build"]);

function chooseMessage(lastMessage: string | null) {
  const choices = lastMessage
    ? loadingMessages.filter((message) => message !== lastMessage)
    : loadingMessages;

  return choices[Math.floor(Math.random() * choices.length)];
}

export function RouteLoadingScreen() {
  const pathname = usePathname();

  // A route key makes the initial visibility derive from the current path,
  // rather than synchronously changing state from an effect after navigation.
  return <RouteLoadingScreenForPath key={pathname} pathname={pathname} />;
}

function RouteLoadingScreenForPath({ pathname }: { pathname: string }) {
  const isLoadingPath = animatedPaths.has(pathname);
  const [isVisible, setIsVisible] = useState(isLoadingPath);

  useEffect(() => {
    const showBeforeNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (anchor.dataset.instantHome === "true") {
        document.documentElement.dataset.instantNavigation = "true";
        return;
      }
      if (!animatedPaths.has(destination.pathname)) return;
      flushSync(() => setIsVisible(true));
    };

    document.addEventListener("click", showBeforeNavigation, true);
    return () => document.removeEventListener("click", showBeforeNavigation, true);
  }, []);

  if (!isVisible) return null;

  return <LoadingScreen key={pathname} finish={() => setIsVisible(false)} />;
}

function LoadingScreen({ finish }: { finish: () => void }) {
  const [message, setMessage] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const messageTimer = window.setTimeout(() => {
      let lastMessage: string | null = null;

      try {
        lastMessage = window.sessionStorage.getItem(lastMessageKey);
      } catch {
        // The transition still works when browser storage is unavailable.
      }

      const nextMessage = chooseMessage(lastMessage);
      setMessage(nextMessage);

      try {
        window.sessionStorage.setItem(lastMessageKey, nextMessage);
      } catch {
        // The selected message only needs to persist for the current transition.
      }
    }, 0);

    const finishTimer = window.setTimeout(() => {
      setIsFinished(true);
    }, transitionDuration);
    const exitTimer = window.setTimeout(() => {
      setIsExiting(true);
    }, transitionDuration - exitDuration);

    return () => {
      window.clearTimeout(messageTimer);
      window.clearTimeout(finishTimer);
      window.clearTimeout(exitTimer);
    };
  }, []);

  useEffect(() => {
    if (isFinished) finish();
  }, [finish, isFinished]);

  if (isFinished) return null;

  return (
    <div
      className={`route-loading-screen${isExiting ? " is-exiting" : ""}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={message || "Preparing the closet"}
    >
      <div className="route-loading-screen__content">
        <p>{message}</p>
        <div className="wc-loading-dots" aria-hidden="true"><span/><span/><span/></div>
      </div>
    </div>
  );
}
