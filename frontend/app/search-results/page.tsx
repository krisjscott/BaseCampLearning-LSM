"use client";

import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  Home,
  Search,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SearchResultResponse, getGlobalSearch, searchCourses } from "../lib/backendApi";

const navItems = [
  ["Learning Home", Home, false],
  ["My Learning", BookOpen, false],
  ["Explore", Compass, true],
  ["Achievements", Trophy, false],
  ["Certificates", Award, false],
  ["Progress", BarChart3, false],
] as const;

const trails = [
  ["Project Management", "58%"],
  ["Content Writing", "24%"],
  ["Graphic Design", "8%"],
] as const;

const stats = [
  ["18", "Results"],
  ["5", "Beginner"],
  ["3", "Certificates"],
] as const;

const matchingCourses = [
  ["Project Planning Basics", "92% match", "Beginner"],
  ["Agile Project Delivery", "87% match", "Intermediate"],
  ["Stakeholder Management", "82% match", "Beginner"],
] as const;

export default function SearchResults() {
  const query = "project management";
  const [results, setResults] = useState<SearchResultResponse[]>([]);
  const [totalHits, setTotalHits] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getGlobalSearch(query), searchCourses(query)])
      .then(([globalResult, courseResult]) => {
        if (!active) return;
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
          })));
          setTotalHits(courseResult.value.totalElements);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const resultRows = useMemo(() => {
    if (!results.length) return matchingCourses;
    return results.slice(0, 3).map((item, index) => [
      item.title,
      index === 0 ? "Best match" : item.type || "Match",
      item.additionalInfo || item.description || "Course",
    ] as const);
  }, [results]);

  const summaryStats = useMemo(() => {
    if (totalHits == null) return stats;
    return [
      [String(totalHits), "Results"],
      [String(results.filter((item) => item.type === "COURSE").length || resultRows.length), "Courses"],
      [String(results.filter((item) => item.type === "CERTIFICATE").length), "Certificates"],
    ] as const;
  }, [resultRows.length, results, totalHits]);

  const bestMatchTitle = results[0]?.title || "Selected course";
  const bestMatchDescription = results[0]?.description || "Practical certificate program with assessed checkpoints and workplace scenarios.";

  return (
    <main className="search-results-page">
      <aside className="learning-sidebar">
        <img src="/basecamp-logo.png" alt="BaseCamp" className="learning-sidebar-logo" />

        <nav className="learning-nav" aria-label="Learning sections">
          {navItems.map(([label, Icon, active]) => (
            <button type="button" className={active ? "active" : ""} key={label}>
              <Icon size={22} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="recent-trails" aria-label="Recent trails">
          <p>Recent trails</p>
          {trails.map(([name, progress]) => (
            <div key={name}>
              <span>{name}</span>
              <strong>{progress}</strong>
            </div>
          ))}
        </section>
        <section className="learner-profile" aria-label="Learner profile">
          <div>N</div>
          <section>
            <strong>Learner</strong>
            <span>Learner</span>
            <small>Account active</small>
          </section>
        </section>
      </aside>

      <section className="search-results-main">
        <header className="search-results-header">
          <div>
            <h1>Search results</h1>
            <p>Results for "{query}".</p>
          </div>
          <button type="button">
            <Search size={18} />
            <span>Refine search</span>
          </button>
        </header>

        <section className="search-best-match">
          <h2>Best match: {bestMatchTitle}</h2>
          <p>{bestMatchDescription}</p>
          <button type="button">Compare results -&gt;</button>
        </section>

        <section className="search-result-stats" aria-label="Search result summary">
          {summaryStats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="matching-courses-title">Matching courses</h2>

        <div className="search-results-grid">
          <section className="matching-course-list" aria-label="Matching courses">
            {resultRows.map(([title, match, level]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>
                    {match} - {level}
                  </p>
                </div>
                <button type="button">View -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="active-filters-card">
            <h2>Active filters</h2>
            <p>Project management - Certificate - Under 30 hours</p>
            <button type="button">Clear filters -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}
