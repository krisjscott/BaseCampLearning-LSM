"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { CardSkeleton } from "../components/Skeleton";
import {
  PublicDashboardResponse,
  SearchResultResponse,
  UserResponse,
  getCurrentUser,
  getGlobalSearch,
  getPublicDashboard,
  searchCourses,
} from "../lib/backendApi";
import { encodeId } from "../lib/idCodec";

function SearchResultsContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<SearchResultResponse[]>([]);
  const [totalHits, setTotalHits] = useState<number | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    Promise.allSettled([getCurrentUser(), getPublicDashboard()]).then(([userResult, dashboardResult]) => {
      if (userResult.status === "fulfilled") setUser(userResult.value);
      setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
    });

    const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
    setInputValue(initialQuery);
    if (initialQuery) {
      runSearch(initialQuery);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setLoading(true);
    setSearched(true);
    router.replace(`/search-results?q=${encodeURIComponent(trimmed)}`);

    Promise.allSettled([getGlobalSearch(trimmed), searchCourses(trimmed)])
      .then(([globalResult, courseResult]) => {
        if (globalResult.status === "fulfilled" && globalResult.value?.results?.length) {
          setResults(globalResult.value.results);
          setTotalHits(globalResult.value.totalHits);
          return;
        }
        if (courseResult.status === "fulfilled" && courseResult.value?.content?.length) {
          setResults(courseResult.value.content.map((course) => ({
            id: course.id,
            type: "COURSE",
            title: course.title,
            description: course.description || course.categoryName || course.status || "Course",
            additionalInfo: course.instructorName || undefined,
          })));
          setTotalHits(courseResult.value.totalElements);
        } else {
          setResults([]);
          setTotalHits(0);
        }
      })
      .catch(() => {
        setResults([]);
        setTotalHits(0);
      })
      .finally(() => setLoading(false));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    runSearch(inputValue);
  }

  const courseCount = results.filter((item) => item.type === "COURSE").length;
  const certificateCount = results.filter((item) => item.type === "CERTIFICATE").length;

  return (
    <main className="search-results-page">
      <LearningSidebar activeHref="/explore" dashboard={dashboard} loading={loading && !searched} user={user} />

      <section className="search-results-main">
        <header className="search-results-header">
          <div>
            <h1>Search results</h1>
            <p>{query ? `Results for "${query}".` : "Search for a course, topic or skill."}</p>
          </div>
          <form onSubmit={handleSubmit} className="learning-search compact-search-form">
            <Search size={18} />
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Search courses"
              aria-label="Search courses"
            />
          </form>
        </header>

        {!searched && !loading ? (
          <section className="search-best-match">
            <h2>Search BaseCamp</h2>
            <p>Type a course name, topic or skill above to get started.</p>
          </section>
        ) : loading ? (
          <CardSkeleton lines={6} />
        ) : (
          <>
            <section className="search-result-stats" aria-label="Search result summary">
              <article>
                <strong>{totalHits ?? results.length}</strong>
                <p>Results</p>
              </article>
              <article>
                <strong>{courseCount}</strong>
                <p>Courses</p>
              </article>
              <article>
                <strong>{certificateCount}</strong>
                <p>Certificates</p>
              </article>
            </section>

            <h2 className="matching-courses-title">Matching results</h2>

            {results.length ? (
              <div className="search-results-grid">
                <section className="matching-course-list" aria-label="Matching courses">
                  {results.map((item) => (
                    <article key={item.id}>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.type || "Result"}{item.description ? ` - ${item.description}` : ""}</p>
                      </div>
                      <button
                        type="button"
                        disabled={item.type !== "COURSE"}
                        onClick={() => item.type === "COURSE" && router.push(`/course?courseId=${encodeId(item.id)}`)}
                      >
                        View -&gt;
                      </button>
                    </article>
                  ))}
                </section>
              </div>
            ) : (
              <section className="search-best-match">
                <h2>No results for "{query}"</h2>
                <p>Try a different search term, or browse the full course catalogue.</p>
                <button type="button" onClick={() => router.push("/explore")}>Browse all courses -&gt;</button>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default function SearchResultsPage() {
  return (
    <AuthGuard>
      <SearchResultsContent />
    </AuthGuard>
  );
}
