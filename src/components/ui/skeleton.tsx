import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-shimmer rounded-md bg-muted", className)}
      {...props}
    />
  )
}

/** Shimmer Skeleton - Professional loading effect with animated gradient */
function ShimmerSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="shimmer-skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0",
        "before:translate-x-full before:animate-shimmer",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

/** Card Skeleton - Loading state for card layouts */
function CardSkeleton() {
  return (
    <div className="premium-card p-6 space-y-4">
      <ShimmerSkeleton className="h-6 w-40" />
      <ShimmerSkeleton className="h-4 w-full" />
      <ShimmerSkeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-2">
        <ShimmerSkeleton className="h-10 w-24" />
        <ShimmerSkeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

/** Table Skeleton - Loading state for data tables */
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-lg bg-muted/50">
          <ShimmerSkeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <ShimmerSkeleton className="h-4 w-40" />
            <ShimmerSkeleton className="h-3 w-60" />
          </div>
          <ShimmerSkeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

/** Line Skeleton - Loading state for text lines */
function LineSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerSkeleton
          key={i}
          className={cn("h-4", i === count - 1 ? "w-4/5" : "w-full")}
        />
      ))}
    </div>
  )
}

export { Skeleton, ShimmerSkeleton, CardSkeleton, TableSkeleton, LineSkeleton }
