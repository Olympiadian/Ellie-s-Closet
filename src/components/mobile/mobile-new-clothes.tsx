"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CameraIcon, CloseIcon } from "@/components/mobile/mobile-icons";

type PhotoSide = "front" | "back";

type SlotPhoto = {
  file: File;
  url: string;
};

type ClothingSlot = {
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

export function MobileNewClothes() {
  const [slots, setSlots] = useState<ClothingSlot[]>(emptySlots);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const objectUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = objectUrls.current;

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

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

        return { ...slot, [side]: { file, url } };
      }),
    );
    setConfirmation("");
  }

  function submitPhotos() {
    if (counts.started !== counts.complete) {
      setConfirmation("Finish the front and back photos for every started slot first.");
      return;
    }

    if (!counts.complete) return;

    setConfirmation(
      `${counts.complete} ${counts.complete === 1 ? "item is" : "items are"} ready. Nothing was uploaded yet—the backend connection comes later.`,
    );
  }

  return (
    <>
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
              <span className="mobile-slot-grid__status">
                {isComplete ? "Ready" : hasStarted ? "Needs both sides" : "Empty"}
              </span>
            </button>
          );
        })}
      </section>

      <button
        type="button"
        className="mobile-primary-action"
        disabled={!counts.complete}
        onClick={submitPhotos}
      >
        Submit {counts.complete ? `${counts.complete} ${counts.complete === 1 ? "item" : "items"}` : "photos"}
      </button>

      {confirmation ? <p className="mobile-form-message">{confirmation}</p> : null}

      {activeSlot !== null && selected ? (
        <div className="mobile-sheet-backdrop" role="presentation">
          <section
            className="mobile-photo-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-photo-sheet-title"
          >
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
          </section>
        </div>
      ) : null}
    </>
  );
}
