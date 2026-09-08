"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { requestJson, uploadPhoto } from "@/lib/api";
import { localDate, type WardrobeItem } from "@/lib/wardrobe";
import { DataGate, useWardrobe, WardrobeProvider } from "./provider";
import { Drawer, Empty, ItemPhoto, PageShell } from "./ui";
import { ItemEditor, IssueList } from "./item-editor";

export function AdminEntry() {
  const [signedIn, setSignedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    requestJson<{ role: string | null }>("/api/session").then(result => setSignedIn(result.role === "admin")).catch(error => setMessage(error.message)).finally(() => setChecking(false));
  }, []);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = event.currentTarget;
    try { await requestJson("/api/session", { action: "login", password: new FormData(form).get("password") }); form.reset(); setSignedIn(true); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not sign in."); }
    finally { setBusy(false); }
  }
  if (checking) return <PageShell title="Admin"><Empty>Checking access…</Empty></PageShell>;
  if (!signedIn) return <PageShell title="Admin"><form className="wc-content wc-narrow wc-surface wc-form" onSubmit={login}><p>A private space to look after the closet.</p><label>Password<input name="password" type="password" autoComplete="current-password" required maxLength={200}/></label><button className="wc-button wc-button--accent" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>{message && <p role="alert">{message}</p>}</form></PageShell>;
  return <WardrobeProvider admin><PageShell title="Behind the Closet"><DataGate><AdminContents/></DataGate></PageShell></WardrobeProvider>;
}
function AdminContents() {
  const { data, refresh, mutate } = useWardrobe();
  const [tab, setTab] = useState("Review");
  const [selected, setSelected] = useState<WardrobeItem | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  if (!data) return null;
  const selectedItem = data.items.find(i => i.id === selected?.id) ?? selected;
  const items = data.items.filter(item => (tab !== "Review" || item.status === "pending" || item.status === "uploading") && item.name.toLowerCase().includes(search.toLowerCase())).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true); setNotice("");
    try { await action(); await refresh(); setNotice(success); } catch (error) { setNotice(error instanceof Error ? error.message : "Please try again."); } finally { setBusy(false); }
  }
  async function saveMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    await run(async () => { await mutate({ action: "message", id: crypto.randomUUID(), title: values.get("title"), body: values.get("body"), date: values.get("date") }); form.reset(); }, "Your message is saved.");
  }
  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await run(() => mutate({ action: "settings", stores: form.get("stores"), area: form.get("area"), manualUrl: form.get("manualUrl") }), "Settings saved.");
  }
  return <div className="wc-content wc-admin">
    <nav className="closet-browser__filters wc-admin-tabs" aria-label="Admin sections">{["Review","All items","Messages","Requests","Activity","Setup"].map(value => <button className={value === tab ? "is-active" : ""} aria-pressed={value === tab} key={value} onClick={() => { setTab(value); setNotice(""); }}>{value}{value === "Review" ? " (" + data.items.filter(i => i.status === "pending" || i.status === "uploading").length + ")" : ""}</button>)}</nav>
    {notice && <p className="wc-notice" role="status">{notice}</p>}
    {(tab === "Review" || tab === "All items") && <><label className="wc-search"><span className="sr-only">Search items</span><input placeholder="Find an item…" value={search} onChange={e => setSearch(e.target.value)}/></label>{items.length ? <div className="wc-record-list">{items.map(item => <button key={item.id} onClick={() => { setSelected(item); setNotice(""); }}><span><strong>{item.name}</strong><small>{item.status} · {new Date(item.createdAt).toLocaleDateString()}</small><IssueList item={item}/></span><span>Review ↗</span></button>)}</div> : <Empty>No items waiting here.</Empty>}</>}
    {tab === "Messages" && <div className="wc-admin-columns"><form className="wc-form wc-surface" onSubmit={saveMessage}><h2>A new note</h2><label>Show on<input name="date" type="date" required defaultValue={localDate()}/></label><label>Title<input name="title" required maxLength={160}/></label><label>Message<textarea name="body" required rows={8} maxLength={6000}/></label><p className="wc-muted">Today’s date makes a note available immediately. Future notes appear on that date in Arizona time.</p><button className="wc-button wc-button--accent" disabled={busy}>Save message</button></form><div>{data.messages.map(message => <article className="wc-surface wc-message" key={message.id}><time>{message.date}</time><h3>{message.title}</h3><p>{message.body}</p><button className="wc-text-link" disabled={busy} onClick={() => { if (confirm("Remove this message?")) void run(() => mutate({ action: "removeMessage", id: message.id }), "Message removed."); }}>Remove</button></article>)}</div></div>}
    {tab === "Requests" && (data.requests.length ? data.requests.map(request => <article className="wc-surface wc-message" key={request.id}><small>{request.kind} · {request.status} · {new Date(request.createdAt).toLocaleDateString()}</small><h2>{request.subject}</h2><p>{request.body}</p><button className="wc-button" disabled={busy} onClick={() => void run(() => mutate({ action: "resolveRequest", id: request.id, resolved: request.status === "open" }), "Request updated.")}>{request.status === "open" ? "Mark resolved" : "Reopen"}</button></article>) : <Empty>No support requests yet.</Empty>)}
    {tab === "Activity" && <section className="wc-surface"><h2>Recent activity</h2>{data.activity.length ? data.activity.map(entry => <div className="wc-activity" key={entry.id}><span>{entry.text}</span><time>{new Date(entry.createdAt).toLocaleString()}</time></div>) : <Empty>Activity will appear as the closet is used.</Empty>}</section>}
    {tab === "Setup" && <div className="wc-admin-columns"><div className="wc-form wc-surface"><h2>Daily Deals</h2><p className="wc-muted">Runs each morning, around 7–8am Arizona time. At most one successful scan per day. Research uses the OpenAI API.</p><button className="wc-button" disabled={busy} onClick={() => void run(() => requestJson("/api/deals", {}), "Daily research is ready.")}>{busy ? "Working…" : "Run today’s scan"}</button>{data.scans[0] && <p>Last scan: {data.scans[0].status}. {data.scans[0].error}</p>}<button className="wc-text-link" onClick={() => void run(async () => { await requestJson("/api/session", { action: "logout" }); window.location.assign("/admin"); }, "")}>Sign out of admin</button></div><form className="wc-form wc-surface" onSubmit={saveSettings}><h2>Research & guide</h2><label>Stores<textarea name="stores" rows={4} defaultValue={data.settings.stores} maxLength={1500}/></label><label>Nearby area<input name="area" defaultValue={data.settings.area} maxLength={250}/></label><label>Manual PDF link<input name="manualUrl" type="url" placeholder="https://…" defaultValue={data.settings.manualUrl} maxLength={2000}/></label><button className="wc-button wc-button--accent" disabled={busy}>Save settings</button></form></div>}
    {selectedItem && <Drawer title={selectedItem.name} close={() => { if (!busy) setSelected(null); }}>
      <div className="wc-item-photos"><ItemPhoto item={selectedItem}/><ItemPhoto item={selectedItem} side="back"/></div>
      <div className="wc-downloads">{(["front","back"] as const).map(side => { const url = side === "front" ? selectedItem.originalFrontUrl : selectedItem.originalBackUrl; return url ? <a key={side} className="wc-text-link" href={url + "&download=" + encodeURIComponent(selectedItem.id + "-" + side)} target="_blank" rel="noreferrer">Download original {side} ↗</a> : <span key={side}>{side} photo not uploaded yet</span>; })}</div>
      <div className="wc-form-grid wc-form">{(["front","back"] as const).map(side => <label key={side}>Finished {side} cutout<input type="file" accept="image/png,image/webp" disabled={busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void run(() => uploadPhoto(selectedItem.id, side, file, true), "Finished image saved."); }}/></label>)}</div>
      <button className="wc-button" disabled={busy || !selectedItem.frontPath} onClick={() => void run(() => requestJson("/api/index", { id: selectedItem.id }), "AI suggestions added. Please review before publishing.")}>Suggest details with AI</button>
      {notice && <p role="status">{notice}</p>}
      <ItemEditor key={JSON.stringify(selectedItem)} item={selectedItem}/>
      <div className="wc-publish"><p className="wc-muted">Save your edits above before publishing. Only published items appear in Ellie’s closet.</p><button className="wc-button wc-button--accent" disabled={busy || !selectedItem.frontPath || !selectedItem.backPath} onClick={() => void run(() => mutate({ action: "publish", id: selectedItem.id, published: selectedItem.status !== "published" }), selectedItem.status === "published" ? "Item archived." : "Item published to the closet.")}>{selectedItem.status === "published" ? "Archive item" : "Publish to closet"}</button></div>
    </Drawer>}
  </div>;
}
export function ConnectPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function connect() {
    setBusy(true); setMessage("");
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    try { await requestJson("/api/session", { action: "pair", token }); history.replaceState(null, "", "/connect"); router.replace("/"); window.location.assign("/"); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not connect."); }
    finally { setBusy(false); }
  }
  return <PageShell title="Ellie’s Closet"><section className="wc-content wc-narrow wc-surface wc-form"><h2>Make yourself at home.</h2><p>Connect this device to your private closet.</p><button className="wc-button wc-button--accent" disabled={busy} onClick={() => void connect()}>{busy ? "Connecting…" : "Connect this device"}</button>{message && <p role="alert">{message}</p>}</section></PageShell>;
}
