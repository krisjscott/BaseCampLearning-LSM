type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <span className={`skeleton ${className}`} aria-hidden="true" />;
}

export function SidebarSkeleton() {
  return (
    <div className="sidebar-skeleton" aria-hidden="true">
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <article className="card-skeleton" aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} />
      ))}
    </article>
  );
}
