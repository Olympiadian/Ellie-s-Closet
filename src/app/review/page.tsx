import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { processingJobs } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Review queue",
  description: "Resolve uncertain or failed wardrobe processing.",
};

export default function ReviewPage() {
  return (
    <AppShell
      eyebrow="Management"
      title="Review queue"
      description="Nothing interrupts capture. Uncertain work waits here until it is easy to fix."
    >
      <div className="review-list">
        {processingJobs.map((job) => (
          <article key={job.id}>
            <div className="review-thumb" aria-hidden="true" />
            <div className="review-copy">
              <p className="eyebrow">{job.status.replace("_", " ")}</p>
              <h2>{job.label}</h2>
              <p>{job.detail}</p>
            </div>
            <div className="review-actions">
              <button type="button" className="button button--primary">Review</button>
              <button type="button" className="button button--quiet">Retry</button>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
