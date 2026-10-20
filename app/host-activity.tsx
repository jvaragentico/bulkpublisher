"use client";

import { hosts } from "@/lib/hosts";
import type { HostJob } from "./hosting";

const manualTests = [
  { name: "Netlify", url: "https://chic-praline-a21751.netlify.app/" },
  { name: "Appwrite", url: "https://bulkpublisher-articles.appwrite.network/" },
  { name: "Cloudflare Pages", url: "https://bulkpublisher-articles.pages.dev/" },
];

export default function HostActivity({ jobs, articles }: { jobs: HostJob[]; articles: { id: string; title: string }[] }) {
  return <section className="panel activity-panel host-activity"><div className="panel-head"><div><h2>Website hosting activity</h2><p>Deployments started from this dashboard, including links after the host accepts an upload.</p></div></div>
    {jobs.length ? jobs.map(job => <article className="host-job" key={job.provider}><div><strong>{hosts.find(host => host.id === job.provider)?.name || job.provider}</strong> <span className="pill pill-draft">{job.state}</span></div>{job.error && <p className="delivery-error">{job.error}</p>}{job.url && <a className="visible-publish-url" href={job.url} target="_blank" rel="noopener noreferrer">{job.url}</a>}{job.url && job.state === "published" && <ul>{(JSON.parse(job.articleIds) as string[]).map(id => <li key={id}><a href={`${job.url}/${id.replace(/[^a-zA-Z0-9-]/g, "")}.html`} target="_blank" rel="noopener noreferrer">{articles.find(article => article.id === id)?.title || "Article"}</a></li>)}</ul>}</article>) : <p>No host deployment has been started from this dashboard yet.</p>}
    <h3>Earlier manual test pages</h3><p>These were published through the host dashboards and are separate from dashboard deployment records.</p><div className="host-manual-links">{manualTests.map(test => <a key={test.name} href={test.url} target="_blank" rel="noopener noreferrer"><strong>{test.name}</strong><span>{test.url}</span></a>)}</div>
  </section>;
}
