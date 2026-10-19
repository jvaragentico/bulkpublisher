"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, ArrowUpRight, Check, ChevronDown, Copy, Download, ExternalLink, Eye, FileText, Globe2, Image as ImageIcon, KeyRound, LayoutDashboard, Link2, Menu, PenLine, Plus, RefreshCw, Search, Send, Settings2, Trash2, Video, X } from "lucide-react";
import { platforms, platformById, type Platform } from "@/lib/catalog";
import { setup } from "@/lib/platform-setup";
import { canDeleteRemote } from "@/lib/remote-delete";
import { isTelegraphAccount } from "@/lib/telegraph-accounts";
import Uploads from "./uploads";
import Hosting, { type HostJob } from "./hosting";
import Guide from "./guide";
import PublishedLinks from "./published-links";
import { markdownToHtml } from "@/lib/publish";

type Article = { id: string; title: string; excerpt: string; body: string; keywords: string[]; coverUrl: string; videoUrl: string; canonicalUrl: string; createdAt: string; updatedAt: string };
type Draft = Omit<Article, "createdAt" | "updatedAt">;
type Delivery = { id: string; articleId: string; platformId: string; state: string; url: string; error: string; views: number; publishedAt: string | null; updatedAt: string };
type Setting = { platformId: string; siteId: string; enabled: boolean };
type Data = { articles: Article[]; deliveries: Delivery[]; settings: Setting[]; workspaceTelegraph?: boolean; workspacePlatforms?: string[]; media?: { cloud: string; preset: string }; hosting?: HostJob[] };
type Section = "overview" | "compose" | "platforms" | "activity" | "hosts" | "guide";

const blank: Draft = { id: "", title: "", excerpt: "", body: "", keywords: [], coverUrl: "", videoUrl: "", canonicalUrl: "" };

async function request<T = Record<string, any>>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(path, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  const data = await response.json() as Record<string, any>;
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data as T;
}

function shortDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function initials(name: string) {
  return name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "BP";
}

function editorCopy(article: Draft) {
  return `${article.title}\n\n${article.coverUrl ? `![${article.title}](${article.coverUrl})\n\n` : ""}${article.body}${article.videoUrl ? `\n\nVideo: ${article.videoUrl}` : ""}${article.keywords.length ? `\n\nKeywords: ${article.keywords.join(", ")}` : ""}`;
}

export default function Studio() {
  const [section, setSection] = useState<Section>("overview");
  const [data, setData] = useState<Data>({ articles: [], deliveries: [], settings: [] });
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft>(blank);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [platformModal, setPlatformModal] = useState<Platform | null>(null);
  const [configToken, setConfigToken] = useState("");
  const [configSiteId, setConfigSiteId] = useState("");
  const [manualQueue, setManualQueue] = useState<string[]>([]);
  const [manualUrl, setManualUrl] = useState("");
  const [viewsDelivery, setViewsDelivery] = useState<Delivery | null>(null);
  const [viewsInput, setViewsInput] = useState("0");
  const [mobileNav, setMobileNav] = useState(false);
  const [sessionTokens, setSessionTokens] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");

  async function importCredentials(file?: File) {
    if (!file) return;
    try {
      if (file.size > 100_000) throw new Error("Credential file is too large.");
      const parsed = JSON.parse(await file.text()) as { format?: string; connections?: Record<string, { token?: string; siteId?: string }> };
      if (parsed.format !== "bulkpublisher-credentials-v1" || !parsed.connections || typeof parsed.connections !== "object") throw new Error("Choose a Bulk Publisher credentials JSON file.");
      let tokenCount = 0;
      let targetCount = 0;
      for (const platform of platforms.filter(item => item.method === "api")) {
        const entry = parsed.connections[platform.id];
        if (!entry || typeof entry !== "object") continue;
        if (typeof entry.siteId === "string" && entry.siteId.trim()) {
          sessionStorage.setItem(`bp-site-${platform.id}`, entry.siteId.trim());
          targetCount++;
        }
        if (typeof entry.token === "string" && entry.token.trim()) {
          sessionStorage.setItem(`bp-token-${platform.id}`, entry.token.trim());
          tokenCount++;
        }
      }
      setSessionTokens(platforms.filter(item => item.method === "api" && !!sessionStorage.getItem(`bp-token-${item.id}`)).map(item => item.id));
      setMessage(tokenCount
        ? `${tokenCount} publishing token${tokenCount === 1 ? "" : "s"} and ${targetCount} site target${targetCount === 1 ? "" : "s"} imported into this tab. Use Connect to test each one. Hosted workspace connections are separate.`
        : `No publishing tokens are filled in this file. ${targetCount} site target${targetCount === 1 ? "" : "s"} imported. Fill the token fields or use a platform's Connect flow. Server settings and hosted workspace connections do not count as file imports.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not read credential file.");
    }
  }

  async function clearHistory() {
    if (!confirm("Clear ALL publication and deployment history from this dashboard? Public posts and hosted websites will stay online. Saved articles will remain. Inspect your destinations before continuing.")) return;
    setBusy(true);
    try {
      const result = await request<{ message: string }>("/api/history", "DELETE", { confirm: "DELETE HISTORY", inspected: true });
      await reload();
      setMessage(result.message);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not clear history."); }
    finally { setBusy(false); }
  }

  async function reload() {
    try {
      const loaded = await request<Data>("/api/bootstrap");
      setData(loaded);
      setSessionTokens(platforms.filter(p => p.method === "api" && (!!sessionStorage.getItem(`bp-token-${p.id}`) || (loaded.workspacePlatforms || []).includes(p.id))).map(p => p.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load workspace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setSessionTokens(platforms.filter((platform) => platform.method === "api" && !!sessionStorage.getItem(`bp-token-${platform.id}`)).map((platform) => platform.id));
    void reload();
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 6500);
    return () => clearTimeout(timer);
  }, [message]);

  const published = data.deliveries.filter((item) => item.state === "published");
  const views = published.reduce((total, item) => total + item.views, 0);
  const connected = sessionTokens.length;
  const categories = ["All", ...new Set(platforms.map((platform) => platform.category))];
  const filteredPlatforms = platforms.filter((platform) => (filter === "All" || platform.category === filter) && `${platform.name} ${platform.category}`.toLowerCase().includes(search.toLowerCase()));
  const currentManual = manualQueue[0] ? platformById[manualQueue[0]] : null;
  const articlePublished = useMemo(() => new Set(published.map((item) => item.articleId)), [data.deliveries]);

  function siteIdFor(id: string) {
    return sessionStorage.getItem(`bp-site-${id}`) || data.settings.find(item => item.platformId === id)?.siteId || "";
  }

  function edit(article: Article) {
    setDraft({ id: article.id, title: article.title, excerpt: article.excerpt, body: article.body, keywords: article.keywords, coverUrl: article.coverUrl, videoUrl: article.videoUrl, canonicalUrl: article.canonicalUrl });
    setSelected([]);
    setSection("compose");
    setMobileNav(false);
  }

  function newArticle() {
    if (draft.body.trim() && !draft.id && !confirm("Start a new draft? Unsaved text will be discarded.")) return;
    setDraft({ ...blank });
    setSelected([]);
    setSection("compose");
    setMobileNav(false);
  }

  async function saveArticle(): Promise<string> {
    if (!draft.title.trim()) throw new Error("Add a title before saving.");
    const result = await request("/api/articles", "POST", draft);
    setDraft((current) => ({ ...current, id: result.id }));
    await reload();
    return result.id;
  }

  async function saveClick() {
    setBusy(true);
    try { await saveArticle(); setMessage("Article saved."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not save article."); }
    finally { setBusy(false); }
  }

  async function deleteArticle() {
    if (!draft.id || !confirm("Delete this local article and its dashboard publication records? Public posts remain online. Delete those separately first if you want them removed.")) return;
    setBusy(true);
    try {
      await request("/api/articles", "DELETE", { id: draft.id });
      setDraft({ ...blank });
      await reload();
      setMessage("Article deleted.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not delete article."); }
    finally { setBusy(false); }
  }

  async function publishSelected(update = false) {
    if (!selected.length) return setMessage("Select at least one destination.");
    if (!draft.body.trim()) return setMessage("Add article text before publishing.");
    const seenTelegraph = new Set<string>();
    for (const id of selected.filter(isTelegraphAccount)) {
      const token = sessionStorage.getItem(`bp-token-${id}`) || "";
      if (token && seenTelegraph.has(token)) return setMessage("Two selected Telegra.ph slots have the same token. Use a different account per slot, or select only one of them.");
      if (token) seenTelegraph.add(token);
    }
    setBusy(true);
    try {
      const articleId = await saveArticle();
      const guided: string[] = [];
      const outcomes: string[] = [];
      for (const id of selected) {
        const platform = platformById[id];
        if (update && !isTelegraphAccount(id)) { outcomes.push(`${platform.name}: select a published Telegra.ph destination for updates`); continue; }
        if (platform.method === "guided") { guided.push(id); continue; }
        const token = sessionStorage.getItem(`bp-token-${id}`) || "";
        if (!token && !(data.workspacePlatforms || []).includes(id)) { outcomes.push(`${platform.name}: add a token in Platforms`); continue; }
        const siteId = siteIdFor(id);
        try {
          const result = await request("/api/publish", "POST", { articleId, platformId: id, token, siteId, update });
          outcomes.push(`${platform.name}: ${result.url}${result.warning ? " — " + result.warning : ""}`);
        } catch (error) { outcomes.push(`${platform.name}: ${error instanceof Error ? error.message : "failed"}`); }
      }
      await reload();
      setManualQueue(guided);
      setManualUrl("");
      setMessage(outcomes.length ? outcomes.join(" · ") : guided.length ? "Guided destinations are ready." : "Nothing to publish.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not publish."); }
    finally { setBusy(false); }
  }

  async function deleteDelivery(delivery: Delivery, remote: boolean) {
    const name = platformById[delivery.platformId]?.name || delivery.platformId;
    const warning = remote ? `Delete the public ${name} post and its dashboard record? This may be permanent.` : `Remove this ${name} dashboard record only? Any public post stays online. Inspect the platform first; removing an uncertain record can allow a duplicate on retry.`;
    if (!confirm(warning)) return;
    setBusy(true);
    try {
      const result = await request("/api/deliveries", "DELETE", { id: delivery.id, remote, inspected: !remote, token: sessionStorage.getItem(`bp-token-${delivery.platformId}`) || "", siteId: siteIdFor(delivery.platformId) });
      await reload();
      setMessage(result.message);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not delete this publication."); }
    finally { setBusy(false); }
  }

  async function recordManual() {
    if (!currentManual || !draft.id) return;
    setBusy(true);
    try {
      await request("/api/deliveries", "POST", { articleId: draft.id, platformId: currentManual.id, url: manualUrl, views: 0 });
      await reload();
      setManualQueue((queue) => queue.slice(1));
      setManualUrl("");
      setMessage(`Recorded ${currentManual.name} publication.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not record URL."); }
    finally { setBusy(false); }
  }

  async function copyText(value: string) {
    try { await navigator.clipboard.writeText(value); setMessage("Copied to clipboard."); }
    catch { setMessage("Clipboard access is unavailable. Select and copy the text from the editor."); }
  }

  function downloadMarkdown() {
    const blob = new Blob([editorCopy(draft)], { type: "text/markdown;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "article"}.md`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function openSettings(platform: Platform) {
    setPlatformModal(platform);
    setConnectionMessage("");
    setConfigToken(sessionStorage.getItem(`bp-token-${platform.id}`) || "");
    setConfigSiteId(siteIdFor(platform.id));
  }

  async function saveSettings() {
    if (!platformModal) return;
    setBusy(true);
    try {
      await request("/api/settings", "POST", { platformId: platformModal.id, siteId: configSiteId, enabled: true });
      if (configToken.trim()) sessionStorage.setItem(`bp-token-${platformModal.id}`, configToken.trim());
      else sessionStorage.removeItem(`bp-token-${platformModal.id}`);
      setSessionTokens(platforms.filter((platform) => platform.method === "api" && !!sessionStorage.getItem(`bp-token-${platform.id}`)).map((platform) => platform.id));
      await reload();
      setPlatformModal(null);
      setMessage("Platform settings saved. Workspace account keys are kept on the server; manually entered overrides stay in this tab.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save settings."); }
    finally { setBusy(false); }
  }

  async function saveViews() {
    if (!viewsDelivery) return;
    setBusy(true);
    try {
      await request("/api/deliveries", "POST", { articleId: viewsDelivery.articleId, platformId: viewsDelivery.platformId, url: viewsDelivery.url, views: Number(viewsInput) });
      await reload();
      setViewsDelivery(null);
      setMessage("View count updated.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update views."); }
    finally { setBusy(false); }
  }

  async function refreshDev() {
    const token = sessionStorage.getItem("bp-token-dev") || "";
    setBusy(true);
    try {
      const result = await request("/api/dev-stats", "POST", { token });
      await reload();
      setMessage(`Refreshed ${result.updated} DEV article${result.updated === 1 ? "" : "s"}.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not refresh DEV views."); }
    finally { setBusy(false); }
  }

  async function testConnection() {
    if (!platformModal) return;
    setBusy(true); setConnectionMessage("");
    try { const result = await request("/api/connection", "POST", { platformId: platformModal.id, token: configToken, siteId: configSiteId }); setConnectionMessage(result.message); }
    catch (e) { setConnectionMessage(e instanceof Error ? e.message : "Test failed."); }
    finally { setBusy(false); }
  }
  async function connectWordPress() {
    const site = configSiteId.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!/^(?:[a-z0-9-]+\.)+wordpress\.com$/i.test(site)) return setConnectionMessage("Enter your WordPress.com site domain first, for example bulkpublisherarticles.wordpress.com.");
    setBusy(true);
    try {
      await request("/api/settings", "POST", { platformId: "wordpress", siteId: site, enabled: true });
      window.location.assign(`/api/wordpress-oauth/start?site=${encodeURIComponent(site)}`);
    } catch (error) { setConnectionMessage(error instanceof Error ? error.message : "Could not start WordPress connection."); setBusy(false); }
  }
  async function createTelegraph() {
    if (!platformModal || !isTelegraphAccount(platformModal.id)) return;
    setBusy(true);
    try { const result = await request("/api/connection", "POST", { platformId: platformModal!.id, action: "create" }); setConfigToken(result.token); setConnectionMessage("Account created. Save the connection and back up this token privately to retain editing access."); }
    catch (e) { setConnectionMessage(e instanceof Error ? e.message : "Could not create account."); }
    finally { setBusy(false); }
  }
  async function logout() {
    await request("/api/auth", "DELETE", {});
    for (const key of Object.keys(sessionStorage)) if (key.startsWith("bp-")) sessionStorage.removeItem(key);
    window.location.reload();
  }
  function nav(to: Section) { setSection(to); setMobileNav(false); }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><span>B</span></div><div><strong>Bulk Publisher</strong><small>STUDIO</small></div><button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18} /></button></div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={section === "overview" ? "active" : ""} onClick={() => nav("overview")}><LayoutDashboard size={19} /> Overview</button>
          <button className={section === "compose" ? "active" : ""} onClick={() => nav("compose")}><PenLine size={19} /> Compose <span className="nav-count">{data.articles.length}</span></button>
          <button className={section === "platforms" ? "active" : ""} onClick={() => nav("platforms")}><Globe2 size={19} /> Platforms <span className="nav-count">{platforms.length}</span></button>
          <button className={section === "activity" ? "active" : ""} onClick={() => nav("activity")}><Activity size={19} /> Activity</button>
          <button className={section === "hosts" ? "active" : ""} onClick={() => nav("hosts")}><Globe2 size={19} /> Page hosts <span className="nav-count">10</span></button>
          <button className={section === "guide" ? "active" : ""} onClick={() => nav("guide")}><FileText size={19} /> Guide & tests</button>
        </nav>
        <div className="sidebar-bottom"><div className="sidebar-tip"><div className="tip-icon"><Send size={17} /></div><strong>Publish with confidence</strong><p>Review each platform's rules and add a canonical URL when republishing.</p></div><div className="profile"><span className="avatar">BP</span><span className="profile-text"><strong>Admin</strong><small>Private workspace</small></span><button className="logout" onClick={logout}>Sign out</button></div></div>
      </aside>

      <main className="main">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21} /></button><div className="breadcrumb">Workspace <span>/</span> <strong>{section[0].toUpperCase() + section.slice(1)}</strong></div><div className="topbar-actions"><span className="live-indicator"><span /> Live workspace</span><button className="top-new" onClick={newArticle}><Plus size={16} /> New article</button></div></header>
        <div className="page-content">
          {loading ? <div className="loading"><RefreshCw className="spin" size={23} /> Loading your workspace…</div> : null}
          {!loading && section === "overview" && <>
            <div className="page-heading"><div><span className="eyebrow">YOUR PUBLISHING DESK</span><h1>Your publishing workspace.</h1><p>One place to write, distribute, and track every article.</p></div><button className="button-primary" onClick={newArticle}><Plus size={18} /> Create article</button></div>
            <div className="stats-grid"><div className="stat-card"><span className="stat-icon violet"><FileText size={21} /></span><span className="stat-label">Articles</span><strong>{data.articles.length}</strong><small>In your library</small></div><div className="stat-card"><span className="stat-icon peach"><Send size={21} /></span><span className="stat-label">Publications</span><strong>{published.length}</strong><small>Across {new Set(published.map((item) => item.platformId)).size} destinations</small></div><div className="stat-card"><span className="stat-icon blue"><Eye size={21} /></span><span className="stat-label">Recorded views</span><strong>{views.toLocaleString()}</strong><small>DEV sync + your entries</small></div><div className="stat-card"><span className="stat-icon mint"><Globe2 size={21} /></span><span className="stat-label">API connections</span><strong>{connected}<span className="stat-denominator"> / {platforms.filter(p => p.method === "api").length}</span></strong><small>Workspace keys + this tab</small></div></div>
            <div className="overview-grid"><section className="panel"><div className="panel-head"><div><h2>Recent articles</h2><p>Your latest drafts and published work</p></div><button className="text-button" onClick={() => nav("compose")}>Open library <ArrowRight size={16} /></button></div>{data.articles.length ? <div className="article-list">{data.articles.slice(0, 5).map((article) => <button className="article-row" key={article.id} onClick={() => edit(article)}><span className="article-icon"><FileText size={18} /></span><span className="article-info"><strong>{article.title}</strong><small>{article.keywords.slice(0, 3).join(" · ") || "No keywords yet"}</small></span><span className={`pill ${articlePublished.has(article.id) ? "pill-success" : "pill-draft"}`}>{articlePublished.has(article.id) ? "Published" : "Draft"}</span><span className="article-date">{shortDate(article.updatedAt)}</span><ArrowUpRight size={16} /></button>)}</div> : <div className="empty-panel"><span><PenLine size={23} /></span><strong>Your first article starts here</strong><p>Draft once, then choose where to publish it.</p><button className="button-primary small" onClick={newArticle}>Write an article</button></div>}</section><section className="panel pulse-panel"><div className="panel-head"><div><h2>Distribution pulse</h2><p>Where your articles are live</p></div></div>{published.length ? <div className="pulse-list">{Object.entries(published.reduce<Record<string, number>>((acc, item) => { acc[item.platformId] = (acc[item.platformId] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, count]) => <div className="pulse-row" key={id}><span className="platform-dot" style={{ background: platformById[id]?.color }} /><span>{platformById[id]?.name || id}</span><div className="pulse-track"><div style={{ width: `${Math.max(15, count / published.length * 100)}%`, background: platformById[id]?.color }} /></div><strong>{count}</strong></div>)}</div> : <div className="pulse-empty"><Globe2 size={27} /><strong>No posts live yet</strong><p>Your distribution breakdown appears as soon as you publish.</p></div>}<div className="pulse-foot"><span>{platforms.length} destination slots</span><button onClick={() => nav("platforms")}>Explore platforms <ArrowRight size={15} /></button></div></section></div>
            <PublishedLinks deliveries={data.deliveries} articles={data.articles} /><div className="test-shortcut"><strong>Three test articles are live.</strong><button className="text-button" onClick={() => nav("guide")}>View published results & setup guide →</button></div><div className="callout"><div className="callout-icon"><KeyRound size={19} /></div><div><strong>Your publishing connections</strong><p>Configured Telegra.ph workspace accounts use server secrets and work in every tab. Other manually entered tokens stay in the current tab. Articles and results are saved to your private workspace.</p></div><button onClick={() => nav("platforms")}>Manage connections <ArrowRight size={16} /></button></div>
          </>}

          {!loading && section === "hosts" && <Hosting articles={data.articles} jobs={data.hosting || []} reload={reload} notify={setMessage} />}
          {!loading && section === "guide" && <Guide />}
          {!loading && section === "compose" && <>
            <div className="page-heading compact"><div><span className="eyebrow">CONTENT STUDIO</span><h1>Write once. Publish everywhere.</h1><p>Draft your story, add media and keywords, then choose destinations.</p></div><button className="button-outline" onClick={newArticle}><Plus size={17} /> New draft</button></div>
            <div className="editor-layout"><aside className="draft-sidebar"><div className="draft-sidebar-head"><strong>Article library</strong><span>{data.articles.length}</span></div><button className={`draft-item ${!draft.id ? "selected" : ""}`} onClick={newArticle}><span className="draft-icon"><Plus size={17} /></span><span><strong>Untitled draft</strong><small>Start something new</small></span></button>{data.articles.map((article) => <button className={`draft-item ${draft.id === article.id ? "selected" : ""}`} key={article.id} onClick={() => edit(article)}><span className="draft-icon"><FileText size={17} /></span><span><strong>{article.title}</strong><small>{shortDate(article.updatedAt)}</small></span></button>)}</aside><div className="editor-main"><div className="editor-toolbar"><span className="edit-status"><span /> {draft.id ? "Saved draft" : "New draft"}</span><div><button className="icon-text" onClick={downloadMarkdown} disabled={!draft.title}><Download size={16} /> Export</button>{draft.id && <button className="icon-text danger" onClick={deleteArticle} disabled={busy}><Trash2 size={16} /> Delete</button>}<button className="button-primary small" onClick={saveClick} disabled={busy}><Check size={16} /> Save article</button></div></div><Uploads defaults={data.media} draft={draft} change={value => setDraft(current => ({ ...current, ...value }))} notify={setMessage} /><div className="editor-fields"><label className="field-label">ARTICLE TITLE</label><input className="title-input" placeholder="Give your article a compelling title…" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} maxLength={220} aria-label="Article title" /><label className="field-label">SHORT DESCRIPTION</label><textarea className="excerpt-input" rows={2} placeholder="A quick summary for readers and search previews" value={draft.excerpt} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} maxLength={500} aria-label="Short description" /><div className="editor-divider" /><div className="body-heading"><label className="field-label">ARTICLE BODY</label><button className="text-button" onClick={() => setPreview(!preview)}>{preview ? "Edit text" : "Preview article"}</button></div>{preview && <div className="article-preview" dangerouslySetInnerHTML={{ __html: markdownToHtml(draft.body) }} />}<textarea hidden={preview} aria-label="Article body" className="body-input" placeholder={`Start writing your story…\n\n## Add a section heading\n\nUse **bold**, *italics*, links, and lists.`} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} /><div className="word-count">{draft.body.trim() ? draft.body.trim().split(/\s+/).length : 0} words</div></div><div className="editor-extra"><div className="extra-heading"><strong>Details & media</strong><span>Optional, but recommended</span></div><div className="form-grid"><label><span><ImageIcon size={15} /> Cover image URL</span><input type="url" placeholder="https://example.com/image.jpg" value={draft.coverUrl} onChange={(event) => setDraft({ ...draft, coverUrl: event.target.value })} /></label><label><span><Video size={15} /> Video URL</span><input type="url" placeholder="https://example.com/video" value={draft.videoUrl} onChange={(event) => setDraft({ ...draft, videoUrl: event.target.value })} /></label><label><span><Link2 size={15} /> Canonical URL</span><input type="url" placeholder="https://your-site.com/original-article" value={draft.canonicalUrl} onChange={(event) => setDraft({ ...draft, canonicalUrl: event.target.value })} /></label><label><span><Settings2 size={15} /> Keywords / tags</span><input placeholder="writing, design, technology" value={draft.keywords.join(", ")} onChange={(event) => setDraft({ ...draft, keywords: event.target.value.split(",").map((value) => value.trim()) })} /></label></div></div><div className="publish-box"><div className="publish-heading"><div><strong>Choose destinations</strong><span>{selected.length} selected · {platforms.filter(p => p.method === "api").length} automatic API destination slots</span></div><button onClick={() => nav("platforms")}>View all {platforms.length} <ArrowUpRight size={15} /></button></div><div className="target-grid">{platforms.map((platform) => <label key={platform.id} className={`target-chip ${selected.includes(platform.id) ? "checked" : ""}`}><input type="checkbox" checked={selected.includes(platform.id)} onChange={() => setSelected((current) => current.includes(platform.id) ? current.filter((id) => id !== platform.id) : [...current, platform.id])} /><span className="target-avatar" style={{ background: platform.color }}>{platform.name[0]}</span><span>{platform.name}</span><small>{platform.method === "api" ? "API" : "Guided"}</small></label>)}</div><div className="publish-footer">{draft.id && data.deliveries.some(item => item.articleId === draft.id && item.state === "published" && isTelegraphAccount(item.platformId)) && <button className="button-outline" disabled={busy || !selected.length} onClick={() => publishSelected(true)}>Update selected Telegra.ph pages</button>}<p>Publishing happens when you press the button. Guided destinations need a final step in their editor.</p><button className="button-primary" onClick={() => publishSelected()} disabled={busy}><Send size={17} /> {busy ? "Working…" : `Publish to ${selected.length || "selected"} destination${selected.length === 1 ? "" : "s"}`}</button></div></div></div></div>
          </>}

          {!loading && section === "platforms" && <>
            <div className="page-heading"><div><span className="eyebrow">DESTINATION DIRECTORY</span><h1>{platforms.length} publishing destinations.</h1><p>{new Set(platforms.map(p => new URL(p.url).hostname)).size} services, including four separate Telegra.ph accounts. {platforms.filter(p => p.method === "api").length} automatic API slots; {platforms.filter(p => p.method === "guided").length} guided editors. Public social and channel posts may be shorter than an article.</p></div><div className="directory-number">{platforms.length} <span>platforms</span></div></div><div className="credential-import"><KeyRound size={18} /><div><strong>Private credential file</strong><p>Keep CREDENTIALS.local.json on your computer. Choose it only when you want to use its tokens in this tab. The file is not uploaded to the server. <a href="https://github.com/jvaragentico/bulkpublisher/blob/main/public/guides/CREDENTIAL-FORMATS.md" target="_blank" rel="noreferrer">See credential examples ↗</a></p></div><label className="button-outline">Import credentials<input type="file" accept=".json,application/json" style={{ display: "none" }} onChange={event => { void importCredentials(event.target.files?.[0]); event.target.value = ""; }} /></label></div><div className="directory-toolbar"><div className="search-box"><Search size={18} /><input placeholder="Search platforms…" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="filter-wrap"><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter by category">{categories.map((category) => <option key={category}>{category}</option>)}</select><ChevronDown size={17} /></div></div><div className="platform-grid">{filteredPlatforms.map((platform) => { const active = platform.method === "api" && sessionTokens.includes(platform.id); return <article className="platform-card" key={platform.id}><div className="platform-card-top"><span className="platform-logo" style={{ background: platform.color }}>{platform.name.slice(0, 1)}</span><span className={`method-badge ${platform.method === "api" ? "api" : "guided"}`}>{platform.method === "api" ? "DIRECT API" : "GUIDED"}</span></div><h2>{platform.name}</h2><span className="platform-category">{platform.category}</span><p>{platform.note}</p><div className="platform-card-foot"><button className="button-outline small" onClick={() => openSettings(platform)}>{platform.method === "api" ? active ? "Token available" : "Connect" : "Requirements"} <ArrowRight size={15} /></button><a href={platform.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${platform.name}`}><ExternalLink size={17} /></a></div></article>; })}</div><p className="directory-note">The count includes four accounts on Telegra.ph, ten public post/document services and {platforms.filter(p => p.category === "Full article site").length} full-article API services. Guided editor means you copy the content, publish on the platform yourself, then record its public URL here. Free plans and publishing rules may change.</p>
          </>}

          {!loading && section === "activity" && <>
            <div className="page-heading"><div><span className="eyebrow">PUBLICATION LOG</span><h1>Track every publication.</h1><p>Real URLs and recorded views, with live DEV view refresh.</p></div><div className="activity-heading-actions"><button className="button-outline" onClick={refreshDev} disabled={busy}><RefreshCw size={17} className={busy ? "spin" : ""} /> Refresh DEV views</button><button className="button-outline danger" onClick={clearHistory} disabled={busy || (!data.deliveries.length && !(data.hosting || []).length)}><Trash2 size={16} /> Clear history</button></div></div><div className="activity-summary"><span><strong>{published.length}</strong> published placements</span><span><strong>{views.toLocaleString()}</strong> recorded views</span><span><strong>{data.deliveries.filter((item) => item.state === "failed").length}</strong> failed attempts</span></div><section className="panel activity-panel"><div className="panel-head"><div><h2>Publication history</h2><p>Click a live URL to inspect the published article.</p></div></div>{data.deliveries.length ? <div className="table-wrap"><table><thead><tr><th>Article</th><th>Destination</th><th>Status</th><th>Views</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{data.deliveries.map((delivery) => <tr key={delivery.id}><td><strong>{data.articles.find((article) => article.id === delivery.articleId)?.title || "Deleted article"}</strong>{delivery.url && <a className="visible-publish-url" href={delivery.url} target="_blank" rel="noopener noreferrer">{delivery.url}</a>}{delivery.error && <small className="delivery-error">{delivery.error}</small>}</td><td><span className="table-platform"><span className="platform-dot" style={{ background: platformById[delivery.platformId]?.color }} />{platformById[delivery.platformId]?.name || delivery.platformId}</span></td><td><span className={`pill ${delivery.state === "published" ? "pill-success" : delivery.state === "failed" ? "pill-error" : "pill-draft"}`}>{delivery.state}</span></td><td>{delivery.state === "published" ? <button className="views-button" onClick={() => { setViewsDelivery(delivery); setViewsInput(String(delivery.views)); }}>{delivery.views.toLocaleString()} <PenLine size={13} /></button> : "—"}</td><td>{shortDate(delivery.updatedAt)}</td><td>{["unknown", "publishing"].includes(delivery.state) && <button className="text-button" onClick={() => { const article = data.articles.find(a => a.id === delivery.articleId); if (article) { edit(article); setManualQueue([delivery.platformId]); setManualUrl(""); } }}>Record result URL</button>}{delivery.url && <a className="row-link" href={delivery.url} target="_blank" rel="noopener noreferrer" aria-label="Open published article"><ArrowUpRight size={18} /></a>}{delivery.state === "published" && canDeleteRemote(delivery.platformId) && <button className="text-button danger" disabled={busy} onClick={() => deleteDelivery(delivery, true)}>Delete public post</button>}<button className="text-button" disabled={busy} onClick={() => deleteDelivery(delivery, false)}>Remove record</button></td></tr>)}</tbody></table></div> : <div className="empty-panel"><span><Activity size={23} /></span><strong>Nothing published yet</strong><p>Once an article goes live, it appears here with its URL and status.</p><button className="button-primary small" onClick={() => nav("compose")}>Open content studio</button></div>}</section><div className="activity-footnote"><Eye size={16} /> DEV views are fetched from DEV when you refresh. For other platforms, enter the count shown in their own analytics.</div>
          </>}
        </div>
      </main>

      {message && <div className="toast" role="status"><span>{message}</span><button onClick={() => setMessage("")} aria-label="Dismiss"><X size={16} /></button></div>}

      {platformModal && <div className="modal-backdrop"><div className="modal" role="dialog" aria-modal="true" aria-label={"Connect " + platformModal.name}><button className="modal-close" onClick={() => setPlatformModal(null)} aria-label="Close"><X size={20} /></button><h2>{platformModal.name}</h2><p>{platformModal.note}</p><h3>What to enter</h3><p>{setup[platformModal.id]?.provide}</p><h3>Step-by-step setup</h3><ol>{setup[platformModal.id]?.needs.map(item => <li key={item}>{item}</li>)}</ol><p className="setup-note">{setup[platformModal.id]?.limitation}</p>{platformModal.method === "api" ? <><label><span>API key / OAuth access token</span><input type="password" autoComplete="off" placeholder={(data.workspacePlatforms || []).includes(platformModal.id) ? "Workspace account configured; optional override" : "Paste platform-issued token"} value={configToken} onChange={event => setConfigToken(event.target.value)} /></label>{setup[platformModal.id]?.target && <label><span>{setup[platformModal.id].target}</span><input value={configSiteId} onChange={event => setConfigSiteId(event.target.value)} /></label>}{isTelegraphAccount(platformModal.id) && <button className="text-button" disabled={busy} onClick={createTelegraph}>Create a free Telegraph account</button>}{platformModal.id === "wordpress" && <button className="button-outline" disabled={busy} onClick={connectWordPress}>Connect with WordPress.com</button>}<div className="credential-note"><KeyRound size={17} /><span>Manually entered tokens stay in this tab. Configured workspace accounts use server secrets and work in every signed-in tab.</span></div>{connectionMessage && <p role="status">{connectionMessage}</p>}<div className="modal-actions"><button className="button-outline" disabled={busy} onClick={testConnection}>Test connection</button><button className="button-primary" onClick={saveSettings} disabled={busy}>Save connection</button></div></> : <><label><span>Your editor / publication URL (optional)</span><input type="url" placeholder={platformModal.editorUrl} value={configSiteId} onChange={event => setConfigSiteId(event.target.value)} /></label><div className="modal-actions"><a className="button-outline" href={platformModal.editorUrl} target="_blank" rel="noreferrer">Sign in on platform ↗</a><button className="button-primary" onClick={saveSettings} disabled={busy}>Save destination</button></div></>}<p><a href={platformModal.docs || platformModal.url} target="_blank" rel="noreferrer">Official setup / platform ↗</a></p></div></div>}

      {currentManual && <div className="modal-backdrop"><div className="modal manual-modal" role="dialog" aria-modal="true" aria-label={`Publish to ${currentManual.name}`}><button className="modal-close" onClick={() => setManualQueue([])} aria-label="Close"><X size={20} /></button><div className="step-count">GUIDED PUBLISHING · {manualQueue.length} REMAINING</div><span className="modal-icon" style={{ background: currentManual.color }}>{currentManual.name[0]}</span><h2>Publish on {currentManual.name}</h2><p>Manual final step: copy the content, open this platform, sign in and press Publish there yourself. Then paste the public article URL below and record it. Adding a key does not automate this editor workflow.</p><div className="manual-actions"><button className="button-outline" onClick={() => copyText(draft.title)}><Copy size={16} /> Copy title</button><button className="button-outline" onClick={() => copyText(editorCopy(draft))}><Copy size={16} /> Copy article</button><a className="button-primary" href={data.settings.find(s => s.platformId === currentManual.id)?.siteId || currentManual.editorUrl} target="_blank" rel="noopener noreferrer">Open editor <ExternalLink size={16} /></a></div><label><span>Published article URL</span><input type="url" placeholder="https://…" value={manualUrl} onChange={(event) => setManualUrl(event.target.value)} /></label><div className="modal-actions"><button className="text-button" onClick={() => { setManualQueue((queue) => queue.slice(1)); setManualUrl(""); }}>Skip this destination</button><button className="button-primary" onClick={recordManual} disabled={busy || !manualUrl}>Record publication <Check size={16} /></button></div></div></div>}

      {viewsDelivery && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewsDelivery(null); }}><div className="modal narrow-modal" role="dialog" aria-modal="true" aria-label="Update views"><button className="modal-close" onClick={() => setViewsDelivery(null)} aria-label="Close"><X size={20} /></button><span className="modal-icon view-icon"><Eye size={23} /></span><h2>Update view count</h2><p>Enter the number reported in {platformById[viewsDelivery.platformId]?.name || "the platform"}&apos;s analytics.</p><label><span>Views</span><input type="number" min="0" value={viewsInput} onChange={(event) => setViewsInput(event.target.value)} /></label><div className="modal-actions"><button className="button-primary" onClick={saveViews} disabled={busy}>Save views</button></div></div></div>}
    </div>
  );
}

