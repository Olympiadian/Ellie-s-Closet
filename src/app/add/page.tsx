import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CapturePanel } from "@/components/capture-panel";
import { processingJobs } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Add clothing",
  description: "Capture and index new clothing or a complete outfit.",
};

export default function AddPage() {
  return (
    <AppShell
      active="add"
      eyebrow="Capture now, organize quietly"
      title="Add to the closet"
      description="Take a clear photo. Naming, categories, colors, and tags happen after upload."
    >
      <div className="capture-modes">
        <button type="button" className="is-active">
          <span>01</span>
          <strong>Add item</strong>
          <p>One new piece</p>
        </button>
        <button type="button">
          <span>02</span>
          <strong>Bulk index</strong>
          <p>Move through the closet</p>
        </button>
        <button type="button">
          <span>03</span>
          <strong>Save outfit</strong>
          <p>Worn or laid out</p>
        </button>
      </div>

      <CapturePanel />

      <section className="processing-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recent activity</p>
            <h2>Processing</h2>
          </div>
          <Link href="/review">Open review queue →</Link>
        </div>
        <div className="processing-list">
          {processingJobs.map((job) => (
            <article key={job.id}>
              <span className={`status-dot status-dot--${job.status}`} aria-hidden="true" />
              <div>
                <strong>{job.label}</strong>
                <p>{job.detail}</p>
              </div>
              <span className="status-label">{job.status.replace("_", " ")}</span>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
