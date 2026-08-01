import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-panel" aria-labelledby="not-found-title">
        <div className="not-found-icon" aria-hidden="true">
          <Compass size={28} strokeWidth={1.8} />
        </div>
        <p>Page not found</p>
        <h1 id="not-found-title">This learning page is not available.</h1>
        <span>Return to the BaseCamp dashboard or explore the course catalogue.</span>
        <div>
          <Link href="/learning">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Learning dashboard</span>
          </Link>
          <Link href="/explore">Explore courses</Link>
        </div>
      </section>
    </main>
  );
}
