"use client";

import { useEffect, useRef, useState } from "react";

const colors = ["#c89b22", "#dcb94c", "#efd681", "#fff8e8", "#f7bdca", "#ffd7df", "#b8d9f6", "#d9eeff"];
let birthdayPlayed = false;

type Confetti = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speed: number;
  drift: number;
  rotation: number;
  rotationSpeed: number;
  circle: boolean;
};

function makePiece(width: number, height: number, initial = false): Confetti {
  const size = 5 + Math.random() * 8;
  return {
    x: Math.random() * width,
    y: initial ? Math.random() * height : -24 - Math.random() * height * 0.25,
    width: size,
    height: Math.random() > 0.45 ? size * (0.45 + Math.random() * 1.25) : size,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: 1.4 + Math.random() * 3.2,
    drift: -0.8 + Math.random() * 1.6,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: -0.09 + Math.random() * 0.18,
    circle: Math.random() > 0.78,
  };
}

export function BirthdayCelebration({ endsAt }: { endsAt: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(!birthdayPlayed);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible || Date.now() > endsAt) {
      if (Date.now() > endsAt) queueMicrotask(() => setVisible(false));
      return;
    }

    birthdayPlayed = true;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      queueMicrotask(() => setVisible(false));
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const overlay = canvas.closest<HTMLElement>(".birthday-celebration");
    const page = overlay?.parentElement;
    const blockedElements = page
      ? Array.from(page.children).filter((child): child is HTMLElement => child instanceof HTMLElement && child !== overlay)
      : [];
    const previousAccessibility = blockedElements.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute("aria-hidden"),
    }));
    blockedElements.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;
    let particles: Confetti[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const quantity = Math.min(260, Math.max(150, Math.round(width * height / 3600)));
      particles = Array.from({ length: quantity }, () => makePiece(width, height, true));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      particles.forEach((piece, index) => {
        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.rotation);
        context.fillStyle = piece.color;
        if (piece.circle) {
          context.beginPath();
          context.arc(0, 0, piece.width / 2, 0, Math.PI * 2);
          context.fill();
        } else {
          context.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
        }
        context.restore();

        if (reduceMotion) return;
        piece.y += piece.speed;
        piece.x += piece.drift + Math.sin(piece.y * 0.018) * 0.35;
        piece.rotation += piece.rotationSpeed;
        if (piece.y > height + 30 || piece.x < -40 || piece.x > width + 40) particles[index] = makePiece(width, height);
      });
      if (!reduceMotion) frame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    const fadeTimer = window.setTimeout(() => setLeaving(true), 3600);
    const removeTimer = window.setTimeout(() => setVisible(false), 4400);
    const endTimer = window.setTimeout(() => setVisible(false), Math.max(0, endsAt - Date.now()));

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
      window.clearTimeout(endTimer);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.body.style.overflow = previousOverflow;
      previousAccessibility.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
    };
  }, [endsAt, visible]);

  if (!visible) return null;

  return <section className={`birthday-celebration${leaving ? " is-leaving" : ""}`} role="dialog" aria-modal="true" aria-label="Happy Birthday Ellie">
    <canvas ref={canvasRef} className="birthday-celebration__confetti" aria-hidden="true" />
    <div className="birthday-celebration__message">
      <span>Happy Birthday</span>
      <strong>Ellie</strong>
    </div>
  </section>;
}
