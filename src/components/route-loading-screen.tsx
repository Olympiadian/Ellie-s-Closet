"use client";

import { useEffect, useState } from "react";
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

const loadingPaths = new Set(["/closet", "/build"]);
const transitionDuration = 2600;
const lastMessageKey = "ellies-closet-last-loading-message";

function chooseMessage(lastMessage: string | null) {
  const choices = lastMessage
    ? loadingMessages.filter((message) => message !== lastMessage)
    : loadingMessages;

  return choices[Math.floor(Math.random() * choices.length)];
}

export function RouteLoadingScreen() {
  const pathname = usePathname();
  const isLoadingPath = loadingPaths.has(pathname);

  if (!isLoadingPath) return null;

  return <LoadingScreen key={pathname} />;
}

function LoadingScreen() {
  const [message, setMessage] = useState("");
  const [isFinished, setIsFinished] = useState(false);

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

    return () => {
      window.clearTimeout(messageTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  if (isFinished) return null;

  return (
    <div
      className="route-loading-screen"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={message || "Preparing the closet"}
    >
      <div className="route-loading-screen__content">
        <p>{message}</p>
        <div className="closet-loader" aria-hidden="true" />
      </div>
    </div>
  );
}
