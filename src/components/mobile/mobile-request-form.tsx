"use client";

import { useState, type FormEvent } from "react";

export function MobileRequestForm() {
  const [message, setMessage] = useState("");

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const subject = String(data.get("subject") || "").trim();

    setMessage(
      subject
        ? `“${subject}” is ready. It will be sent once the backend connection is added.`
        : "Your request is ready. It will be sent once the backend connection is added.",
    );
  }

  return (
    <form className="mobile-request-form" onSubmit={submitRequest}>
      <label>
        <span>Subject</span>
        <input
          type="text"
          name="subject"
          placeholder="What would you like changed?"
          autoComplete="off"
          required
        />
      </label>

      <label>
        <span>Request</span>
        <textarea
          name="request"
          placeholder="Tell me what you would like added, removed, fixed, or changed..."
          rows={10}
          required
        />
      </label>

      <button type="submit" className="mobile-primary-action">
        Submit request
      </button>

      {message ? <p className="mobile-form-message">{message}</p> : null}
    </form>
  );
}
