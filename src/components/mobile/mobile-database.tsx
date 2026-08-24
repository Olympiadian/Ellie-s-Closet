"use client";

import { useMemo, useState } from "react";
import { CloseIcon } from "@/components/mobile/mobile-icons";
import { clothingCategories } from "@/lib/types";

export type MobileDatabaseIssue =
  | "Missing tag"
  | "Missing size"
  | "A.I. unsure of category"
  | "A.I. unsure of color"
  | "A.I. unsure of item type";

export type MobileDatabaseRecord = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  color: string;
  size: string;
  tags: string[];
  occasions: string[];
  issues: MobileDatabaseIssue[];
};

type DatabaseProps = {
  initialRecords: MobileDatabaseRecord[];
};

export function MobileDatabase({ initialRecords }: DatabaseProps) {
  const [records, setRecords] = useState(initialRecords);
  const [query, setQuery] = useState("");
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const visibleRecords = useMemo(() => {
    const normalized = query.toLowerCase().trim();

    return records.filter((record) => {
      const matchesIssue = !showFlaggedOnly || record.issues.length > 0;
      const matchesQuery =
        !normalized ||
        [
          record.name,
          record.category,
          record.subcategory,
          record.color,
          record.size,
          ...record.tags,
          ...record.occasions,
          ...record.issues,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);

      return matchesIssue && matchesQuery;
    });
  }, [query, records, showFlaggedOnly]);

  const editingRecord = records.find((record) => record.id === editingId) ?? null;
  const flaggedCount = records.filter((record) => record.issues.length).length;

  function saveRecord(formData: FormData) {
    if (!editingRecord) return;

    const size = String(formData.get("size") || "").trim();
    const tags = String(formData.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const reviewedAi = formData.get("reviewedAi") === "on";

    setRecords((current) =>
      current.map((record) => {
        if (record.id !== editingRecord.id) return record;

        const issues = record.issues.filter((issue) => {
          if (issue === "Missing size" && size) return false;
          if (issue === "Missing tag" && tags.length) return false;
          if (issue.startsWith("A.I. unsure") && reviewedAi) return false;
          return true;
        });

        return {
          ...record,
          name: String(formData.get("name") || "").trim(),
          category: String(formData.get("category") || "").trim(),
          subcategory: String(formData.get("subcategory") || "").trim(),
          color: String(formData.get("color") || "").trim(),
          size,
          tags,
          occasions: String(formData.get("occasions") || "")
            .split(",")
            .map((occasion) => occasion.trim())
            .filter(Boolean),
          issues,
        };
      }),
    );

    setMessage(`Saved ${editingRecord.name}. Backend sync will be connected later.`);
    setEditingId(null);
  }

  return (
    <>
      <section className="mobile-database-summary">
        <div>
          <strong>{records.length}</strong>
          <span>Total items</span>
        </div>
        <div>
          <strong>{flaggedCount}</strong>
          <span>Need attention</span>
        </div>
      </section>

      <section className="mobile-database-tools" aria-label="Database filters">
        <label>
          <span className="sr-only">Search clothes</span>
          <input
            type="search"
            placeholder="Search clothes or tags"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div>
          <button
            type="button"
            className={showFlaggedOnly ? "is-active" : ""}
            onClick={() => setShowFlaggedOnly(true)}
          >
            Needs attention
          </button>
          <button
            type="button"
            className={!showFlaggedOnly ? "is-active" : ""}
            onClick={() => setShowFlaggedOnly(false)}
          >
            All clothes
          </button>
        </div>
      </section>

      <section className="mobile-database-list" aria-label="Clothing database records">
        {visibleRecords.map((record) => (
          <button type="button" onClick={() => setEditingId(record.id)} key={record.id}>
            <span className="mobile-database-list__copy">
              <strong>{record.name}</strong>
              <small>
                {record.category} · {record.color || "No color"} · {record.size || "No size"}
              </small>
              <span>{record.tags.length ? record.tags.join(" · ") : "No tags"}</span>
            </span>
            {record.issues.length ? (
              <span className="mobile-database-list__issues">
                {record.issues.map((issue) => (
                  <em key={issue}>{issue}</em>
                ))}
              </span>
            ) : (
              <span className="mobile-database-list__clean">Complete</span>
            )}
          </button>
        ))}

        {!visibleRecords.length ? (
          <p className="mobile-database-list__empty">No clothes match this view.</p>
        ) : null}
      </section>

      {message ? <p className="mobile-form-message">{message}</p> : null}

      {editingRecord ? (
        <div className="mobile-sheet-backdrop" role="presentation">
          <section
            className="mobile-record-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-record-title"
          >
            <div className="mobile-photo-sheet__handle" aria-hidden="true" />
            <header>
              <div>
                <p>Edit information</p>
                <h2 id="mobile-record-title">{editingRecord.name}</h2>
              </div>
              <button type="button" onClick={() => setEditingId(null)} aria-label="Close editor">
                <CloseIcon />
              </button>
            </header>

            <form action={saveRecord}>
              <label>
                <span>Name</span>
                <input name="name" defaultValue={editingRecord.name} required />
              </label>
              <div className="mobile-record-sheet__row">
                <label>
                  <span>Category</span>
                  <select name="category" defaultValue={editingRecord.category}>
                    {clothingCategories.map((category) => (
                      <option value={category} key={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Size</span>
                  <input name="size" defaultValue={editingRecord.size} placeholder="Add size" />
                </label>
              </div>
              <label>
                <span>Item type</span>
                <input name="subcategory" defaultValue={editingRecord.subcategory} />
              </label>
              <label>
                <span>Color</span>
                <input name="color" defaultValue={editingRecord.color} />
              </label>
              <label>
                <span>Tags</span>
                <input name="tags" defaultValue={editingRecord.tags.join(", ")} />
                <small>Separate tags with commas.</small>
              </label>
              <label>
                <span>Occasions</span>
                <input name="occasions" defaultValue={editingRecord.occasions.join(", ")} />
                <small>Separate occasions with commas.</small>
              </label>

              {editingRecord.issues.some((issue) => issue.startsWith("A.I. unsure")) ? (
                <label className="mobile-record-sheet__reviewed">
                  <input type="checkbox" name="reviewedAi" />
                  <span>I reviewed and corrected the A.I. suggestions.</span>
                </label>
              ) : null}

              <button type="submit" className="mobile-primary-action">
                Save changes
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
