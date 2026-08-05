"use client";

import { useEffect, useMemo, useState } from "react";
import { HelpCircle } from "lucide-react";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { PublicDashboardResponse, UserResponse, getCurrentUser, getPublicDashboard } from "../lib/backendApi";

const topics = [
  ["Course progress not updating", "Video and activity troubleshooting"],
  ["Quiz attempts and pass scores", "Assessment rules"],
  ["Download or verify a certificate", "Credential support"],
] as const;

function HelpSupport() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCurrentUser(), getPublicDashboard()]).then(([u, d]) => {
      if (!active) return;
      if (u.status === "fulfilled") setUser(u.value);
      setDashboard(d.status === "fulfilled" ? d.value : null);
    }).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(([title, description]) =>
      title.toLowerCase().includes(q) || description.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <main className="certificate-detail-page help-support-page">
      <LearningSidebar activeHref="/learning" dashboard={dashboard} loading={loading} user={user} />

      <section className="certificate-detail-main">
        <header className="certificate-detail-header">
          <div>
            <h1>Help &amp; Support</h1>
            <p>Find answers or contact the BaseCamp support team.</p>
          </div>
          <button type="button" onClick={() => { window.location.href = "mailto:support@tiesverse.com"; }}>
            <HelpCircle size={18} />
            <span>Contact support</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          <h2>How can we help?</h2>
          <p>Search help topics for courses, assessments, certificates and account access.</p>
          <input
            type="search"
            className="inline-text-input hero-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search help topics..."
            aria-label="Search help topics"
          />
        </section>

        <h2 className="share-certificate-title">
          {query.trim() ? `Results for "${query.trim()}"` : "Popular help topics"}
        </h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Popular help topics">
            {filteredTopics.length ? (
              filteredTopics.map(([title, description]) => (
                <article key={title}>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    {expandedTopic === title && (
                      <p className="expandable-note">For further help on this topic, use Contact support above.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedTopic((prev) => (prev === title ? null : title))}
                  >
                    {expandedTopic === title ? "Hide" : "Open ->"}
                  </button>
                </article>
              ))
            ) : (
              <p className="admin-empty">No help topics match your search.</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default function HelpSupportPage() {
  return (
    <AuthGuard>
      <HelpSupport />
    </AuthGuard>
  );
}
