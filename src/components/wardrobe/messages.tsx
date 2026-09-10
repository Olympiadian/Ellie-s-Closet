"use client";
import { useState } from "react";
import { DataGate, useWardrobe } from "./provider";
import { Drawer, Empty } from "./ui";
export function MessagesButton({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const { data } = useWardrobe();
  return <><button className={mobile ? "mobile-home__quick-button" : "wc-utility-button"} aria-label="Daily messages" onClick={() => setOpen(true)}>{mobile ? "Messages" : <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 7.5h13.5a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H12l-5 3.8V7.5Z"/></svg>}</button>
    {open && <Drawer title="A Note for You" close={() => setOpen(false)} small><DataGate>{data?.messages.length ? data.messages.map(message => <article className="wc-message" key={message.id}><time dateTime={message.date}>{new Date(message.date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}</time><h3>{message.title}</h3><p>{message.body}</p></article>) : <Empty>Your notes will arrive here.</Empty>}</DataGate></Drawer>}
  </>;
}
