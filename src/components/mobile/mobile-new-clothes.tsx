"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CameraIcon, CloseIcon } from "@/components/mobile/mobile-icons";
import { uploadPhoto } from "@/lib/api";
import { DataGate, useWardrobe } from "@/components/wardrobe/provider";

type PhotoSide = "front" | "back";

type SlotPhoto = {
  file: File;
  url: string;
};

type ClothingSlot = {
  id?: string;
  sent?: boolean;
  uploadedFront?: boolean;
  uploadedBack?: boolean;
  front?: SlotPhoto;
  back?: SlotPhoto;
};

const slotCount = 10;

function emptySlots(): ClothingSlot[] {
  return Array.from({ length: slotCount }, () => ({}));
}

function PhotoPreview({ photo, label }: { photo?: SlotPhoto; label: string }) {
  return (
    <span className={`mobile-photo-preview${photo ? " has-photo" : ""}`}>
      {photo ? (
        <Image src={photo.url} alt={`${label} preview`} fill sizes="140px" unoptimized />
      ) : (
        <CameraIcon />
      )}
      <small>{label}</small>
    </span>
  );
}

function PhotoSheet({ children, close }: { children: ReactNode; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="mobile-photo-sheet mobile-photo-dialog" onCancel={close} aria-labelledby="mobile-photo-sheet-title">{children}</dialog>;
}

export function MobileNewClothes() {
  const [slots, setSlots] = useState<ClothingSlot[]>(emptySlots);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const { refresh } = useWardrobe();
  const objectUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = objectUrls.current;

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);
  useEffect(() => {
    const preventAccidentalExit = (event: BeforeUnloadEvent) => {
      if (slots.some(slot => (slot.front || slot.back) && !slot.sent)) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", preventAccidentalExit);
    return () => window.removeEventListener("beforeunload", preventAccidentalExit);
  }, [slots]);

  const counts = useMemo(() => {
    const started = slots.filter((slot) => slot.front || slot.back).length;
    const complete = slots.filter((slot) => slot.front && slot.back).length;
    return { started, complete };
  }, [slots]);

  const selected = activeSlot === null ? null : slots[activeSlot];

  function choosePhoto(side: PhotoSide, file?: File) {
    if (!file || activeSlot === null) return;

    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);

    setSlots((current) =>
      current.map((slot, index) => {
        if (index !== activeSlot) return slot;

        const previous = slot[side];
        if (previous) {
          URL.revokeObjectURL(previous.url);
          objectUrls.current.delete(previous.url);
        }

        return { ...slot, [side]: { file, url }, [side === "front" ? "uploadedFront" : "uploadedBack"]: false };
      }),
    );
    setConfirmation("");
  }

  async function submitPhotos() {
    if (counts.started !== counts.complete) {
      setConfirmation("Finish the front and back photos for every started slot first.");
      return;
    }

    if (!counts.complete) return;

    setBusy(true);
    const next = slots.map(slot => ({ ...slot, id: slot.id ?? crypto.randomUUID() }));
    setSlots(next);
    try {
      for (let index = 0; index < next.length; index++) {
        const slot = next[index];
        if (!slot.front || !slot.back || slot.sent) continue;
        setConfirmation("Uploading item " + (index + 1) + "… Keep this page open.");
        if (!slot.uploadedFront) { await uploadPhoto(slot.id, "front", slot.front.file); slot.uploadedFront = true; setSlots(next.map(s => ({ ...s }))); }
        if (!slot.uploadedBack) { await uploadPhoto(slot.id, "back", slot.back.file); slot.uploadedBack = true; setSlots(next.map(s => ({ ...s }))); }
        slot.sent = true;
        setSlots(next.map(s => ({ ...s })));
      }
      setConfirmation("Photos submitted for review. They will appear in your closet once published.");
      await refresh();
    } catch (error) { setConfirmation(error instanceof Error ? error.message : "Upload interrupted. Your photos are still here; tap Submit to retry."); }
    finally { setBusy(false); }
  }

  return (
    <DataGate>
      <section className="mobile-upload-summary" aria-live="polite">
        <div>
          <strong>{counts.complete}</strong>
          <span>of {slotCount} complete</span>
        </div>
        <p>Each item needs one front photo and one back photo.</p>
      </section>

      <section className="mobile-slot-grid" aria-label="New clothing photo slots">
        {slots.map((slot, index) => {
          const isComplete = Boolean(slot.front && slot.back);
          const hasStarted = Boolean(slot.front || slot.back);

          return (
            <button
              type="button"
              disabled={busy || slot.sent}
              className={isComplete ? "is-complete" : hasStarted ? "is-started" : ""}
              onClick={() => setActiveSlot(index)}
              key={index}
            >
              <span className="mobile-slot-grid__number">{String(index + 1).padStart(2, "0")}</span>
              {hasStarted ? (
                <span className="mobile-slot-grid__photos">
                  <PhotoPreview photo={slot.front} label="Front" />
                  <PhotoPreview photo={slot.back} label="Back" />
                </span>
              ) : (
                <span className="mobile-slot-grid__empty">
                  <CameraIcon />
                  <small>Add item</small>
                </span>
              )}
              {hasStarted ? (
                <span className="mobile-slot-grid__status">
                  {slot.sent ? "Submitted" : isComplete ? "Ready" : "Add the other side"}
                </span>
              ) : null}
            </button>
          );
        })}
      </section>

      <button
        type="button"
        className="mobile-primary-action"
        disabled={busy || !counts.complete || slots.every(slot => !slot.front || slot.sent)}
        onClick={submitPhotos}
      >
        Submit {counts.complete ? `${counts.complete} ${counts.complete === 1 ? "item" : "items"}` : "photos"}
      </button>

      {confirmation ? <p className="mobile-form-message" role="status">{confirmation}</p> : null}
      {slots.some(slot => slot.sent) && !busy && <button className="mobile-primary-action" onClick={() => {
        if (slots.some(slot => (slot.front || slot.back) && !slot.sent) && !confirm("Clear the remaining unsent photos to start a new batch?")) return;
        objectUrls.current.forEach(url => URL.revokeObjectURL(url)); objectUrls.current.clear(); setSlots(emptySlots()); setConfirmation("");
      }}>Add more clothes</button>}

      {activeSlot !== null && selected ? (
        <PhotoSheet close={() => setActiveSlot(null)}>
            <div className="mobile-photo-sheet__handle" aria-hidden="true" />
            <header>
              <div>
                <p>Slot {String(activeSlot + 1).padStart(2, "0")}</p>
                <h2 id="mobile-photo-sheet-title">Add front &amp; back</h2>
              </div>
              <button type="button" onClick={() => setActiveSlot(null)} aria-label="Close photo sheet">
                <CloseIcon />
              </button>
            </header>

            <div className="mobile-photo-sheet__inputs">
              {(["front", "back"] as const).map((side) => (
                <label key={side}>
                  <PhotoPreview photo={selected[side]} label={side === "front" ? "Front" : "Back"} />
                  <span>{selected[side] ? `Replace ${side}` : `Add ${side} photo`}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      choosePhoto(side, event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
              ))}
            </div>

            <p className="mobile-photo-sheet__hint">
              On iPhone, choosing a photo opens the normal camera and photo-library options.
            </p>
            <button
              type="button"
              className="mobile-primary-action"
              disabled={!selected.front || !selected.back}
              onClick={() => setActiveSlot(null)}
            >
              Done
            </button>
        </PhotoSheet>
      ) : null}
    </DataGate>
  );
}
