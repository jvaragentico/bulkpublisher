"use client";

import { useEffect, useState } from "react";
import { hosts, type Host } from "@/lib/hosts";
import type { HostJob } from "./hosting";

type Config = Record<string, string>;

export default function HostSettings({ jobs, articles, reload, notify, directory = false, search = "", showAll = true }: {
  jobs: HostJob[];
  articles: { id: string; title: string }[];
  reload: () => Promise<void>;
  notify: (message: string) => void;
  directory?: boolean;
  search?: string;
  showAll?: boolean;
}) {
  const [configs, setConfigs] = useState<Record<string, Config>>({});
  const [host, setHost] = useState<Host | null>(null);
  const [form, setForm] = useState<Config>({});
  const [token, setToken] = useState("");
  const [secondary, setSecondary] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try { setConfigs(JSON.parse(localStorage.getItem("bp-host-config") || "{}")); }
    catch { setConfigs({}); }
  }, []);

  function open(item: Host) {
    setHost(item);
    setForm(configs[item.id] || { branch: item.id === "codeberg" ? "pages" : "main" });
    setToken(sessionStorage.getItem(`bp-host-token-${item.id}`) || "");
    setSecondary(sessionStorage.getItem(`bp-host-second-${item.id}`) || "");
  }

  function save() {
    if (!host) return;
    const next = { ...configs, [host.id]: form };
    setConfigs(next);
    localStorage.setItem("bp-host-config", JSON.stringify(next));
    sessionStorage.setItem(`bp-host-token-${host.id}`, token.trim());
    sessionStorage.setItem(`bp-host-second-${host.id}`, secondary.trim());
    setHost(null);
    notify(`${host.name} settings saved for this browser. Select it above, then publish.`);
  }

  async function verify(provider: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/hosting", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "check", provider }) });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || "Verification failed.");
      notify(result.message || "Verification completed.");
      await reload();
    } catch (error) { notify(error instanceof Error ? error.message : "Verification failed."); }
    finally { setBusy(false); }
  }

  const visibleHosts = showAll ? hosts.filter(item => item.name.toLowerCase().includes(search.toLowerCase())) : [];
  return <div className={directory ? "host-directory" : "host-inline-settings"}>
    {!directory && <><h3>Page host settings</h3><p>Set up each selected host here. Access tokens stay in this browser tab; site settings stay on this device.</p></>}
    {directory && visibleHosts.length > 0 && <><h2>Website and page hosts</h2><p>Configure a dedicated publishing site, then select it beside your article in Compose.</p></>}
    <div className={directory ? "platform-grid" : "target-grid"}>{visibleHosts.map(item => directory ? <article className="platform-card" key={item.id}><div className="platform-card-top"><span className="platform-logo" style={{ background: "#dcf5ed" }}>{item.name.slice(0, 1)}</span><span className="method-badge api">PAGE HOST</span></div><h2>{item.name}</h2><span className="platform-category">Website hosting</span><p>{item.note}</p><div className="platform-card-foot"><button className="button-outline small" onClick={() => open(item)}>{sessionStorage.getItem(`bp-host-token-${item.id}`) ? "Token available" : "Configure"}</button><a href={item.docs} target="_blank" rel="noopener noreferrer" aria-label={`Setup ${item.name}`}>Setup instructions ↗</a></div></article> : <button className="target-chip" key={item.id} onClick={() => open(item)}><span>{item.name}</span><small>Configure</small></button>)}</div>
    {jobs.length > 0 && <div className="host-inline-results"><h3>Hosted pages</h3>{jobs.map(job => <div className="host-job" key={job.provider}><strong>{hosts.find(item => item.id === job.provider)?.name || job.provider}</strong> <span className="pill pill-draft">{job.state}</span>{job.error && <p className="delivery-error">{job.error}</p>}{job.url && <a href={job.url} target="_blank" rel="noreferrer">{job.url} ↗</a>}<button className="button-outline small" disabled={busy || !job.url} onClick={() => verify(job.provider)}>Verify live pages</button>{job.state === "published" && <ul>{(JSON.parse(job.articleIds) as string[]).map(id => <li key={id}><a href={`${job.url}/${id.replace(/[^a-zA-Z0-9-]/g, "")}.html`} target="_blank" rel="noreferrer">{articles.find(article => article.id === id)?.title || "Article"}</a></li>)}</ul>}</div>)}</div>}
    {host && <div className="modal-backdrop"><div className="modal" role="dialog" aria-modal="true" aria-label={`Configure ${host.name}`}><button className="modal-close" onClick={() => setHost(null)} aria-label="Close">×</button><h2>{host.name}</h2><p>{host.note}</p><label>API / access token<input type="password" autoComplete="off" value={token} onChange={event => setToken(event.target.value)} /></label>{host.id === "render" && <label>GitHub Contents-write token<input type="password" autoComplete="off" value={secondary} onChange={event => setSecondary(event.target.value)} /></label>}{host.fields.map(field => <label key={field.key}>{field.label}{field.optional ? " (optional)" : ""}<input placeholder={field.hint} value={form[field.key] || ""} onChange={event => setForm({ ...form, [field.key]: event.target.value })} /></label>)}<a href={host.docs} target="_blank" rel="noreferrer">Setup instructions ↗</a><p>Tokens stay in this browser tab. Site settings stay on this device.</p><button className="button-primary" onClick={save}>Save settings</button></div></div>}
  </div>;
}
