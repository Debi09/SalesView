function Block({ className }: { className: string }) {
  return <div className={`rounded-sm bg-ink/10 motion-safe:animate-pulse ${className}`} />;
}

function PanelSkeleton({ height }: { height: string }) {
  return (
    <div className="nb-card p-5">
      <Block className="mb-4 h-5 w-48" />
      <Block className={`w-full ${height}`} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="nb-card p-4">
            <Block className="h-4 w-24" />
            <Block className="mt-4 h-9 w-32" />
            <Block className="mt-4 h-5 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2"><PanelSkeleton height="h-72" /></div>
        <PanelSkeleton height="h-72" />
        <PanelSkeleton height="h-72" />
        <PanelSkeleton height="h-80" />
        <PanelSkeleton height="h-80" />
        <div className="lg:col-span-2"><PanelSkeleton height="h-64" /></div>
      </div>
    </div>
  );
}
